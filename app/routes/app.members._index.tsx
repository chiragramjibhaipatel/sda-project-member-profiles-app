import {Card, Layout, Page} from "@shopify/polaris";

export default function MembersList() {
  return (
      <Page fullWidth={false}>
	<Layout>
	  <Layout.Section variant={"oneHalf"}>
	    <Card>
	      <Layout>
		<Layout.Section>
		  Members List
		</Layout.Section>
		<Layout.Section>
		  Members list goes here
		</Layout.Section>
	      </Layout>
	    </Card>
	  </Layout.Section>
	    <Layout.Section variant={"oneHalf"}>
		<Card>
		    <Layout>
			<Layout.Section>
			    Members List
			</Layout.Section>
			<Layout.Section>
			    Members list goes here
			</Layout.Section>
		    </Layout>
		</Card>
	    </Layout.Section>
	</Layout>
      </Page>
  );
}
