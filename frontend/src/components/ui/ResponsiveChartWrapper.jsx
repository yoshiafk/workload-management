import React, { useRef, useState, useEffect, cloneElement } from 'react';
import { ChartSkeleton } from '@/components/ui/skeleton';

/**
 * ResponsiveChartWrapper
 * - Defensively measures its container using ResizeObserver
 * - Renders children only when container width/height > 0
 * - Otherwise renders a ChartSkeleton to avoid Recharts runtime errors
 *
 * Improvements:
 * - clamps measured sizes to >= 0 to avoid negative -1 values
 * - adds minWidth/minHeight:0 on container to prevent flex-basis shrink issues
 * - listens to window.resize as a fallback
 */
export default function ResponsiveChartWrapper({ children, height = 250, className }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const r = el.getBoundingClientRect();
      setSize({ width: Math.max(0, Math.round(r.width)), height: Math.max(0, Math.round(r.height)) });
    };

    // Initial read
    update();

    // Listen for layout changes
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    }

    // Fallback listeners
    const onLoad = () => update();
    const onResize = () => update();

    if (typeof window !== 'undefined') {
      window.addEventListener('load', onLoad);
      window.addEventListener('resize', onResize);
    }

    return () => {
      ro && ro.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', onLoad);
        window.removeEventListener('resize', onResize);
      }
    };
  }, []);

  const isVisible = size.width > 0 && size.height > 0;

  // If visible and children contain ResponsiveContainer (or similar), inject numeric size props
  const renderChildren = () => {
    if (!isVisible) return <ChartSkeleton height={height} />;

    // If children is a single element that accepts width/height, clone with numeric values
    try {
      const child = React.Children.only(children);
      if (React.isValidElement(child) && child.props) {
        // Detect ResponsiveContainer by name/displayName or presence of width/height props
        const typeName = child.type && (child.type.displayName || child.type.name);
        if (typeName === 'ResponsiveContainer' || 'width' in child.props || 'height' in child.props) {
          return cloneElement(child, {
            width: size.width,
            height: size.height,
            minWidth: 0,
            minHeight: 0,
          });
        }
      }
    } catch (e) {
      // not a single child or cloning failed; fall back to rendering children as-is
    }

    return children;
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: '100%', height, minWidth: 0, minHeight: 0 }}
      data-testid="responsive-chart-wrapper"
    >
      {renderChildren()}
    </div>
  );
}
