"use client";

import * as React from "react";
import RPNInput, {
  type Value,
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

import "react-phone-number-input/style.css";

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  defaultCountry?: Country;
  placeholder?: string;
}

const EXAMPLE_NUMBERS: Record<string, string> = {
  TR: "5XX XXX XX XX",
  US: "(XXX) XXX-XXXX",
  GB: "7XXX XXXXXX",
  DE: "1XX XXXXXXX",
  FR: "6 XX XX XX XX",
  IT: "3XX XXX XXXX",
  ES: "6XX XXX XXX",
  NL: "6 XXXXXXXX",
  RU: "9XX XXX-XX-XX",
  SA: "5X XXX XXXX",
  AE: "5X XXX XXXX",
  JP: "90-XXXX-XXXX",
  CN: "1XX XXXX XXXX",
  IN: "9XXX XXX XXX",
  BR: "(XX) 9XXXX-XXXX",
  AU: "4XX XXX XXX",
  CA: "(XXX) XXX-XXXX",
  KR: "10-XXXX-XXXX",
  MX: "XX XXXX XXXX",
  PL: "5XX XXX XXX",
  SE: "7X XXX XX XX",
  NO: "4XX XX XXX",
  DK: "XX XX XX XX",
  FI: "4X XXX XXXX",
  GR: "69X XXX XXXX",
  PT: "9XX XXX XXX",
  AT: "6XX XXXXXXX",
  CH: "7X XXX XX XX",
  BE: "4XX XX XX XX",
  CZ: "6XX XXX XXX",
  IE: "8X XXX XXXX",
  IL: "5X-XXX-XXXX",
  EG: "1XX XXX XXXX",
  ZA: "7X XXX XXXX",
  UA: "XX XXX XX XX",
  RO: "7XX XXX XXX",
  BG: "8X XXX XXXX",
  HR: "9X XXX XXXX",
  RS: "6X XXX XXXX",
  AL: "6X XXX XXXX",
  GE: "5XX XXX XXX",
  AZ: "5X XXX XX XX",
  KZ: "7XX XXX XX XX",
};

const PRIORITY_COUNTRIES: Country[] = ["TR", "US", "GB", "DE", "FR", "NL", "RU", "SA", "AE"];

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, defaultCountry = "TR", placeholder, ...props }, ref) => {
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(defaultCountry);

    const handleChange = (val: Value | undefined) => {
      onChange(val || "");
    };

    const dynamicPlaceholder = placeholder || (
      EXAMPLE_NUMBERS[selectedCountry]
        ? `${EXAMPLE_NUMBERS[selectedCountry]}`
        : "XXX XXX XXXX"
    );

    return (
      <RPNInput
        international
        countryCallingCodeEditable={false}
        defaultCountry={defaultCountry}
        flags={flags}
        value={(value as Value) || undefined}
        onChange={handleChange}
        onCountryChange={(country) => {
          if (country) setSelectedCountry(country);
        }}
        placeholder={dynamicPlaceholder}
        inputComponent={InputComponent}
        countrySelectComponent={CountrySelectComponent}
        className={cn(
          "flex items-center gap-2",
          className
        )}
        {...props}
      />
    );
  }
);
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
InputComponent.displayName = "InputComponent";

interface CountrySelectOption {
  value?: Country;
  label: string;
}

interface CountrySelectProps {
  value: Country;
  onChange: (country: Country) => void;
  options: CountrySelectOption[];
  disabled?: boolean;
}

function CountrySelectComponent({
  value,
  onChange,
  options,
  disabled,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const FlagComponent = value ? flags[value] : null;

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const sortedOptions = React.useMemo(() => {
    const validOptions = options.filter((o) => o.value);
    const prioritized = PRIORITY_COUNTRIES
      .map((code) => validOptions.find((o) => o.value === code))
      .filter(Boolean) as CountrySelectOption[];
    const rest = validOptions.filter((o) => !PRIORITY_COUNTRIES.includes(o.value!));
    return [...prioritized, ...rest];
  }, [options]);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return sortedOptions;
    const q = search.toLowerCase();
    return sortedOptions.filter((o) => {
      if (!o.value) return false;
      const code = `+${getCountryCallingCode(o.value)}`;
      return (
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        code.includes(q)
      );
    });
  }, [sortedOptions, search]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-10 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 hover:bg-accent/50 transition-colors cursor-pointer select-none whitespace-nowrap"
      >
        {FlagComponent && (
          <span className="h-4 w-5 rounded-sm object-cover inline-block overflow-hidden">
            <FlagComponent title={value} />
          </span>
        )}
        <span className="text-sm font-medium text-muted-foreground">
          +{value ? getCountryCallingCode(value) : ""}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-72 rounded-lg border border-input bg-background shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="p-2 border-b border-input">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ülke ara..."
                className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.map((option) => {
              if (!option.value) return null;
              const OptionFlag = flags[option.value];
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value!);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 transition-colors",
                    isSelected && "bg-accent/30 font-medium"
                  )}
                >
                  {OptionFlag && (
                    <span className="h-4 w-5 rounded-sm object-cover shrink-0 inline-block overflow-hidden">
                      <OptionFlag title={option.value} />
                    </span>
                  )}
                  <span className="truncate">{option.label}</span>
                  <span className="ml-auto text-muted-foreground text-xs shrink-0">
                    +{getCountryCallingCode(option.value)}
                  </span>
                </button>
              );
            })}
            {filteredOptions.length === 0 && (
              <p className="px-3 py-4 text-sm text-center text-muted-foreground">Sonuç bulunamadı</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { PhoneInput };
