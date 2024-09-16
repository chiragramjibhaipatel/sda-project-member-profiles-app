import bcrypt from "bcryptjs";
import type {AdminApiContext} from "@shopify/shopify-app-remix";

export const createHashedPassword = async ({password}: {password: string;}) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
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
export const getAppInstallationId = async (admin: AdminApiContext) => {
    try{
        const response = await admin.graphql(CURRENT_APP_INSTALLATION)
        const {data: {currentAppInstallation: {id}}} = await response.json();
        return {id};
    } catch(e){
        console.error(e)
        throw new Error("Something went wrong while fetching the app installation id");
    }
    
    
    
};
export const storeHashedPassword = async ({appInstallationId: ownerId, hashedPassword, email: key, admin}: { appInstallationId: any; hashedPassword: string; admin: AdminApiContext; email: string }) => {
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
export const createMember = async ({role, name, email, admin}: { role: string; name: string; admin: AdminApiContext; email: string }) => {
    const response = await admin.graphql(CREATE_MEMBER, {
        variables: {
            "metaobject" : {
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
    const {data: {metaobjectCreate: {metaobject, userErrors}}} = await response.json();
    if(userErrors.length > 0){
        throw new Error("Something went wrong while creating the member");
    }
    return {handle: metaobject.handle};
    
};
