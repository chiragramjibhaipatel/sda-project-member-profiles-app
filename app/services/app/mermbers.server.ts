import { AdminGraphqlClient } from "@shopify/shopify-app-remix/server";
import GetAllMembers from "~/graphql/GetAllMembers";
import { GetAllMembersQuery } from "~/types/admin.generated";

export async function getMembers({
  graphql,
  startCursor,
  endCursor,
  direction,
}: {
  graphql: AdminGraphqlClient;
  startCursor?: string;
  endCursor?: string;
  direction?: string;
}) {
  
    
  const variables = {
    type: "member_profile",
    query: "",
    sortKey: "updated_at",
    reverse: true,
    first: direction === "next" ? 50 : undefined,
    after: direction === "next" ? endCursor : undefined,
    last: direction === "previous" ? 50 : undefined,
    before: direction === "previous" ? startCursor : undefined,
  };

  const response = await graphql(GetAllMembers, { variables });
  if (!response.ok) {
    throw new Error("Failed to fetch members");
  }
  const responseJson = (await response.json()) as { data: GetAllMembersQuery };

  return { members: responseJson.data };
}
