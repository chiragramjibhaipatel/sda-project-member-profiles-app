import {Button, Card, FormLayout, Layout, Page, TextField} from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import {HideIcon, ViewIcon} from "@shopify/polaris-icons";
import React, {useState} from "react";
import z from "zod";
import {useFetcher} from "@remix-run/react";
import {ActionFunctionArgs, json, redirect} from "@remix-run/node";
import {unauthenticated} from "~/shopify.server";
import {getMemberByEmail, validateLogin} from "~/utils.server";

const LoginForm = z.object ({
    username: z.string ().min (1),
    password: z.string ().min (1)
});
type LoginFormErrors = z.inferFlattenedErrors<typeof LoginForm>;


export const action = async ({request}: ActionFunctionArgs) => {
    const formData = await request.formData ();
    const loginData = {
	username: formData.get ('username'),
	password: formData.get ('password')
    };
    const validateData = LoginForm.safeParse (loginData);
    if (!validateData.success) {
	return json ({errors: validateData.error.flatten ()});
    }
    if (!process.env.SHOP) {
	return new Response ("Shop is not defined", {status: 400});
    }
    const {admin} = await unauthenticated.admin (process.env.SHOP);
    const {username, password} = validateData.data;
    const {isValidLogin} = await validateLogin ({admin, username, password});
    if (!isValidLogin) {
	return new Response ("Invalid login", {status: 401});
    }
    //get the user details from the metaobject
    const {handle} = await getMemberByEmail ({admin, username: loginData.username});
    return redirect (`/members/${handle}`);
}

export default function MembersLogin () {
    const fetcher = useFetcher ();
    const [isPasswordVisible, setIsPasswordVisible] = useState (false)
    const [loginForm, setLoginForm] = useState ({username: '', password: ''});
    const [loginFormError, setLoginFormError] = useState<LoginFormErrors> ();
    
    const handleLoginFormChange = (value: string, field: string) => {
	setLoginForm ((prevState) => {
	    return {...prevState, [field]: value};
	});
    }
    
    const handleLogin = () => {
	const validateData = LoginForm.safeParse (loginForm);
	if (!validateData.success) {
	    console.error (validateData.error.flatten ());
	    return;
	}
	setLoginFormError (undefined);
	fetcher.submit (loginForm, {method: 'post'});
	
	
    };
    return (
	<Page fullWidth={false}>
	    <Layout>
		<Layout.Section variant={"oneHalf"}>
		    <Card>
			<FormLayout>
			    <TextField id="username" label={"Username"} value={loginForm.username} autoComplete={"off"} requiredIndicator={true} onChange={handleLoginFormChange} error={loginFormError?.fieldErrors.username}/>
			    <TextField id="password"
				       label={"Password"} value={loginForm.password} autoComplete={"off"} requiredIndicator={true} onChange={handleLoginFormChange} error={loginFormError?.fieldErrors.password}
				       type={isPasswordVisible ? "text" : "password"}
				       connectedRight={<Button icon={isPasswordVisible ? HideIcon : ViewIcon} onClick={() => setIsPasswordVisible (prevState => !prevState)}/>}
			    />
			    <Button variant={"primary"} onClick={handleLogin}>Login</Button>
			</FormLayout>
		    </Card>
		</Layout.Section>
	    </Layout>
	</Page>
    );
}

