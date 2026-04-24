import React, { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PageThumbnailCard from './PageThumbnailCard.jsx';

/**
 * SortableCardWrapper
 * Wraps the PageThumbnailCard to inject dnd-kit sortable hooks
 */
const SortableCardWrapper = ({ id, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <PageThumbnailCard
      {...props}
      pageNumber={id} // id is the pageNumber for sortable items
      setNodeRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDragging={isDragging}
    />
  );
};


/**
 * PageThumbnailGrid.jsx
 * 
 * Generic grid layout for thumbnails.
 * Handles drag-and-drop context if supportsDrag is true.
 * Handles standard grid with selection if supportsDrag is false.
 */
const PageThumbnailGrid = ({
  pdfDoc,
  documentId,
  version,
  pages, // Array of page numbers (e.g. [1, 2, 3] or reordered [3, 1, 2])
  selectedPages,
  onSelectPage,
  supportsSelection,
  supportsDrag,
  onReorder
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px drag to trigger, allows clicking without dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = pages.indexOf(active.id);
      const newIndex = pages.indexOf(over.id);
      const newOrder = arrayMove(pages, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  if (supportsDrag) {
    return (
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={pages} // items array must be unique IDs, we use page numbers
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-6">
            {pages.map((pageNum) => (
              <SortableCardWrapper
                key={pageNum}
                id={pageNum}
                pdfDoc={pdfDoc}
                documentId={documentId}
                version={version}
                supportsSelection={false} // Selection typically disabled during drag operations
                isSelected={false}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  // Standard non-draggable grid (for Selection/Rotate/Delete)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-6">
      {pages.map((pageNum) => (
        <PageThumbnailCard
          key={pageNum}
          pageNumber={pageNum}
          pdfDoc={pdfDoc}
          documentId={documentId}
          version={version}
          supportsSelection={supportsSelection}
          isSelected={selectedPages.includes(pageNum)}
          onSelect={onSelectPage}
        />
      ))}
    </div>
  );
};

export default PageThumbnailGrid;
