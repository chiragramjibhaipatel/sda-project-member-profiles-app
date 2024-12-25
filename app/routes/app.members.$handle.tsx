import { authenticate } from "~/shopify.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  BlockStack,
  Button,
  Card,
  FormLayout,
  InlineError,
  InlineStack,
  List,
  Page,
  RadioButton,
  Text,
  TextField,
} from "@shopify/polaris";
import { HideIcon, ViewIcon } from "@shopify/polaris-icons";
import { useState } from "react";
import z from "zod";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  createHashedPassword,
  createMember,
  getAppInstallationId,
  getMemberByHandle,
  storeHashedPassword,
  updateMember,
} from "~/utils/utils.server";
import { useForm, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import invariant from "tiny-invariant";

export const MemberSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(3),
    email: z.string().min(3).email(),
    role: z.enum(["Founder", "Founding Member", "Member"]),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    _action: z.string().optional(),
  })
  .refine(
    ({ confirmPassword, password, _action }) => {
      if (_action === undefined) {
        return true;
      }
      return password === confirmPassword;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const { handle } = params;
  invariant(handle, "Handle is required");
  if (handle === "new") {
    return { member: null };
  }
  const member = await getMemberByHandle({ handle, admin });
  member.name = "aaaaa"
  return member;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { handle } = params;
  invariant(handle, "Handle is required");
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: MemberSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { id, name, email, role, password } = submission.value;
  const { id: appInstallationId } = await getAppInstallationId(admin);
  let member;
  if (handle === "new") {
	  console.log("Creating new member");
	  member = await createMember({ name, email, role, admin });
	  const { hashedPassword } = await createHashedPassword({ password });
	  await storeHashedPassword({
		admin,
		appInstallationId,
		email,
		handle,
		hashedPassword,
	  });
	  return redirect(`/app/members/${member.handle}`);
	} else {
		console.log("Updating member");
		invariant(id, "Id is required");
		member = await updateMember({ id, name, role, admin });
    return null;
  }
};

export default function Member() {
  const loaderData = useLoaderData<typeof loader>();
  console.log("loaderData", loaderData);
  const navigation = useNavigation();
  const loading = navigation.state !== "idle";

  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: lastResult || loaderData,
    defaultValue: loaderData,
    onValidate({ formData }) {
      console.log(
        "validating form data",
        formData.get("password"),
        formData.get("role"),
      );
      return parseWithZod(formData, { schema: MemberSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const name = useInputControl(fields.name);
  const email = useInputControl(fields.email);
  const role = useInputControl(fields.role);
  const password = useInputControl(fields.password);
  const confirmPassword = useInputControl(fields.confirmPassword);
  const id = useInputControl(fields.id);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleRoleChange = (newValue: boolean, id: string) => {
    console.log("Role", newValue, id);
    role.change(id);
  };

  return (
    <Page
      title="Add new member"
      backAction={{ content: "Dashboard", url: "/app" }}
    >
      <BlockStack gap={"400"}>
        <Card>
          <Form method="post" id={form.id} onSubmit={form.onSubmit}>
            <input type="hidden" name="id" value={id.value} />
            <FormLayout>
              <TextField
                id="name"
                label={"Name"}
                value={name.value}
                name={fields.name.name}
                autoComplete={"off"}
                requiredIndicator={true}
                onChange={name.change}
                error={fields.name.errors}
              />
              <TextField
                id="email"
                label={"Email"}
                name={fields.email.name}
                value={email.value}
                autoComplete={"off"}
                requiredIndicator={true}
                error={fields.email.errors}
              />
              <InlineStack gap={"400"} blockAlign={"center"}>
                <Text as={"h2"} variant={"bodyLg"}>
                  Role
                </Text>
                <RadioButton
                  label="Founder"
                  helpText=""
                  checked={role.value === "Founder"}
                  id="Founder"
                  onChange={handleRoleChange}
                />
                <RadioButton
                  label="Founding member"
                  helpText=""
                  id="Founding Member"
                  checked={role.value === "Founding Member"}
                  onChange={handleRoleChange}
                />
                <RadioButton
                  label="Member"
                  helpText=""
                  id="Member"
                  checked={role.value === "Member"}
                  onChange={handleRoleChange}
                />
                <InlineError
                  fieldID=""
                  message={fields.role.errors?.join() || ""}
                />
              </InlineStack>
              <TextField
                id="password"
                label="Paasword"
                type={isPasswordVisible ? "text" : "password"}
                value={password.value}
                onChange={password.change}
                name={fields.password.name}
                autoComplete="off"
                connectedRight={
                  <Button
                    icon={isPasswordVisible ? HideIcon : ViewIcon}
                    onClick={() =>
                      setIsPasswordVisible((prevState) => !prevState)
                    }
                  />
                }
                requiredIndicator={true}
                error={fields.password.errors}
              />
              <TextField
                id="confirmPassword"
                label="Confirm Password"
                type={isPasswordVisible ? "text" : "password"}
                value={confirmPassword.value}
                onChange={confirmPassword.change}
                name={fields.confirmPassword.name}
                autoComplete="off"
                requiredIndicator={true}
                error={fields.confirmPassword.errors}
              />
              <Button
                submit
                variant={"primary"}
                loading={loading}
                disabled={loading}
              >
                Create
              </Button>
            </FormLayout>
          </Form>
        </Card>
        <Card>
          <Text as={"h2"} variant={"bodyLg"}>
            Form instructions
          </Text>
          <List gap="extraTight" type={"bullet"}>
            <List.Item>This form will create new metaobject entry</List.Item>
            <List.Item>
              The member needs to be provided with the password so that they can
              update it
            </List.Item>
            <List.Item>
              The member will have to reset the password on first login
            </List.Item>
          </List>
        </Card>
      </BlockStack>
    </Page>
  );
}
