import type { ComponentProps, RefObject } from "react";

import { motion, AnimatePresence } from "motion/react";
import { useNoteOperations } from "@/store";
import { SidebarTabs } from "@/models";
import { useState } from "react";

interface NotePopoverProps extends ComponentProps<"div"> {
  ref?: RefObject<HTMLDivElement>;
  show: boolean;
  onClose: () => void;
}

export const NewNotePopover = (props: NotePopoverProps) => {
  const { ref, show, onClose } = props;
  const { createNote } = useNoteOperations();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<SidebarTabs>(SidebarTabs.inbox);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    createNote(title, content, undefined); // Only pass 3 arguments
    setLoading(false);
    setTitle("");
    setContent("");
    setCategory(SidebarTabs.inbox);
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.18, duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4 border border-zinc-200"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">New Note</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-800 rounded p-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <input
              className="rounded border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="rounded border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400 min-h-[80px]"
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <select
              className="rounded border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              value={category}
              onChange={(e) => setCategory(e.target.value as SidebarTabs)}
            >
              {Object.values(SidebarTabs).map((tab) => (
                <option key={tab} value={tab}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-zinc-900 text-white rounded px-4 py-2 font-medium hover:bg-zinc-800 transition disabled:opacity-50"
              disabled={loading || !title.trim() || !content.trim()}
            >
              {loading ? "Creating..." : "Create Note"}
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
