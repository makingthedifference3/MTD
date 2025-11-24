import { supabase } from './supabaseClient';

/**
 * Analytics Service
 * Provides comprehensive analysis and reporting data for AnalysisReport component
 * Data sources: projects, budget_allocation, project_expenses, csr_partners
 */

export interface ProjectAnalytic {
  project: string;
  budget: number;
  spent: number;
  completion: number;
}

export interface MonthlyTrend {
  month: string;
  projects: number;
  budget: number;
  expenses: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export interface FunnelStage {
  stage: string;
  value: number;
  color: string;
}

export interface ChartDataPoint {
  name?: string;
  item?: string;
  value?: number;
  series1?: number;
  series2?: number;
  series3?: number;
  month?: string;
  projects?: number;
  budget?: number;
  expenses?: number;
  color?: string;
  [key: string]: string | number | undefined;
}

// Get project performance data
export async function getProjectPerformanceData(): Promise<ProjectAnalytic[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        total_budget,
        utilized_budget,
        completion_percentage
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching project performance:', error);
      return [];
    }

    return (data as Array<{name: string; total_budget?: number; utilized_budget?: number; completion_percentage?: number}> || []).map((project) => ({
      project: project.name,
      budget: project.total_budget || 0,
      spent: project.utilized_budget || 0,
      completion: project.completion_percentage || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch project performance data:', error);
    return [];
  }
}

// Get category distribution (from projects with category)
export async function getCategoryDistributionData(): Promise<CategoryDistribution[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('category, total_budget')
      .eq('is_active', true)
      .not('category', 'is', null);

    if (error) {
      console.error('Error fetching category distribution:', error);
      return [];
    }

    // Group by category and sum budgets
    const categoryMap: Record<string, number> = {};
    (data as Array<{category?: string; total_budget?: number}> || []).forEach((project) => {
      const category = project.category || 'Other';
      categoryMap[category] = (categoryMap[category] || 0) + (project.total_budget || 0);
    });

    const total = Object.values(categoryMap).reduce((a, b) => a + b, 0);
    const colors = ['#10b981', '#60a5fa', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

    return Object.entries(categoryMap).map(([name, value], index) => ({
      name,
      value: Math.round((value / total) * 100) || 0,
      color: colors[index % colors.length],
    }));
  } catch (error) {
    console.error('Failed to fetch category distribution data:', error);
    return [];
  }
}

// Get monthly trends data
export async function getMonthlyTrendsData(): Promise<MonthlyTrend[]> {
  try {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('created_at, total_budget, utilized_budget')
      .eq('is_active', true);

    if (projectsError) {
      console.error('Error fetching monthly trends:', projectsError);
      return [];
    }

    // Group by month
    const monthlyMap: Record<string, { budget: number; expenses: number; count: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    (projects as Array<{created_at?: string; total_budget?: number; utilized_budget?: number}> || []).forEach((project) => {
      const date = new Date(project.created_at || new Date());
      const monthKey = monthNames[date.getMonth()];

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { budget: 0, expenses: 0, count: 0 };
      }

      monthlyMap[monthKey].budget += project.total_budget || 0;
      monthlyMap[monthKey].expenses += project.utilized_budget || 0;
      monthlyMap[monthKey].count += 1;
    });

    return monthNames
      .filter((month) => monthlyMap[month])
      .map((month) => ({
        month,
        projects: monthlyMap[month].count,
        budget: Math.round(monthlyMap[month].budget),
        expenses: Math.round(monthlyMap[month].expenses),
      }));
  } catch (error) {
    console.error('Failed to fetch monthly trends data:', error);
    return [];
  }
}

// Get key metrics
export async function getKeyMetrics(): Promise<{
  totalProjects: number;
  totalBudget: number;
  avgCompletion: number;
}> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, total_budget, completion_percentage')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching key metrics:', error);
      return { totalProjects: 0, totalBudget: 0, avgCompletion: 0 };
    }

    const projects = data as Array<{id: string; total_budget?: number; completion_percentage?: number}> || [];
    const totalProjects = projects.length;
    const totalBudget = projects.reduce((sum: number, p) => sum + (p.total_budget || 0), 0);
    const avgCompletion =
      totalProjects > 0
        ? Math.round(projects.reduce((sum: number, p) => sum + (p.completion_percentage || 0), 0) / totalProjects)
        : 0;

    return {
      totalProjects,
      totalBudget,
      avgCompletion,
    };
  } catch (error) {
    console.error('Failed to fetch key metrics:', error);
    return { totalProjects: 0, totalBudget: 0, avgCompletion: 0 };
  }
}

// Get funding funnel data (stages of project completion)
export async function getFunnelData(): Promise<FunnelStage[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('status')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching funnel data:', error);
      return [];
    }

    const statuses = ['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived'];
    const colors = ['#10b981', '#34d399', '#60a5fa', '#f59e0b', '#ef4444', '#dc2626'];
    const statusMap: Record<string, number> = {};

    (data as Array<{status?: string}> || []).forEach((project) => {
      const status = project.status || 'planning';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    const total = Object.values(statusMap).reduce((a, b) => a + b, 0);
    let cumulativePercent = 100;

    return statuses.map((status, index) => {
      const count = statusMap[status] || 0;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      const value = cumulativePercent;
      cumulativePercent = Math.max(0, cumulativePercent - percent);

      return {
        stage: status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.slice(1),
        value,
        color: colors[index],
      };
    });
  } catch (error) {
    console.error('Failed to fetch funnel data:', error);
    return [];
  }
}

// Get item analysis data (project count by category)
export async function getItemAnalysisData(): Promise<ChartDataPoint[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('category')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching item analysis:', error);
      return [];
    }

    const categoryCount: Record<string, number> = {};
    (data as Array<{category?: string}> || []).forEach((project) => {
      const category = project.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .slice(0, 4);
  } catch (error) {
    console.error('Failed to fetch item analysis data:', error);
    return [];
  }
}

// Get distribution data (budget allocation pie chart)
export async function getDistributionData(): Promise<ChartDataPoint[]> {
  try {
    const { data, error } = await supabase
      .from('budget_allocation')
      .select('allocated_amount, category')
      .order('allocated_amount', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching distribution data:', error);
      return [];
    }

    const total = (data as Array<{allocated_amount?: number; category?: string}> || []).reduce((sum: number, item) => sum + (item.allocated_amount || 0), 0);
    const colors = ['#10b981', '#60a5fa', '#f59e0b'];

    return (data as Array<{allocated_amount?: number; category?: string}> || []).map((item, index: number) => ({
      name: item.category || `Item ${index + 1}`,
      value: total > 0 ? Math.round((item.allocated_amount! / total) * 100 * 10) / 10 : 0,
      color: colors[index],
    }));
  } catch (error) {
    console.error('Failed to fetch distribution data:', error);
    return [];
  }
}

// Get multi-series trends (project metrics over time)
export async function getMultiSeriesTrendsData(): Promise<ChartDataPoint[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('created_at, total_budget, direct_beneficiaries, indirect_beneficiaries')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Error fetching multi-series trends:', error);
      return [];
    }

    return (data as Array<{total_budget?: number; direct_beneficiaries?: number; indirect_beneficiaries?: number}> || []).map((project, index: number) => ({
      item: `Item ${index + 1}`,
      series1: Math.round((project.total_budget || 0) / 100000),
      series2: project.direct_beneficiaries || 0,
      series3: project.indirect_beneficiaries || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch multi-series trends data:', error);
    return [];
  }
}

// Get all analytics data at once
export async function getAllAnalyticsData(): Promise<{
  projectPerformance: ProjectAnalytic[];
  categoryDistribution: CategoryDistribution[];
  monthlyTrends: MonthlyTrend[];
  keyMetrics: {
    totalProjects: number;
    totalBudget: number;
    avgCompletion: number;
  };
  funnelData: FunnelStage[];
  itemAnalysis: ChartDataPoint[];
  distributionData: ChartDataPoint[];
  multiSeriesTrends: ChartDataPoint[];
}> {
  try {
    const [projectPerformance, categoryDistribution, monthlyTrends, keyMetrics, funnelData, itemAnalysis, distributionData, multiSeriesTrends] = await Promise.all([
      getProjectPerformanceData(),
      getCategoryDistributionData(),
      getMonthlyTrendsData(),
      getKeyMetrics(),
      getFunnelData(),
      getItemAnalysisData(),
      getDistributionData(),
      getMultiSeriesTrendsData(),
    ]);

    return {
      projectPerformance,
      categoryDistribution,
      monthlyTrends,
      keyMetrics,
      funnelData,
      itemAnalysis,
      distributionData,
      multiSeriesTrends,
    };
  } catch (error) {
    console.error('Failed to fetch all analytics data:', error);
    return {
      projectPerformance: [],
      categoryDistribution: [],
      monthlyTrends: [],
      keyMetrics: { totalProjects: 0, totalBudget: 0, avgCompletion: 0 },
      funnelData: [],
      itemAnalysis: [],
      distributionData: [],
      multiSeriesTrends: [],
    };
  }
}
