const GetMemberByHandle = `#graphql
query GetMemberByHandle($handle: MetaobjectHandleInput!){
    metaobjectByHandle(handle:$handle){
        id
        fields{
            key
            value
            type
        }
    }
}
`;


export default GetMemberByHandle;