import { Editor, Element, Transforms } from "slate";
import { EditorType, MarkKey, ElementKey } from "./types";
export const isMarkActive = (editor: EditorType, format: MarkKey) => {
  return !!Editor.marks(editor)?.[format];
};

export const toggleMark = (editor: EditorType, format: MarkKey) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) editor.removeMark(format);
  else editor.addMark(format, true);
};

const isListFormat = (format: ElementKey) =>
  ["numbered-list", "bulleted-list"].includes(format);

export const isBlockActive = (editor: EditorType, format: ElementKey) => {
  const { selection } = editor;
  if (!selection) return false;

  const match = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (node) => {
        return (
          !Editor.isEditor(node) &&
          Element.isElement(node) &&
          node["type"] === format
        );
      },
    }),
  );

  return !!match?.[0];
};

export const toggleBlock = (editor: EditorType, format: ElementKey) => {
  const isList = isListFormat(format);
  const isActive = isBlockActive(editor, format);

  let type: string | undefined;

  type = isActive ? "paragraph" : format;

  if (!isActive && isList) {
    type = "list-item";
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }

  let newProperties: Partial<Element> = {};
  if (type) newProperties["type"] = type;

  Transforms.setNodes<Editor>(editor, newProperties);
};
