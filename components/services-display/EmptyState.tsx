"use client";

import { Package2 } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package2 className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-lg font-medium text-gray-900 mb-2">Henüz Hizmet Bulunmuyor</h2>
      <p className="text-gray-600 max-w-md mx-auto">
        Bu hizmet noktasına henüz özel hizmet atanmamış. Yakında yeni hizmetler eklenecek.
      </p>
    </div>
  );
}