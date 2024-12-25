import { LoaderFunctionArgs } from "@remix-run/node";
import { Form as RemixForm, useNavigation } from "@remix-run/react";
import {
  BlockStack,
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { RestResources } from "@shopify/shopify-api/rest/admin/2024-07";
import { AdminApiContextWithRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  console.log("fetching members");
  //get first 50 members from the shopify metaobject
  return null;
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  //add or delete members
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  switch (_action) {
    case "add":
      console.log("adding members");
	  await addMembers({admin, count: 10});
      break;
    case "delete":
      console.log("deleting members");
      //delete all members
      break;
  }

  return null;
};

export default function MembersList() {
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
function addMembers({admin, count}:{ admin: AdminApiContextWithRest<RestResources>, count: number}) {

}

