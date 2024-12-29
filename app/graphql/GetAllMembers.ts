const GetAllMembers = `#graphql
fragment MemberProfile on Metaobject {
    id
    name: field(key: "name") {
        value
    }
    email: field(key: "email") {
        value
    }
}

fragment PageInfo on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
}

query GetAllMembers($type: String!, $query: String) {
  metaobjects(type: $type, first: 50, query: $query, reverse: true) {
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
