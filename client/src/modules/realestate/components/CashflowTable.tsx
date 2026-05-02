import { useState, useMemo, Fragment } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  GripVertical,
} from 'lucide-react';
import type { CashflowEntry, CashflowCategory, PLCategoryType } from '../data/types';

const COLORS = {
  garnish: '#18975A',
  blue: '#4DBFD8',
  neutral: '#BBC9C5',
  incomeLight: 'rgba(24, 151, 90, 0.08)',
  expenseLight: 'rgba(77, 191, 216, 0.08)',
};

const categoryColors: Record<CashflowCategory, string> = {
  Rental: '#18975A',
  Maintenance: '#4DBFD8',
  Taxes: '#F59E0B',
  Insurance: '#8B5CF6',
  Utilities: '#EC4899',
  Management: '#6366F1',
  Renovation: '#14B8A6',
};

const bankColors: Record<string, string> = {
  'Emirates NBD': '#18975A',
  'HSBC UAE': '#4DBFD8',
  'Mashreq Bank': '#8B5CF6',
  'FAB': '#14B8A6',
};

type SortDirection = 'asc' | 'desc' | null;
type ColumnId = 'date' | 'plCategory' | 'category' | 'subcategory' | 'payee' | 'description' | 'amount' | 'currency' | 'fxRate' | 'bank' | 'quarter' | 'balance' | 'links';

interface ColumnDef {
  id: ColumnId;
  label: string;
  width: string;
  sortable: boolean;
  filterable: boolean;
}

const defaultColumns: ColumnDef[] = [
  { id: 'date', label: 'Date', width: '100px', sortable: true, filterable: false },
  { id: 'plCategory', label: 'P&L', width: '80px', sortable: true, filterable: true },
  { id: 'category', label: 'Category', width: '110px', sortable: true, filterable: true },
  { id: 'subcategory', label: 'Subcategory', width: '130px', sortable: true, filterable: true },
  { id: 'payee', label: 'Payee', width: '160px', sortable: true, filterable: false },
  { id: 'description', label: 'Description', width: '200px', sortable: false, filterable: false },
  { id: 'amount', label: 'Amount', width: '100px', sortable: true, filterable: false },
  { id: 'currency', label: 'Curr', width: '60px', sortable: true, filterable: true },
  { id: 'fxRate', label: 'FX Rate', width: '80px', sortable: true, filterable: false },
  { id: 'bank', label: 'Bank', width: '120px', sortable: true, filterable: true },
  { id: 'quarter', label: 'Quarter', width: '90px', sortable: true, filterable: true },
  { id: 'balance', label: 'Balance', width: '100px', sortable: false, filterable: false },
  { id: 'links', label: 'Links', width: '70px', sortable: false, filterable: false },
];

interface CashflowTableProps {
  data: CashflowEntry[];
  propertyName: string;
}

export function CashflowTable({ data, propertyName }: CashflowTableProps) {
  const [columns, setColumns] = useState<ColumnDef[]>(defaultColumns);
  const [sortColumn, setSortColumn] = useState<ColumnId | null>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(new Set(['Q1-2025', 'Q2-2025', 'Q3-2025', 'Q4-2025']));
  const [draggedColumn, setDraggedColumn] = useState<ColumnId | null>(null);

  const [plCategoryFilter, setPlCategoryFilter] = useState<Set<PLCategoryType>>(() => new Set(['Income', 'Expense'] as PLCategoryType[]));
  const [categoryFilter, setCategoryFilter] = useState<Set<CashflowCategory>>(() => new Set(['Rental', 'Maintenance', 'Taxes', 'Insurance', 'Utilities', 'Management', 'Renovation'] as CashflowCategory[]));
  const [quarterFilter, setQuarterFilter] = useState<Set<string>>(() => new Set(['Q1-2025', 'Q2-2025', 'Q3-2025', 'Q4-2025']));
  const [bankFilter, setBankFilter] = useState<Set<string>>(() => new Set());

  const allBanks = useMemo(() => Array.from(new Set(data.map(d => d.bank))), [data]);
  const allSubcategories = useMemo(() => Array.from(new Set(data.map(d => d.subcategory))), [data]);
  const [subcategoryFilter, setSubcategoryFilter] = useState<Set<string>>(() => new Set());

  const filteredData = useMemo(() => {
    return data.filter(entry => {
      if (!plCategoryFilter.has(entry.plCategory)) return false;
      if (!categoryFilter.has(entry.category)) return false;
      if (!quarterFilter.has(entry.quarter)) return false;
      if (bankFilter.size > 0 && !bankFilter.has(entry.bank)) return false;
      if (subcategoryFilter.size > 0 && !subcategoryFilter.has(entry.subcategory)) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          entry.payee.toLowerCase().includes(query) ||
          entry.description.toLowerCase().includes(query) ||
          entry.category.toLowerCase().includes(query) ||
          entry.subcategory.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [data, plCategoryFilter, categoryFilter, quarterFilter, bankFilter, subcategoryFilter, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortColumn) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'amount':
          aVal = a.amount;
          bVal = b.amount;
          break;
        case 'fxRate':
          aVal = a.fxRate;
          bVal = b.fxRate;
          break;
        default:
          aVal = String(a[sortColumn as keyof CashflowEntry] || '');
          bVal = String(b[sortColumn as keyof CashflowEntry] || '');
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const groupedData = useMemo(() => {
    const groups: Record<string, { entries: CashflowEntry[]; runningBalances: number[] }> = {};
    let runningBalance = 0;

    sortedData.forEach(entry => {
      if (!groups[entry.quarter]) {
        groups[entry.quarter] = { entries: [], runningBalances: [] };
      }
      runningBalance += entry.amount;
      groups[entry.quarter].entries.push(entry);
      groups[entry.quarter].runningBalances.push(runningBalance);
    });

    return groups;
  }, [sortedData]);

  const handleSort = (columnId: ColumnId) => {
    if (sortColumn === columnId) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const toggleQuarter = (quarter: string) => {
    const newExpanded = new Set(expandedQuarters);
    if (newExpanded.has(quarter)) {
      newExpanded.delete(quarter);
    } else {
      newExpanded.add(quarter);
    }
    setExpandedQuarters(newExpanded);
  };

  const handleDragStart = (columnId: ColumnId) => {
    setDraggedColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent, targetColumnId: ColumnId) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetColumnId) return;

    const newColumns = [...columns];
    const draggedIndex = newColumns.findIndex(c => c.id === draggedColumn);
    const targetIndex = newColumns.findIndex(c => c.id === targetColumnId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, removed);
      setColumns(newColumns);
    }
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  const exportToCSV = () => {
    const headers = columns.filter(c => c.id !== 'links' && c.id !== 'balance').map(c => c.label);
    const rows = sortedData.map(entry => [
      entry.date,
      entry.plCategory,
      entry.category,
      entry.subcategory,
      entry.payee,
      entry.description,
      entry.amount,
      entry.currency,
      entry.fxRate,
      entry.bank,
      entry.quarter,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${propertyName.replace(/\s+/g, '_')}_cashflows.csv`;
    link.click();
  };

  const exportToExcel = () => {
    exportToCSV();
  };

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString();
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const renderCell = (entry: CashflowEntry, columnId: ColumnId, balance: number) => {
    switch (columnId) {
      case 'date':
        return <span className="text-sm whitespace-nowrap">{entry.date}</span>;
      case 'plCategory':
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: entry.plCategory === 'Income' ? COLORS.garnish : COLORS.blue }}
          >
            {entry.plCategory}
          </span>
        );
      case 'category':
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: categoryColors[entry.category] }}
          >
            {entry.category}
          </span>
        );
      case 'subcategory':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {entry.subcategory}
          </span>
        );
      case 'payee':
        return <span className="text-sm truncate block max-w-[150px] whitespace-nowrap">{entry.payee}</span>;
      case 'description':
        return <span className="text-sm text-gray-600 truncate block max-w-[190px] whitespace-nowrap">{entry.description}</span>;
      case 'amount':
        return (
          <span className={`text-sm font-medium whitespace-nowrap ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatAmount(entry.amount)} {entry.currency}
          </span>
        );
      case 'currency':
        return <span className="text-sm whitespace-nowrap">{entry.currency}</span>;
      case 'fxRate':
        return <span className="text-sm text-gray-600 whitespace-nowrap">{entry.fxRate.toFixed(4)}</span>;
      case 'bank':
        return (
          <span
            className="px-2 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
            style={{ backgroundColor: bankColors[entry.bank] || COLORS.neutral }}
          >
            {entry.bank}
          </span>
        );
      case 'quarter':
        return <span className="text-sm font-medium whitespace-nowrap">{entry.quarter}</span>;
      case 'balance':
        return (
          <span className={`text-sm font-medium whitespace-nowrap ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatAmount(balance)}
          </span>
        );
      case 'links':
        return (
          <div className="flex gap-1">
            {entry.invoiceLink && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href={entry.invoiceLink} className="text-blue-500 hover:text-blue-700">
                      <FileText className="w-4 h-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Invoice</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {entry.receiptLink && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href={entry.receiptLink} className="text-green-500 hover:text-green-700">
                      <FileSpreadsheet className="w-4 h-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Receipt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderFilterDropdown = (column: ColumnDef) => {
    if (!column.filterable) return null;

    let options: string[] = [];
    let currentFilter: Set<string> = new Set();
    let setFilter: (filter: Set<string>) => void = () => {};

    switch (column.id) {
      case 'plCategory':
        options = ['Income', 'Expense'];
        currentFilter = plCategoryFilter as Set<string>;
        setFilter = (f) => setPlCategoryFilter(f as Set<PLCategoryType>);
        break;
      case 'category':
        options = ['Rental', 'Maintenance', 'Taxes', 'Insurance', 'Utilities', 'Management', 'Renovation'];
        currentFilter = categoryFilter as Set<string>;
        setFilter = (f) => setCategoryFilter(f as Set<CashflowCategory>);
        break;
      case 'quarter':
        options = ['Q1-2025', 'Q2-2025', 'Q3-2025', 'Q4-2025'];
        currentFilter = quarterFilter;
        setFilter = setQuarterFilter;
        break;
      case 'bank':
        options = allBanks;
        currentFilter = bankFilter.size > 0 ? bankFilter : new Set(allBanks);
        setFilter = setBankFilter;
        break;
      case 'subcategory':
        options = allSubcategories;
        currentFilter = subcategoryFilter.size > 0 ? subcategoryFilter : new Set(allSubcategories);
        setFilter = setSubcategoryFilter;
        break;
      default:
        return null;
    }

    const isFiltered = currentFilter.size < options.length;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`h-5 w-5 p-0 ${isFiltered ? 'text-blue-500' : ''}`}>
            <Filter className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto">
          {options.map(option => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={currentFilter.has(option)}
              onCheckedChange={(checked) => {
                const newFilter = new Set(currentFilter);
                if (checked) {
                  newFilter.add(option);
                } else {
                  newFilter.delete(option);
                }
                setFilter(newFilter);
              }}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const quarters = ['Q1-2025', 'Q2-2025', 'Q3-2025', 'Q4-2025'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search all columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: COLORS.neutral }}>
                <TableHead className="w-10"></TableHead>
                {columns.map(column => (
                  <TableHead
                    key={column.id}
                    className="cursor-move select-none"
                    style={{ width: column.width, minWidth: column.width }}
                    draggable
                    onDragStart={() => handleDragStart(column.id)}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-3 w-3 text-gray-400 opacity-50" />
                      <span className="font-semibold text-gray-700">{column.label}</span>
                      {column.sortable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => handleSort(column.id)}
                        >
                          {sortColumn === column.id ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                          )}
                        </Button>
                      )}
                      {renderFilterDropdown(column)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {quarters.map(quarter => {
                const quarterData = groupedData[quarter];
                if (!quarterData || quarterData.entries.length === 0) return null;

                const isExpanded = expandedQuarters.has(quarter);
                const quarterTotal = quarterData.entries.reduce((sum, e) => sum + e.amount, 0);

                return (
                  <Fragment key={quarter}>
                    <TableRow
                      className="cursor-pointer hover:bg-gray-50 bg-gray-100"
                      onClick={() => toggleQuarter(quarter)}
                    >
                      <TableCell className="w-10">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell colSpan={columns.length} className="font-semibold">
                        <div className="flex items-center justify-between">
                          <span>{quarter} ({quarterData.entries.length} transactions)</span>
                          <span className={quarterTotal >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatAmount(quarterTotal)} AED
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && quarterData.entries.map((entry, idx) => (
                      <TableRow
                        key={entry.id}
                        style={{
                          backgroundColor: entry.plCategory === 'Income' ? COLORS.incomeLight : COLORS.expenseLight,
                        }}
                        className="hover:opacity-80"
                      >
                        <TableCell className="w-10"></TableCell>
                        {columns.map(column => (
                          <TableCell key={column.id} style={{ width: column.width }}>
                            {renderCell(entry, column.id, quarterData.runningBalances[idx])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Showing {sortedData.length} of {data.length} transactions
      </div>
    </div>
  );
}
