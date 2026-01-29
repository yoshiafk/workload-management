/**
 * PageLoader Component
 * Displayed during lazy loading of page components
 */

import './PageLoader.css';
import { useEffect, useState } from 'react';

// Short delay to avoid flicker on very-fast navigations
const DELAY_MS = 120;

export default function PageLoader({ compact = false }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="page-loader">
      <div className="loader-content">
        <div className="loader-spinner"></div>
        <span className="loader-text">Loading...</span>
      </div>
    </div>
  );
}

