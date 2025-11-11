import { useFilter } from '../context/FilterContext';
import { dashboardCards, projects, csrPartners } from '../mockData';

export const useFilteredData = () => {
  const { selectedPartner, selectedProject } = useFilter();

  // Filter dashboard cards based on selected filters
  const getFilteredCards = () => {
    let filtered = dashboardCards;

    if (selectedProject) {
      // Show only cards for selected project
      filtered = dashboardCards.filter((card) => card.projectId === selectedProject);
    } else if (selectedPartner) {
      // Show cards for all projects under selected partner
      const partnerProjects = projects.filter((p) => p.partnerId === selectedPartner);
      const partnerProjectIds = partnerProjects.map((p) => p.id);
      filtered = dashboardCards.filter((card) => partnerProjectIds.includes(card.projectId));
    }
    // else: show all cards (Overall view)

    return filtered;
  };

  // Get current filter mode
  const getFilterMode = () => {
    if (selectedProject) {
      const project = projects.find((p) => p.id === selectedProject);
      return {
        mode: 'project',
        label: `Project: ${project?.name}`,
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

  // Aggregate metrics from filtered cards
  const getAggregatedMetrics = () => {
    const filtered = getFilteredCards();
    
    const beneficiaries = filtered
      .filter((c) => c.type === 'beneficiaries')
      .reduce((sum, c) => ({ current: sum.current + c.current, target: sum.target + c.target }), { current: 0, target: 0 });

    const events = filtered
      .filter((c) => c.type === 'events')
      .reduce((sum, c) => ({ current: sum.current + c.current, target: sum.target + c.target }), { current: 0, target: 0 });

    const donations = filtered
      .filter((c) => c.type === 'donations')
      .reduce((sum, c) => ({ current: sum.current + c.current, target: sum.target + c.target }), { current: 0, target: 0 });

    const volunteers = filtered
      .filter((c) => c.type === 'volunteers')
      .reduce((sum, c) => ({ current: sum.current + c.current, target: sum.target + c.target }), { current: 0, target: 0 });

    return {
      beneficiaries,
      events,
      donations,
      volunteers,
      totalCards: filtered.length,
    };
  };

  return {
    filteredCards: getFilteredCards(),
    filterMode: getFilterMode(),
    aggregatedMetrics: getAggregatedMetrics(),
    hasFilters: !!(selectedPartner || selectedProject),
  };
};
