import { useEffect, useRef } from 'react';

import './Ribbons.css';

const Ribbons = () => {
  const pixelCursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supportsDecorativeCursor =
      typeof window !== 'undefined'
      && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!supportsDecorativeCursor) {
      return;
    }

    function updateCursor(x: number, y: number) {
      const cursor = pixelCursorRef.current;
      if (!cursor) return;
      cursor.style.setProperty('--cursor-x', `${x}px`);
      cursor.style.setProperty('--cursor-y', `${y}px`);
      cursor.classList.add('is-visible');
    }

    function handlePointerMove(e: PointerEvent) {
      updateCursor(e.clientX, e.clientY);
    }

    function handlePointerDown(e: PointerEvent) {
      updateCursor(e.clientX, e.clientY);
      pixelCursorRef.current?.classList.add('is-pressing');
    }

    function handlePointerUp() {
      pixelCursorRef.current?.classList.remove('is-pressing');
    }

    function hideCursor() {
      pixelCursorRef.current?.classList.remove('is-visible', 'is-pressing');
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('blur', hideCursor);
    document.documentElement.addEventListener('mouseleave', hideCursor);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('blur', hideCursor);
      document.documentElement.removeEventListener('mouseleave', hideCursor);
    };
  }, []);

  return (
    <div className="ribbons-container">
      <div ref={pixelCursorRef} className="pixel-cursor" aria-hidden="true" />
    </div>
  );
};

export default Ribbons;
