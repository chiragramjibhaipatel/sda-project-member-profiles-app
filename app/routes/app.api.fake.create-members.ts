import { faker } from "@faker-js/faker";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { AdminApiContext } from "@shopify/shopify-app-remix/server";
import invariant from "tiny-invariant";
import { authenticate } from "~/shopify.server";
import { images } from "~/data/mockdata";
import CreateMember from "~/graphql/CreateMember";
import { createMember } from "~/utils/utils.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const { _action } = Object.fromEntries(formData);
  invariant(_action, "Action is required");

  switch (_action) {
    case "create":
      await createFakeMemberProfiles({ admin });
  }
  return json({ status: "success" });
};

async function createFakeMemberProfiles({ admin }: { admin: AdminApiContext }) {
  const profiles = [];
  for (let i = 0; i < 10; i++) {
    const profile = {
      type: "member_profile",
      fields: {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        role: ["Founder", "Member", "Founding Member"][
          Math.floor(Math.random() * 3)
        ],
      },
    };
    profiles.push(profile);
  }

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    console.log("Creating member", profile.fields.name);
    await createMember({
      admin,
      name: profile.fields.name,
      email: profile.fields.email,
      role: profile.fields.role,
    });
  }
}
