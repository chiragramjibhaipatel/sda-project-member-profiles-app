import {
  Badge,
  BlockStack,
  Box,
  Button,
  InlineError,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import type { FieldName } from "@conform-to/dom";
import { useField, useInputControl } from "@conform-to/react";

export function OpenToWorkToggle({
  openToWork,
}: {
  openToWork: FieldName<boolean>;
}) {
  const [meta] = useField(openToWork);
  const profileInput = useInputControl(meta);
  const [enabled, setEnabled] = useState(profileInput.value || false);

  const handleToggle = useCallback(
    () =>
      setEnabled((enabled) => {
        const newEnabled = !enabled;
        profileInput.change(newEnabled ? "on" : "off");
        return newEnabled;
      }),
    [profileInput],
  );

  const contentStatus = enabled ? "No" : "Yes";
  const toggleId = "setting-toggle-uuid";
  const badgeStatus = enabled ? "success" : undefined;
  const badgeContent = enabled ? "Yes" : "No";
  const title = "Open to work";
  const settingStatusMarkup = (
    <Badge
      tone={badgeStatus}
      toneAndProgressLabelOverride={`Setting is ${badgeContent}`}
    >
      {badgeContent}
    </Badge>
  );

  const settingTitle = title ? (
    <InlineStack gap="200" wrap={false}>
      <InlineStack gap="200" align="start" blockAlign="baseline">
        <label htmlFor={toggleId}>
          <Text variant="headingMd" as="h6">
            {title}
          </Text>
        </label>
        <InlineStack gap="200" align="center" blockAlign="center">
          {settingStatusMarkup}
        </InlineStack>
      </InlineStack>
    </InlineStack>
  ) : null;

  const actionMarkup = (
    <Button
      role="switch"
      id={toggleId}
      ariaChecked={enabled ? "true" : "false"}
      onClick={handleToggle}
      size="slim"
    >
      {contentStatus}
    </Button>
  );

  const headerMarkup = (
    <Box width="100%">
      <InlineStack
        gap="200"
        align="space-between"
        blockAlign="start"
        wrap={false}
      >
        {settingTitle}
        <Box minWidth="fit-content">
          <InlineStack align="end">{actionMarkup}</InlineStack>
        </Box>
      </InlineStack>
    </Box>
  );

  return (
    <BlockStack gap={"200"}>
      <Box width="100%">
        <BlockStack gap={{ xs: "200", sm: "400" }}>{headerMarkup}</BlockStack>
      </Box>
      <Text variant="bodyMd" as="p">
        Your profile will be visible to employers when you are open to work.
      </Text>
      <InlineError message={meta.errors?.join(",")} fieldID={meta.errorId} />
    </BlockStack>
  );
}
