import { SidebarTabs } from "@/models";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";

// --- Types ---
export interface RootState {
  pathname: string;
  locale: string;
  activeSidebarTab: SidebarTabs;
  // Add more global state fields as needed
}

export type RootAction =
  | { type: "SET_PATHNAME"; payload: string }
  | { type: "SET_LOCALE"; payload: string }
  | { type: "SET_ACTIVE_SIDEBAR_TAB"; payload: SidebarTabs }
  | { type: "RESET" };

interface RootContextType {
  state: RootState;
  setPathname: (pathname: string) => void;
  setLocale: (locale: string) => void;
  setActiveSidebarTab: (tab: SidebarTabs) => void;
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

  const setPathname = useCallback((pathname: string) => {
    dispatch({ type: "SET_PATHNAME", payload: pathname });
  }, []);

  const setLocale = useCallback((locale: string) => {
    dispatch({ type: "SET_LOCALE", payload: locale });
  }, []);

  const setActiveSidebarTab = useCallback((tab: SidebarTabs) => {
    dispatch({ type: "SET_ACTIVE_SIDEBAR_TAB", payload: tab });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value: RootContextType = {
    state,
    setPathname,
    setLocale,
    setActiveSidebarTab,
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
