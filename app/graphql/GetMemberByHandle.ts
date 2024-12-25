const GetMemberByHandle = `#graphql
query GetMemberByHandle($handle: MetaobjectHandleInput!){
    metaobjectByHandle(handle:$handle){
        id
        fields{
            key
            jsonValue
            type
        }
    }
}
`;


export default GetMemberByHandle;