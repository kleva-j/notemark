import { SidebarGroupContent } from "@/components/ui/sidebar";
import { NotePreview } from "@/components/note/note-preview";
import { useNoteSelection, useNoteSearch } from "@/store";

export const NoteList: React.FC = () => {
  const { selectNote, selectedNoteId } = useNoteSelection();
  const { filteredNotes } = useNoteSearch();

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
