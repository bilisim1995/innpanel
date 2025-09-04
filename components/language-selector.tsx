"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from 'react-i18next';
import { FlagIcon, FlagIconCode } from 'react-flag-kit'; // FlagIconCode import edildi

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Kullanılan ülke kodlarını içeren bir tip tanımlayalım
type SupportedCountryCode = 'TR' | 'GB';

interface Language {
  code: string;
  name: string;
  countryCode: SupportedCountryCode; // Tipi SupportedCountryCode olarak güncellendi
}

const languages: Language[] = [
  { code: "tr", name: "Türkçe", countryCode: "TR" },
  { code: "en", name: "English", countryCode: "GB" },
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

    let newPath = `/${langCode}${currentPathWithoutLocale}`;
    const params = new URLSearchParams(currentSearchParams);

    // Sadece hizmet sayfaları için qr_scan=true parametresini ekle/koru
    if (currentPathWithoutLocale.startsWith('/services/')) {
      if (!params.has('qr_scan')) {
        params.set('qr_scan', 'true');
      }
    } else {
      // Diğer rotalar için qr_scan parametresini kaldır
      params.delete('qr_scan');
    }
    
    const updatedSearchParams = params.toString();

    if (updatedSearchParams) {
      newPath += `?${updatedSearchParams}`;
    }
    
    // Sayfanın tamamen yeniden yüklenmesini sağlayın
    window.location.href = newPath;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-10 h-10 p-0 rounded-full border border-gray-300 shadow-sm hover:bg-gray-50 flex items-center justify-center"
        >
          <FlagIcon 
            code={currentDisplayLang.countryCode} 
            size={24} 
            className="rounded-full overflow-hidden" 
          />
          <span className="sr-only">Change Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => handleLanguageChange(lang.code)} className="flex items-center">
            <FlagIcon 
              code={lang.countryCode} 
              size={20} 
              className="mr-2 rounded-full overflow-hidden" 
            />
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}