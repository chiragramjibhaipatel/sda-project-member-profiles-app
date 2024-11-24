import { BaseEditor } from "slate";
import { HistoryEditor } from "slate-history";
import { ReactEditor } from "slate-react";

export type EditorType = BaseEditor & ReactEditor & HistoryEditor;
export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
};


export type CustomElement = {
  type: string;
  children: CustomText[];
};

export type MarkKey =
  | "bold"
  | "italic"

export type ElementKey =
  | "numbered-list"
  | "bulleted-list"
