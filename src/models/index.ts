export type * from "@/models/note";

import type { LucideIcon } from "lucide-react";

export enum SidebarTabs {
  inbox = "Inbox",
  drafts = "Drafts",
  junk = "Junk",
  trash = "Trash",
}

export type NavTabs = {
  title: SidebarTabs;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
};
