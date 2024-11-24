import {
  ListNumberedIcon,
  ListBulletedFilledIcon,
  TextBoldIcon,
  TextItalicIcon
} from "@shopify/polaris-icons";

export enum RichTextAction {
  Bold = "bold",
  Italics = "italic",
  NumberedList = "numbered-list",
  BulletedList = "bulleted-list",
  Undo = "undo",
  Redo = "redo",
}

export const TEXT_FORMAT_OPTIONS = [
  { id: RichTextAction.Bold, icon: <TextBoldIcon />, label: "Bold" },
  { id: RichTextAction.Italics, icon: <TextItalicIcon />, label: "Italics" },
];

export const TEXT_BLOCK_OPTIONS = [
  {
    id: RichTextAction.BulletedList,
    icon: <ListBulletedFilledIcon />,
    label: "Bulleted List",
  },
  {
    id: RichTextAction.NumberedList,
    icon: <ListNumberedIcon />,
    label: "Numbered List",
  },
];

export const HEADINGS = ["paragraph", "h1", "h2", "h3", "h4", "h5", "h6"];

export const LIST_TYPES = ["numbered-list", "bulleted-list"];
