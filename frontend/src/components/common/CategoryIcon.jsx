import React from 'react';
import * as Icons from 'lucide-react';

const iconMap = {
  Utensils: Icons.Utensils,
  Car: Icons.Car,
  ShoppingBag: Icons.ShoppingBag,
  GraduationCap: Icons.GraduationCap,
  Zap: Icons.Zap,
  HeartPulse: Icons.HeartPulse,
  Film: Icons.Film,
  Home: Icons.Home,
  Briefcase: Icons.Briefcase,
  Laptop: Icons.Laptop,
  TrendingUp: Icons.TrendingUp,
  DollarSign: Icons.DollarSign,
  Gift: Icons.Gift,
  PlusCircle: Icons.PlusCircle,
  Dumbbell: Icons.Dumbbell,
  Tag: Icons.Tag,
  Coffee: Icons.Coffee,
  Plane: Icons.Plane,
  Smartphone: Icons.Smartphone,
  BookOpen: Icons.BookOpen,
  Wifi: Icons.Wifi,
  MoreHorizontal: Icons.MoreHorizontal,
};

export default function CategoryIcon({ name, className = 'w-5 h-5', style }) {
  const IconComponent = iconMap[name] || Icons.Tag;
  return <IconComponent className={className} style={style} />;
}
