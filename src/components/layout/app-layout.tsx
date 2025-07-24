import type { CSSProperties, PropsWithChildren } from "react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarLayout } from "@/components/layout/app-sidebar";
import { ContentHeader } from "@/components/layout/app-header";
import { CreateNoteDialog } from "@/components/note/new-note";
import { Pathname, useRoot, useRootState } from "@/store";
import { Children } from "react";

export function AppLayout({ children }: PropsWithChildren) {
  const { setPathname } = useRoot();

  const state = useRootState();

  return (
    <SidebarProvider style={{ "--sidebar-width": "22rem" } as CSSProperties}>
      <SidebarLayout />
      <SidebarInset>
        <ContentHeader />
        <div className="flex flex-col items-center justify-center h-[calc(100vh_-_theme(spacing.16))] relative">
          {Children.map(children, (child) => child)}
        </div>
      </SidebarInset>
      <CreateNoteDialog
        show={state.pathname === Pathname.createNote}
        onClose={() => setPathname("/")}
      />
    </SidebarProvider>
  );
}
