import { SidebarTabs } from "@/models";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";

export const Pathname = {
  root: "/",
  createNote: "/create-note",
} as const;

const Locales = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  ru: "ru",
  zh: "zh",
} as const;

type Locale = (typeof Locales)[keyof typeof Locales];
type Pathname = (typeof Pathname)[keyof typeof Pathname];

// --- Types ---
export interface RootState {
  pathname: Pathname;
  locale: Locale;
  activeSidebarTab: SidebarTabs;
  // Add more global state fields as needed
}

export type RootAction =
  | { type: "SET_PATHNAME"; payload: Pathname }
  | { type: "SET_LOCALE"; payload: Locale }
  | { type: "SET_ACTIVE_SIDEBAR_TAB"; payload: SidebarTabs }
  | { type: "RESET_PATHNAME" }
  | { type: "RESET" };

interface RootContextType {
  state: RootState;
  setPathname: (pathname: Pathname) => void;
  setLocale: (locale: Locale) => void;
  setActiveSidebarTab: (tab: SidebarTabs) => void;
  resetPathname: () => void;
  reset: () => void;
}

// --- Initial State ---
const initialState: RootState = {
  pathname: "/",
  locale: "en",
  activeSidebarTab: SidebarTabs.inbox,
};

// --- Reducer ---
function rootReducer(state: RootState, action: RootAction): RootState {
  switch (action.type) {
    case "SET_PATHNAME":
      return { ...state, pathname: action.payload };
    case "SET_LOCALE":
      return { ...state, locale: action.payload };
    case "SET_ACTIVE_SIDEBAR_TAB":
      return { ...state, activeSidebarTab: action.payload };
    case "RESET_PATHNAME":
      return { ...state, pathname: "/" };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// --- Context ---
const RootContext = createContext<RootContextType | undefined>(undefined);

// --- Provider ---
export function RootProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  const setPathname = useCallback((pathname: Pathname) => {
    dispatch({ type: "SET_PATHNAME", payload: pathname });
  }, []);

  const setLocale = useCallback((locale: Locale) => {
    dispatch({ type: "SET_LOCALE", payload: locale });
  }, []);

  const setActiveSidebarTab = useCallback((tab: SidebarTabs) => {
    dispatch({ type: "SET_ACTIVE_SIDEBAR_TAB", payload: tab });
  }, []);

  const resetPathname = useCallback(() => {
    dispatch({ type: "RESET_PATHNAME" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value: RootContextType = {
    state,
    setPathname,
    setLocale,
    setActiveSidebarTab,
    resetPathname,
    reset,
  };

  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
}

// --- Hook ---
export function useRoot() {
  const context = useContext(RootContext);
  if (!context) {
    throw new Error("useRoot must be used within a RootProvider");
  }
  return context;
}

export const useRootState = () => useRoot().state;

export const useRootOperations = () => {
  const { setPathname, setLocale, setActiveSidebarTab, resetPathname, reset } =
    useRoot();

  return {
    setPathname,
    setLocale,
    setActiveSidebarTab,
    resetPathname,
    reset,
  };
};
