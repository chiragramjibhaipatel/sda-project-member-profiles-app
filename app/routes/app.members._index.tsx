import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import {
  Layout,
  Page,
} from "@shopify/polaris";
import { getMembers } from "~/services/app/mermbers.server";
import { authenticate } from "~/shopify.server";

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
  console.log("🚀 ~ MembersList ~ members:", members)
  
  const navigation = useNavigation();
  const loading = navigation.state !== "idle";
  const formType = navigation.formData?.get("_action");
  
  return (
    <Page fullWidth={false}>
      <Layout>
        <Layout.Section variant={"oneHalf"}>

          
        </Layout.Section>
      </Layout>
    </Page>
  );
}


