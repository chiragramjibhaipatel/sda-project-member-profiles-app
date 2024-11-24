import {
  Button,
  ButtonGroup,
  Popover,
  ActionList,
  Text,
} from "@shopify/polaris";
import { useSlate } from "slate-react";
import {
  HEADINGS,
  RichTextAction,
  TEXT_BLOCK_OPTIONS,
  TEXT_FORMAT_OPTIONS,
} from "./constants";
import { useState, useCallback } from "react";
import { ElementKey, MarkKey } from "./types";
import { isBlockActive, isMarkActive, toggleBlock, toggleMark } from "./utils";

export function Toolbar() {
  const editor = useSlate();

  const onMarkClick = (id: RichTextAction) => {
    toggleMark(editor, id as MarkKey);
  };

  const getMarkSelectionProps = (id: RichTextAction) => {
    if (isMarkActive(editor, id as MarkKey))
      return { colorScheme: "blue", variant: "solid" };
    return {};
  };

  const onBlockClick = (id: RichTextAction) => {
    toggleBlock(editor, id as ElementKey);
  };

  const getBlockSelectionProps = (id: RichTextAction) => {
    if (isBlockActive(editor, id as ElementKey))
      return { colorScheme: "blue", variant: "solid" };
    return {};
  };

  return (
    <ButtonGroup variant="segmented">
      <Headings />
      {TEXT_FORMAT_OPTIONS.map(({ id, icon, label }) => (
        <Button key={id} icon={icon} onClick={() => onMarkClick(id)}>
          {label}
        </Button>
      ))}
      {TEXT_BLOCK_OPTIONS.map(({ id, icon, label }) => (
        <Button key={id} icon={icon} onClick={() => onBlockClick(id)}>
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
}

function Headings() {
  const editor = useSlate();

  const [popoverActive, setPopoverActive] = useState(false);
  const [selectedHeading, setSelectedHeading] = useState("h1");

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const activator = (
    <Button onClick={togglePopoverActive} disclosure>
      {selectedHeading}
    </Button>
  );

  function getHeadingLabel(heading: string): any {
    if (heading === "h1") {
      return (
        <Text variant="heading2xl" as="h2">
          Heading 1
        </Text>
      );
    } else if (heading === "h2") {
      return (
        <Text variant="headingXl" as="h2">
          Heading 2
        </Text>
      );
    } else if (heading === "h3") {
      return (
        <Text variant="headingLg" as="h4">
          Heading 3
        </Text>
      );
    } else if (heading === "h4") {
      return (
        <Text variant="headingMd" as="h5">
          Heading 4
        </Text>
      );
    } else if (heading === "h5") {
      return (
        <Text variant="headingSm" as="h6">
          Heading 5
        </Text>
      );
    } else if (heading === "h6") {
      return (
        <Text variant="headingXs" as="h6">
          Heading 6
        </Text>
      );
    } else {
      return (
        <Text variant="bodyLg" as="p">
          Paragraph
        </Text>
      );
    }
  }

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      autofocusTarget="first-node"
      onClose={togglePopoverActive}
    >
      <ActionList
        actionRole="menuitem"
        items={HEADINGS.map((heading) => ({
          content: getHeadingLabel(heading),
          onAction: () => {
            setSelectedHeading(heading);
            toggleBlock(editor, heading as ElementKey);
            togglePopoverActive();
          },
        }))}
      />
    </Popover>
  );
}
