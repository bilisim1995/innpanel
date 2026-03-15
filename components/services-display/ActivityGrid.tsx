"use client";

import { AssignmentData } from "@/lib/assignments";
import { ServiceData } from "@/lib/services";
import { ServiceCard } from "./ServiceCard";

interface EnhancedAssignmentData extends AssignmentData {
  serviceDetails?: ServiceData;
}

interface ActivityGridProps {
  assignments: EnhancedAssignmentData[];
  onClearFilter: () => void;
  categoryColors: {[key: string]: any};
  categoryMetaMap: {[key: string]: { label: string; iconKey: string }};
  currentImageIndex: {[key: string]: number};
  isDragging: {[key: string]: boolean};
  onImageClick: (imageUrl: string) => void;
  onServiceSelect: (assignment: EnhancedAssignmentData) => void;
  onPrevImage: (assignmentId: string, totalImages: number) => void;
  onNextImage: (assignmentId: string, totalImages: number) => void;
  onDragStart: (assignmentId: string, e: React.MouseEvent | React.TouchEvent) => void;
  onDragEnd: (assignmentId: string, totalImages: number, e: React.MouseEvent | React.TouchEvent) => void;
  onDragMove: (assignmentId: string, e: React.MouseEvent | React.TouchEvent) => void;
}

export function ActivityGrid({
  assignments,
  onClearFilter,
  categoryColors,
  categoryMetaMap,
  currentImageIndex,
  isDragging,
  onImageClick,
  onServiceSelect,
  onPrevImage,
  onNextImage,
  onDragStart,
  onDragEnd,
  onDragMove
}: ActivityGridProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 animate-in fade-in-50 duration-700">
        {assignments.map((assignment) => (
          <ServiceCard
            key={assignment.id}
            assignment={assignment}
            categoryColors={categoryColors}
            categoryMetaMap={categoryMetaMap}
            currentImageIndex={currentImageIndex}
            isDragging={isDragging}
            onImageClick={onImageClick}
            onServiceSelect={onServiceSelect}
            onPrevImage={onPrevImage}
            onNextImage={onNextImage}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragMove={onDragMove}
          />
        ))}
      </div>
    </div>
  );
}