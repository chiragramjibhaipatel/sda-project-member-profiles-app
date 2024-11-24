import type { FieldName } from "@conform-to/dom";
import { useField, useInputControl } from "@conform-to/react";
import React from "react";
import { useState } from "react";
import { createEditor } from "slate";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from "slate-react";
import { Toolbar } from "./Toolbar";
import { Text } from "@shopify/polaris";
import { CustomElement, CustomText, EditorType } from "./types";
import { toggleMark } from "./utils";

interface RichTextEditorProps {}
const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

declare module "slate" {
  interface CustomTypes {
    Editor: EditorType;
    Element: CustomElement;
    Text: CustomText;
  }
}

const RenderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  return (
    <span
      {...attributes}
      style={{
        ...(leaf.bold && { fontWeight: "bold" }),
        ...(leaf.italic && { fontStyle: "italic" }),
      }}
    >
      {children}
    </span>
  );
};

const RenderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case "numbered-list": {
      return <ol {...attributes}>{children}</ol>;
    }
    case "bulleted-list": {
      return <ul {...attributes}>{children}</ul>;
    }
    case "list-item": {
      return <li {...attributes}>{children}</li>;
    }

    case "h1": {
      return (
        <Text variant="heading2xl" as="h2">
          {children}
        </Text>
      );
    }
    case "h2": {
      return (
        <Text variant="headingXl" as="h3">
          {children}
        </Text>
      );
    }
    case "h3": {
      return (
        <Text variant="headingLg" as="h4">
          {children}
        </Text>
      );
    }
    case "h4": {
      return (
        <Text variant="headingMd" as="h5">
          {children}
        </Text>
      );
    }
    case "h5": {
      return (
        <Text variant="headingSm" as="h6">
          {children}
        </Text>
      );
    }
    case "h6": {
      return (
        <Text variant="headingXs" as="h6">
          {children}
        </Text>
      );
    }
    default: {
      return (
        <p {...attributes}>
          {children}
        </p>
      );
    }
  }
};

export const RichTextEditor: React.FC<RichTextEditorProps> = React.memo(
  function RichTextEditor({}) {
    const [editor] = useState(withReact(createEditor()));
        const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (
          event,
        ) => {
          const key = event?.key?.toLowerCase();
          if (key === "b" && event?.ctrlKey) {
            toggleMark(editor, "bold");
          }
          if (key === "i" && event?.ctrlKey) {
            toggleMark(editor, "italic");
          }
          if (key === "z" && event?.ctrlKey) {
            editor.undo();
          }
          if (key === "y" && event?.ctrlKey) {
            editor.redo();
          }
        };
    return (
      <>
        <Slate
          editor={editor}
          initialValue={initialValue}
          onChange={(value) => {
            console.log(value);
          }}
        >
          <Toolbar />
          <Editable
            renderLeaf={RenderLeaf}
            renderElement={RenderElement}
            onKeyDown={onKeyDown}
          />
        </Slate>
      </>
    );
  },
);
