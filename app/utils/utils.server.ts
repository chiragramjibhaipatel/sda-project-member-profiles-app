import bcrypt from "bcryptjs";
import type {AdminApiContext} from "@shopify/shopify-app-remix/server";

export const createHashedPassword = async ({password}: { password: string; }) => {
    const salt = await bcrypt.genSalt (10);
    const hashedPassword = await bcrypt.hash (password, salt);
    return {hashedPassword};
};


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

const CREATE_MEMBER = `#graphql
mutation Metaobjectreate($metaobject: MetaobjectCreateInput!){
    metaobjectCreate(metaobject: $metaobject) {
        metaobject {
            id
            handle
        }
        userErrors{
            field
            message
        }
    }
}
`

const GET_MEMBER_PASSWORD_BY_EMAIL = `#graphql
query getAppInstallation($key: String!){
    currentAppInstallation{
        metafield(namespace:"sda_member_hashed_password", key:$key){
            value
        }
    }
}
`

const GET_MEMBER_BY_HANDLE = `#graphql
query GetMemner($handle: MetaobjectHandleInput!){
    metaobjectByHandle(handle:$handle){
        id
        name: field(key:"name"){
            value
        }
        email: field(key:"email"){
            value
        }
        working_hours: field(key:"working_hours"){
            value
        }
    }
}
`


const UPDATE_METAOBJECT = `#graphql
    mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
	metaobjectUpdate(id: $id, metaobject: $metaobject ) {
	    userErrors {
		field
		message
		code
	    }
	}
    }
`
export const getAppInstallationId = async (admin: AdminApiContext) => {
    try {
	const response = await admin.graphql (CURRENT_APP_INSTALLATION)
	const {data: {currentAppInstallation: {id}}} = await response.json ();
	return {id};
    } catch (e) {
	console.error (e)
	throw new Error ("Something went wrong while fetching the app installation id");
    }
    
    
};
export const storeHashedPassword = async ({appInstallationId: ownerId, hashedPassword, email: key, handle, admin}: { appInstallationId: any; hashedPassword: string; admin: AdminApiContext; email: string; handle: string }) => {
    const namespace = "sda_member_hashed_password";
    const type = "json";
    const response = await admin.graphql (SAVE_HASHED_PASSWORD, {
	variables: {
	    metafields: {
		ownerId,
		namespace,
		key,
		value: JSON.stringify ({handle, hashedPassword}),
		type
	    }
	}
    });
    const {data: {metafieldsSet: {userErrors}}} = await response.json ();
    if (userErrors.length > 0) {
	throw new Error ("Something went wrong while storing the hashed password");
    }
};
export const createMember = async ({role, name, email, admin}: { role: string; name: string; admin: AdminApiContext; email: string }) => {
    const response = await admin.graphql (CREATE_MEMBER, {
	variables: {
	    "metaobject": {
		"type": "member_profile",
		"fields": [
		    {
			"key": "name",
			"value": name
		    },
		    {
			"key": "email",
			"value": email
		    },
		    {
			"key": "role",
			"value": role
		    }
		]
	    }
	}
    });
    const {data: {metaobjectCreate: {metaobject, userErrors}}} = await response.json ();
    if (userErrors.length > 0) {
	throw new Error ("Something went wrong while creating the member");
    }
    return {handle: metaobject.handle};
    
};
export const validateLogin = async ({admin, username, password}: { password: string; admin: AdminApiContext; username: string }) => {
    try {
	const response = await admin.graphql (GET_MEMBER_PASSWORD_BY_EMAIL, {
	    variables: {
		key: username
	    }
	});
	const {data: {currentAppInstallation: {metafield}}} = await response.json ();
	if(!metafield){
	    return {isValidLogin: false};
	}
	const {handle, hashedPassword} = JSON.parse (metafield.value);
	if (!hashedPassword || !handle) {
	    return {isValidLogin: false};
	}
	return {
	    isValidLogin: await bcrypt.compare (password, hashedPassword),
	    handle
	}
    } catch (e) {
	console.error (e);
	return {isValidLogin: false};
    }
};

export const getMemberByHandle = async ({admin, handle}: { admin: AdminApiContext; handle: string }) => {
    const response = await admin.graphql (GET_MEMBER_BY_HANDLE, {
	variables: {
	    handle: {
		type: "member_profile",
		handle
	    }
	}
    });
    const {data: {metaobjectByHandle: {id, name, email, working_hours}}} = await response.json ();
    
    return {id, name, email, working_hours};
}

export const updateMember = async ({handle, id, name, working_hours, admin}: {id:string; working_hours: any; name: any; admin: AdminApiContext; handle: any }) => {
    console.log("Updating member", {handle, id, name, working_hours});
	const input = convertInput({name, working_hours});
	await admin.graphql (UPDATE_METAOBJECT, {
	    variables: {
		id,
		metaobject: {
		    fields: input
		}
	    }
	});
	
};


function convertInput(input) {
    return Object.keys(input).map(key => ({
	key: key,
	value: input[key].value
    }));
}
