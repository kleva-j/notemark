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
