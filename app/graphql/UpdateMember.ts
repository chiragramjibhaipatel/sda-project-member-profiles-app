const UpdateMember = `#graphql
mutation UpdateMember($id: ID!, $metaobject: MetaobjectUpdateInput!){
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
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

export default UpdateMember;