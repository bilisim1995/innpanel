"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CATEGORY_ICON_OPTIONS, getCategoryIcon, getCategoryIconOption } from "@/lib/category-icons";

interface IconSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIconKey: string;
  onSelect: (iconKey: string) => void;
}

const ALL_GROUP = "All";

export function IconSetModal({ isOpen, onClose, selectedIconKey, onSelect }: IconSetModalProps) {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState(ALL_GROUP);

  const groups = useMemo(() => {
    const unique = new Set(CATEGORY_ICON_OPTIONS.map((option) => option.group));
    return [ALL_GROUP, ...Array.from(unique)];
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATEGORY_ICON_OPTIONS.filter((option) => {
      const byGroup = activeGroup === ALL_GROUP || option.group === activeGroup;
      if (!byGroup) return false;
      if (!q) return true;
      const haystack = `${option.key} ${option.label} ${option.group} ${option.keywords.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [activeGroup, search]);

  const selectedOption = getCategoryIconOption(selectedIconKey);
  const SelectedIcon = getCategoryIcon(selectedIconKey);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogTitle>Ikon Seti</DialogTitle>

        <div className="space-y-4">
          <div className="rounded-lg border p-3 bg-muted/20 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md border bg-background flex items-center justify-center">
                <SelectedIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{selectedOption?.label || "Secili ikon"}</p>
                <p className="text-xs text-muted-foreground">{selectedIconKey}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Toplam {CATEGORY_ICON_OPTIONS.length} ikon, gosterilen {filtered.length}
            </p>
          </div>

          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ikon ara (ornek: car, travel, map)"
              className="pl-9"
            />
          </div>

          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center gap-2 pb-2">
              {groups.map((group) => (
                <Button
                  key={group}
                  type="button"
                  variant={activeGroup === group ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveGroup(group)}
                >
                  {group}
                </Button>
              ))}
            </div>
          </ScrollArea>

          <ScrollArea className="h-[380px] pr-4">
            {filtered.length === 0 ? (
              <div className="h-[340px] flex items-center justify-center text-sm text-muted-foreground">
                Aramaya uygun ikon bulunamadi.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filtered.map((option) => {
                  const Icon = getCategoryIcon(option.key);
                  const isSelected = selectedIconKey === option.key;

                  return (
                    <button
                      type="button"
                      key={option.key}
                      onClick={() => onSelect(option.key)}
                      className={`relative rounded-lg border p-3 text-left transition-all hover:shadow-sm ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-md border bg-background flex items-center justify-center mb-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium leading-tight">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{option.group}</p>
                      {isSelected && (
                        <span className="absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

