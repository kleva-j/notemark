import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Pathname, useRoot } from "@/store";
import { Plus } from "lucide-react";

export const EmptyContent = () => {
  const { setPathname } = useRoot();

  const createNote = () => {
    setPathname(Pathname.createNote);
  };

  return (
    <div className="border border-border/70 rounded p-4 h-full w-full max-w-[calc(100%_-_theme(spacing.8))] flex flex-col gap-4 items-center justify-center my-4">
      <Typography as="h2" variant="h2" className="m-0">
        Welcome to the NoteMark app.
      </Typography>
      <Typography className="mt-0! text-center leading-6" variant="p" as="p">
        This is a note-taking app that allows you to create, organize, and
        manage your notes. <br /> It's designed to be simple and easy to use, so
        you can focus on what matters most - your notes.
      </Typography>
      <Button onClick={createNote}>
        <Plus className="mr-2 cursor-pointer" />
        Create a new note
      </Button>
    </div>
  );
};
