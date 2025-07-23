import type { Transition } from "motion";

import { useOnClickOutside } from "@/hooks/use-onclick-outside";
import { DeleteNoteAlert } from "@/components/delete-alert";
import { ArrowLeft, Search, Trash } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import { Button } from "@/components/ui/button";
import { useNoteSelection } from "@/store";
import { useRef, useState } from "react";

const transition: Transition = {
  type: "spring",
  bounce: 0.1,
  duration: 0.2,
};

export function Toolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { selectedNote } = useNoteSelection();

  useOnClickOutside(containerRef, () => {
    setIsOpen(false);
  });

  if (!selectedNote) return null;

  return (
    <MotionConfig transition={transition}>
      <div className="absolute top-8 right-8 z-1" ref={containerRef}>
        <div className="h-full w-full rounded-xl border border-zinc-950/10 bg-white">
          <motion.div
            animate={{ width: isOpen ? "240px" : "96px" }}
            initial={false}
          >
            <div className="overflow-hidden p-2">
              {!isOpen ? (
                <div className="flex gap-2">
                  <DeleteNoteAlert noteId={selectedNote?.id}>
                    <Button
                      className="cursor-pointer size-9"
                      aria-label="User profile"
                      variant="destructive"
                    >
                      <Trash className="h-5 w-5" />
                    </Button>
                  </DeleteNoteAlert>
                  <Button
                    onClick={() => setIsOpen(true)}
                    className="cursor-pointer size-9"
                    aria-label="Search notes"
                    variant="secondary"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="cursor-pointer size-9"
                    variant="secondary"
                    aria-label="Back"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="relative w-full">
                    <input
                      className="h-9 w-full rounded-lg border border-zinc-950/10 bg-transparent p-2 text-zinc-900 placeholder-zinc-500 focus:outline-hidden"
                      placeholder="Search text"
                    />
                    <div className="absolute right-1 top-0 flex h-full items-center justify-center" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
