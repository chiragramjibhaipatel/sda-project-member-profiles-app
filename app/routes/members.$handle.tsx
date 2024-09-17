import {Button, Card, FormLayout, Layout, Page, TextField} from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import React, {useState} from "react";
import {json, LoaderFunctionArgs, redirect} from "@remix-run/node";
import {unauthenticated} from "~/shopify.server";
import {getMemberByHandle, updateMember} from "~/utils.server";
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
    return json ({member});
}

export const action = async ({request}: LoaderFunctionArgs) => {
    const formData = await request.json();
    const cookieSession = await sessionStorage.getSession (
	request.headers.get ('cookie'),
    )
    const handle = cookieSession.get ('handle');
    if (!handle) {
	return redirect ('/members/login', {headers: {'Set-Cookie': await sessionStorage.destroySession(cookieSession)}});
    }
    if(!process.env.SHOP) {
	return new Response ("Shop is not defined", {status: 400});
    }
    const {admin} = await unauthenticated.admin (process.env.SHOP);
    const {name, working_hours, id} = formData;
    await updateMember ({admin, id, handle, name, working_hours});
    return redirect (`/members/${handle}`);
}


export default function MembersLogin () {
    const fetcher = useFetcher();
    const {member} = useLoaderData<typeof loader> ();
    
    const [updatedMember, setUpdatedMember] = useState(member);
    const handleMemberChange = (value: string, field: string) => {
	setUpdatedMember ((prevState: typeof member) => {
	    return {...prevState, [field]: {value}};
	});
    }
    
    const handleLogout = async () => {
	fetcher.submit({}, {method: 'post', action: '/members/logout'});
    }
    
    const handleMemberUpdate = () => {
	fetcher.submit(updatedMember, {method: 'post', encType: 'application/json'});
    };
    return (
	<Page title={`Hello ${updatedMember.name.value} 👋`} fullWidth={false} primaryAction={{content: "Logout", onAction: handleLogout}}>
	    <Layout>
		<Layout.Section variant={"oneHalf"}>
		    <Card>
			<Form id="member-form">
			
			<FormLayout>
			    <TextField name="name" id="name" label={"Name"} value={updatedMember.name.value} autoComplete={"off"} requiredIndicator={true} onChange={handleMemberChange}/>
			    <TextField name="email" id="email" label={"Email"} value={updatedMember.email.value} autoComplete={"off"} requiredIndicator={true} readOnly/>
			    <TextField id="working_hours" label="Working Hours" autoComplete={"off"} value={updatedMember.working_hours.value} onChange={handleMemberChange}/>
			    <Button variant={"primary"} onClick={handleMemberUpdate}>Update</Button>
			</FormLayout>
			</Form>
		    </Card>
		</Layout.Section>
	    </Layout>
	</Page>
    );
}
