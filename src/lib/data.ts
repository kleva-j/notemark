import type { NavTabs } from "@/models";

import { ArchiveX, File, Inbox, Trash2 } from "lucide-react";
import { SidebarTabs } from "@/models";

export const staticData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export const MainNavTabs: NavTabs[] = [
  {
    title: SidebarTabs.inbox,
    url: "#",
    icon: Inbox,
    isActive: true,
  },
  {
    title: SidebarTabs.drafts,
    url: "#",
    icon: File,
    isActive: false,
  },
  {
    title: SidebarTabs.junk,
    url: "#",
    icon: ArchiveX,
    isActive: false,
  },
  {
    title: SidebarTabs.trash,
    url: "#",
    icon: Trash2,
    isActive: false,
  },
];
