import { useState, useEffect, useRef } from 'react';

export function useSidebarReorder(projects, onReorder) {
  const [items, setItems] = useState(projects);
  const reorderTimer = useRef(null);

  useEffect(() => {
    setItems(projects);
  }, [projects]);

  const handleReorder = (newItems) => {
    setItems(newItems);
    if (onReorder) {
      clearTimeout(reorderTimer.current);
      reorderTimer.current = setTimeout(() => {
        onReorder(newItems.map(p => p.id));
      }, 500);
    }
  };

  return { items, handleReorder };
}
