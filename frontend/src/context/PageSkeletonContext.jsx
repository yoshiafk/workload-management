import React from 'react';

// Minimal stub: skeleton feature removed, provide no-op hooks to avoid breaking imports
export function PageSkeletonProvider({ children }) {
  return <>{children}</>;
}

export function usePageSkeleton() {
  return {
    setVariant: () => {},
    resetVariant: () => {},
    registerRegion: () => () => {},
    getRegions: () => [],
    variant: 'default'
  };
}
