import {Button, Card, FormLayout, Layout, Page, TextField} from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import React from "react";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import {unauthenticated} from "~/shopify.server";
import {getMemberByHandle} from "~/utils.server";
import {useLoaderData} from "@remix-run/react";


export const loader = async ({params}: LoaderFunctionArgs) => {
    const {id} = params;
    if(!id) {
	return json ({member: null});
    }
    if (!process.env.SHOP) {
	return new Response ("Shop is not defined", {status: 400});
    }
    const {admin} = await unauthenticated.admin (process.env.SHOP);
    const member = await getMemberByHandle ({admin, handle: id});
    return json ({member});
}


export default function MembersLogin () {
    const {member} = useLoaderData<typeof loader> ();
    return (
	<Page fullWidth={false}>
	    <Layout>
		<Layout.Section variant={"oneHalf"}>
		    <Card>
			<FormLayout>
			    <TextField id="name" label={"Name"} value={member.name.value} autoComplete={"off"} requiredIndicator={true}/>
			    <TextField id="email" label={"Email"} value={member.email.value} autoComplete={"off"} requiredIndicator={true} readOnly/>
			    <Button variant={"primary"}>Update</Button>
			</FormLayout>
		    </Card>
		</Layout.Section>
	    </Layout>
	</Page>
    );
}
