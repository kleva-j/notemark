import { NoteList } from "@/components/note/note-list";
import { staticData, MainNavTabs } from "@/lib/data";
import { NavUser } from "@/components/nav-user";
import { Command, Plus } from "lucide-react";
import { Pathname, useRoot } from "@/store";

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
  const { state, setActiveSidebarTab, setPathname } = useRoot();
  const { setOpen } = useSidebar();

  const createNote = () => {
    setPathname(Pathname.createNote);
  };

  const { activeSidebarTab: activeTab } = state;

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
                {MainNavTabs.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{ children: item.title, hidden: false }}
                      isActive={activeTab === item.title}
                      className="px-2.5 md:px-2"
                      onClick={() => {
                        setActiveSidebarTab(item.title);
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
          <SidebarGroup>
            <SidebarGroupContent className="px-0">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={createNote}
                    tooltip="Create a new note"
                    className="size-8 bg-transparent cursor-pointer border"
                  >
                    <Plus />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={staticData.user} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="text-foreground text-base font-medium">
            {activeTab}
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
