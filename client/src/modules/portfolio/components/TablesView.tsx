import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Filter, Search, ChevronUp, ChevronDown, Loader2, Columns, GripVertical } from "lucide-react";
import type { Investment } from "@/types/portfolio";

interface NetCashflow {
  id: string;
  airtableId: string;
  fundId: string;
  fundName: string | null;
  name: string | null;
  amount: string;
  cashflowDate: string;
  status: string | null;
  inOut: string | null;
  currency: string | null;
  year: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function TablesView() {
  const [selectedTable, setSelectedTable] = useState("net_cashflows");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<keyof NetCashflow | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    airtableId: true,
    fundName: true,
    name: true,
    amount: true,
    status: true,
    inOut: true,
    cashflowDate: true,
    createdAt: true,
    updatedAt: true,
    id: true
  });

  // Column order state
  const [columnOrder, setColumnOrder] = useState<(keyof typeof visibleColumns)[]>([
    'airtableId',
    'fundName', 
    'name',
    'amount',
    'status',
    'inOut',
    'cashflowDate',
    'createdAt',
    'updatedAt',
    'id'
  ]);
  
  // Drag state
  const [draggedColumn, setDraggedColumn] = useState<keyof typeof visibleColumns | null>(null);

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleColumnDragStart = (e: React.DragEvent, column: keyof typeof visibleColumns) => {
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', column);
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent, targetColumn: keyof typeof visibleColumns) => {
    e.preventDefault();
    
    if (!draggedColumn || draggedColumn === targetColumn) {
      setDraggedColumn(null);
      return;
    }

    const newColumnOrder = [...columnOrder];
    const draggedIndex = newColumnOrder.indexOf(draggedColumn);
    const targetIndex = newColumnOrder.indexOf(targetColumn);
    
    // Remove dragged column and insert at target position
    newColumnOrder.splice(draggedIndex, 1);
    newColumnOrder.splice(targetIndex, 0, draggedColumn);
    
    setColumnOrder(newColumnOrder);
    setDraggedColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  const { data: netCashflows, isLoading } = useQuery({
    queryKey: ["/api/net-cashflows"],
    queryFn: (): Promise<NetCashflow[]> =>
      fetch("/api/net-cashflows").then(res => res.json()),
    enabled: selectedTable === "net_cashflows",
  });

  // Filter and sort data
  const filteredData = netCashflows?.filter(cashflow => {
    const matchesSearch = !searchQuery || 
      cashflow.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cashflow.fundName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cashflow.airtableId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || 
      (statusFilter === 'positive' && Number(cashflow.amount) > 0) ||
      (statusFilter === 'negative' && Number(cashflow.amount) < 0);

    return matchesSearch && matchesStatus;
  }) || [];

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    let comparison = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (field: keyof NetCashflow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof NetCashflow) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return '-';
    const num = parseFloat(value);
    const absNum = Math.abs(num);
    const formatted = absNum >= 1000000 ? `${(absNum / 1000000).toFixed(1)}M` : absNum.toLocaleString();
    return num < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAmountColor = (amount: string) => {
    const num = parseFloat(amount);
    if (num > 0) return 'text-green-600';
    if (num < 0) return 'text-red-600';
    return 'text-foreground';
  };

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Data Tables</h3>
          <p className="text-sm text-muted-foreground">Explore and filter your portfolio data</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedTable} onValueChange={setSelectedTable} data-testid="select-table">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="net_cashflows">Net Cashflows</SelectItem>
              <SelectItem value="capital_calls">Capital Calls</SelectItem>
              <SelectItem value="distributions">Distributions</SelectItem>
              <SelectItem value="fund_info">Fund Information</SelectItem>
            </SelectContent>
          </Select>
          
          <Button size="sm" data-testid="button-filter">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" data-testid="button-columns">
                <Columns className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Toggle columns</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-airtableId"
                      checked={visibleColumns.airtableId}
                      onCheckedChange={() => toggleColumn('airtableId')}
                    />
                    <label htmlFor="col-airtableId" className="text-sm">Airtable ID</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-fundName"
                      checked={visibleColumns.fundName}
                      onCheckedChange={() => toggleColumn('fundName')}
                    />
                    <label htmlFor="col-fundName" className="text-sm">Fund Name</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-name"
                      checked={visibleColumns.name}
                      onCheckedChange={() => toggleColumn('name')}
                    />
                    <label htmlFor="col-name" className="text-sm">Cashflow Name</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-amount"
                      checked={visibleColumns.amount}
                      onCheckedChange={() => toggleColumn('amount')}
                    />
                    <label htmlFor="col-amount" className="text-sm">Amount</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-status"
                      checked={visibleColumns.status}
                      onCheckedChange={() => toggleColumn('status')}
                    />
                    <label htmlFor="col-status" className="text-sm">Status</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-inOut"
                      checked={visibleColumns.inOut}
                      onCheckedChange={() => toggleColumn('inOut')}
                    />
                    <label htmlFor="col-inOut" className="text-sm">In-Out</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-cashflowDate"
                      checked={visibleColumns.cashflowDate}
                      onCheckedChange={() => toggleColumn('cashflowDate')}
                    />
                    <label htmlFor="col-cashflowDate" className="text-sm">Date</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-createdAt"
                      checked={visibleColumns.createdAt}
                      onCheckedChange={() => toggleColumn('createdAt')}
                    />
                    <label htmlFor="col-createdAt" className="text-sm">Created</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-updatedAt"
                      checked={visibleColumns.updatedAt}
                      onCheckedChange={() => toggleColumn('updatedAt')}
                    />
                    <label htmlFor="col-updatedAt" className="text-sm">Last Modified</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="col-id"
                      checked={visibleColumns.id}
                      onCheckedChange={() => toggleColumn('id')}
                    />
                    <label htmlFor="col-id" className="text-sm">Internal ID</label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Data Table */}
      <Card className="viz-block h-full w-full">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading table data...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-net-cashflows">
                  <thead className="bg-muted">
                    <tr>
                      {columnOrder.map((column) => {
                        if (!visibleColumns[column]) return null;
                        
                        const getColumnConfig = () => {
                          switch (column) {
                            case 'airtableId':
                              return { label: 'Airtable ID', align: 'text-left', sortable: true };
                            case 'fundName':
                              return { label: 'Fund Name', align: 'text-left', sortable: true };
                            case 'name':
                              return { label: 'Cashflow Name', align: 'text-left', sortable: true };
                            case 'amount':
                              return { label: 'Amount', align: 'text-right', sortable: true };
                            case 'status':
                              return { label: 'Status', align: 'text-center', sortable: true };
                            case 'inOut':
                              return { label: 'In-Out', align: 'text-center', sortable: true };
                            case 'cashflowDate':
                              return { label: 'Date', align: 'text-center', sortable: true };
                            case 'createdAt':
                              return { label: 'Created', align: 'text-center', sortable: false };
                            case 'updatedAt':
                              return { label: 'Last Modified', align: 'text-center', sortable: true };
                            case 'id':
                              return { label: 'Internal ID', align: 'text-left', sortable: false };
                            default:
                              return { label: '', align: 'text-left', sortable: false };
                          }
                        };

                        const config = getColumnConfig();
                        const flexAlign = config.align === 'text-right' ? 'ml-auto' : config.align === 'text-center' ? 'mx-auto' : '';

                        return (
                          <th 
                            key={column}
                            className={`${config.align} p-3 font-semibold text-foreground relative group cursor-move ${draggedColumn === column ? 'opacity-50' : ''}`}
                            draggable
                            onDragStart={(e) => handleColumnDragStart(e, column)}
                            onDragOver={handleColumnDragOver}
                            onDrop={(e) => handleColumnDrop(e, column)}
                            onDragEnd={handleColumnDragEnd}
                            data-testid={`sort-${column.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
                          >
                            <div className="flex items-center space-x-1">
                              <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                              {config.sortable ? (
                                <button 
                                  className={`flex items-center space-x-1 hover:text-primary transition-colors ${flexAlign}`}
                                  onClick={() => handleSort(column)}
                                >
                                  <span>{config.label}</span>
                                  {getSortIcon(column)}
                                </button>
                              ) : (
                                <span className={flexAlign}>{config.label}</span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((cashflow, index) => (
                        <tr 
                          key={cashflow.id} 
                          className={`table-row border-b border-border hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          data-testid={`row-cashflow-${cashflow.id}`}
                        >
                          {columnOrder.map((column) => {
                            if (!visibleColumns[column]) return null;

                            const renderCell = () => {
                              switch (column) {
                                case 'airtableId':
                                  return (
                                    <td key={column} className="p-3">
                                      <div className="font-mono text-sm text-foreground" data-testid={`cashflow-airtable-id-${cashflow.id}`}>
                                        {cashflow.airtableId}
                                      </div>
                                    </td>
                                  );
                                case 'fundName':
                                  return (
                                    <td key={column} className="p-3">
                                      <div className="font-medium text-foreground" data-testid={`cashflow-fund-name-${cashflow.id}`}>
                                        {cashflow.fundName || '-'}
                                      </div>
                                      <div className="text-sm text-muted-foreground font-mono">
                                        ID: {cashflow.fundId}
                                      </div>
                                    </td>
                                  );
                                case 'name':
                                  return (
                                    <td key={column} className="p-3" data-testid={`cashflow-name-${cashflow.id}`}>
                                      <div className="text-foreground">
                                        {cashflow.name || '-'}
                                      </div>
                                    </td>
                                  );
                                case 'amount':
                                  return (
                                    <td key={column} className="p-3 text-right" data-testid={`cashflow-amount-${cashflow.id}`}>
                                      <div className={`font-semibold ${getAmountColor(cashflow.amount)}`}>
                                        {formatCurrency(cashflow.amount)}
                                      </div>
                                    </td>
                                  );
                                case 'status':
                                  return (
                                    <td key={column} className="p-3 text-center" data-testid={`cashflow-status-${cashflow.id}`}>
                                      <Badge 
                                        variant={cashflow.status === 'actual' ? 'default' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {cashflow.status || 'Unknown'}
                                      </Badge>
                                    </td>
                                  );
                                case 'inOut':
                                  return (
                                    <td key={column} className="p-3 text-center" data-testid={`cashflow-in-out-${cashflow.id}`}>
                                      <Badge 
                                        variant={cashflow.inOut === 'Contribution' ? 'destructive' : 'default'}
                                        className="text-xs"
                                      >
                                        {cashflow.inOut || 'Unknown'}
                                      </Badge>
                                    </td>
                                  );
                                case 'cashflowDate':
                                  return (
                                    <td key={column} className="p-3 text-center" data-testid={`cashflow-date-${cashflow.id}`}>
                                      <div className="text-foreground">
                                        {formatDate(cashflow.cashflowDate)}
                                      </div>
                                    </td>
                                  );
                                case 'createdAt':
                                  return (
                                    <td key={column} className="p-3 text-center" data-testid={`cashflow-created-${cashflow.id}`}>
                                      <div className="text-sm text-muted-foreground">
                                        {formatDate(cashflow.createdAt)}
                                      </div>
                                    </td>
                                  );
                                case 'updatedAt':
                                  return (
                                    <td key={column} className="p-3 text-center" data-testid={`cashflow-updated-${cashflow.id}`}>
                                      <div className="text-sm text-muted-foreground">
                                        {formatDate(cashflow.updatedAt)}
                                      </div>
                                    </td>
                                  );
                                case 'id':
                                  return (
                                    <td key={column} className="p-3" data-testid={`cashflow-internal-id-${cashflow.id}`}>
                                      <div className="font-mono text-xs text-muted-foreground truncate max-w-32" title={cashflow.id}>
                                        {cashflow.id}
                                      </div>
                                    </td>
                                  );
                                default:
                                  return null;
                              }
                            };

                            return renderCell();
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="p-8 text-center text-muted-foreground">
                          {searchQuery || statusFilter ? 
                            "No cashflows match your current filters." :
                            "No cashflow data available. Sync with Airtable to populate data."
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <div className="text-sm text-muted-foreground" data-testid="pagination-info">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} cashflows
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      data-testid="button-previous-page"
                    >
                      Previous
                    </Button>
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const page = currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                      if (page > totalPages) return null;
                      
                      return (
                        <Button
                          key={page}
                          size="sm"
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          data-testid={`button-page-${page}`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
