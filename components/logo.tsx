"use client";

import { Building2 } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Building2 className="h-6 w-6 flex-shrink-0" />
      <span className="font-bold text-xl whitespace-nowrap">INN Panel</span>
    </div>
  );
}