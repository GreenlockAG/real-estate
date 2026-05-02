import { apiRequest } from "./queryClient";
import type {
  PortfolioMetrics,
  FundPerformance,
  Investment,
  NetCashflow,
  DetailedNetCashflow,
  FundInfo,
  SyncStatus,
  TimeSeriesPoint,
  PieChartData,
  HealthStatus,
  ChatMessage
} from "../types/portfolio";

export const api = {
  // Health and sync
  async getHealth(): Promise<HealthStatus> {
    const res = await apiRequest("GET", "/api/healthz");
    return res.json();
  },

  async syncData(): Promise<{ success: boolean; message: string; timestamp: string }> {
    const res = await apiRequest("POST", "/api/sync");
    return res.json();
  },

  async getSyncStatus(): Promise<SyncStatus[]> {
    const res = await apiRequest("GET", "/api/sync/status");
    return res.json();
  },

  // Data endpoints
  async getInvestments(): Promise<Investment[]> {
    const res = await apiRequest("GET", "/api/investments");
    return res.json();
  },

  async getNetCashflows(): Promise<NetCashflow[]> {
    const res = await apiRequest("GET", "/api/net-cashflows");
    return res.json();
  },

  async getDetailedNetCashflows(): Promise<DetailedNetCashflow[]> {
    const res = await apiRequest("GET", "/api/detailed-net-cashflows");
    return res.json();
  },

  async getFunds(): Promise<FundInfo[]> {
    const res = await apiRequest("GET", "/api/funds");
    return res.json();
  },

  // Metrics endpoints
  async getPortfolioMetrics(): Promise<PortfolioMetrics> {
    const res = await apiRequest("GET", "/api/metrics/portfolio");
    return res.json();
  },

  async getFundPerformance(): Promise<FundPerformance[]> {
    const res = await apiRequest("GET", "/api/metrics/performance");
    return res.json();
  },

  async getNetCashflowsSeries(): Promise<TimeSeriesPoint[]> {
    const res = await apiRequest("GET", "/api/metrics/net-cashflows-series");
    return res.json();
  },

  async getDistributionsSeries(): Promise<TimeSeriesPoint[]> {
    const res = await apiRequest("GET", "/api/metrics/distributions-series");
    return res.json();
  },

  async getNavBreakdown(): Promise<PieChartData[]> {
    const res = await apiRequest("GET", "/api/metrics/nav-breakdown");
    return res.json();
  },

  // ChatGPT Advisor
  async askAdvisor(message: string, history?: ChatMessage[]): Promise<{ response: string; error?: string }> {
    const res = await apiRequest("POST", "/api/ask", { 
      message, 
      history: history?.map(msg => ({ role: msg.role, content: msg.content })) 
    });
    return res.json();
  },
};
