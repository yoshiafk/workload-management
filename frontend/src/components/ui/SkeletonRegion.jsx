import React from 'react';

// SkeletonRegion is now a noop wrapper (skeleton feature removed)
export default function SkeletonRegion({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}
