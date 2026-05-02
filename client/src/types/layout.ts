export type CardSize = 'quarter' | 'third' | 'half' | 'full';

export type CardType = 
  | 'metric-total-committed'
  | 'metric-total-paid-in'
  | 'metric-tvpi'
  | 'metric-active-investments'
  | 'net-cashflows-chart'
  | 'distributions-chart'
  | 'net-cashflow-chart'
  | 'nav-breakdown-chart'
  | 'performance-table'
  | 'fund-net-cashflows-table';

export interface CardLayoutConfig {
  id: CardType;
  size: CardSize;
  order: number;
}

export interface DashboardLayout {
  cards: CardLayoutConfig[];
  gridColumns: number;
  lastUpdated: number;
}

export interface LayoutContextType {
  layout: DashboardLayout;
  updateCardSize: (cardId: CardType, size: CardSize) => void;
  updateCardOrder: (cardOrder: CardType[]) => void;
  resetLayout: () => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

// Default layout configuration
export const DEFAULT_LAYOUT: DashboardLayout = {
  cards: [
    { id: 'metric-total-committed', size: 'half', order: 0 },
    { id: 'metric-total-paid-in', size: 'half', order: 1 },
    { id: 'metric-tvpi', size: 'half', order: 2 },
    { id: 'metric-active-investments', size: 'half', order: 3 },
    { id: 'fund-net-cashflows-table', size: 'full', order: 4 },
    { id: 'net-cashflows-chart', size: 'half', order: 5 },
    { id: 'distributions-chart', size: 'half', order: 6 },
    { id: 'net-cashflow-chart', size: 'half', order: 7 },
    { id: 'nav-breakdown-chart', size: 'half', order: 8 },
    { id: 'performance-table', size: 'full', order: 9 },
  ],
  gridColumns: 4,
  lastUpdated: Date.now(),
};

export const LAYOUT_STORAGE_KEY = 'dashboard-layout';