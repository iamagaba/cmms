# DataTable Component

The DataTable component is a sophisticated data display component designed for maintenance management workflows, providing advanced features like sorting, filtering, selection, and responsive behavior.

## Overview

DataTable is built specifically for CMMS applications where users need to efficiently browse, sort, and manage large datasets of work orders, assets, and maintenance records.

## API Reference

### Props

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  sorting?: {
    sortBy: string | null;
    sortOrder: 'asc' | 'desc' | null;
    onSortChange: (column: string, order: 'asc' | 'desc') => void;
  };
  filtering?: {
    globalFilter: string;
    columnFilters: Record<string, any>;
    onGlobalFilterChange: (value: string) => void;
    onColumnFilterChange: (column: string, value: any) => void;
  };
  selection?: {
    selectedRows: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    getRowId: (row: T) => string;
  };
  actions?: {
    onRowClick?: (row: T) => void;
    onRowDoubleClick?: (row: T) => void;
    rowActions?: Array<{
      label: string;
      icon?: string;
      onClick: (row: T) => void;
      variant?: 'default' | 'danger';
    }>;
  };
  responsive?: {
    breakpoint?: 'sm' | 'md' | 'lg';
    mobileView?: 'cards' | 'accordion' | 'horizontal-scroll';
  };
  className?: string;
}

interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  cell?: (info: { getValue: () => any; row: T }) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sticky?: 'left' | 'right';
}
```

## Usage Examples

### Basic Data Table

```tsx
import { DataTable } from '@/components/ui/DataTable';

interface WorkOrder {
  id: string;
  number: string;
  title: string;
  status: 'new' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  createdAt: Date;
}

const columns: ColumnDef<WorkOrder>[] = [
  {
    id: 'number',
    header: 'Work Order #',
    accessorKey: 'number',
    sortable: true,
    width: 120,
  },
  {
    id: 'title',
    header: 'Title',
    accessorKey: 'title',
    sortable: true,
    filterable: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue }) => (
      <StatusBadge status={getValue() as string} />
    ),
    sortable: true,
    filterable: true,
    width: 100,
  },
  {
    id: 'priority',
    header: 'Priority',
    accessorKey: 'priority',
    cell: ({ getValue }) => (
      <PriorityIndicator priority={getValue() as string} />
    ),
    sortable: true,
    width: 80,
  },
  {
    id: 'assignee',
    header: 'Assignee',
    accessorKey: 'assignee',
    sortable: true,
    filterable: true,
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => (
      <span>{format(getValue() as Date, 'MMM dd, yyyy')}</span>
    ),
    sortable: true,
    width: 100,
  },
];

function WorkOrdersTable() {
  const [data, setData] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      pagination={{
        pageIndex: 0,
        pageSize: 25,
        pageCount: 10,
        onPageChange: (page) => console.log('Page:', page),
        onPageSizeChange: (size) => console.log('Page size:', size),
      }}
    />
  );
}
```

### Advanced Features

```tsx
function AdvancedWorkOrdersTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const handleRowClick = (workOrder: WorkOrder) => {
    // Navigate to work order details
    navigate(`/work-orders/${workOrder.id}`);
  };

  const rowActions = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (row: WorkOrder) => openEditDialog(row),
    },
    {
      label: 'Duplicate',
      icon: 'copy',
      onClick: (row: WorkOrder) => duplicateWorkOrder(row),
    },
    {
      label: 'Delete',
      icon: 'trash',
      onClick: (row: WorkOrder) => deleteWorkOrder(row),
      variant: 'danger' as const,
    },
  ];

  return (
    <DataTable
      data={workOrders}
      columns={columns}
      loading={loading}
      selection={{
        selectedRows,
        onSelectionChange: setSelectedRows,
        getRowId: (row) => row.id,
      }}
      filtering={{
        globalFilter,
        columnFilters: {},
        onGlobalFilterChange: setGlobalFilter,
        onColumnFilterChange: (column, value) => {
          // Handle column-specific filtering
        },
      }}
      sorting={{
        sortBy,
        sortOrder,
        onSortChange: (column, order) => {
          setSortBy(column);
          setSortOrder(order);
        },
      }}
      actions={{
        onRowClick: handleRowClick,
        rowActions,
      }}
      responsive={{
        breakpoint: 'md',
        mobileView: 'cards',
      }}
    />
  );
}
```

### Custom Cell Renderers

```tsx
const customColumns: ColumnDef<WorkOrder>[] = [
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue, row }) => {
      const status = getValue() as string;
      return (
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          {status === 'in-progress' && (
            <ProgressIndicator progress={row.progress} />
          )}
        </div>
      );
    },
  },
  {
    id: 'technician',
    header: 'Technician',
    accessorFn: (row) => row.assignee,
    cell: ({ getValue, row }) => (
      <div className="flex items-center gap-2">
        <Avatar 
          src={row.assigneeAvatar} 
          name={getValue() as string}
          size="sm"
        />
        <span>{getValue()}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => viewDetails(row)}
        >
          View
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => editWorkOrder(row)}
        >
          Edit
        </Button>
      </div>
    ),
    width: 120,
    align: 'right',
  },
];
```

## Design Tokens

### Colors
- Header Background: `professionalColors.machineryGray[50]`
- Border: `professionalColors.machineryGray[200]`
- Row Hover: `professionalColors.steelBlue[50]`
- Selected Row: `professionalColors.steelBlue[100]`

### Spacing
- Cell Padding: `professionalSpacing.scale[3] professionalSpacing.scale[4]`
- Row Gap: `professionalSpacing.scale[1]`
- Header Padding: `professionalSpacing.scale[4]`

### Typography
- Header Text: `professionalTypography.fontSizes.sm` with `font-semibold`
- Cell Text: `professionalTypography.fontSizes.sm`
- Caption Text: `professionalTypography.fontSizes.xs`

## Responsive Behavior

### Breakpoint Behavior

#### Desktop (lg+)
- Full table with all columns visible
- Horizontal scrolling for overflow
- Hover states and detailed interactions

#### Tablet (md)
- Condensed columns with priority-based hiding
- Sticky first column for context
- Touch-friendly row selection

#### Mobile (sm)
- Card-based layout by default
- Swipe actions for row operations
- Collapsible details sections

### Mobile Card Layout

```tsx
function MobileWorkOrderCard({ workOrder }: { workOrder: WorkOrder }) {
  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{workOrder.number}</h3>
          <p className="text-sm text-gray-600">{workOrder.title}</p>
        </div>
        <StatusBadge status={workOrder.status} />
      </div>
      
      <div className="flex justify-between text-sm">
        <span>Assignee: {workOrder.assignee}</span>
        <PriorityIndicator priority={workOrder.priority} />
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {format(workOrder.createdAt, 'MMM dd, yyyy')}
        </span>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </div>
    </div>
  );
}
```

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate through interactive elements
- **Arrow Keys**: Navigate between cells (when in focus mode)
- **Enter**: Activate row or cell action
- **Space**: Toggle row selection
- **Escape**: Exit focus mode

### Screen Reader Support
- Proper table semantics with `<table>`, `<thead>`, `<tbody>`
- Column headers associated with data cells
- Row selection state announced
- Sorting state communicated
- Loading and error states announced

### Focus Management
- Clear focus indicators on all interactive elements
- Focus trap within table when in navigation mode
- Logical tab order through controls
- Focus restoration after modal interactions

## Performance Optimization

### Virtualization
For large datasets (>1000 rows), the table implements virtual scrolling:

```tsx
<DataTable
  data={largeDataset}
  columns={columns}
  virtualization={{
    enabled: true,
    rowHeight: 48,
    overscan: 10,
  }}
/>
```

### Memoization
- Column definitions memoized to prevent re-renders
- Cell renderers wrapped in React.memo
- Sort and filter functions optimized with useMemo

### Lazy Loading
```tsx
function LazyDataTable() {
  const {
    data,
    loading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['work-orders'],
    queryFn: fetchWorkOrders,
  });

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      onScrollEnd={() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }}
    />
  );
}
```

## Testing

### Unit Tests

```tsx
describe('DataTable', () => {
  const mockData = [
    { id: '1', name: 'Item 1', status: 'active' },
    { id: '2', name: 'Item 2', status: 'inactive' },
  ];

  const mockColumns = [
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'status', header: 'Status', accessorKey: 'status' },
  ];

  it('renders table with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />);
    
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('handles row selection', () => {
    const onSelectionChange = vi.fn();
    
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        selection={{
          selectedRows: [],
          onSelectionChange,
          getRowId: (row) => row.id,
        }}
      />
    );

    const checkbox = screen.getAllByRole('checkbox')[1]; // First row checkbox
    fireEvent.click(checkbox);
    
    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });
});
```

### Property-Based Tests

```tsx
describe('DataTable Property Tests', () => {
  it('should handle any valid data array', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        id: fc.string(),
        name: fc.string(),
        value: fc.integer(),
      })),
      (data) => {
        const columns = [
          { id: 'name', header: 'Name', accessorKey: 'name' },
          { id: 'value', header: 'Value', accessorKey: 'value' },
        ];

        const { container } = render(
          <DataTable data={data} columns={columns} />
        );

        const table = container.querySelector('table');
        expect(table).toBeInTheDocument();
        
        // Should render correct number of rows
        const rows = container.querySelectorAll('tbody tr');
        expect(rows).toHaveLength(data.length);
      }
    ));
  });
});
```

## Common Patterns

### Batch Operations

```tsx
function WorkOrdersWithBatchActions() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const batchActions = [
    {
      label: 'Assign Technician',
      onClick: () => openBatchAssignDialog(selectedRows),
    },
    {
      label: 'Update Status',
      onClick: () => openBatchStatusDialog(selectedRows),
    },
    {
      label: 'Export Selected',
      onClick: () => exportWorkOrders(selectedRows),
    },
  ];

  return (
    <div>
      {selectedRows.length > 0 && (
        <BatchActionBar
          selectedCount={selectedRows.length}
          actions={batchActions}
          onClearSelection={() => setSelectedRows([])}
        />
      )}
      
      <DataTable
        data={workOrders}
        columns={columns}
        selection={{
          selectedRows,
          onSelectionChange: setSelectedRows,
          getRowId: (row) => row.id,
        }}
      />
    </div>
  );
}
```

### Filtering and Search

```tsx
function FilterableDataTable() {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    dateRange: null,
  });

  return (
    <div>
      <TableFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters({})}
      />
      
      <DataTable
        data={filteredData}
        columns={columns}
        filtering={{
          globalFilter: filters.search,
          columnFilters: filters,
          onGlobalFilterChange: (value) => 
            setFilters(prev => ({ ...prev, search: value })),
          onColumnFilterChange: (column, value) =>
            setFilters(prev => ({ ...prev, [column]: value })),
        }}
      />
    </div>
  );
}
```

## Related Components

- [StatusBadge](./StatusBadge.md) - For status indicators
- [PriorityIndicator](./PriorityIndicator.md) - For priority display
- [LoadingSpinner](./LoadingSpinner.md) - For loading states
- [Pagination](./Pagination.md) - For data navigation
- [TableFilters](./TableFilters.md) - For filtering controls