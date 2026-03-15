"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, GripVertical } from "lucide-react";
import { ServiceData } from "@/lib/services";

interface SortableServiceRowProps {
  service: ServiceData;
  getCategoryLabel: (category: string) => string;
  onEdit: (service: ServiceData) => void;
  onDelete: (id: string) => void;
  onStatusToggle: (service: ServiceData) => void;
  updatingStatus: boolean;
}

export function SortableServiceRow({
  service,
  getCategoryLabel,
  onEdit,
  onDelete,
  onStatusToggle,
  updatingStatus,
}: SortableServiceRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-50 bg-muted/50" : ""}
    >
      <TableCell className="w-10 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </TableCell>
      <TableCell className="font-medium">{service.serviceName}</TableCell>
      <TableCell>{service.companyName}</TableCell>
      <TableCell>{getCategoryLabel(service.category)}</TableCell>
      <TableCell>{service.quota}</TableCell>
      <TableCell>
        <Badge variant={service.isActive ? "default" : "secondary"}>
          {service.isActive ? "Aktif" : "Pasif"}
        </Badge>
      </TableCell>
      <TableCell>
        <Switch
          checked={service.isActive}
          onCheckedChange={() => onStatusToggle(service)}
          disabled={updatingStatus}
          className="data-[state=checked]:bg-green-600"
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(service)}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hizmeti Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu hizmeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => service.id && onDelete(service.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
