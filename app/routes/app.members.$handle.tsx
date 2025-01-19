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
import { MemberProfileSchema, MemberProfileSchemaWithPassword } from "~/zodschema/MemberProfileSchema";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const { handle } = params;
  invariant(handle, "Handle is required");
  if (handle === "new") {
    return { member: null };
  }
  const member = await getMemberByHandle({ handle, admin });
  return { member };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { handle } = params;
  invariant(handle, "Handle is required");
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  let member;

  if (handle === "new") {
    const submission = parseWithZod(formData, { schema: MemberProfileSchemaWithPassword });
    console.log("submission done");
    if (submission.status !== "success") {
      console.log("submission failed");
      return json(submission.reply());
    }
    const { name, email, role, password } = submission.value
    console.log("submission success");
    const { id: appInstallationId } = await getAppInstallationId(admin);
    console.log("appInstallationId", appInstallationId);
    member = await createMember({ name, email, role, admin });
    const { hashedPassword } = await createHashedPassword({ password });
    console.log("hashedPassword", hashedPassword);
    await storeHashedPassword({
      admin,
      appInstallationId,
      email,
      handle,
      hashedPassword,
    });
    console.log("redirecting to", `/app/members/${member.handle}`);
    return redirect(`/app/members/${member.handle}`);
  } else {
    const submission = parseWithZod(formData, { schema: MemberProfileSchema });
    if (submission.status !== "success") {
      return json(submission.reply());
    }
    const { id, name, email, role } = submission.value;
    invariant(id, "Id is required");
    member = await updateMember({ id, name, role, admin });
    return null;
  }
};

export default function Member() {
  const { member } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const isNew = member === null;

  const navigation = useNavigation();
  const loading = navigation.state !== "idle" && navigation.formData !== undefined;

  const [form, fields] = useForm({
    lastResult: lastResult,
    defaultValue: member,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: isNew ? MemberProfileSchemaWithPassword : MemberProfileSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  console.log("lastResult", lastResult);
  console.log("loaderData", member);

  const name = useInputControl(fields.name);
  const email = useInputControl(fields.email);
  const role = useInputControl(fields.role);
  const password = useInputControl(fields.password);
  const confirmPassword = useInputControl(fields.confirmPassword);
  const id = useInputControl(fields.id);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  console.log("id:", id.value);

  const handleRoleChange = (newValue: boolean, id: string) => {
    role.change(id);
  };

  return (
    <Page
      title={isNew ? "Create Member" : "Update Member"}
      backAction={{ content: "Dashboard", url: "/app/members" }}
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
                onChange={isNew ? email.change : undefined}
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
                {isNew ? "Create" : "Update"}
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
        <Card>
          <FakeMembersCreateButton />
        </Card>
      </BlockStack>
    </Page>
  );
}

function FakeMembersCreateButton({ }) {
  const fetcher = useFetcher();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);

    fetcher.submit(formData, { method: "POST", action: "/app/api/fake/create-members" });
  };

  return (
    <InlineStack gap={"400"} align="space-between">
      <Text as={"h2"} variant={"bodyLg"}>
        Create a lot of fake member profiles
      </Text>
      <Form onSubmit={handleSubmit}>
        <input type="hidden" name="_action" value="create" />
        <Button submit variant={"primary"}>
          Create 10 fake profiles
        </Button>
      </Form>
    </InlineStack>
  );
}
