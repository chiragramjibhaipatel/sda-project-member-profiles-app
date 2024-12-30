import { AdminGraphqlClient } from "@shopify/shopify-app-remix/server";
import GetAllMembers from "~/graphql/GetAllMembers";
import { GetAllMembersQuery } from "~/types/admin.generated";

export async function getMembers({
  graphql,
  startCursor,
  endCursor,
  direction = "next",
  selectedTab,
  sortSelected = "updated_at asc",
  queryValue = "",
}: {
  graphql: AdminGraphqlClient;
  startCursor?: string;
  endCursor?: string;
  direction?: string;
  selectedTab?: string;
  sortSelected?: string;
  queryValue?: string;
}) {
  let query = "";
  if(queryValue){
    query = `display_name:${queryValue}*`;
  }
  query = getQuery({ query, selectedTab });
  const sortKey = sortSelected.split(" ")[0];
  const reverse = sortSelected.includes("desc");

  const variables = {
    type: "member_profile",
    query,
    sortKey,
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
function getQuery({query, selectedTab}: { query: string; selectedTab?: string; }) {
  if(query){
    query = `${query} AND `;
  }
  if (selectedTab === "Founders") {
    query += 'fields.role:"Founder"';
  } else if (selectedTab === "Founding Members") {
    query += 'fields.role:"Founding Member"';
  } else if (selectedTab === "Members") {
    query += 'fields.role:"Member"';
  }
  return query;
}

