import { SidebarGroupContent } from "@/components/ui/sidebar";
import { CreateNoteDialog } from "@/components/note/new-note";
import { NotePreview } from "@/components/note/note-preview";
import { useRef } from "react";

import {
  useNoteSelection,
  useNoteSearch,
  useRootState,
  Pathname,
  useRoot,
} from "@/store";

export const NoteList: React.FC = () => {
  const { selectNote, selectedNoteId } = useNoteSelection();
  const { filteredNotes } = useNoteSearch();
  const { setPathname } = useRoot();

  const state = useRootState();

  const popoverRef = useRef<HTMLDivElement>(null);

  const showPopover = state.pathname === Pathname.createNote;

  const handleNoteClick = (noteId: string) => {
    selectNote(noteId);
  };

  if (!filteredNotes.length) {
    return (
      <div className="text-center p-4">
        <span>No notes yet.</span>
      </div>
    );
  }

  return (
    <SidebarGroupContent>
      <CreateNoteDialog
        onClose={() => setPathname("/")}
        show={showPopover ?? false}
        ref={popoverRef}
      />

      {filteredNotes
        .sort(
          ({ createdAt: a }, { createdAt: b }) =>
            new Date(b).getTime() - new Date(a).getTime()
        )
        .map((note) => (
          <NotePreview
            isActive={note.id === selectedNoteId}
            onClick={() => handleNoteClick(note.id)}
            key={note.id}
            note={note}
          />
        ))}
    </SidebarGroupContent>
  );
};
