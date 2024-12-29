const GetAllMembers = `#graphql
fragment MemberProfile on Metaobject {
    id
    name: field(key: "name") {
        value
    }
    email: field(key: "email") {
        value
    }
    updatedAt
}

fragment PageInfo on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
}

query GetAllMembers($type: String!, $query: String, $reverse: Boolean!, $sortKey: String!) {
  metaobjects(type: $type, first: 50, query: $query, reverse:$reverse, sortKey:$sortKey) {
    edges {
      node {
       ...MemberProfile
      }
    }
    pageInfo {
     ...PageInfo
    }
  }
}
`;

export default GetAllMembers;
