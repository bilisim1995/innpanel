"use client";

import { Building2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string | null;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-900">Hata</h1>
          <p className="text-gray-600">{error}</p>
        </div>
        <Button 
          onClick={() => window.history.back()} 
          variant="outline"
          className="border-gray-300"
        >
          Geri Dön
        </Button>
      </div>
    </div>
  );
}