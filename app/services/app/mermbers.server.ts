import { AdminGraphqlClient } from "@shopify/shopify-app-remix/server";
import GetAllMembers from "~/graphql/GetAllMembers";
import { GetAllMembersQuery } from "~/types/admin.generated";

export async function getMembers({ graphql }: { graphql: AdminGraphqlClient }) {
  const response = await graphql(GetAllMembers, {
    variables: {
      type: "member_profile",
      query: "",
      sortKey: "updated_at",
      reverse: true,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch members");
  }
  const responseJson = (await response.json()) as { data: GetAllMembersQuery };

  return {members: responseJson.data}

}
