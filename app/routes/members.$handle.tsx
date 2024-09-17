import {Button, Card, FormLayout, Layout, Page, TextField} from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import React, {useState} from "react";
import {json, LoaderFunctionArgs, redirect} from "@remix-run/node";
import {unauthenticated} from "~/shopify.server";
import {getMemberByHandle} from "~/utils.server";
import {Form, useFetcher, useLoaderData} from "@remix-run/react";
import {sessionStorage} from "~/session.server";


export const loader = async ({params, request}: LoaderFunctionArgs) => {
    
    const {handle} = params;
    const cookieSession = await sessionStorage.getSession (
	request.headers.get ('cookie'),
    )
    const handleInCookie = cookieSession.get ('handle')
    if (!handleInCookie || handleInCookie !== handle) {
	return redirect ('/members/login', {headers: {'Set-Cookie': await sessionStorage.destroySession(cookieSession)}});
    }
    
    if (!handle) {
	return json ({member: null});
    }
    if (!process.env.SHOP) {
	return new Response ("Shop is not defined", {status: 400});
    }
    const {admin} = await unauthenticated.admin (process.env.SHOP);
    let member = await getMemberByHandle ({admin, handle});
    member = Object.entries(member).map(([key, value]) => ({ key, value: value.value })).reduce((acc,curr) => ({...acc, [curr.key]: curr.value}), {} as typeof member);
    return json ({member});
}


export default function MembersLogin () {
    const fetcher = useFetcher();
    const {member} = useLoaderData<typeof loader> ();
    
    const [updatedMember, setUpdatedMember] = useState(member);
    const handleMemberChange = (value: string, field: string) => {
	setUpdatedMember ((prevState: typeof member) => {
	    return {...prevState, [field]: value};
	});
    }
    
    const handleLogout = async () => {
	fetcher.submit({}, {method: 'post', action: '/members/logout'});
    }
    
    return (
	<Page title={`Hello ${updatedMember.name} 👋`} fullWidth={false} primaryAction={{content: "Logout", onAction: handleLogout}}>
	    <Layout>
		<Layout.Section variant={"oneHalf"}>
		    <Card>
			<Form id="member-form">
			
			<FormLayout>
			    <TextField name="name" id="name" label={"Name"} value={updatedMember.name} autoComplete={"off"} requiredIndicator={true} onChange={handleMemberChange}/>
			    <TextField name="email" id="email" label={"Email"} value={updatedMember.email} autoComplete={"off"} requiredIndicator={true} readOnly/>
			    <TextField id="working_hours" label="Working Hours" autoComplete={"off"} value={updatedMember.working_hours} onChange={handleMemberChange}/>
			    <Button variant={"primary"}>Update</Button>
			</FormLayout>
			</Form>
		    </Card>
		</Layout.Section>
	    </Layout>
	</Page>
    );
}
