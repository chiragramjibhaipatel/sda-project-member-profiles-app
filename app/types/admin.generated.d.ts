/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type CreateMemberMutationVariables = AdminTypes.Exact<{
  metaobject: AdminTypes.MetaobjectCreateInput;
}>;


export type CreateMemberMutation = { metaobjectCreate?: AdminTypes.Maybe<{ metaobject?: AdminTypes.Maybe<Pick<AdminTypes.Metaobject, 'id' | 'handle'>>, userErrors: Array<Pick<AdminTypes.MetaobjectUserError, 'field' | 'message'>> }> };

export type CurrentAppInstallationQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type CurrentAppInstallationQuery = { currentAppInstallation: Pick<AdminTypes.AppInstallation, 'id'> };

export type MemberProfileFragment = (
  Pick<AdminTypes.Metaobject, 'id' | 'updatedAt' | 'handle'>
  & { name?: AdminTypes.Maybe<Pick<AdminTypes.MetaobjectField, 'value'>>, email?: AdminTypes.Maybe<Pick<AdminTypes.MetaobjectField, 'value'>> }
);

export type PageInfoFragment = Pick<AdminTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'>;

export type GetAllMembersQueryVariables = AdminTypes.Exact<{
  type: AdminTypes.Scalars['String']['input'];
  query?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  reverse: AdminTypes.Scalars['Boolean']['input'];
  sortKey: AdminTypes.Scalars['String']['input'];
  after?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  before?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
  first?: AdminTypes.InputMaybe<AdminTypes.Scalars['Int']['input']>;
  last?: AdminTypes.InputMaybe<AdminTypes.Scalars['Int']['input']>;
}>;


export type GetAllMembersQuery = { metaobjects: { edges: Array<{ node: (
        Pick<AdminTypes.Metaobject, 'id' | 'updatedAt' | 'handle'>
        & { name?: AdminTypes.Maybe<Pick<AdminTypes.MetaobjectField, 'value'>>, email?: AdminTypes.Maybe<Pick<AdminTypes.MetaobjectField, 'value'>> }
      ) }>, pageInfo: Pick<AdminTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'> } };

export type GetMemberByHandleQueryVariables = AdminTypes.Exact<{
  handle: AdminTypes.MetaobjectHandleInput;
}>;


export type GetMemberByHandleQuery = { metaobjectByHandle?: AdminTypes.Maybe<(
    Pick<AdminTypes.Metaobject, 'id'>
    & { fields: Array<Pick<AdminTypes.MetaobjectField, 'key' | 'jsonValue' | 'type'>> }
  )> };

export type GetMemberPasswordByEmailQueryVariables = AdminTypes.Exact<{
  key: AdminTypes.Scalars['String']['input'];
}>;


export type GetMemberPasswordByEmailQuery = { currentAppInstallation: { metafield?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'value'>> } };

export type SaveHashedPasswordMutationVariables = AdminTypes.Exact<{
  metafields: AdminTypes.MetafieldsSetInput;
}>;


export type SaveHashedPasswordMutation = { metafieldsSet?: AdminTypes.Maybe<{ metafields?: AdminTypes.Maybe<Array<Pick<AdminTypes.Metafield, 'id' | 'namespace' | 'key' | 'value'>>>, userErrors: Array<Pick<AdminTypes.MetafieldsSetUserError, 'field' | 'message'>> }> };

export type UpdateMemberMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
  metaobject: AdminTypes.MetaobjectUpdateInput;
}>;


export type UpdateMemberMutation = { metaobjectUpdate?: AdminTypes.Maybe<{ metaobject?: AdminTypes.Maybe<Pick<AdminTypes.Metaobject, 'id' | 'handle'>>, userErrors: Array<Pick<AdminTypes.MetaobjectUserError, 'field' | 'message'>> }> };

interface GeneratedQueryTypes {
  "#graphql\nquery CurrentAppInstallation {\n    currentAppInstallation {\n        id\n    }\n}\n": {return: CurrentAppInstallationQuery, variables: CurrentAppInstallationQueryVariables},
  "#graphql\nfragment MemberProfile on Metaobject {\n    id\n    name: field(key: \"name\") {\n        value\n    }\n    email: field(key: \"email\") {\n        value\n    }\n  updatedAt\n  handle\n}\n\nfragment PageInfo on PageInfo {\n    hasNextPage\n    hasPreviousPage\n    startCursor\n    endCursor\n}\n\nquery GetAllMembers($type: String!, $query: String, $reverse: Boolean!, $sortKey: String!, $after: String, $before: String, $first: Int, $last: Int) {\n  metaobjects(type: $type, first: $first, last: $last, query: $query, reverse:$reverse, sortKey:$sortKey, after: $after, before: $before) {\n    edges {\n      node {\n       ...MemberProfile\n      }\n    }\n    pageInfo {\n     ...PageInfo\n    }\n  }\n}\n": {return: GetAllMembersQuery, variables: GetAllMembersQueryVariables},
  "#graphql\nquery GetMemberByHandle($handle: MetaobjectHandleInput!){\n    metaobjectByHandle(handle:$handle){\n        id\n        fields{\n            key\n            jsonValue\n            type\n        }\n    }\n}\n": {return: GetMemberByHandleQuery, variables: GetMemberByHandleQueryVariables},
  "#graphql\nquery GetMemberPasswordByEmail($key: String!){\n    currentAppInstallation{\n        metafield(namespace:\"sda_member_hashed_password\", key:$key){\n            value\n        }\n    }\n}\n": {return: GetMemberPasswordByEmailQuery, variables: GetMemberPasswordByEmailQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\nmutation CreateMember($metaobject: MetaobjectCreateInput!){\n    metaobjectCreate(metaobject: $metaobject) {\n        metaobject {\n            id\n            handle\n        }\n        userErrors{\n            field\n            message\n        }\n    }\n}\n": {return: CreateMemberMutation, variables: CreateMemberMutationVariables},
  "#graphql\nmutation SaveHashedPassword($metafields: MetafieldsSetInput!){\n    metafieldsSet(\n        metafields:[$metafields]\n    ) {\n        metafields {\n            id\n            namespace\n            key\n            value\n        }\n        userErrors {\n            field\n            message\n        }\n    }\n}\n": {return: SaveHashedPasswordMutation, variables: SaveHashedPasswordMutationVariables},
  "#graphql\nmutation UpdateMember($id: ID!, $metaobject: MetaobjectUpdateInput!){\n    metaobjectUpdate(id: $id, metaobject: $metaobject) {\n        metaobject {\n            id\n            handle\n        }\n        userErrors{\n            field\n            message\n        }\n    }\n}\n": {return: UpdateMemberMutation, variables: UpdateMemberMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
