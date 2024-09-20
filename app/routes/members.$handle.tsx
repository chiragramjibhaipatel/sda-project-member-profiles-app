import {
  Button,
  Card,
  FormLayout,
  InlineError,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import React from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { unauthenticated } from "~/shopify.server";
import { getMemberByHandle, updateMember } from "~/utils/utils.server";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { sessionStorage } from "~/session.server";
import z from "zod";
import { useIsPending } from "~/utils/misc";
import { getFormProps, useForm, useInputControl } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { LanguagesWrapper } from "~/components/LanguagesWrapper";
import { LogoutForm } from "~/components/LogoutForm";

const validLanguages = [
  "English",
  "Punjabi",
  "Dutch",
  "French",
  "Spanish",
  "Mandarin Chinese",
  "Gujarati",
  "Hindi",
  "Russian",
  "Turkish",
  "Azerbaijani",
  "Polish",
  "German",
  "Greek",
] as const;

const MemberData = z.object({
  id: z.string(),
  name: z.string({ required_error: "Name is required" }),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" }),
  profile: z.boolean().nullable().optional(),
  profile_photo: z.string().optional().nullable(),
  open_to_work: z.boolean().nullable().optional(),
  languages: z.array(z.string()).nullable().optional(),
  working_hours: z.string().nullable().optional(),
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { handle } = params;
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

  if (!handle) {
    return json({ member: null });
  }
  const { admin } = await unauthenticated.admin(process.env.SHOP);
  let member: z.infer<typeof MemberData> = await getMemberByHandle({
    admin,
    handle,
  });
  return json({ member });
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const { admin } = await unauthenticated.admin(process.env.SHOP);

  const submission = parseWithZod(formData, {
    schema: MemberData,
  });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { id, ...fields } = submission.value;
  try {
    await updateMember({ admin, id, fields });
    return new Response("", { status: 200 });
  } catch (e) {
    return submission.reply({
      formErrors: ["Failed to save changes...", "Manual Error"],
    });
  }
};

export default function MemberDashboard() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();

  const [form, fields] = useForm({
    id: "member-form",
    lastResult: actionData,
    defaultValue: loaderData.member,
    constraint: getZodConstraint(MemberData),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: MemberData });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const name = useInputControl(fields.name);
  const email = useInputControl(fields.email);
  const working_hours = useInputControl(fields.working_hours);
  const languages = useInputControl(fields.languages);

  return (
    <Page
      title={`Hello ${name.value}👋`}
      fullWidth={false}
      primaryAction={<LogoutForm />}
    >
      <Form method={"POST"} {...getFormProps(form)} onSubmit={form.onSubmit}>
        <Layout>
          <Layout.Section variant={"oneHalf"}>
            <Card>
              <FormLayout>
                <input type="hidden" name="id" value={fields.id.value} />
                <TextField
                  label={"Name"}
                  value={name.value}
                  onChange={name.change}
                  autoComplete={"off"}
                  requiredIndicator={true}
                  error={fields.name.errors}
                />
                <TextField
                  label={"Email"}
                  value={email.value}
                  autoComplete={"off"}
                  requiredIndicator={true}
                  readOnly
                />
                <TextField
                  label="Working Hours"
                  autoComplete={"off"}
                  value={working_hours.value}
                  onChange={working_hours.change}
                />
                <LanguagesWrapper
                  name={fields.languages.name}
                  value={languages.value}
                  onChange={languages.change}
                  validLanguages={validLanguages}
                />

                <Button loading={isPending} submit variant={"primary"}>
                  Update
                </Button>
                <InlineError
                  fieldID={form.errorId}
                  message={form.errors?.join() || ""}
                />
              </FormLayout>
            </Card>
          </Layout.Section>
        </Layout>
      </Form>
    </Page>
  );
}
