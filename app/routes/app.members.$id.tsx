import {authenticate} from "~/shopify.server";
import {LoaderFunctionArgs} from "@remix-run/node";
import {Text, Button, Card, FormLayout, InlineStack, RadioButton, TextField, Box, List} from "@shopify/polaris";
import {
    ViewIcon, HideIcon
} from '@shopify/polaris-icons';

export const loader = async ({request, params}: LoaderFunctionArgs) => {
    await authenticate.admin (request);
    const {id} = params;
    if (id === 'new') {
	return {member: null};
    }
    return {member: {id: id, name: 'John Doe'}};
    
}


export default function Member () {
    return (
	
	<Card>
	    <FormLayout>
		<TextField label={"Name"} value={"Chiarg Patel"} autoComplete={"off"}/>
		<TextField label={"Email"} value={"chiarg@gmail.com"} autoComplete={"off"}/>
		<InlineStack gap={"400"}>
		    <RadioButton
			label="Admin"
			helpText=""
			checked={true}
			id="admin"
			name="role"
			onChange={() => {}}
		    />
		    <RadioButton
			label="Accounts are optional"
			helpText=""
			id="member"
			name="role"
			checked={false}
			onChange={() => {}}
		    />
		</InlineStack>
		<TextField
		    label="Paasword"
		    type="password"
		    value={"easyeasy"}
		    onChange={() => {}}
		    autoComplete="off"
		    connectedRight={<Button icon={ViewIcon}/>}
		/>
		
		<Button submit>Create</Button>
		<List gap="extraTight">
		    <List.Item>This form will create new metaobject entry</List.Item>
		    <List.Item>The member needs to be provided with the password</List.Item>
		    <List.Item>The member will have to reset the password on first login</List.Item>
		</List>
	    </FormLayout>
	</Card>
	
    );
}
