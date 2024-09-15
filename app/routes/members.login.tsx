import {Card, Layout, Page} from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import {AppProvider} from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

export default function MembersLogin() {
  return (
    <AppProvider i18n={en} >
      <Page fullWidth={false}>
	<Layout>
	  <Layout.Section variant={"oneHalf"}>
	    <Card>
	      <Layout>
		<Layout.Section>
		  Members Login
		</Layout.Section>
		<Layout.Section>
		  Members login form goes here
		</Layout.Section>
	      </Layout>
	    </Card>
	  </Layout.Section>
	    <Layout.Section variant={"oneHalf"}>
		<Card>
		    <Layout>
			<Layout.Section>
			    Members Login
			</Layout.Section>
			<Layout.Section>
			    Members login form goes here
			</Layout.Section>
		    </Layout>
		</Card>
	    </Layout.Section>
	</Layout>
      </Page>
    </AppProvider>
  );
}


// todo: to be implemented
