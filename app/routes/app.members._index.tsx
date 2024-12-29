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
  //get first 50 members from the shopify metaobject
  const {members} = await getMembers({graphql});
  return json({members});
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  
  return null;
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


