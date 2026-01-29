import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

// Controls navigation/loading overlay visibility with minimum visible time
const NavigationProgressContext = createContext(null);

export function NavigationProgressProvider({ children, minVisibleMs = 250 }) {
  const [visible, setVisible] = useState(false);
  const loadingCount = useRef(0);
  const visibleSince = useRef(0);
  const hideTimer = useRef(null);

  const show = useCallback(() => {
    clearTimeout(hideTimer.current);
    visibleSince.current = Date.now();
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    const elapsed = Date.now() - visibleSince.current;
    const remaining = Math.max(0, minVisibleMs - elapsed);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      visibleSince.current = 0;
      hideTimer.current = null;
    }, remaining);
  }, [minVisibleMs]);

  const notifyNavigation = useCallback(() => {
    // show immediately on navigation; will auto-hide after minVisibleMs
    show();
    // schedule a hide in case nothing else clears it
    hide();
  }, [show, hide]);

  const registerLoading = useCallback(() => {
    loadingCount.current += 1;
    show();
    return () => {
      loadingCount.current = Math.max(0, loadingCount.current - 1);
      if (loadingCount.current === 0) {
        hide();
      }
    };
  }, [show, hide]);

  return (
    <NavigationProgressContext.Provider value={{ visible, notifyNavigation, registerLoading }}>
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const ctx = useContext(NavigationProgressContext);
  if (!ctx) throw new Error('useNavigationProgress must be used within NavigationProgressProvider');
  return ctx;
}
