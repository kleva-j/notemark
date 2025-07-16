import type { CSSProperties, PropsWithChildren } from "react";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { SidebarLayout } from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumb,
} from "@/components/ui/breadcrumb";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "350px" } as CSSProperties}
    >
      <SidebarLayout />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Inbox</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
