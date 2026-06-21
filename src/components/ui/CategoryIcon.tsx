import {
  Utensils,
  Home,
  Car,
  HeartPulse,
  Gamepad2,
  BookOpen,
  Receipt,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  PlusCircle,
  Tag,
  LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  home: Home,
  car: Car,
  "heart-pulse": HeartPulse,
  "gamepad-2": Gamepad2,
  "book-open": BookOpen,
  receipt: Receipt,
  "more-horizontal": MoreHorizontal,
  briefcase: Briefcase,
  laptop: Laptop,
  "trending-up": TrendingUp,
  "plus-circle": PlusCircle,
  tag: Tag,
};

export function CategoryIcon({
  name,
  size = 16,
  className,
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  const Icon = (name && ICON_MAP[name]) || Tag;
  return <Icon size={size} className={className} />;
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
