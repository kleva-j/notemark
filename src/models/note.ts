import type { DateArg } from "date-fns";
import type { SidebarTabs } from ".";

type NoteCategory = Omit<SidebarTabs, "inbox"> | null;

export type NoteInfo = {
  id: string;
  title: string;
  content: NoteContent;
  description?: string;
  createdAt: DateArg<Date>;
  updatedAt?: DateArg<Date>;
  category: NoteCategory;
};

export type NoteContent = string;

export type GetNotes = () => Promise<NoteInfo[]>;

export type GetNoteInfoFromFilename = (filename: string) => Promise<NoteInfo>;

export type SaveOrUpdateNote = (note: NoteInfo) => Promise<void>;

export type DeleteNote = (note: NoteInfo) => Promise<void>;
