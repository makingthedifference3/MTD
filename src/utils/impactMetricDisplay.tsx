import { IMPACT_METRIC_VISUALS } from '../constants/impactMetricVisuals';
import { IMPACT_METRIC_LABELS, type ImpactMetricKey } from './impactMetrics';

export const IMPACT_METRIC_ORDER: ImpactMetricKey[] = [
  'meals_served',
  'pads_distributed',
  'students_enrolled',
  'trees_planted',
  'schools_renovated',
];

export const IMPACT_METRIC_FORMATTERS: Record<ImpactMetricKey, (value: number) => string> = {
  meals_served: (value) => `${(value / 1000000).toFixed(1)}M`,
  pads_distributed: (value) => `${(value / 1000000).toFixed(1)}M`,
  students_enrolled: (value) => `${(value / 1000).toFixed(1)}K`,
  trees_planted: (value) => `${(value / 1000).toFixed(1)}K`,
  schools_renovated: (value) => value.toLocaleString(),
  custom: (value) => value.toLocaleString(),
};

export const renderImpactMetricCard = (key: ImpactMetricKey, formattedValue: string) => {
  const visual = IMPACT_METRIC_VISUALS[key];
  const Icon = visual.icon;
  return (
    <div key={key} className={`rounded-xl p-6 border-2 ${visual.wrapperClasses} hover:shadow-lg transition-all`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`${visual.iconWrapperClasses} rounded-lg`}>
          <Icon className={`w-5 h-5 ${visual.iconClasses}`} />
        </div>
        <span className={visual.labelClasses}>{IMPACT_METRIC_LABELS[key]}</span>
      </div>
      <p className={visual.valueClasses}>{formattedValue}</p>
    </div>
  );
};
