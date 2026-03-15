"use client";

import { ArrowLeft } from "lucide-react";
import { AssignmentData } from "@/lib/assignments";

interface ServiceDetailHeaderProps {
  assignment: AssignmentData;
  showBackButton?: boolean;
  onClose?: () => void;
}

export function ServiceDetailHeader({ assignment, showBackButton = false, onClose }: ServiceDetailHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:bg-gray-200 shadow-sm border border-gray-800"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-gray-900 truncate">{assignment.serviceName}</h1>
          <p className="text-xs text-gray-500 truncate">{assignment.companyName}</p>
        </div>
      </div>
    </div>
  );
}
