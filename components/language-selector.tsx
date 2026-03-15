"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { FlagIcon, FlagIconCode } from 'react-flag-kit';
import { Check } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type SupportedCountryCode = 'TR' | 'GB';

interface Language {
  code: string;
  name: string;
  countryCode: SupportedCountryCode;
}

const languages: Language[] = [
  { code: "tr", name: "Türkçe", countryCode: "TR" },
  { code: "en", name: "English", countryCode: "GB" },
];

const locales = ['en', 'tr'];

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

  // URL'den aktif dili al
  const currentLocaleFromPath = pathname.split('/').filter(Boolean)[0];
  const activeLanguageCode = locales.includes(currentLocaleFromPath) ? currentLocaleFromPath : 'en';

  // Bayrağı, i18n.language yerine URL'deki aktif dile göre belirle
  const currentDisplayLang = languages.find(lang => lang.code === activeLanguageCode) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    const currentPathWithoutLocale = getPathWithoutLocale(pathname, locales);
    const currentSearchParams = searchParams.toString();

    let newPath = `/${langCode}${currentPathWithoutLocale}`;
    const params = new URLSearchParams(currentSearchParams);

    if (currentPathWithoutLocale.startsWith('/services/')) {
      if (!params.has('qr_scan')) {
        params.set('qr_scan', 'true');
      }
    } else {
      params.delete('qr_scan');
    }
    
    const updatedSearchParams = params.toString();

    if (updatedSearchParams) {
      newPath += `?${updatedSearchParams}`;
    }
    
    window.location.href = newPath;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="relative w-11 h-11 p-0 rounded-2xl border border-white/80 bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white transition-all duration-200 hover:scale-105 flex items-center justify-center"
        >
          <span className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-black/10 shadow-sm">
            <FlagIcon 
              code={currentDisplayLang.countryCode} 
              size={32} 
              className="w-full h-full" 
            />
          </span>
          <span className="absolute -bottom-1 -right-1 text-[9px] font-bold uppercase bg-white text-gray-700 border border-gray-200 rounded-full px-1.5 py-0.5 shadow-sm">
            {activeLanguageCode}
          </span>
          <span className="sr-only">Change Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40 p-1.5">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between rounded-md px-2 py-1.5"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-black/10">
                <FlagIcon 
                  code={lang.countryCode} 
                  size={24}
                  className="w-full h-full" 
                />
              </span>
              <span>{lang.name}</span>
            </span>
            {activeLanguageCode === lang.code && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
