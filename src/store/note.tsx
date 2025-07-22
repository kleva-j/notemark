import type { NoteInfo } from "@/models";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useReducer,
  useMemo,
} from "react";

import { MockNotes } from "@/store/mocks";
import { SidebarTabs } from "@/models";
import { useRoot } from "@/store/root";

// State interface
interface NoteState {
  notes: NoteInfo[];
  selectedNoteId: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

// Action types
type NoteAction =
  | { type: "SET_NOTES"; payload: NoteInfo[] }
  | { type: "ADD_NOTE"; payload: NoteInfo }
  | { type: "UPDATE_NOTE"; payload: { id: string; updates: Partial<NoteInfo> } }
  | { type: "DELETE_NOTE"; payload: string }
  | { type: "SELECT_NOTE"; payload: string | null }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" };

// Context interface
interface NoteContextType {
  state: NoteState;
  // CRUD operations
  createNote: (title: string, content?: string, description?: string) => string;
  updateNote: (id: string, updates: Partial<NoteInfo>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => NoteInfo | undefined;
  // Selection and search
  selectNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  // Computed values
  filteredNotes: NoteInfo[];
  selectedNote: NoteInfo | undefined;
  // Utility
  clearError: () => void;
}

// Initial state
const initialState: NoteState = {
  notes: MockNotes.sort(
    ({ createdAt: a }, { createdAt: b }) =>
      new Date(b).getTime() - new Date(a).getTime()
  ),
  selectedNoteId: null,
  searchQuery: "",
  isLoading: false,
  error: null,
};

// Reducer function
function noteReducer(state: NoteState, action: NoteAction): NoteState {
  switch (action.type) {
    case "SET_NOTES":
      return { ...state, notes: action.payload };

    case "ADD_NOTE":
      return { ...state, notes: [action.payload, ...state.notes] };

    case "UPDATE_NOTE":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id
            ? { ...note, ...action.payload.updates, updatedAt: new Date() }
            : note
        ),
      };

    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
        selectedNoteId:
          state.selectedNoteId === action.payload ? null : state.selectedNoteId,
      };

    case "SELECT_NOTE":
      return { ...state, selectedNoteId: action.payload };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}

// Create context
const NoteContext = createContext<NoteContextType | undefined>(undefined);

// Provider component
interface NoteProviderProps {
  children: ReactNode;
}

export function NoteProvider({ children }: NoteProviderProps) {
  const [state, dispatch] = useReducer(noteReducer, initialState);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // CRUD operations
  const createNote = useCallback(
    (title: string, content = "", description?: string): string => {
      const id = generateId();
      const now = new Date();

      const newNote: NoteInfo = {
        id,
        title,
        content,
        description: description || content?.substring(0, 100) || "",
        createdAt: now,
        updatedAt: now,
        category: null,
      };

      dispatch({ type: "ADD_NOTE", payload: newNote });
      return id;
    },
    [generateId]
  );

  const updateNote = useCallback((id: string, updates: Partial<NoteInfo>) => {
    dispatch({ type: "UPDATE_NOTE", payload: { id, updates } });
  }, []);

  const deleteNote = useCallback((id: string) => {
    dispatch({ type: "DELETE_NOTE", payload: id });
  }, []);

  const getNote = useCallback(
    (id: string): NoteInfo | undefined => {
      return state.notes.find((note) => note.id === id);
    },
    [state.notes]
  );

  // Selection and search
  const selectNote = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_NOTE", payload: id });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  }, []);

  // Computed values
  const { state: rootState } = useRoot();

  const activeSidebarTab = rootState.activeSidebarTab;

  const filteredNotes = useMemo(() => {
    let notes = state.notes;

    if (activeSidebarTab && activeSidebarTab !== SidebarTabs.inbox) {
      notes = notes.filter((note) => note.category === activeSidebarTab);
    }

    if (!state.searchQuery.trim()) {
      return notes;
    }

    const query = state.searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.description?.toLowerCase().includes(query) ||
        note.content?.toLowerCase().includes(query)
    );
  }, [state.notes, state.searchQuery, activeSidebarTab]);

  const selectedNote = useMemo(() => {
    return state.selectedNoteId ? getNote(state.selectedNoteId) : undefined;
  }, [state.selectedNoteId, getNote]);

  // Utility
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const contextValue: NoteContextType = {
    setSearchQuery,
    filteredNotes,
    selectedNote,
    clearError,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    getNote,
    state,
  };

  return (
    <NoteContext.Provider value={contextValue}>{children}</NoteContext.Provider>
  );
}

// Custom hook to use the note context
export function useNotes(): NoteContextType {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NoteProvider");
  }
  return context;
}

// Utility hook for note operations
export function useNoteOperations() {
  const { createNote, updateNote, deleteNote, getNote } = useNotes();

  return {
    createNote,
    updateNote,
    deleteNote,
    getNote,
  };
}

// Utility hook for note selection
export function useNoteSelection() {
  const { selectNote, selectedNote, state } = useNotes();

  return {
    selectNote,
    selectedNote,
    selectedNoteId: state.selectedNoteId,
  };
}

// Utility hook for note search
export function useNoteSearch() {
  const { setSearchQuery, filteredNotes, state } = useNotes();

  return {
    setSearchQuery,
    filteredNotes,
    searchQuery: state.searchQuery,
  };
}
