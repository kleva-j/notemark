import { DraggableTopbar } from "@/components/draggable-topbar";
import { NoteContent } from "@/components/note/note-content";
import { AppLayout } from "@/components/layout/app-layout";
import { NoteProvider, RootProvider } from "@/store";
import { Toaster } from "@/components/ui/sonner";
import { Toolbar } from "@/components/toolbar";

export function App() {
  return (
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
  );
}

export default App;
