import { SidebarGroupContent } from "@/components/ui/sidebar";
import { NotePreview } from "@/components/note/note-preview";
import { NewNotePopover } from "@/components/note/new-note";
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
        <span>No notes found</span>
      </div>
    );
  }

  return (
    <SidebarGroupContent>
      <NewNotePopover
        onClose={() => setPathname("/")}
        show={showPopover ?? false}
        ref={popoverRef}
      />

      {filteredNotes.map((note) => (
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
