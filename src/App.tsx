import { DraggableTopbar } from "@/components/draggable-topbar";
import { NoteContent } from "@/components/note/note-content";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { NoteProvider, RootProvider } from "@/store";
import { Toaster } from "@/components/ui/sonner";
import { Toolbar } from "@/components/toolbar";

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="notemark-theme">
      <RootProvider>
        <NoteProvider>
          <DraggableTopbar />
          <AppLayout>
            <Toolbar />
            <NoteContent />
          </AppLayout>
        </NoteProvider>
        <Toaster />
      </RootProvider>
    </ThemeProvider>
  );
}

export default App;
