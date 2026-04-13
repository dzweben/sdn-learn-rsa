/**
 * AppContext — minimal context for the static website.
 * Only provides access to bundled script content (for PeekScript).
 */

import { createContext, useContext } from 'react'

export interface AppContextType {
  getScriptContent(scriptName: string): string | null
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppContext.Provider>')
  return ctx
}

export default AppContext
