import bcrypt from "bcryptjs";
import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import SaveHashedPassword from "~/graphql/SaveHashedPassword";
import CurrentAppInstallation from "~/graphql/CurrentAppInstallation";
import CreateMember from "~/graphql/CreateMember";
import GetMemberPasswordByEmail from "~/graphql/GetMemberPasswordByEmail";
import GetMemberByHandle from "~/graphql/GetMemberByHandle";
import {
  CreateMemberMutation,
  CurrentAppInstallationQuery,
  GetMemberByHandleQuery,
  GetMemberPasswordByEmailQuery,
  SaveHashedPasswordMutation,
  UpdateMemberMutation,
} from "~/types/admin.generated";
import invariant from "tiny-invariant";
import UpdateMember from "~/graphql/UpdateMember";
import { mapAdminResponseToMetaobjectField, MemberProfileSchema, MemberProfileSchemaForAdmin, MetaobjectField } from "~/zodschema/MemberProfileSchema";
import { MemberPasswordSchema } from "~/zodschema/MemberPassword";

export const createHashedPassword = async ({
  password,
}: {
  password: string;
}) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return { hashedPassword };
};

export const getAppInstallationId = async (admin: AdminApiContext) => {
  try {
    const response = await admin.graphql(CurrentAppInstallation);
    const { data } = (await response.json()) as {
      data: CurrentAppInstallationQuery;
    };
    console.log("data", data);

    return { id: data.currentAppInstallation.id };
  } catch (e) {
    console.error(e);
    throw new Error(
      "Something went wrong while fetching the app installation id",
    );
  }
};
export const storeHashedPassword = async ({
  appInstallationId: ownerId,
  hashedPassword,
  email: key,
  handle,
  admin,
  isNew = false,
}: {
  appInstallationId: any;
  hashedPassword: string;
  admin: AdminApiContext;
  email: string;
  handle: string;
  isNew?: boolean;
}) => {
  const namespace = "sda_member_hashed_password";
  const type = "json";
  const response = await admin.graphql(SaveHashedPassword, {
    variables: {
      metafields: {
        ownerId,
        namespace,
        key,
        value: JSON.stringify({ handle, hashedPassword, needReset: isNew }),
        type,
      },
    },
  });
  const { data } = (await response.json()) as {
    data: SaveHashedPasswordMutation;
  };
  const { metafieldsSet } = data;
  if (metafieldsSet?.userErrors && metafieldsSet.userErrors.length > 0) {
    throw new Error("Something went wrong while storing the hashed password");
  }
};
export const createMember = async ({
  role,
  name,
  email,
  admin,
}: {
  role: string;
  name: string;
  admin: AdminApiContext;
  email: string;
}) => {
  const response = await admin.graphql(CreateMember, {
    variables: {
      metaobject: {
        type: "member_profile",
        fields: [
          {
            key: "name",
            value: name,
          },
          {
            key: "email",
            value: email,
          },
          {
            key: "role",
            value: role,
          },
          {
            key: "profile",
            value: "false",
          },
        ],
      },
    },
  });
  const { data } = (await response.json()) as { data: CreateMemberMutation };
  invariant(data.metaobjectCreate, "No metaobjectCreate in response");
  const { metaobject, userErrors } = data.metaobjectCreate;

  if (userErrors.length > 0) {
    console.error("userErrors", JSON.stringify(userErrors));
    throw new Error("Something went wrong while creating the member");
  }
  invariant(metaobject, "No metaobject in response");
  return { handle: metaobject.handle };
};
export const validateLogin = async ({
  admin,
  username,
  password,
}: {
  password: string;
  admin: AdminApiContext;
  username: string;
}) => {
  try {
    const memberPassword = await getMemberPasswordByEmail({ admin, username });
    if (!memberPassword) {
      return { isValidLogin: false, handle: null, needReset: false };
    }
    const isValidLogin = await bcrypt.compare(password, memberPassword.hashedPassword);
    return {
      isValidLogin,
      handle: memberPassword.handle,
      needReset: memberPassword.needReset,
    };
  } catch (e) {
    console.error(e);
    return { isValidLogin: false, handle: null, needReset: false };
  }
};

export const getMemberPasswordByEmail = async ({
  admin,
  username,
}: {
  admin: AdminApiContext;
  username: string;
}) => {
  const response = await admin.graphql(GetMemberPasswordByEmail, {
    variables: {
      key: username,
    },
  });
  const { data } = (await response.json()) as {
    data: GetMemberPasswordByEmailQuery;
  };
  const { metafield } = data.currentAppInstallation;
  if (!metafield) {
    return null;
  }
  const submission = MemberPasswordSchema.safeParse(JSON.parse(metafield.value))
  if (!submission.success) {
    return null;
  }
  const { handle, hashedPassword, needReset } = submission.data;
  return { handle, hashedPassword, needReset };
}

export const getMemberByHandle = async ({
  admin,
  handle,
  isAdmin = false,
}: {
  admin: AdminApiContext;
  handle: string;
  isAdmin?: boolean;
}) => {
  const response = await admin.graphql(GetMemberByHandle, {
    variables: {
      handle: {
        type: "member_profile",
        handle,
      },
    },
  });
  const { data } = (await response.json()) as { data: GetMemberByHandleQuery };
  const { metaobjectByHandle } = data;
  invariant(metaobjectByHandle, "No metaobjectByHandle in response");

  const typedMetaobjectFields = metaobjectByHandle.fields.map(mapAdminResponseToMetaobjectField);
  const member = {id: metaobjectByHandle.id, ...mapToSchema(typedMetaobjectFields)};
  const submission = isAdmin ? MemberProfileSchemaForAdmin.safeParse(member) : MemberProfileSchema.safeParse(member);
  if (!submission.success) {
    console.error("submission.error", submission.error);
    throw new Error("Something went wrong while parsing the member data");
  }
  return submission.data;
};

export const updateMember = async ({
  id,
  admin,
  ...fields
}: {
  id: string;
  admin: AdminApiContext;
  [key: string]: any;
}) => {

  //todo: make sure it actually change the status of the member based on the public profile. The expected behaviour is: memeber profile is only visible if the public profile is true.
  let input = convertInputToGqlFormat(fields);
  // console.log("input", input);
  const response = await admin.graphql(UpdateMember, {
    variables: {
      id,
      metaobject: {
        fields: input,
      },
    },
  });
  const { data } = await response.json() as { data: UpdateMemberMutation };

  const { metaobjectUpdate } = data;
  invariant(metaobjectUpdate, "No metaobjectUpdate in response");

  if (metaobjectUpdate?.userErrors.length > 0) {
    console.error("userErrors", JSON.stringify(metaobjectUpdate.userErrors));
    throw new Error("Something went wrong while updating the member");
  }
};

const fieldsWithRichText = [
  "description",
  "additional_services",
  "skills_and_technologies_additional_notes",
  "portfolio_sites",
  "other_links",
];
function convertInputToGqlFormat(input: { [key: string]: any }) {
  return Object.keys(input).map((key) => {
    let value = input[key];
    if (fieldsWithRichText.includes(key)) {
      value = {
        type: "root",
        children: [
          { type: "paragraph", children: [{ text: value, type: "text" }] },
        ],
      };
      // value = JSON.stringify(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      console.log("value", value);
    } else {
      value = typeof value !== "string" ? JSON.stringify(value) : value;
    }
    return {
      key: key,
      value: value || "",
    };
  });
}

function mapToSchema(
  fields: MetaobjectField[],
) {
  return fields.reduce(
    (acc, field) => {
      acc[field.key] = field.value;
      return acc;
    },
    {} as { [key: string]: any },
  );
}
