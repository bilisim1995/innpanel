"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const storedAuth = localStorage.getItem('inn-auth');
    if (!isAuthenticated && !storedAuth) {
      // Only redirect to login if we're in the dashboard section
      if (window.location.pathname.startsWith('/dashboard')) {
        router.push('/login');
      }
    }
    setIsLoading(false);
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>{children}</>
  );
}