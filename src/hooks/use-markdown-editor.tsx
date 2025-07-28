import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import { useNotes, useNoteSelection } from "@/store";
import { autoSaveInterval } from "@/lib/constant";
import { toast } from "sonner";

export const useMarkdownEditor = () => {
  const { selectedNote } = useNoteSelection();
  const { updateNote } = useNotes();

  const handleChange = useDebounceCallback((content: string) => {
    if (!selectedNote) {
      console.error("No note selected");
      toast.error("No note selected");
      return;
    }

    updateNote(selectedNote.id, { content });
  }, autoSaveInterval);

  return { handleChange, selectedNote };
};
