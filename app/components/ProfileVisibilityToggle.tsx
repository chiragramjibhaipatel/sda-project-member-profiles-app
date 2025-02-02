import {
  Badge,
  BlockStack,
  Box,
  Button,
  InlineError,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import type { FieldName } from "@conform-to/dom";
import { useField, useInputControl } from "@conform-to/react";

export function ProfileVisibilityToggle({
  profile,
}: {
  profile: FieldName<boolean | null>;
}) {
  const [meta] = useField(profile);
  const profileInput = useInputControl(meta);
  const [enabled, setEnabled] = useState(profileInput.value || false);

  useEffect(() => {
    setEnabled(profileInput.value || false);
  }, [profileInput.value]);

  const handleToggle = useCallback(
    () =>
      setEnabled((enabled) => {
        const newEnabled = !enabled;
        profileInput.change(newEnabled ? "on" : "");
        return newEnabled;
      }),
    [profileInput],
  );

  const contentStatus = enabled ? "Hide" : "Show";
  const toggleId = "setting-toggle-uuid";
  const badgeStatus = enabled ? "success" : undefined;
  const badgeContent = enabled ? "Visible" : "Hidden";
  const title = "Public profile";
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
        Toggle public profile visibility. Click{" "}
        <Button variant={"plain"}> here </Button> to visit your profile.
      </Text>
      <InlineError message={meta.errors?.join(",") || ""} fieldID={meta.errorId} />
    </BlockStack>
  );
}
