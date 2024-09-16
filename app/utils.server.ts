import bcrypt from "bcryptjs";
import {AdminApiContext} from "@shopify/shopify-app-remix/server";
import {redirect} from "@remix-run/node";

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
            name: field(key:"name"){
                value
            }
            email: field(key:"email"){
                value
            }
        }
    }
`

const GET_MEMBER_BY_EMAIL = `#graphql
    query GetMemberByEmail($query: String!){
        metaobjects(first:1, query: $query, type:"member_profile"){
            edges{
                node{
                    handle
                    fields{
                        value
                        key
                    }
                }
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
export const validateLogin = async ({admin, username, password}: { password: string; admin: AdminApiContext; username: string }) => {
    let isValidLogin = false;
    console.log("Inside validateLogin");
    const response = await admin.graphql(GET_MEMBER_PASSWORD_BY_EMAIL, {
        variables:{
            key: username
        }
    });
    const {data: {currentAppInstallation: {metafield: {value: hashedPassword}}}} = await response.json();
    console.log("Value", hashedPassword);
    if(!hashedPassword){
        return {isValidLogin};
    }
    console.log ("checking password");
    isValidLogin = await bcrypt.compare(password, hashedPassword);
    console.log("isValidLogin", isValidLogin);
    return {
        isValidLogin
    }
};

    export const getMemberByEmail =async ({admin, username}: { admin: AdminApiContext; username: File | string | null }) => {
    const response = await admin.graphql(GET_MEMBER_BY_EMAIL,{
        variables:{
            query: `email:${username}`
        }
    });
    const {data: {metaobjects: {edges}}} = await response.json();
    if(edges.length === 0){
        throw new Error("Member not found");
    }
        const {node} = edges[0];
    
        console.log("Member", node);
        return {handle: node.handle};
};

    export const getMemberByHandle = async ({admin, handle}: { admin: AdminApiContext; handle: string }) => {
        const response = await admin.graphql(GET_MEMBER_BY_HANDLE, {
                variables:{
                        handle: {
                            type: "member_profile",
                            handle
                        }
                }
        });
        const {data: {metaobjectByHandle: {name, email}}} = await response.json();
        console.log("Name", name);
        
        return {name, email};
    }
