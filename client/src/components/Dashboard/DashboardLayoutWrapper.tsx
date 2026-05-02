import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useLayout } from '@/contexts/LayoutContext';
import { CardType, CardSize } from '@/types/layout';
import DraggableCard from './DraggableCard';
import MetricCard from './MetricCard';
import NetCashflowsChart from './CapitalCallsChart';
import DistributionsChart from './DistributionsChart';
import NetCashflowChart from './NetCashflowChart';
import NavBreakdownChart from './NavBreakdownChart';
import PerformanceTable from './PerformanceTable';
import FundNetCashflowsTable from './FundCapitalCallsTable';

interface DashboardLayoutWrapperProps {
  portfolioMetrics?: {
    totalCommitted: number;
    totalPaidIn: number;
    tvpi: number;
    activeInvestments: number;
  };
}

export default function DashboardLayoutWrapper({ portfolioMetrics }: DashboardLayoutWrapperProps) {
  const { layout, updateCardOrder, isEditing } = useLayout();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = layout.cards.findIndex(card => card.id === active.id);
      const newIndex = layout.cards.findIndex(card => card.id === over?.id);
      
      const newOrder = arrayMove(layout.cards, oldIndex, newIndex);
      updateCardOrder(newOrder.map(card => card.id));
    }
  }

  const renderCard = (cardId: CardType, size: CardSize) => {
    switch (cardId) {
      case 'metric-total-committed':
        return (
          <MetricCard
            title="Total Committed"
            value={portfolioMetrics ? `$${(portfolioMetrics.totalCommitted / 1000000).toFixed(1)}M` : "-"}
            change="+12.3%"
            trend="up"
            variant="primary"
          />
        );
      case 'metric-total-paid-in':
        return (
          <MetricCard
            title="Total Paid-In"
            value={portfolioMetrics ? `$${portfolioMetrics.totalPaidIn.toFixed(1)}M` : "-"}
            change={portfolioMetrics?.totalPaidInChange || "+0.0%"}
            trend={
              portfolioMetrics?.totalPaidInChange?.startsWith('+') ? "up" : 
              portfolioMetrics?.totalPaidInChange?.startsWith('-') ? "down" : 
              "neutral"
            }
            variant="secondary"
          />
        );
      case 'metric-tvpi':
        return (
          <MetricCard
            title="Total Distributions"
            value={portfolioMetrics ? `$${portfolioMetrics.totalDistributions?.toFixed(1)}M` : "-"}
            change="-2.1%"
            trend="down"
            variant="warning"
          />
        );
      case 'metric-active-investments':
        return (
          <MetricCard
            title="Active Investments"
            value={portfolioMetrics ? portfolioMetrics.activeInvestments.toString() : "-"}
            change="+3 this quarter"
            trend="up"
            variant="default"
          />
        );
      case 'net-cashflows-chart':
        return <NetCashflowsChart />;
      case 'distributions-chart':
        return <DistributionsChart />;
      case 'fund-net-cashflows-table':
        return <FundNetCashflowsTable />;
      case 'net-cashflow-chart':
        return <NetCashflowChart />;
      case 'nav-breakdown-chart':
        return <NavBreakdownChart />;
      case 'performance-table':
        return <PerformanceTable />;
      default:
        return <div>Unknown card type: {cardId}</div>;
    }
  };

  // Sort cards by order
  const sortedCards = [...layout.cards].sort((a, b) => a.order - b.order);
  const cardIds = sortedCards.map(card => card.id);

  return (
    <div className="h-full p-6 overflow-y-auto" style={{ backgroundColor: '#F5F5F5' }}>
      {isEditing && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed border-primary/30">
          <p className="text-sm text-muted-foreground">
            🎯 <strong>Edit Mode:</strong> Drag cards to reorder them or use the controls to change their size.
          </p>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-min">
            {sortedCards.map((card) => (
              <DraggableCard
                key={card.id}
                id={card.id}
                size={card.size}
                data-testid={`dashboard-card-${card.id}`}
              >
                {renderCard(card.id, card.size)}
              </DraggableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}