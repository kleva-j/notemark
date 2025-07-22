import { DraggableTopbar } from "@/components/draggable-topbar";
import { NoteContent } from "@/components/note/note-content";
import { AppLayout } from "@/components/layout/app-layout";
import { NoteProvider, RootProvider } from "@/store";
import { Toaster } from "@/components/ui/sonner";

export function App() {
  return (
    <RootProvider>
      <NoteProvider>
        <DraggableTopbar />
        <AppLayout>
          <NoteContent />
        </AppLayout>
      </NoteProvider>
      <Toaster />
    </RootProvider>
  );
}

export default App;
