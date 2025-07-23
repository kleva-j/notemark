import type { PropsWithChildren } from "react";

import { Button } from "@/components/ui/button";
import { CircleAlertIcon } from "lucide-react";
import { useNotes } from "@/store";
import { toast } from "sonner";

import {
  AlertDialogDescription,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogCancel,
  AlertDialogTitle,
  AlertDialog,
} from "@/components/ui/alert-dialog";

interface DeleteNoteAlertProps extends PropsWithChildren {
  noteId?: string;
}

export function DeleteNoteAlert({ children, noteId }: DeleteNoteAlertProps) {
  const { deleteNote } = useNotes();

  const handleDeletion = () => {
    if (!noteId) return;

    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(deleteNote(noteId));
      }, 800);
    });

    toast.promise(promise, {
      loading: "Deleting note...",
      success: "Note deleted successfully",
      error: "Failed to delete note",
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? <Button variant="destructive">Delete</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-red-300"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80 stroke-red-400" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeletion}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
