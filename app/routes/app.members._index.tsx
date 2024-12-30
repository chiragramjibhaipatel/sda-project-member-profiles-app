import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import {
  Layout,
  Page,
} from "@shopify/polaris";
import { getMembers } from "~/services/app/mermbers.server";
import { authenticate } from "~/shopify.server";
import { MembersListTable } from "../components/MembersListTable";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const {admin: {graphql}} = await authenticate.admin(request);
  console.log("fetching members");
  const {members} = await getMembers({graphql, direction:"next"});
  return json({members});
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const { admin: {graphql} } = await authenticate.admin(request);
  const formData = await request.formData();
  const { startCursor, endCursor, direction, selectedTab, _action } = Object.fromEntries(
    formData,
  ) as { startCursor?: string; endCursor?: string; direction: string, selectedTab?: string, _action?: string };
  if (_action === "tab_changed" && selectedTab) {
    console.log(`Tab changed to: ${selectedTab}`);
    const { members } = await getMembers({ graphql, selectedTab });
    return json({ members });
  }
  const { members } = await getMembers({ graphql, startCursor, endCursor, direction, selectedTab });
  return json({ members });
};

export default function MembersList() {
  const {members} = useLoaderData<typeof loader>();
  
  return (
    <Page fullWidth={false}>
      <Layout>
        <Layout.Section variant={"fullWidth"}>
            <MembersListTable members={members}/>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


export function shouldRevalidate({ actionResult }: { actionResult: any }) {
  return false;
}