import {
  BlockStack,
  Combobox,
  FormLayout,
  Icon,
  InlineError,
  InlineStack,
  Listbox,
  Tag,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FieldName, useField, useInputControl } from "@conform-to/react";

const validTechnologies = [
  "Frontend development (HTML, CSS, and Javascript)",
  "Backend development",
  "React",
  "Vue",
  "Tailwind CSS",
  "Python",
  "PHP",
  "Rust",
  "Typescript",
  "Postgres",
  "MongoDB",
  "MySQL",
  "Polaris",
  "AWS",
  "Firebase",
];

export function TechnologiesWrapper({ 
  technologies 
}: { 
  technologies: FieldName<string[] | null | undefined>; 
}) {
  return (
    <FormLayout>
      <Technologies technologies={technologies} />
    </FormLayout>
  );
}

function Technologies({ technologies }: { technologies: FieldName<string[] | null | undefined> }) {
  const [technologiesMeta] = useField(technologies);
  const technologiesInput = useInputControl(technologiesMeta);

  const deselectedOptions = useMemo(
    () => validTechnologies.map((tech) => ({ label: tech, value: tech })),
    []
  );

  const [selectedOptions, setSelectedOptions] = useState(
    technologiesInput.value as string[] || []
  );

  useEffect(() => {
    setSelectedOptions(technologiesInput.value as string[] || []);
  }, [technologiesInput.value]);

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
        technologiesInput.change("");
      } else {
        technologiesInput.change(value);
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
        technologiesInput.change("");
      } else {
        technologiesInput.change(options);
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
            label="Technologies"
            value={inputValue}
            placeholder="Technologies you work with"
            autoComplete="off"
          />
        }
      >
        {optionsMarkup ? (
          <Listbox onSelect={updateSelection}>{optionsMarkup}</Listbox>
        ) : null}
      </Combobox>
      <InlineStack gap={"200"}>{tagsMarkup}</InlineStack>
      <InlineError 
        message={technologiesMeta.errors || ""} 
        fieldID={technologiesMeta.errorId} 
      />
    </BlockStack>
  );
}