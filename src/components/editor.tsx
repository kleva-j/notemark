import {
  type MDXEditorProps,
  markdownShortcutPlugin,
  thematicBreakPlugin,
  headingsPlugin,
  quotePlugin,
  listsPlugin,
  MDXEditor,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

export function MarkdownEditor(props: MDXEditorProps) {
  return (
    <MDXEditor
      {...props}
      plugins={[
        markdownShortcutPlugin(),
        thematicBreakPlugin(),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
      ]}
    />
  );
}
