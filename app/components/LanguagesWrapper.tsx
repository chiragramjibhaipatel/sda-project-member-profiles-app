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

export function LanguagesWrapper({
  languages,
  validLanguages,
}: {
  languages: FieldName<string[] | null>;
  validLanguages: string[];
}) {
  const [meta] = useField(languages);
  const languagesInput = useInputControl(meta);
  const deselectedOptions = useMemo(
    () =>
      validLanguages.map((language) => ({ label: language, value: language })),
    [],
  );
  const [selectedOptions, setSelectedOptions] = useState(
    languagesInput.value as string[] || [],
  );
  useEffect(() => {
    setSelectedOptions(languagesInput.value as string[] || []);
  }, [languagesInput.value]);
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
      if (value.length === 0) {
        languagesInput.change("");
      } else {
        languagesInput.change(value);
      }
      updateText("");
    },
    [selectedOptions, updateText],
  );

  const removeTag = useCallback(
    (tag: string) => () => {
      const options = [...selectedOptions];
      options.splice(options.indexOf(tag), 1);
      setSelectedOptions(options);
      if (options.length === 0) {
        languagesInput.change("");
      } else {
        languagesInput.change(options);
      }
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
        <InlineError message={meta.errors || ""} fieldID={meta.errorId} />
      </BlockStack>
    </>
  );
}
