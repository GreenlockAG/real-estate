export interface Module {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: string;
  enabled: boolean;
  order: number;
  features?: string[];
  apiPrefix?: string;
  status?: 'active' | 'planned' | 'deprecated';
  plannedPhase?: number;
}

export interface ModuleRegistry {
  version: string;
  modules: Module[];
  metadata?: {
    lastUpdated: string;
    currentPhase: number;
    activeModules: number;
    totalModules: number;
  };
}
