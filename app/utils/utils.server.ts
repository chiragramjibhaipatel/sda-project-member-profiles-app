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
import { MetaobjectField } from "~/types/admin.types";
import UpdateMember from "~/graphql/UpdateMember";
import { MemberProfileSchema } from "~/zodschema/MemberProfileSchema";

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
}: {
  appInstallationId: any;
  hashedPassword: string;
  admin: AdminApiContext;
  email: string;
  handle: string;
}) => {
  const namespace = "sda_member_hashed_password";
  const type = "json";
  const response = await admin.graphql(SaveHashedPassword, {
    variables: {
      metafields: {
        ownerId,
        namespace,
        key,
        value: JSON.stringify({ handle, hashedPassword }),
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
      return { isValidLogin: false };
    }
    const { handle, hashedPassword } = JSON.parse(metafield.value);
    if (!hashedPassword || !handle) {
      return { isValidLogin: false };
    }
    return {
      isValidLogin: await bcrypt.compare(password, hashedPassword),
      handle,
    };
  } catch (e) {
    console.error(e);
    return { isValidLogin: false };
  }
};

export const getMemberByHandle = async ({
  admin,
  handle,
}: {
  admin: AdminApiContext;
  handle: string;
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
  console.log("metaobjectByHandle", metaobjectByHandle);
  invariant(metaobjectByHandle, "No metaobjectByHandle in response");

  const member = mapToSchema(metaobjectByHandle.fields);
  console.log("member", member);
  const submission = MemberProfileSchema.safeParse({id: metaobjectByHandle.id, ...member});
  if (!submission.success) {
    console.error("submission.error", submission.error);
    throw new Error("Something went wrong while fetching the member");
  }
  return submission.data;
};

export const updateMember = async ({
  id,
  name,
  role,
  admin,
}: {
  id: string;
  name: string;
  role: string;
  admin: AdminApiContext;
}) => {
  let input = convertInputToGqlFormat({ name, role });
  // console.log("input", input);
  const response = await admin.graphql(UpdateMember,{
    variables: {
      id,
      metaobject: {
        fields: input,
      },
    },
  });
  const {data} = await response.json() as {data: UpdateMemberMutation};

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
  fields: Pick<MetaobjectField, "type" | "key" | "jsonValue">[],
) {
  return fields.reduce(
    (acc, field) => {
      acc[field.key] = field.jsonValue;
      return acc;
    },
    {} as { [key: string]: any },
  );
}
