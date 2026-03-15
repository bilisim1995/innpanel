import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  Bike,
  Bus,
  Camera,
  Car,
  CircleHelp,
  Compass,
  FerrisWheel,
  Flame,
  Globe,
  HeartPulse,
  Hotel,
  Map,
  MapPin,
  MoreHorizontal,
  Mountain,
  PartyPopper,
  Plane,
  Route,
  Sailboat,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  UtensilsCrossed,
  Waves,
  Wind,
} from "lucide-react";

export interface CategoryIconOption {
  key: string;
  label: string;
  group: string;
  keywords: string[];
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { key: "route", label: "Route", group: "Travel", keywords: ["tour", "path", "travel", "road"] },
  { key: "map", label: "Map", group: "Travel", keywords: ["map", "location", "travel"] },
  { key: "compass", label: "Compass", group: "Travel", keywords: ["direction", "travel", "explore"] },
  { key: "map-pin", label: "Map Pin", group: "Travel", keywords: ["location", "pin", "place"] },
  { key: "plane", label: "Plane", group: "Travel", keywords: ["airport", "flight", "air"] },
  { key: "car", label: "Car", group: "Transport", keywords: ["transfer", "vehicle", "ride"] },
  { key: "bus", label: "Bus", group: "Transport", keywords: ["shuttle", "group", "transport"] },
  { key: "bike", label: "Bike", group: "Transport", keywords: ["motor", "activity", "ride"] },
  { key: "sailboat", label: "Sailboat", group: "Transport", keywords: ["boat", "sea", "trip"] },
  { key: "wind", label: "Wind", group: "Nature", keywords: ["balloon", "air", "sky"] },
  { key: "mountain", label: "Mountain", group: "Nature", keywords: ["landscape", "nature", "outdoor"] },
  { key: "waves", label: "Waves", group: "Nature", keywords: ["water", "beach", "sea"] },
  { key: "flame", label: "Flame", group: "Nature", keywords: ["adventure", "energy"] },
  { key: "sparkles", label: "Sparkles", group: "Experience", keywords: ["premium", "special", "vip"] },
  { key: "ferris-wheel", label: "Ferris Wheel", group: "Experience", keywords: ["fun", "activity", "park"] },
  { key: "party-popper", label: "Party Popper", group: "Experience", keywords: ["event", "celebration"] },
  { key: "camera", label: "Camera", group: "Experience", keywords: ["photo", "gallery", "media"] },
  { key: "ticket", label: "Ticket", group: "Commerce", keywords: ["booking", "reservation", "entry"] },
  { key: "shopping-bag", label: "Shopping Bag", group: "Commerce", keywords: ["shop", "store", "product"] },
  { key: "badge-percent", label: "Badge Percent", group: "Commerce", keywords: ["sale", "discount", "offer"] },
  { key: "utensils", label: "Utensils", group: "Service", keywords: ["food", "restaurant", "meal"] },
  { key: "hotel", label: "Hotel", group: "Service", keywords: ["accommodation", "room"] },
  { key: "shield-check", label: "Shield Check", group: "Service", keywords: ["safe", "approved", "quality"] },
  { key: "heart-pulse", label: "Heart Pulse", group: "Service", keywords: ["health", "wellness"] },
  { key: "globe", label: "Globe", group: "Service", keywords: ["international", "global"] },
  { key: "more-horizontal", label: "More Horizontal", group: "Other", keywords: ["other", "misc"] },
];

const iconMap: Record<string, LucideIcon> = {
  route: Route,
  map: Map,
  compass: Compass,
  "map-pin": MapPin,
  plane: Plane,
  car: Car,
  bus: Bus,
  bike: Bike,
  sailboat: Sailboat,
  wind: Wind,
  mountain: Mountain,
  waves: Waves,
  flame: Flame,
  sparkles: Sparkles,
  "ferris-wheel": FerrisWheel,
  "party-popper": PartyPopper,
  camera: Camera,
  ticket: Ticket,
  "shopping-bag": ShoppingBag,
  "badge-percent": BadgePercent,
  utensils: UtensilsCrossed,
  hotel: Hotel,
  "shield-check": ShieldCheck,
  "heart-pulse": HeartPulse,
  globe: Globe,
  "more-horizontal": MoreHorizontal,
};

export const getCategoryIcon = (iconKey: string) => {
  return iconMap[iconKey] || CircleHelp;
};

export const getCategoryIconOption = (iconKey: string) => {
  return CATEGORY_ICON_OPTIONS.find((option) => option.key === iconKey);
};


