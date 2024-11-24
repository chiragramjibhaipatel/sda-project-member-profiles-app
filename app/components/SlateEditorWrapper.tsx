import type { FieldName } from "@conform-to/dom";
import React, { useCallback, useState } from "react";
import { createEditor, Editor, Transforms, Element } from "slate";
import { Slate, Editable, withReact } from "slate-react";

import { BaseEditor, Descendant } from "slate";
import { ReactEditor } from "slate-react";

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

export function SlateEditorWrapper(props: {
  description: FieldName<any, Record<string, any>, string[]>;
}) {
  const [editor] = useState(() => withReact(createEditor()));
  // Define a React component renderer for our code blocks.

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  // Define a leaf rendering function that is memoized with `useCallback`.
  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(value) => {
        console.log("Value: ", value);
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type,
        );
        if (isAstChange) {
          // Save the value to Local Storage.
          const content = JSON.stringify(value);
          localStorage.setItem("content", content);
        }
      }}
    >
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (!event.ctrlKey) {
            return;
          }

          switch (event.key) {
            case "`": {
              event.preventDefault();
              const [match] = Editor.nodes(editor, {
                match: (n) => n.type === "code",
              });
              Transforms.setNodes(
                editor,
                { type: match ? "paragraph" : "code" },
                { match: (n) => Editor.isBlock(editor, n) },
              );
              break;
            }

            case "b": {
              event.preventDefault();
              Editor.addMark(editor, "bold", true);
              break;
            }
          }
        }}
      />
    </Slate>
  );
}

const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code style={{ color: "red" }}>{props.children}</code>
    </pre>
  );
};
const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>;
};

const Leaf = (props) => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}
    >
      {props.children}
    </span>
  );
};
