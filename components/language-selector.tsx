"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "tr", name: "Türkçe", flag: "/flags/tr.svg" },
  { code: "en", name: "English", flag: "/flags/gb.svg" }, // Assuming Great Britain flag for English
];

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine current language from pathname if locale is part of the URL
  // This is a simplified approach, a more robust i18n solution would be better
  const currentLang = languages.find(lang => pathname.startsWith(`/${lang.code}`)) || languages[0]; // Default to Turkish

  const handleLanguageChange = (langCode: string) => {
    // This is a placeholder for actual i18n implementation
    // In a real app, you would change the locale and redirect
    console.log("Changing language to:", langCode);
    // Example: router.push(`/${langCode}${pathname.substring(3)}`); // Assuming /en/path or /tr/path
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" // Changed to outline variant
          className="w-10 h-10 p-0 rounded-full border border-gray-300 shadow-sm hover:bg-gray-50" // Added border and shadow classes
        >
          <Image
            src={currentLang.flag}
            alt={currentLang.name}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="sr-only">Change Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => handleLanguageChange(lang.code)}>
            <Image
              src={lang.flag}
              alt={lang.name}
              width={20}
              height={20}
              className="mr-2 rounded-full"
            />
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
