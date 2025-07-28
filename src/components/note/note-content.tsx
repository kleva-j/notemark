import { useOnClickOutside } from "@/hooks/use-onclick-outside";
import { useMarkdownEditor } from "@/hooks/use-markdown-editor";
import { EmptyContent } from "@/components/empty-note";
import { MarkdownEditor } from "@/components/editor";
import { useNoteSelection } from "@/store";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const NoteContent = () => {
  const [isFocused, setIsFocused] = useState(false);

  const { selectedNote } = useNoteSelection();

  const { handleChange } = useMarkdownEditor();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = () => {
    if (isFocused) setIsFocused(false);
  };

  const handleClickInside = () => {
    if (!isFocused) setIsFocused(true);
  };

  useOnClickOutside(containerRef, handleClickOutside);

  if (!selectedNote) return <EmptyContent />;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      className={cn(
        "w-full max-w-[calc(100%_-_theme(spacing.8))] border border-border/70 my-4 rounded h-full overflow-auto px-4 relative transition-all duration-200 ease-linear",
        { "blur-[0.5px]": !isFocused }
      )}
      onClick={handleClickInside}
      ref={containerRef}
    >
      <div className="flex justify-center pt-2 sticky top-0 z-10">
        <span className="text-zinc-400/30 text-sm">{selectedNote.title}</span>
      </div>
      <MarkdownEditor
        autoFocus
        key={selectedNote.id}
        onChange={handleChange}
        markdown={selectedNote.content}
        contentEditableClassName="outline-none max-w-none font-sans px-8 py-5 caret-yellow-500 prose prose-lg prose-invert prose-p:my-3 prose-p:leading-relaxed prose-headings:my-4 prose-blockquote:my-4 prose-ul:my-2 prose-li:my-0 prose-code:px-1 prose-code:text-red-500 prose-code:before:content-[''] prose-code:after:content-[''] *:dark:text-sidebar-foreground"
      />
    </div>
  );
};
