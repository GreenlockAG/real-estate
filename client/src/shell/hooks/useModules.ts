import { useMemo } from 'react';
import moduleRegistryData from '../moduleRegistry.json';
import type { ModuleRegistry, Module } from '../types';

const moduleRegistry = moduleRegistryData as ModuleRegistry;

export function useModules() {
  const enabledModules = useMemo(
    () => moduleRegistry.modules.filter(module => module.enabled),
    []
  );

  const getModuleByRoute = (route: string): Module | undefined => {
    return moduleRegistry.modules.find(
      module => route.startsWith(module.route)
    );
  };

  const getModuleById = (id: string): Module | undefined => {
    return moduleRegistry.modules.find(module => module.id === id);
  };

  return {
    modules: moduleRegistry.modules,
    enabledModules,
    getModuleByRoute,
    getModuleById,
    metadata: moduleRegistry.metadata,
  };
}
