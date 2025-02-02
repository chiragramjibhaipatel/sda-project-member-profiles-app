import { z } from 'zod';
import { MetaobjectField as AdminMetaobjectField, Maybe, MetafieldReference } from '~/types/admin.types';

export type ObjectValues<T> = T[keyof T];
export const MetafieldType = {
  BOOLEAN: 'boolean',
  DATE_TIME: 'date_time',
  JSON: 'json',
  NUMBER_DECIMAL: 'number_decimal',
  NUMBER_INTEGER: 'number_integer',
  SINGLE_LINE_TEXT_FIELD: 'single_line_text_field',
  NULL: 'null',
  URL: 'url',
  LIST_SINGLE_LINE_TEXT_FIELD: 'list.single_line_text_field',
  RICH_TEXT_FIELD: 'rich_text_field',
  METAOBJECT_REFERENCE: 'metaobject_reference',
  LIST_METAOBJECT_REFERENCE: 'list.metaobject_reference',
} as const;
export type MetafieldType = ObjectValues<typeof MetafieldType>;


interface MetaobjectFieldBase {
  valueType: MetafieldType;
  key: string;
}

export interface BooleanMetaobjectField extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.BOOLEAN;
  value: boolean;
}

export interface DateTimeMetaobjectField extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.DATE_TIME;
  value: Date;
}

export interface JsonMetaobjectField extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.JSON;
  value: any;
}

export interface NumberDecimalMetaobjectField extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.NUMBER_DECIMAL;
  value: number;
}

export interface NumberIntegerMetaobjectField extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.NUMBER_INTEGER;
  value: number;
}

export interface SingleLineTextFieldMetaobjectField
  extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.SINGLE_LINE_TEXT_FIELD;
  value: string;
}

export interface NullMetaobjectField extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.NULL;
  value: null;
}

export interface UrlMetaobjectField extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.URL;
  value: string;
}

export interface ListSingleLineTextFieldMetaobjectField extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.LIST_SINGLE_LINE_TEXT_FIELD;
  value: string[];
}

export interface RichTextFieldMetaobjectField extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.RICH_TEXT_FIELD;
  value: string;
}

export interface MetaobjectReferenceMetaobjectField extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.METAOBJECT_REFERENCE;
  value:string;
  reference: MetaobjectField;
}

export interface ListMetaobjectReferenceMetaobjectField extends MetaobjectFieldBase {
  valueType: typeof MetafieldType.LIST_METAOBJECT_REFERENCE;
  value: string[];
  references: MetaobjectField[];

}

export type MetaobjectField =
  | BooleanMetaobjectField
  | DateTimeMetaobjectField
  | JsonMetaobjectField
  | NumberDecimalMetaobjectField
  | NumberIntegerMetaobjectField
  | SingleLineTextFieldMetaobjectField
  | NullMetaobjectField
  | UrlMetaobjectField
  | ListSingleLineTextFieldMetaobjectField
  | RichTextFieldMetaobjectField
  | MetaobjectReferenceMetaobjectField
  | ListMetaobjectReferenceMetaobjectField;

export type NonNullMetaobjectField = Exclude<
  MetaobjectField,
  NullMetaobjectField
>;

export const MemberProfileSchemaForAdmin = z
  .object({
    id: z.string().optional(),
    name: z.string().min(3),
    role: z.enum(["Founder", "Founding Member", "Member"]),
    email: z.string().min(3).email(),
  });

  export const ReviewSchema = z.object({
    id: z.string().optional(),
    reference: z.string().optional(),
    review_content: z.any().optional().nullable(),
    reviewer: z.string().optional(),
    link: z.string().url().optional().nullable(),
  })

export const MemberProfileSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(3),
    email: z.string().min(3).email(),
    profile: z.boolean().optional().nullable().transform(value => value || false),
    open_to_work: z.boolean().optional().nullable().transform(value => value || false),
    tagline: z.string().optional().nullable(),
    working_hours: z.string().optional().nullable(),
    languages: z.array(z.string()).optional().nullable(),
    website: z.string().url().optional().nullable(),
    twitter: z.string().url().optional().nullable(),
    linked_in: z.string().url().optional().nullable(),
    github: z.string().url().optional().nullable(),
    you_tube: z.string().url().optional().nullable(),
    alternative_contact: z.string().url().optional().nullable(),
    primary_service: z.string().optional().nullable(),
    services: z.array(z.string()).optional().nullable(),
    technologies: z.array(z.string()).optional().nullable(),
    industry_experience: z.array(z.string()).optional().nullable(),
    // description: z.any().optional().nullable(),
    review: z.object({ids: z.array(z.string()), references: z.array(ReviewSchema).optional().nullable().readonly()}).optional().nullable(), 
    //todo: in sda store this fields is called reviews, but in my test store it is review, I have tried once to delte it and create a new field called reviews, but it is not working, so I have to keep it as review
  });

export type MemberProfileSchemaType = z.infer<typeof MemberProfileSchema>;

const PasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
})


export const MemberProfileSchemaWithPassword = MemberProfileSchemaForAdmin.merge(PasswordSchema).refine(
  ({ confirmPassword, password }) => password === confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type MemberProfileSchemaWithPasswordType = z.infer<typeof MemberProfileSchemaWithPassword>;

export function mapAdminResponseToMetaobjectField(
  field: Pick<AdminMetaobjectField, 'key' | 'value' | 'type' | 'reference' | 'references'>,
): MetaobjectField {
  const { key, type, value, reference, references } = field;

  if (!value) {
    return {
      key: key,
      valueType: MetafieldType.NULL,
      value: null,
    };
  }

  switch (type) {
    case MetafieldType.DATE_TIME:
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) {
        throw new Error(`Invalid date value for field '${key}'`);
      }
      return {
        key: key,
        valueType: type,
        value: dateValue,
      };
    case MetafieldType.BOOLEAN:
      if (value !== 'true' && value !== 'false') {
        throw new Error(`Invalid boolean value for field '${key}'`);
      }
      const booleanValue = value === 'true';
      return {
        key: key,
        valueType: type,
        value: booleanValue,
      };
    case MetafieldType.JSON:
      let jsonValue;
      try {
        jsonValue = JSON.parse(value);
      } catch (error) {
        throw new Error(`Invalid JSON value for field '${key}'`);
      }
      return {
        key: key,
        valueType: type,
        value: jsonValue,
      };
    case MetafieldType.NUMBER_DECIMAL:
      const decimalValue = parseFloat(value);
      if (isNaN(decimalValue)) {
        throw new Error(`Invalid decimal number value for field '${key}'`);
      }
      return {
        key: key,
        valueType: type,
        value: decimalValue,
      };
    case MetafieldType.NUMBER_INTEGER:
      const numberValue = parseInt(value, 10);
      if (isNaN(numberValue)) {
        throw new Error(`Invalid integer number value for field '${key}'`);
      }
      return {
        key: key,
        valueType: type,
        value: numberValue,
      };
    case MetafieldType.SINGLE_LINE_TEXT_FIELD:
      return {
        key: key,
        valueType: type,
        value: value,
      };
    case MetafieldType.NULL:
      return {
        key: key,
        valueType: type,
        value: null,
      };
    case MetafieldType.URL:
      return {
        key: key,
        valueType: type,
        value: value,
      };
    case MetafieldType.LIST_SINGLE_LINE_TEXT_FIELD:
      let listValue;
      try {
        listValue = JSON.parse(value);
      } catch (error) {
        throw new Error(`Invalid list value for field '${key}'`);
      }
      return {
        key: key,
        valueType: type,
        value: listValue,
      };
    case MetafieldType.RICH_TEXT_FIELD:
      let richTextFieldValue; 
      try {
        richTextFieldValue = JSON.parse(value);
      } catch (error) {
        throw new Error(`Invalid rich text value for field '${key}'`);
      }
      return {
        key: key,
        valueType: type,
        value: richTextFieldValue,
      };
    case MetafieldType.METAOBJECT_REFERENCE:
      let referenceData;
      console.log({reference})
      if(reference && reference.__typename === "Metaobject"){
        let referenceFields;
        referenceFields = reference.fields.map(field => mapAdminResponseToMetaobjectField(field));
        referenceData = {id: reference.id, ...mapToSchema(referenceFields)};
      }
      return {
        key: key,
        valueType: type,
        value: value,
        reference: referenceData,        
      };
    case MetafieldType.LIST_METAOBJECT_REFERENCE:
      let listReferenceData : (Maybe<MetafieldReference> | undefined)[] = [];
      if(references){
        listReferenceData = references.edges.map(edge => edge.node);
      }
      let listReferenceDataWithFields = listReferenceData.map(reference => {
        if(reference && reference.__typename === "Metaobject"){
          let fields = reference.fields.map(field => mapAdminResponseToMetaobjectField(field));
          return {id: reference.id, ...mapToSchema(fields)};
        }
        return null;
      });
      return {
        key: key,
        valueType: type,
        value: JSON.parse(value),
        references: listReferenceDataWithFields,
      };
    default:
      throw new Error(
        `Unsupported field type '${field.type}' for field '${field.key}'`,
      );
  }
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