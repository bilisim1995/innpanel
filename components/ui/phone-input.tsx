"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;
      
      // Remove all non-digit characters except + at the beginning
      inputValue = inputValue.replace(/[^\d+]/g, '');
      
      // Ensure + is only at the beginning
      if (inputValue.includes('+')) {
        const plusIndex = inputValue.indexOf('+');
        if (plusIndex === 0) {
          inputValue = '+' + inputValue.slice(1).replace(/\+/g, '');
        } else {
          inputValue = inputValue.replace(/\+/g, '');
        }
      }
      
      // Format Turkish phone number
      if (inputValue.startsWith('+90') || inputValue.startsWith('90')) {
        let digits = inputValue.replace(/^\+?90/, '');
        digits = digits.replace(/\D/g, '');
        
        if (digits.length <= 10) {
          if (digits.length >= 7) {
            inputValue = `+90 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
          } else if (digits.length >= 4) {
            inputValue = `+90 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
          } else if (digits.length >= 1) {
            inputValue = `+90 ${digits.slice(0, 3)} ${digits.slice(3)}`;
          } else {
            inputValue = '+90';
          }
        }
      } else if (inputValue.startsWith('0')) {
        // Turkish domestic format
        let digits = inputValue.replace(/^0/, '');
        digits = digits.replace(/\D/g, '');
        
        if (digits.length <= 10) {
          if (digits.length >= 7) {
            inputValue = `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
          } else if (digits.length >= 4) {
            inputValue = `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
          } else if (digits.length >= 1) {
            inputValue = `0${digits.slice(0, 3)} ${digits.slice(3)}`;
          }
        }
      }
      
      onChange(inputValue);
    };

    return (
      <Input
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        className={cn("", className)}
        placeholder="Telefon numarası"
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };