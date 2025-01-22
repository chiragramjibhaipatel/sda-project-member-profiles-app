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
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { unauthenticated } from "~/shopify.server";
import { getMemberByHandle, updateMember } from "~/utils/utils.server";
import { Form, useActionData, useLoaderData, useParams, useNavigate } from "@remix-run/react";
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
import { LinksWrapper } from "~/components/LinksWrapper";
import invariant from "tiny-invariant";

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
  languages: z.preprocess(
    (val) => (val === undefined ? "" : val),
    z.array(z.string()).optional().or(z.string().optional()),
  ),
  working_hours: z.string().optional(),
  website: z.string().url().optional(),
  twitter: z.string().url().optional(),
  linked_in: z.string().url().optional(),
  github: z.string().url().optional(),
  you_tube: z.string().url().optional(),
  alternative_contact: z.string().url().optional(),
  description: z.string().optional(),
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
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
  let member= await getMemberByHandle({
    admin,
    handle,
  });
  return json({ member });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const { handle } = params;
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
    // await updateMember({ admin, id, ...fields });
    // let member: { [p: string]: any; id: string } = await getMemberByHandle({
    //   admin,
    //   handle,
    // });
    // const result = MemberData.safeParse(member);
    // if (!result.success) {
    //   console.error(result.error);
    //   return json({ member: null });
    // }
  } catch (e) {
    console.error(e);
    return submission.reply({
      formErrors: ["Failed to save changes..."],
    });
  }
  return redirect(`/members/${handle}`);
};

export default function MemberDashboard() {
  const { member } = useLoaderData<typeof loader>();
  const { handle } = useParams();
  let actionData = useActionData<typeof action>();
  const isPending = useIsPending();
  const navigate = useNavigate();

  const [form, fields] = useForm({
    id: `member-form-${handle}`,
    lastResult: actionData,
    defaultValue: member,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: MemberData });
    },
    shouldValidate: "onBlur",
  });

  const name = useInputControl(fields.name);
  const tagline = useInputControl(fields.tagline);
  const email = useInputControl(fields.email);

  const handleResetPassword = () => {
    navigate(`/members/${handle}/reset-password`);
  };

  return (
    <Page
      title={`Hello ${name.value}👋`}
      fullWidth={false}
      primaryAction={<LogoutForm />}
      secondaryActions={[{
        content: "Reset Password",
        onAction: handleResetPassword
      }]}
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
                  </FormLayout>
                </Card>
                <Card>
                  <LinksWrapper
                    website={fields.website.name}
                    twitter={fields.twitter.name}
                    linked_in={fields.linked_in.name}
                    github={fields.github.name}
                    you_tube={fields.you_tube.name}
                    alternative_contact={fields.alternative_contact.name}
                  />
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
