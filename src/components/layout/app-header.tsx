import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useNoteSelection, useRoot } from "@/store";

import {
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumb,
} from "@/components/ui/breadcrumb";

export const ContentHeader = () => {
  const { selectedNote } = useNoteSelection();
  const { activeSidebarTab } = useRoot().state;

  return (
    <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 z-1">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">Notemark</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{activeSidebarTab}</BreadcrumbPage>
          </BreadcrumbItem>
          {selectedNote && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="font-bold">
                <BreadcrumbPage>{selectedNote?.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};
