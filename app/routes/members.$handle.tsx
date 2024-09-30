import {
  BlockStack,
  Button,
  Card,
  FormLayout,
  InlineError,
  InlineGrid,
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
import {
  FormProvider,
  getFormProps,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { LanguagesWrapper } from "~/components/LanguagesWrapper";
import { LogoutForm } from "~/components/LogoutForm";
import { ProfilePhoto } from "~/components/ProfilePhoto";
import { ProfileVisibilityToggle } from "~/components/ProfileVisibilityToggle";
import { OpenToWorkToggle } from "~/components/OpenToWorkToggle";

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
];

const MemberData = z.object({
  id: z.string(),
  name: z.string({ required_error: "Name is required" }),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  profile: z
    .preprocess((val) => val === "on" || val == true, z.boolean().optional())
    .optional(),
  open_to_work: z
    .preprocess((val) => val === "on" || val == true, z.boolean().optional())
    .optional(),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" }),
  profile_photo: z.string().optional().nullable(),
  languages: z.array(z.string()).optional(),
  working_hours: z.string().optional(),
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
  let member: { [p: string]: any; id: string } = await getMemberByHandle({
    admin,
    handle,
  });
  const result = MemberData.safeParse(member);
  if (!result.success) {
    return json({ member: null });
  }
  return json({ member: result.data });
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
  console.log("new fields", fields);
  try {
    await updateMember({ admin, id, fields });
    return new Response("", { status: 200 });
  } catch (e) {
    console.error(e);
    return submission.reply({
      formErrors: ["Failed to save changes..."],
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
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: MemberData });
    },
    shouldValidate: "onBlur",
  });

  const name = useInputControl(fields.name);
  const tagline = useInputControl(fields.tagline);
  const description = useInputControl(fields.description);
  const email = useInputControl(fields.email);

  return (
    <Page
      title={`Hello ${name.value}👋`}
      fullWidth={false}
      primaryAction={<LogoutForm />}
    >
      <FormProvider context={form.context}>
        <Form method={"POST"} {...getFormProps(form)} onSubmit={form.onSubmit}>
          <Layout>
            <Layout.Section>
              <BlockStack gap={"400"}>
                <Card>
                  <FormLayout>
                    <InlineGrid gap={"400"} columns={["oneThird", "twoThirds"]}>
                      <ProfilePhoto />
                      <FormLayout>
                        <TextField
                          label={"Name"}
                          value={name.value}
                          onChange={name.change}
                          autoComplete={"off"}
                          requiredIndicator={true}
                          error={fields.name.errors}
                        />
                        <TextField
                          label={"Tagline"}
                          value={tagline.value}
                          onChange={tagline.change}
                          autoComplete={"off"}
                          error={fields.tagline.errors}
                          multiline={2}
                        />
                      </FormLayout>
                    </InlineGrid>
                    <TextField
                      label={"Description"}
                      autoComplete={"off"}
                      multiline={4}
                      value={description.value}
                      onChange={description.change}
                      error={fields.description.errors}
                    />
                  </FormLayout>
                </Card>
                <Card>
                  <FormLayout></FormLayout>
                </Card>
              </BlockStack>
            </Layout.Section>
            <Layout.Section variant={"oneThird"}>
              <BlockStack gap={"400"}>
                <Card roundedAbove="sm">
                  <ProfileVisibilityToggle profile={fields.profile.name} />
                </Card>
                <Card>
                  <OpenToWorkToggle
                    openToWork={fields.open_to_work.name}
                    workingHours={fields.working_hours.name}
                  />
                </Card>
                <Card>
                  <LanguagesWrapper
                    languages={fields.languages.name}
                    validLanguages={validLanguages}
                  />
                </Card>
              </BlockStack>
            </Layout.Section>
          </Layout>

          <Layout>
            <Layout.Section variant={"oneHalf"}>
              <Card>
                <FormLayout>
                  <input type="hidden" name="id" value={fields.id.value} />

                  <TextField
                    label={"Email"}
                    value={email.value}
                    autoComplete={"off"}
                    requiredIndicator={true}
                    readOnly
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
      </FormProvider>
    </Page>
  );
}
