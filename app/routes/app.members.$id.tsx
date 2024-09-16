import {authenticate} from "~/shopify.server";
import {ActionFunctionArgs, json, LoaderFunctionArgs} from "@remix-run/node";
import {BlockStack, Button, Card, FormLayout, InlineStack, List, Page, RadioButton, Text, TextField} from "@shopify/polaris";
import {HideIcon, ViewIcon} from '@shopify/polaris-icons';
import {useState} from "react";
import z from 'zod';
import {useFetcher} from "@remix-run/react";
import {createHashedPassword} from "~/utils.server";
import type {AdminApiContext} from "@shopify/shopify-app-remix/server"

const MemberSchema = z.object ({
    name: z.string ().min (3),
    email: z.string ().min (3).email (),
    role: z.enum (['Founder', 'Founding Member', 'Member']),
    password: z.string ().min (8),
    confirmPassword: z.string ().min (8)
}).refine (data => data.password === data.confirmPassword, {message: "Passwords do not match", path: ['confirmPassword']});
type FlattenedErrors = z.inferFlattenedErrors<typeof MemberSchema>;


export const loader = async ({request, params}: LoaderFunctionArgs) => {
    await authenticate.admin (request);
    const {id} = params;
    if (id === 'new') {
	return {member: null};
    }
    return {member: {id: id, name: 'John Doe'}};
    
}

const CURRENT_APP_INSTALLATION = `#graphql
    query {
	currentAppInstallation {
	    id
	}
    }
`;

const SAVE_HASHED_PASSWORD = `#graphql
    mutation MetafieldsSet($metafields: MetafieldsSetInput!){
	metafieldsSet(
	    metafields:[$metafields]
	) {
	    metafields {
		id
		namespace
		key
		value
	    }
	    userErrors {
		field
		message
	    }
	}
    }
`
const getAppInstallationId = async (admin: AdminApiContext) => {
    try{
	const response = await admin.graphql(CURRENT_APP_INSTALLATION)
	const {data: {currentAppInstallation: {id}}} = await response.json();
	return {id};
    } catch(e){
	console.error(e)
	throw new Error("Something went wrong while fetching the app installation id");
    }
    
    

};
const storeHashedPassword = async ({appInstallationId: ownerId, hashedPassword, email: key, admin}: { appInstallationId: any; hashedPassword: string; admin: AdminApiContext; email: string }) => {
    const namespace = "sda_member_hashed_password";
    const type = "single_line_text_field";
    const response = await admin.graphql(SAVE_HASHED_PASSWORD, {
	variables: {
	    metafields: {
		ownerId,
		namespace,
		key,
		value: hashedPassword,
		type
	    }
	}
    });
    const {data: {metafieldsSet: {userErrors}}} = await response.json();
    if (userErrors.length > 0) {
	throw new Error("Something went wrong while storing the hashed password");
    }
};
//todo: move this to utils.server.js
export const action = async ({request, params}: ActionFunctionArgs) => {
    console.log ("Inside action");
    const {admin} = await authenticate.admin (request);
    
    const formData = await request.json();
    const validateData = MemberSchema.safeParse (formData);
    if (!validateData.success) {
	console.error(validateData.error.flatten ());
	return json ({errors: validateData.error.flatten ()});
    }
    console.log ({validateData});
    const {name, email, role, password} = validateData.data;
    const {hashedPassword} = await createHashedPassword ({password});
    const {id: appInstallationId} = await getAppInstallationId (admin);
    await storeHashedPassword ({admin, appInstallationId, email, hashedPassword});
    // await createMember ({name, email, role, admin});
    return json ({success: true});
}


export default function Member () {
    let fetcher = useFetcher ();
    const [newMember, setNewMember] = useState ({name: '', email: '', role: 'Member', password: '', confirmPassword: ''});
    const [memberError, setMemberError] = useState<FlattenedErrors> ();
    const [isPasswordVisible, setIsPasswordVisible] = useState (false);
    const handleMemberChange = (value: string, field: string) => {
	setNewMember ((prevState) => {
	    return {...prevState, [field]: value};
	});
    }
    const handleMemberCreate = async () => {
	console.log ("Inside handleMemberCreate");
	const validatedData = MemberSchema.safeParse (newMember);
	if (!validatedData.success) {
	    setMemberError (validatedData.error.flatten ());
	    return;
	}
	setMemberError (undefined);
	fetcher.submit (newMember, {method: 'post', encType: 'application/json'});
    }
    
    return (
	<Page title="New member" backAction={{content: "Dashboard", url: "/app"}}>
	    <BlockStack gap={"400"}>
		<Card>
		    <FormLayout>
			<TextField id="name" label={"Name"} value={newMember.name} autoComplete={"off"} requiredIndicator={true} onChange={handleMemberChange} error={memberError?.fieldErrors.name}/>
			<TextField id="email" label={"Email"} value={newMember.email} autoComplete={"off"} requiredIndicator={true} onChange={handleMemberChange} error={memberError?.fieldErrors.email}/>
			<InlineStack gap={"400"} blockAlign={"center"}>
			    <Text as={"h2"} variant={"bodyLg"}>Role</Text>
			    <RadioButton
				label="Founder"
				helpText=""
				checked={newMember.role === "Founder"}
				id="Founder"
				name="role"
				onChange={() => handleMemberChange ("Founder", "role")}
			    />
			    <RadioButton
				label="Founding member"
				helpText=""
				id="Founding Member"
				name="role"
				checked={newMember.role === "Founding Member"}
				onChange={() => handleMemberChange ("Founding Member", "role")}
			    />
			    <RadioButton
				label="Member"
				helpText=""
				id="Member"
				name="role"
				checked={newMember.role === "Member"}
				onChange={() => handleMemberChange ("Member", "role")}
			    />
			</InlineStack>
			<TextField
			    id="password"
			    label="Paasword"
			    type={isPasswordVisible ? "text" : "password"}
			    value={newMember.password}
			    onChange={handleMemberChange}
			    autoComplete="off"
			    connectedRight={<Button icon={isPasswordVisible ? HideIcon : ViewIcon} onClick={() => setIsPasswordVisible (prevState => !prevState)}/>}
			    requiredIndicator={true}
			    error={memberError?.fieldErrors.password}
			/>
			<TextField
			    id="confirmPassword"
			    label="Confirm Password"
			    type={isPasswordVisible ? "text" : "password"}
			    value={newMember.confirmPassword}
			    onChange={handleMemberChange}
			    autoComplete="off"
			    requiredIndicator={true}
			    error={memberError?.fieldErrors.confirmPassword}
			/>
			<Button submit variant={"primary"} onClick={handleMemberCreate}>Create</Button>
		    </FormLayout>
		</Card>
		<Card>
		    <Text as={"h2"} variant={"bodyLg"}>Form instructions</Text>
		    <List gap="extraTight" type={"bullet"}>
			<List.Item>This form will create new metaobject entry</List.Item>
			<List.Item>The member needs to be provided with the password so that they can update it</List.Item>
			<List.Item>The member will have to reset the password on first login</List.Item>
		    </List>
		</Card>
	    </BlockStack>
	</Page>
    );
}


