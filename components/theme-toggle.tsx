"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-accent">
            {theme === "light" ? (
              <Moon className="h-[1.2rem] w-[1.2rem] text-foreground" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem] text-foreground" />
            )}
            <span className="sr-only">Tema Değiştir</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Temayı Değiştir</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}