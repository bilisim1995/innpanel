"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AssignmentData } from "@/lib/assignments";

interface ServiceDetailHeaderProps {
  assignment: AssignmentData;
  onClose: () => void;
}

export function ServiceDetailHeader({ assignment, onClose }: ServiceDetailHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium shadow-sm hover:shadow-md transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{assignment.serviceName}</h1>
          <p className="text-sm text-gray-600" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{assignment.companyName}</p>
        </div>
      </div>
    </div>
  );
}