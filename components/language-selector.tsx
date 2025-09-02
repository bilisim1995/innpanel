"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useTranslation } from 'react-i18next';

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

const locales = ['en', 'tr'];

// Helper to get the path without the locale prefix
const getPathWithoutLocale = (currentPathname: string, availableLocales: string[]) => {
  const segment = currentPathname.split('/').filter(Boolean)[0];
  if (availableLocales.includes(segment)) {
    return currentPathname.replace(`/${segment}`, '');
  }
  return currentPathname;
};

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { i18n } = useTranslation();

  const currentDisplayLang = languages.find(lang => lang.code === i18n.language) || languages.find(lang => lang.code === 'en') || languages[0];

  const handleLanguageChange = (langCode: string) => {
    const currentPathWithoutLocale = getPathWithoutLocale(pathname, locales);
    const currentSearchParams = searchParams.toString();

    if (currentPathWithoutLocale.startsWith('/services/')) {
      let newPath = `/${langCode}${currentPathWithoutLocale}`;
      if (currentSearchParams) {
        newPath += `?${currentSearchParams}`;
      }
      router.push(newPath);
    } else {
      // Diğer rotalar için sadece i18n dilini değiştir, URL'yi elleme
      // (Middleware zaten bu rotaları dil yönlendirmesinden hariç tutuyor)
      i18n.changeLanguage(langCode);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-10 h-10 p-0 rounded-full border border-gray-300 shadow-sm hover:bg-gray-50" 
        >
          <Image
            src={currentDisplayLang.flag}
            alt={currentDisplayLang.name}
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