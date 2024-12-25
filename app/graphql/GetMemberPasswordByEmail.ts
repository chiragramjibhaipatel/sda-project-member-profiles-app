const GetMemberPasswordByEmail = `#graphql
query GetMemberPasswordByEmail($key: String!){
    currentAppInstallation{
        metafield(namespace:"sda_member_hashed_password", key:$key){
            value
        }
    }
}
`;


export default GetMemberPasswordByEmail;