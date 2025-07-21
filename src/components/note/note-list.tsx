import { useNoteSelection, useNoteSearch } from "@/components/note";
import { SidebarGroupContent } from "@/components/ui/sidebar";
import { NotePreview } from "@/components/note/note-preview";

export const NoteList: React.FC = () => {
  const { selectNote, selectedNoteId } = useNoteSelection();
  const { filteredNotes } = useNoteSearch();

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
