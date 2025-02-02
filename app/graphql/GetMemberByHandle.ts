const GetMemberByHandle = `#graphql
query GetMemberByHandle($handle: MetaobjectHandleInput!) {
  metaobjectByHandle(handle: $handle) {
    id
    fields {
      key
      value
      type
      references(first: 20) {
        edges {
          node {
            ... on Metaobject {
              id
              __typename
              fields {
                key
                value
                type
              }
            }
          }
        }
      }
    }
  }
}
`;


export default GetMemberByHandle;