import { AdminGraphqlClient } from "@shopify/shopify-app-remix/server";
import GetAllMembers from "~/graphql/GetAllMembers";
import { GetAllMembersQuery } from "~/types/admin.generated";

export async function getMembers({
  graphql,
  startCursor,
  endCursor,
  direction = "next",
  reverse = false,
  selectedTab,
}: {
  graphql: AdminGraphqlClient;
  startCursor?: string;
  endCursor?: string;
  direction?: string;
  reverse?: boolean;
  selectedTab?: string;
}) {

  let query = "";
  query = getQuery({selectedTab})
  
    
  const variables = {
    type: "member_profile",
    query,
    sortKey: "updated_at",
    reverse,
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
function getQuery({selectedTab}: { selectedTab?: string; }) {
  let query = "";
  if (selectedTab === "Founders") {
    query = 'fields.role:"Founder"';
  } else if (selectedTab === "Founding Members") {
    query = 'fields.role:"Founding Member"';
  } else if (selectedTab === "Members") {
    query = 'fields.role:"Member"';
  }
  return query;
}

