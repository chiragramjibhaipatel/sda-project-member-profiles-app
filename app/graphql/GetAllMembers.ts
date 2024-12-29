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

query GetAllMembers($type: String!, $query: String, $reverse: Boolean!, $sortKey: String!, $after: String, $before: String, $first: Int, $last: Int) {
  metaobjects(type: $type, first: $first, last: $last, query: $query, reverse:$reverse, sortKey:$sortKey, after: $after, before: $before) {
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
