import { useEffect, useState } from 'react';
import { useFilter } from '../context/useFilter';
import {
  getAllDashboardMetrics,
  getMetricsByProjectId,
  getMetricsByPartner,
  type DashboardMetric,
} from '../services/dashboardMetricsService';
import type { Project } from '../services/filterService';

export const useFilteredData = () => {
  const { selectedPartner, selectedProject, csrPartners, filteredProjects, isLoading: filterLoading } = useFilter();
  const [selectedProjectData, setSelectedProjectData] = useState<Project | null>(null);
  const [dashboardCards, setDashboardCards] = useState<DashboardMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard metrics based on filters
  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let metrics: DashboardMetric[] = [];

        if (selectedProject) {
          // Fetch metrics for selected project
          metrics = await getMetricsByProjectId(selectedProject);
        } else if (selectedPartner) {
          // Fetch metrics for selected partner (all projects under partner)
          metrics = await getMetricsByPartner(selectedPartner);
        } else {
          // Fetch all metrics
          metrics = await getAllDashboardMetrics();
        }

        setDashboardCards(metrics);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [selectedProject, selectedPartner]);

  // Update selected project data when selectedProject changes
  useEffect(() => {
    if (selectedProject && filteredProjects.length > 0) {
      const project = filteredProjects.find((p) => p.id === selectedProject);
      setSelectedProjectData(project || null);
    } else {
      setSelectedProjectData(null);
    }
  }, [selectedProject, filteredProjects]);

  // Get current filter mode
  const getFilterMode = () => {
    if (selectedProject && selectedProjectData) {
      return {
        mode: 'project',
        label: `Project: ${selectedProjectData.name}`,
      };
    } else if (selectedPartner) {
      const partner = csrPartners.find((cp) => cp.id === selectedPartner);
      return {
        mode: 'partner',
        label: `Partner: ${partner?.name}`,
      };
    }
    return {
      mode: 'overall',
      label: 'Overall Summary (All Partners & Projects)',
    };
  };

  // Aggregate metrics from dashboard cards
  const getAggregatedMetrics = () => {
    const beneficiaries = dashboardCards
      .filter((c) => c.type === 'beneficiaries')
      .reduce((sum, c) => ({ current: sum.current + c.current, target: sum.target + c.target }), { current: 0, target: 0 });

    const events = dashboardCards
      .filter((c) => c.type === 'events')
      .reduce((sum, c) => ({ current: sum.current + c.current, target: sum.target + c.target }), { current: 0, target: 0 });

    const donations = dashboardCards
      .filter((c) => c.type === 'donations')
      .reduce((sum, c) => ({ current: sum.current + c.current, target: sum.target + c.target }), { current: 0, target: 0 });

    const volunteers = dashboardCards
      .filter((c) => c.type === 'volunteers')
      .reduce((sum, c) => ({ current: sum.current + c.current, target: sum.target + c.target }), { current: 0, target: 0 });

    return {
      beneficiaries,
      events,
      donations,
      volunteers,
      totalCards: dashboardCards.length,
    };
  };

  return {
    filteredCards: dashboardCards,
    filterMode: getFilterMode(),
    aggregatedMetrics: getAggregatedMetrics(),
    hasFilters: !!(selectedPartner || selectedProject),
    selectedProjectData,
    isLoading: filterLoading || isLoading,
    error,
  };
};
