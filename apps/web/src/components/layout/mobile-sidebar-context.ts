'use client';

import { createContext, useContext } from 'react';

interface MobileSidebarContextValue {
  toggle: () => void;
}

export const MobileSidebarContext = createContext<MobileSidebarContextValue>({
  toggle: () => {},
});

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}
