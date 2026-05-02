import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { DashboardLayout, LayoutContextType, DEFAULT_LAYOUT, LAYOUT_STORAGE_KEY, CardType, CardSize } from '@/types/layout';

const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

interface LayoutProviderProps {
  children: React.ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT);
  const [isEditing, setIsEditing] = useState(false);

  // Load layout from localStorage on mount
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout) {
        const parsedLayout = JSON.parse(savedLayout) as DashboardLayout;
        // Validate the layout structure and merge with defaults if needed
        const validatedLayout = validateAndMergeLayout(parsedLayout);
        setLayout(validatedLayout);
      }
    } catch (error) {
      console.warn('Failed to load dashboard layout from localStorage:', error);
      setLayout(DEFAULT_LAYOUT);
    }
  }, []);

  // Save layout to localStorage whenever it changes
  const saveLayout = useCallback((newLayout: DashboardLayout) => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayout));
    } catch (error) {
      console.warn('Failed to save dashboard layout to localStorage:', error);
    }
  }, []);

  const updateCardSize = useCallback((cardId: CardType, size: CardSize) => {
    setLayout(prevLayout => {
      const newLayout = {
        ...prevLayout,
        cards: prevLayout.cards.map(card =>
          card.id === cardId ? { ...card, size } : card
        ),
        lastUpdated: Date.now(),
      };
      saveLayout(newLayout);
      return newLayout;
    });
  }, [saveLayout]);

  const updateCardOrder = useCallback((cardOrder: CardType[]) => {
    setLayout(prevLayout => {
      const cardMap = new Map(prevLayout.cards.map(card => [card.id, card]));
      const newCards = cardOrder.map((cardId, index) => ({
        ...cardMap.get(cardId)!,
        order: index,
      }));

      const newLayout = {
        ...prevLayout,
        cards: newCards,
        lastUpdated: Date.now(),
      };
      saveLayout(newLayout);
      return newLayout;
    });
  }, [saveLayout]);

  const resetLayout = useCallback(() => {
    const newLayout = {
      ...DEFAULT_LAYOUT,
      lastUpdated: Date.now(),
    };
    setLayout(newLayout);
    saveLayout(newLayout);
  }, [saveLayout]);

  const contextValue: LayoutContextType = {
    layout,
    updateCardSize,
    updateCardOrder,
    resetLayout,
    isEditing,
    setIsEditing,
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
}

// Helper function to validate and merge saved layout with defaults
function validateAndMergeLayout(savedLayout: DashboardLayout): DashboardLayout {
  const defaultCardMap = new Map(DEFAULT_LAYOUT.cards.map(card => [card.id, card]));
  const savedCardMap = new Map(savedLayout.cards?.map(card => [card.id, card]) || []);

  // Merge saved cards with defaults, ensuring all default cards are present
  const mergedCards = DEFAULT_LAYOUT.cards.map(defaultCard => {
    const savedCard = savedCardMap.get(defaultCard.id);
    return savedCard ? { ...defaultCard, ...savedCard } : defaultCard;
  });

  // Sort by order
  mergedCards.sort((a, b) => a.order - b.order);

  return {
    cards: mergedCards,
    gridColumns: savedLayout.gridColumns || DEFAULT_LAYOUT.gridColumns,
    lastUpdated: savedLayout.lastUpdated || Date.now(),
  };
}