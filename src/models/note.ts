import type { DateArg } from "date-fns";

export type NoteInfo = {
  id: string;
  title: string;
  content: NoteContent;
  description?: string;
  createdAt: DateArg<Date>;
  updatedAt?: DateArg<Date>;
};

export type NoteContent = string;
