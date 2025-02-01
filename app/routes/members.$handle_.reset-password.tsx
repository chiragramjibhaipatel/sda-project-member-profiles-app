import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import {
  BlockStack,
  Button,
  Card,
  FormLayout,
  InlineError,
  Page,
  TextField,
} from "@shopify/polaris";
import { HideIcon, ViewIcon } from "@shopify/polaris-icons";
import { useState } from "react";
import { Form, useActionData, useParams } from "@remix-run/react";
import { useForm, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { unauthenticated } from "~/shopify.server";
import { createHashedPassword, getAppInstallationId, storeHashedPassword, validateLogin } from "~/utils/utils.server";
import { z } from "zod";
import invariant from "tiny-invariant";
import "@shopify/polaris/build/esm/styles.css";
import { sessionStorage } from "~/session.server";



const PasswordResetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  email: z.string().email(),
}).refine(
  ({ confirmPassword, password }) => password === confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export const action = async ({ request, params }: ActionFunctionArgs) => {
  console.log("Inside action: members.$handle_.reset-password");
  const { handle } = params;
  invariant(handle, "Handle is required");
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const handleInCookie = cookieSession.get("handle");
  if (!handleInCookie || handleInCookie !== handle) {
    return redirect("/members/login", {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(cookieSession),
      },
    });
  }

  const { admin } = await unauthenticated.admin(process.env.SHOP);
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
		schema: () =>
			PasswordResetSchema.transform(async (data, ctx) => {
				const { password, email } = data;
				const { isValidLogin, handle: handleInDB, needReset } = await validateLogin({ admin, username: email, password });
				if (!isValidLogin && handleInDB !== handle) {
					ctx.addIssue({
						code: 'custom',
						message: 'Invalid email',
					})
					return z.NEVER
				}
				return { ...data, handle, needReset }
			}),
		async: true
	});
  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { password, email } = submission.value;
  const { id: appInstallationId } = await getAppInstallationId(admin);
  const { hashedPassword } = await createHashedPassword({ password });

  await storeHashedPassword({
    admin,
    appInstallationId,
    email,
    handle,
    hashedPassword,
    isNew: false,
  });

  return redirect(`/members/${handle}`);
};

export default function ResetPassword() {
  const lastResult = useActionData<typeof action>();
  const { handle } = useParams();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [form, fields] = useForm({
    id: `reset-password-form-${handle}`,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PasswordResetSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const password = useInputControl(fields.password);
  const confirmPassword = useInputControl(fields.confirmPassword);
  const email = useInputControl(fields.email);

  return (
    <Page title="Reset Password">
      <BlockStack gap="400">
        <Card>
          <Form method="post" id={form.id} onSubmit={form.onSubmit}>
            <FormLayout>
              <TextField
                label="Email"
                autoComplete="email"
                name={fields.email.name}
                value={email.value || ""}
                onChange={email.change}
                error={fields.email.errors}
                requiredIndicator
              />
              <TextField
                label="New Password"
                type={isPasswordVisible ? "text" : "password"}
                value={password.value || ""}
                onChange={password.change}
                name={fields.password.name}
                autoComplete="new-password"
                connectedRight={
                  <Button
                    icon={isPasswordVisible ? HideIcon : ViewIcon}
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                  />
                }
                requiredIndicator
                error={fields.password.errors}
              />
              <TextField
                label="Confirm New Password"
                type={isPasswordVisible ? "text" : "password"}
                value={confirmPassword.value || ""}
                onChange={confirmPassword.change}
                name={fields.confirmPassword.name}
                autoComplete="new-password"
                requiredIndicator
                error={fields.confirmPassword.errors}
              />
              <Button submit variant="primary">
                Reset Password
              </Button>
								<InlineError message={form.errors?.join("-") || ""} fieldID={form.id} />

            </FormLayout>
          </Form>
        </Card>
      </BlockStack>
    </Page>
  );
} 