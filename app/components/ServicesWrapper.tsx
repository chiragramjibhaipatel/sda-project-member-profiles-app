import {
  BlockStack,
  Combobox,
  FormLayout,
  Icon,
  InlineError,
  InlineStack,
  Listbox,
  Tag,
  TextField,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FieldName } from "@conform-to/dom";
import { useField, useInputControl } from "@conform-to/react";

const validServices = [
  "Theme development",
  "App development",
  "Migrations",
  "Design",
  "SEO",
  "Email marketing",
  "Ads",
  "POS support",
  "Copywriting",
  "Headless development",
  "User Experience (UX)",
  "Conversion Rate Optimization (CRO)",
  "Consulting",
  "Checkout Extensions",
  "Speed Optimization",
  "Shipping and logistics",
  "DNS and email",
];

export function ServicesWrapper({
  primaryService,
  services,
}: {
  primaryService: FieldName<string | null | undefined>;
  services: FieldName<string[] | null | undefined>;
}) {
  const [primaryServiceMeta] = useField(primaryService);
  const primaryServiceInput = useInputControl(primaryServiceMeta);
  const [primaryServiceInputValue, setPrimaryServiceInputValue] = useState(primaryServiceInput.value);
  useEffect(() => {
    setPrimaryServiceInputValue(primaryServiceInput.value);
  }, [primaryServiceInput.value]);
  return (
    <FormLayout>
      <TextField
        label="Primary Service"
        value={primaryServiceInputValue}
        onChange={primaryServiceInput.change}
        autoComplete="off"
        error={primaryServiceMeta.errors}
      />
      <Services services={services} />
    </FormLayout>
  )

}


function Services({ services }: { services: FieldName<string[] | null | undefined> }) {

  const [servicesMeta] = useField(services);
  const servicesInput = useInputControl(servicesMeta);

  const deselectedOptions = useMemo(
    () => validServices.map((service) => ({ label: service, value: service })),
    []
  );

  const [selectedOptions, setSelectedOptions] = useState(
    servicesInput.value as string[] || []
  );

  useEffect(() => {
    setSelectedOptions(servicesInput.value as string[] || []);
  }, [servicesInput.value]);

  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(deselectedOptions);

  const escapeSpecialRegExCharacters = useCallback(
    (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    []
  );

  const updateText = useCallback(
    (value: string) => {
      setInputValue(value);

      if (value === "") {
        setOptions(deselectedOptions);
        return;
      }

      const filterRegex = new RegExp(escapeSpecialRegExCharacters(value), "i");
      const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex)
      );
      setOptions(resultOptions);
    },
    [deselectedOptions, escapeSpecialRegExCharacters]
  );

  
  const updateSelection = useCallback(
    (selected: string) => {
      let value;
      if (selectedOptions.includes(selected)) {
        value = selectedOptions.filter((option) => option !== selected);
        setSelectedOptions(value);
      } else {
        value = [...selectedOptions, selected];
        setSelectedOptions(value);
      }
      if (value.length === 0) {
        servicesInput.change("");
      } else {
        servicesInput.change(value);
      }
      updateText("");
    },
    [selectedOptions, updateText]
  );

  const removeTag = useCallback(
    (tag: string) => () => {
      const options = [...selectedOptions];
      options.splice(options.indexOf(tag), 1);
      setSelectedOptions(options);
      if (options.length === 0) {
        servicesInput.change("");
      } else {
        servicesInput.change(options);
      }
    },
    [selectedOptions]
  );

  const tagsMarkup = selectedOptions.map((option) => (
    <Tag key={`option-${option}`} onRemove={removeTag(option)}>
      {option}
    </Tag>
  ));

  const optionsMarkup =
    options.length > 0
      ? options.map((option) => {
          const { label, value } = option;

          return (
            <Listbox.Option
              key={`${value}`}
              value={value}
              selected={selectedOptions.includes(value)}
              accessibilityLabel={label}
            >
              {label}
            </Listbox.Option>
          );
        })
      : null;

  return (
    <BlockStack gap={"100"}>
      <Combobox
        allowMultiple
        activator={
          <Combobox.TextField
            prefix={<Icon source={SearchIcon} />}
            onChange={updateText}
            label="Services"
            value={inputValue}
            placeholder="Services you offer"
            autoComplete="off"
          />
        }
      >
        {optionsMarkup ? (
          <Listbox onSelect={updateSelection}>{optionsMarkup}</Listbox>
        ) : null}
      </Combobox>
      <InlineStack gap={"200"}>{tagsMarkup}</InlineStack>
      <InlineError message={servicesMeta.errors || ""} fieldID={servicesMeta.errorId} />
    </BlockStack>
  );
}