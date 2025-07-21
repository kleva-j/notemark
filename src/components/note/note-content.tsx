import { EmptyContent } from "@/components/empty-note";
import { useNoteSelection } from "@/components/note";
import { MarkdownEditor } from "@/components/editor";
import { cn } from "@/lib/utils";

export const NoteContent = () => {
  const { selectedNote } = useNoteSelection();

  if (!selectedNote) return <EmptyContent />;

  return (
    <div className="w-full h-full overflow-hidden px-4 relative">
      <div className={cn("flex justify-center pt-2")}>
        <span className="text-gray-400">{selectedNote.title}</span>
      </div>
      <MarkdownEditor
        markdown={selectedNote.content}
        contentEditableClassName="outline-none max-w-none font-sans px-8 py-5 caret-yellow-500 prose prose-lg prose-invert prose-p:my-3 prose-p:leading-relaxed prose-headings:my-4 prose-blockquote:my-4 prose-ul:my-2 prose-li:my-0 prose-code:px-1 prose-code:text-red-500 prose-code:before:content-[''] prose-code:after:content-['']"
      />
    </div>
  );
};
