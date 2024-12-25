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
