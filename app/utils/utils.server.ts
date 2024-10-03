import bcrypt from "bcryptjs";
import type { AdminApiContext } from "@shopify/shopify-app-remix/server";

export const createHashedPassword = async ({
  password,
}: {
  password: string;
}) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return { hashedPassword };
};

const CURRENT_APP_INSTALLATION = `#graphql
query {
    currentAppInstallation {
        id
    }
}
`;

const SAVE_HASHED_PASSWORD = `#graphql
mutation MetafieldsSet($metafields: MetafieldsSetInput!){
    metafieldsSet(
        metafields:[$metafields]
    ) {
        metafields {
            id
            namespace
            key
            value
        }
        userErrors {
            field
            message
        }
    }
}
`;

const CREATE_MEMBER = `#graphql
mutation Metaobjectreate($metaobject: MetaobjectCreateInput!){
    metaobjectCreate(metaobject: $metaobject) {
        metaobject {
            id
            handle
        }
        userErrors{
            field
            message
        }
    }
}
`;

const GET_MEMBER_PASSWORD_BY_EMAIL = `#graphql
query getAppInstallation($key: String!){
    currentAppInstallation{
        metafield(namespace:"sda_member_hashed_password", key:$key){
            value
        }
    }
}
`;

const GET_MEMBER_BY_HANDLE = `#graphql
query GetMemner($handle: MetaobjectHandleInput!){
    metaobjectByHandle(handle:$handle){
        id
        fields{
            key
            jsonValue
            type
        }
    }
}
`;

const UPDATE_METAOBJECT = `#graphql
mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject ) {
        userErrors {
            field
            message
            code
        }
    }
}
`;
export const getAppInstallationId = async (admin: AdminApiContext) => {
  try {
    const response = await admin.graphql(CURRENT_APP_INSTALLATION);
    const {
      data: {
        currentAppInstallation: { id },
      },
    } = await response.json();
    return { id };
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
  const response = await admin.graphql(SAVE_HASHED_PASSWORD, {
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
  const {
    data: {
      metafieldsSet: { userErrors },
    },
  } = await response.json();
  if (userErrors.length > 0) {
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
  const response = await admin.graphql(CREATE_MEMBER, {
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
        ],
      },
    },
  });
  const {
    data: {
      metaobjectCreate: { metaobject, userErrors },
    },
  } = await response.json();
  if (userErrors.length > 0) {
    throw new Error("Something went wrong while creating the member");
  }
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
    const response = await admin.graphql(GET_MEMBER_PASSWORD_BY_EMAIL, {
      variables: {
        key: username,
      },
    });
    const {
      data: {
        currentAppInstallation: { metafield },
      },
    } = await response.json();
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
  const response = await admin.graphql(GET_MEMBER_BY_HANDLE, {
    variables: {
      handle: {
        type: "member_profile",
        handle,
      },
    },
  });
  const {
    data: { metaobjectByHandle },
  } = await response.json();
  const {
    id,
    fields,
  }: { id: string; fields: [{ key: string; jsonValue: any; type: string }] } =
    metaobjectByHandle;
  const member = convertInputToJSONObjectFormat({ fields });
  return { id, ...member };
};

export const updateMember = async ({
  id,
  fields,
  admin,
}: {
  id: string;
  fields: { [key: string]: any };
  admin: AdminApiContext;
}) => {
  let input = convertInputToGqlFormat(fields);
  input = JSON.stringify(input);
  console.log("input", input);
  const variables = {
    id,
    metaobject: {
      fields: { name: "testname" },
    },
  };
  console.dir(variables, { depth: null });

  // const response = await admin.graphql(UPDATE_METAOBJECT, {
  //   variables,
  // });
  const response = await admin.graphql(`mutation {
    metaobjectUpdate(
      id: "gid://shopify/Metaobject/76185010466"
      metaobject: {fields: {key: "name", value: "testname"}}
    ) {
      metaobject {
        handle
        fields {
          key
          jsonValue
          type
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }`);
  const {
    data: {
      metaobjectUpdate: { userErrors },
    },
  } = await response.json();
  if (userErrors.length > 0) {
    console.error("userErrors", userErrors);
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

//ref: https://community.shopify.com/c/metafields-and-custom-data/limited-functionality-of-rich-text-field-in-metaobjects/m-p/2130345
//todo: this function will always return the very first value of the jsonValue array, need to have better implementation to handle this
function getDeepFieldFromJSON(jsonValue: any) {
  if (!jsonValue) {
    return "";
  }
  return jsonValue?.children[0]?.children[0]?.value || "";
}

function convertInputToJSONObjectFormat({
  fields,
}: {
  fields: [{ key: string; jsonValue: any; type: string }];
}) {
  const result = {} as { [key: string]: any };
  fields.forEach((field) => {
    if (field.type === "rich_text_field") {
      result[field.key] = getDeepFieldFromJSON(field.jsonValue);
    } else if (field.jsonValue !== null) {
      result[field.key] = field.jsonValue;
    }
  });
  return result;
}
