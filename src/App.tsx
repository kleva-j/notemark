import { DraggableTopbar } from "@/components/draggable-topbar";
import { NoteContent } from "@/components/note/note-content";
import { AppLayout } from "@/components/layout/app-layout";
import { NoteProvider } from "@/components/note";

export function App() {
  return (
    <NoteProvider>
      <DraggableTopbar />
      <AppLayout>
        <NoteContent />
      </AppLayout>
    </NoteProvider>
  );
}

export default App;
