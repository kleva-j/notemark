/// <reference types="vite-plugin-electron/electron-env" />

import type {
  SaveOrUpdateNote,
  DeleteNote,
  NoteInfo,
  GetNotes,
} from "@/models";

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
declare global {
  interface Window {
    ipcRenderer: import("electron").IpcRenderer;
    versions: {
      node: () => string;
      chrome: () => string;
      electron: () => string;
    };
    context: {
      locale: string;
      saveOrUpdateNote: (...args: Parameters<SaveOrUpdateNote>) => Promise<void>;
      getNotes: (...args: Parameters<GetNotes>) => Promise<NoteInfo[]>;
      deleteNote: (...args: Parameters<DeleteNote>) => Promise<void>;
    };
  }
}
