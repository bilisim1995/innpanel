"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/lib/auth";

export default function DashboardLayout({
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
    <div className="h-screen overflow-hidden bg-background">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 md:h-14 border-b shrink-0 flex items-center px-6 bg-card">
            <div className="flex-1"></div>
            <div className="flex items-center gap-4 justify-end">
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}