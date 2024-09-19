import {
  BlockStack,
  Combobox,
  Icon,
  InlineStack,
  Listbox,
  Tag,
} from "@shopify/polaris";

import { SearchIcon } from "@shopify/polaris-icons";
import { useCallback, useMemo, useState } from "react";

export function LanguagesWrapper({
  name,
  value,
  onChange,
  validLanguages,
}: {
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  validLanguages: string[];
}) {
  const deselectedOptions = useMemo(
    () =>
      validLanguages.map((language) => ({ label: language, value: language })),
    [],
  );

  const [selectedOptions, setSelectedOptions] = useState<string[]>(value);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(deselectedOptions);

  const escapeSpecialRegExCharacters = useCallback(
    (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    [],
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
        option.label.match(filterRegex),
      );
      setOptions(resultOptions);
    },
    [deselectedOptions, escapeSpecialRegExCharacters],
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
      onChange(value);
      updateText("");
    },
    [selectedOptions, updateText],
  );

  const removeTag = useCallback(
    (tag: string) => () => {
      const options = [...selectedOptions];
      options.splice(options.indexOf(tag), 1);
      setSelectedOptions(options);
      onChange(options);
    },
    [selectedOptions],
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
    <>
      <BlockStack gap={"100"}>
        <Combobox
          allowMultiple
          activator={
            <Combobox.TextField
              prefix={<Icon source={SearchIcon} />}
              onChange={updateText}
              label="Languages"
              value={inputValue}
              placeholder="Languages you speak"
              autoComplete="off"
            />
          }
        >
          {optionsMarkup ? (
            <Listbox onSelect={updateSelection}>{optionsMarkup}</Listbox>
          ) : null}
        </Combobox>
        <InlineStack gap={"200"}>{tagsMarkup}</InlineStack>
      </BlockStack>
    </>
  );
}
