export type ImpactMetricKey =
  | 'meals_served'
  | 'pads_distributed'
  | 'students_enrolled'
  | 'trees_planted'
  | 'schools_renovated'
  | 'custom'; // For user-defined metrics

export interface ImpactMetricEntry {
  key: ImpactMetricKey;
  value: number;
  customLabel?: string; // Only used when key === 'custom'
}

const metricLabels: Record<ImpactMetricKey, string> = {
  meals_served: 'Meals Served',
  pads_distributed: 'Pads Distributed',
  students_enrolled: 'Students Enrolled',
  trees_planted: 'Trees Planted',
  schools_renovated: 'Schools Renovated',
  custom: 'Custom Metric',
};

export const PREDEFINED_METRIC_KEYS: ImpactMetricKey[] = [
  'meals_served',
  'pads_distributed',
  'students_enrolled',
  'trees_planted',
  'schools_renovated',
];

export const IMPACT_METRIC_KEYS: ImpactMetricKey[] = [...PREDEFINED_METRIC_KEYS, 'custom'];
export const IMPACT_METRIC_LABELS = metricLabels;

export const getMetricLabel = (metric: ImpactMetricEntry): string => {
  if (metric.key === 'custom' && metric.customLabel) {
    return metric.customLabel;
  }
  return metricLabels[metric.key];
};

export const createImpactMetricsRecord = (initialValue = 0): Record<ImpactMetricKey, number> =>
  IMPACT_METRIC_KEYS.reduce((acc, key) => {
    acc[key] = initialValue;
    return acc;
  }, {} as Record<ImpactMetricKey, number>);

export const impactMetricsArrayToRecord = (
  metrics?: ImpactMetricEntry[]
): Record<ImpactMetricKey, number> => {
  const record = createImpactMetricsRecord();
  metrics?.forEach((metric) => {
    record[metric.key] = Math.max(0, Number(metric.value) || 0);
  });
  return record;
};

export const buildImpactMetricsPayload = (
  metrics: Record<ImpactMetricKey, number>
): ImpactMetricEntry[] =>
  IMPACT_METRIC_KEYS.map((key) => ({
    key,
    value: Math.max(0, Number(metrics[key]) || 0),
  }));

export const getImpactMetricValue = (
  metrics: ImpactMetricEntry[] | undefined,
  key: ImpactMetricKey
): number => metrics?.find((metric) => metric.key === key)?.value ?? 0;

export const sumImpactMetricValue = (
  projects: { impact_metrics?: ImpactMetricEntry[] }[],
  key: ImpactMetricKey
): number => projects.reduce((sum, project) => sum + getImpactMetricValue(project.impact_metrics, key), 0);

export const hasImpactMetrics = (metrics?: ImpactMetricEntry[]): boolean =>
  (metrics ?? []).some((metric) => (metric.value || 0) > 0);
