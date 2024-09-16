import {authenticate} from "~/shopify.server";
import {LoaderFunctionArgs} from "@remix-run/node";
import {Text, Button, Card, FormLayout, InlineStack, RadioButton, TextField, Box, List, BlockStack, Page} from "@shopify/polaris";
import {
    ViewIcon, HideIcon
} from '@shopify/polaris-icons';
import {useState} from "react";

export const loader = async ({request, params}: LoaderFunctionArgs) => {
    await authenticate.admin (request);
    const {id} = params;
    if (id === 'new') {
	return {member: null};
    }
    return {member: {id: id, name: 'John Doe'}};
    
}


export default function Member () {
    const [newMember, setNewMember] = useState ({name: '', email: '', role: 'Member', password: ''});
    const [isPasswordVisible, setIsPasswordVisible] = useState (false);
    const handleMemberChange = (value: string, field: string) => {
	setNewMember ((prevState) => {
	    return {...prevState, [field]: value};
	});
    }
    
    return (
	<Page title="New member" backAction={{content: "Dashboard", url:"/app"}} >
	    <BlockStack gap={"400"}>
		<Card>
		    <FormLayout>
			<TextField id="name" label={"Name"} value={newMember.name} autoComplete={"off"} requiredIndicator={true} onChange={handleMemberChange}/>
			<TextField id="email" label={"Email"} value={newMember.email} autoComplete={"off"} requiredIndicator={true} onChange={handleMemberChange}/>
			<InlineStack gap={"400"} blockAlign={"center"}>
			    <Text as={"h2"} variant={"bodyLg"}>Role</Text>
			    <RadioButton
				label="Founder"
				helpText=""
				checked={newMember.role === "Founder"}
				id="Founder"
				name="role"
				onChange={() => handleMemberChange("Founder", "role")}
			    />
			    <RadioButton
				label="Founding member"
				helpText=""
				id="Founding Member"
				name="role"
				checked={newMember.role === "Founding Member"}
				onChange={() => handleMemberChange("Founding Member", "role")}
			    />
			    <RadioButton
				label="Member"
				helpText=""
				id="Member"
				name="role"
				checked={newMember.role === "Member"}
				onChange={() => handleMemberChange("Member", "role")}
			    />
			</InlineStack>
			<TextField
			    id="password"
			    label="Paasword"
			    type={isPasswordVisible ? "text" : "password"}
			    value={newMember.password}
			    onChange={handleMemberChange}
			    autoComplete="off"
			    connectedRight={<Button icon={isPasswordVisible? HideIcon : ViewIcon} onClick={() => setIsPasswordVisible(prevState => !prevState)}/>}
			    requiredIndicator={true}
			/>
			<Button submit variant={"primary"} >Create</Button>
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
