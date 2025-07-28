import {
  type GetNoteInfoFromFilename,
  type NoteInfo,
  type GetNotes,
  SidebarTabs,
} from "@/models";

import {
  ensureDir,
  writeFile,
  readFile,
  readdir,
  unlink,
  stat,
} from "fs-extra";

import { APP_DIR_NAME, fileEncoding } from "./../lib/constant";
import { homedir } from "node:os";

import grayMatter from "gray-matter";

export const getRootDir = () => {
  return `${homedir()}/${APP_DIR_NAME}`;
};

export const getNotes: GetNotes = async () => {
  const rootDir = getRootDir();
  await ensureDir(rootDir);

  const notesFile = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false,
  });

  const notes = notesFile.filter((noteFile) => noteFile.endsWith(".md"));

  return Promise.all(notes.map(getNoteInfoFromFilename));
};

export const getNoteInfoFromFilename: GetNoteInfoFromFilename = async (
  filename
) => {
  const filePath = `${getRootDir()}/${filename}`;
  const fileStat = await stat(filePath);

  const fileContent = await readFile(filePath, { encoding: fileEncoding });

  const { content, data } = grayMatter(fileContent);

  const { description, category = SidebarTabs.inbox } = data;

  return {
    id: fileStat.ino.toString(),
    title: filename
      .replace(/\.md$/, "")
      .replace(/-|_|\\./g, " ")
      .trim(),
    content,
    description,
    category,
    createdAt: fileStat.birthtime,
    updatedAt: fileStat.mtime,
  };
};

export const saveOrUpdateNote = async (note: NoteInfo) => {
  const filePath = `${getRootDir()}/${note.title}.md`;
  await ensureDir(getRootDir());
  const stringifiedNote = grayMatter.stringify(note.content, {
    data: {
      title: note.title,
      description: note.description,
      category: note.category,
    },
  });
  await writeFile(filePath, stringifiedNote, { encoding: fileEncoding });
};

export const deleteNote = async (note: NoteInfo) => {
  const filePath = `${getRootDir()}/${note.title}.md`;
  await ensureDir(getRootDir());
  await unlink(filePath);
};
