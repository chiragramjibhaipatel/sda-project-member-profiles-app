const CreateMember = `#graphql
mutation CreateMember($metaobject: MetaobjectCreateInput!){
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
`;


export default CreateMember;