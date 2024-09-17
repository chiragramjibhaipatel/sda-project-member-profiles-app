import type {LoaderFunctionArgs} from "@remix-run/node";
import {BlockStack, CalloutCard, Layout, Page,} from "@shopify/polaris";
import {TitleBar} from "@shopify/app-bridge-react";
import {authenticate} from "../shopify.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
    await authenticate.admin (request);
    return null;
};
export default function Index () {
    return (
	<Page>
	    <TitleBar title="SDA Dashboard"/>
	    <BlockStack gap="500">
		<Layout>
		    <Layout.Section>
			<CalloutCard
			    title="Customize the style of your checkout"
			    illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
			    primaryAction={{content: 'Add new member', url: '/app/members/new'}}
			    secondaryAction={{content: 'View all members', url: '/app/members'}}
			>
			    <p>Upload your store’s logo, change colors and fonts, and more.</p>
			</CalloutCard>
		    </Layout.Section>
		
		</Layout>
	    </BlockStack>
	</Page>
    );
}
