import { Package, Boxes, ScrollText, Shirt, Stethoscope, Cpu, Code, Megaphone } from 'lucide-react';

// Map icons to category names
export const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Raw Supplies': { icon: Boxes, gradient: 'from-green-400 to-emerald-500' },
    'Stationery': { icon: ScrollText, gradient: 'from-emerald-400 to-green-500' },
    'Packaging': { icon: Package, gradient: 'from-green-500 to-emerald-600' },
    'Garments': { icon: Shirt, gradient: 'from-emerald-500 to-green-600' },
    'Medical': { icon: Stethoscope, gradient: 'from-green-400 to-emerald-500' },
    'Electronics': { icon: Cpu, gradient: 'from-emerald-400 to-green-500' },
    'Software': { icon: Code, gradient: 'from-green-500 to-emerald-600' },
    'Marketing': { icon: Megaphone, gradient: 'from-emerald-500 to-green-600' }
  };

  return iconMap[categoryName] || { icon: Package, gradient: 'from-green-400 to-emerald-500' };
};