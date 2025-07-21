import { NoteList } from "@/components/note/note-list";
import { NavUser } from "@/components/nav-user";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Command } from "lucide-react";
import { data } from "@/lib/data";
import { useState } from "react";

import {
  SidebarGroupContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarGroup,
  SidebarMenu,
  useSidebar,
  Sidebar,
} from "@/components/ui/sidebar";

export function SidebarLayout({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = useState(data.navMain[0]);
  const { setOpen } = useSidebar();

  return (
    <Sidebar
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      collapsible="icon"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#home">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{ children: item.title, hidden: false }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                      onClick={() => {
                        setActiveItem(item);
                        setOpen(true);
                      }}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Unreads</span>
              <Switch className="shadow-none" />
            </Label>
          </div>
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <NoteList />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
