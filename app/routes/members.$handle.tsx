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
import { useIsPending } from "~/utils/misc";
import {
  FormProvider,
  getFormProps,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { LanguagesWrapper } from "~/components/LanguagesWrapper";
import { ProfilePhoto } from "~/components/ProfilePhoto";
import { ProfileVisibilityToggle } from "~/components/ProfileVisibilityToggle";
import { OpenToWorkToggle } from "~/components/OpenToWorkToggle";
import { LinksWrapper } from "~/components/LinksWrapper";
import invariant from "tiny-invariant";
import { MemberProfileSchema, MemberProfileSchemaType } from "~/zodschema/MemberProfileSchema";
import { ServicesWrapper } from "../components/ServicesWrapper";
import { TechnologiesWrapper } from "../components/TechnologiesWrapper";
import { IndustryExperienceWrapper } from "../components/IndustryExperienceWrapper";
import ReviewsWrapper from "~/components/ReviewsWrapper";


export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  console.log("Inside loader: members.$handle");
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
  let member = await getMemberByHandle({
    admin,
    handle,
    isAdmin: false,
  }) as MemberProfileSchemaType;
  return json({ member });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const { handle } = params;
  const formData = await request.formData();
  const { admin } = await unauthenticated.admin(process.env.SHOP);

  const submission = parseWithZod(formData, {
    schema: MemberProfileSchema,
  });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { id, ...fields } = submission.value;
  invariant(id, "Id is required");
  try {
    await updateMember({ admin, id, ...fields });
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
      return parseWithZod(formData, { schema: MemberProfileSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });
  const isDirty = JSON.stringify(form.initialValue) !== JSON.stringify(form.value);
  const name = useInputControl(fields.name);
  const tagline = useInputControl(fields.tagline);
  const email = useInputControl(fields.email);
  const handleResetPassword = () => {
    navigate(`/members/${handle}/reset-password`);
  };

  const handleLogout = () => {
    navigate("/members/logout");
  };

  const handleReset = () => {
    form.reset();
  };


  return (
    <FormProvider context={form.context}>
      <Form method={"POST"} {...getFormProps(form)} onSubmit={form.onSubmit}>
        <Page
          title={`Hello ${name.value}👋`}
          fullWidth={false}
          primaryAction={ <Button loading={isPending} submit variant={"primary"} disabled={!isDirty}>Save</Button>}
          secondaryActions={[
            {
              content: "Reset Password",
              onAction: handleResetPassword
            },
            {
              content: "Logout",
              onAction: handleLogout
            },
            {
              content: "Reset",
              onAction: handleReset
            },
          ]}
        >
          <Layout>
            <Layout.Section>
              <BlockStack gap={"400"}>
                <Card>
                  <FormLayout>
                    <input type="hidden" name="id" value={fields.id.value} />
                    <InlineError
                      fieldID={form.errorId}
                      message={form.errors?.join() || ""}
                    />
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
                <Card>
                  <ServicesWrapper
                    primaryService={fields.primary_service.name}
                    services={fields.services.name}
                  />
                </Card>
                <Card>
                  <TechnologiesWrapper
                    technologies={fields.technologies.name}
                  />
                </Card>
                <Card>
                  <ReviewsWrapper
                    reviews={fields.review.name}
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
                  />
                </Card>
                
                <Card>
                  <IndustryExperienceWrapper
                    industryExperience={fields.industry_experience.name}
                  />
                </Card>
              </BlockStack>
            </Layout.Section>
          </Layout>
        </Page>
      </Form>
    </FormProvider>
  );
}




