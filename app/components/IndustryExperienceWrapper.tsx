import {
  BlockStack,
  Combobox,
  Icon,
  InlineError,
  InlineStack,
  Listbox,
  Tag,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FieldName } from "@conform-to/dom";
import { useField, useInputControl } from "@conform-to/react";

const validIndustries = [
  "Arts and crafts",
  "Baby and kids",
  "Books, music, and video",
  "Business equipment and supplies",
  "Clothing",
  "Electronics",
  "Food and drink",
  "Hardware and automotive",
  "Health and beauty",
  "Home and decor",
  "Jewelry and accessories",
  "Outdoor and garden",
  "Pet supplies",
  "Restaurants",
  "Services",
  "Sports and recreation",
  "Toys and games",
  "Music",
  "Sewing Machines",
  "Running/ Fitness",
];

export function IndustryExperienceWrapper({
  industryExperience,
}: {
  industryExperience: FieldName<string[] | null>;
}) {
  const [meta] = useField(industryExperience);
  const industryInput = useInputControl(meta);
  const deselectedOptions = useMemo(
    () => validIndustries.map((industry) => ({ label: industry, value: industry })),
    []
  );
  const [selectedOptions, setSelectedOptions] = useState(
    industryInput.value as string[] || []
  );
  useEffect(() => {
    setSelectedOptions(industryInput.value as string[] || []);
  }, [industryInput.value]);
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
        industryInput.change("");
      } else {
        industryInput.change(value);
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
        industryInput.change("");
      } else {
        industryInput.change(options);
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
            label="Industry Experience"
            value={inputValue}
            placeholder="Select industries"
            autoComplete="off"
          />
        }
      >
        {optionsMarkup ? (
          <Listbox onSelect={updateSelection}>{optionsMarkup}</Listbox>
        ) : null}
      </Combobox>
      <InlineStack gap={"200"}>{tagsMarkup}</InlineStack>
      <InlineError message={meta.errors || ""} fieldID={meta.errorId} />
    </BlockStack>
  );
} 