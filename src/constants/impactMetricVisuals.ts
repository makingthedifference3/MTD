import type { LucideIcon } from 'lucide-react';
import { Activity, Award, GraduationCap, Leaf, FolderKanban, Star } from 'lucide-react';
import type { ImpactMetricKey } from '../utils/impactMetrics';

interface ImpactMetricVisualConfig {
  icon: LucideIcon;
  wrapperClasses: string;
  iconWrapperClasses: string;
  iconClasses: string;
  labelClasses: string;
  valueClasses: string;
}

export const IMPACT_METRIC_VISUALS: Record<ImpactMetricKey, ImpactMetricVisualConfig> = {
  meals_served: {
    icon: Activity,
    wrapperClasses: 'bg-orange-50 border-orange-200',
    iconWrapperClasses: 'p-3 bg-orange-200',
    iconClasses: 'text-orange-700',
    labelClasses: 'text-xs font-bold text-orange-700 uppercase',
    valueClasses: 'text-2xl font-black text-orange-900',
  },
  pads_distributed: {
    icon: Award,
    wrapperClasses: 'bg-pink-50 border-pink-200',
    iconWrapperClasses: 'p-3 bg-pink-200',
    iconClasses: 'text-pink-700',
    labelClasses: 'text-xs font-bold text-pink-700 uppercase',
    valueClasses: 'text-2xl font-black text-pink-900',
  },
  students_enrolled: {
    icon: GraduationCap,
    wrapperClasses: 'bg-blue-50 border-blue-200',
    iconWrapperClasses: 'p-3 bg-blue-200',
    iconClasses: 'text-blue-700',
    labelClasses: 'text-xs font-bold text-blue-700 uppercase',
    valueClasses: 'text-2xl font-black text-blue-900',
  },
  trees_planted: {
    icon: Leaf,
    wrapperClasses: 'bg-green-50 border-green-200',
    iconWrapperClasses: 'p-3 bg-green-200',
    iconClasses: 'text-green-700',
    labelClasses: 'text-xs font-bold text-green-700 uppercase',
    valueClasses: 'text-2xl font-black text-green-900',
  },
  schools_renovated: {
    icon: FolderKanban,
    wrapperClasses: 'bg-purple-50 border-purple-200',
    iconWrapperClasses: 'p-3 bg-purple-200',
    iconClasses: 'text-purple-700',
    labelClasses: 'text-xs font-bold text-purple-700 uppercase',
    valueClasses: 'text-2xl font-black text-purple-900',
  },
  custom: {
    icon: Star,
    wrapperClasses: 'bg-indigo-50 border-indigo-200',
    iconWrapperClasses: 'p-3 bg-indigo-200',
    iconClasses: 'text-indigo-700',
    labelClasses: 'text-xs font-bold text-indigo-700 uppercase',
    valueClasses: 'text-2xl font-black text-indigo-900',
  },
};
