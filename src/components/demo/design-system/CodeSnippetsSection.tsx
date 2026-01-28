import { Info, Package, Edit, Plus, MoreVertical, CheckCircle, Clock, AlertCircle, RefreshCw, User, Trash2 } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';



const CodeSnippetsSection: React.FC = () => {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Package className="w-5 h-5" />
          Quick Copy Templates
        </CardTitle>
        <CardDescription className="text-primary">
          Ready-to-use code snippets for common CMMS scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="form-dialog" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="form-dialog">Form Dialog</TabsTrigger>
            <TabsTrigger value="data-table">Data Table</TabsTrigger>
            <TabsTrigger value="stat-ribbon">Stat Ribbon</TabsTrigger>
            <TabsTrigger value="status-badge">Status Badge</TabsTrigger>
            <TabsTrigger value="action-menu">Action Menu</TabsTrigger>
          </TabsList>

          {/* Form Dialog Template */}
          <TabsContent value="form-dialog" className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-indigo-900 mb-2">Work Order Creation Dialog</h4>
              <p className="text-xs text-primary mb-3">Complete form dialog with validation-ready structure</p>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                {`<Dialog>
  <DialogTrigger asChild>
    <Button>
      <Plus className="w-5 h-5" />
      Create Work Order
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Work Order</DialogTitle>
      <DialogDescription>
        Fill in the details to create a maintenance work order
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input 
          id="title" 
          placeholder="e.g., Replace brake pads" 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="asset">Asset *</Label>
        <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Select asset...</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>Medium</option>
          <option>Low</option>
          <option>High</option>
          <option>Critical</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea 
          id="description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Describe the issue..."
        />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Create Work Order</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
              </pre>
            </div>
          </TabsContent>

          {/* Data Table Template */}
          <TabsContent value="data-table" className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-indigo-900 mb-2">Interactive Data Table</h4>
              <p className="text-xs text-primary mb-3">Table with selection, actions, and status badges</p>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                {`<div className="border rounded-lg">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <input type="checkbox" className="w-4 h-4 rounded" />
        </TableHead>
        <TableHead>Work Order</TableHead>
        <TableHead>Asset</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Priority</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="hover:bg-gray-50">
        <TableCell>
          <input type="checkbox" className="w-4 h-4 rounded" />
        </TableCell>
        <TableCell className="font-medium">WO-2024-001</TableCell>
        <TableCell>ABC-123</TableCell>
        <TableCell>
          <Badge variant="status-in-progress">In Progress</Badge>
        </TableCell>
        <TableCell>
          <Badge variant="priority-high">High</Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVerticalIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>`}
              </pre>
            </div>
          </TabsContent>

          {/* Stat Ribbon Template */}
          <TabsContent value="stat-ribbon" className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-indigo-900 mb-2">Dashboard Stat Ribbon</h4>
              <p className="text-xs text-primary mb-3">Horizontal metrics bar with icons and color-coded values</p>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                {`<Card>
  <CardContent className="pt-6">
    <div className="flex items-center divide-x divide-gray-200">
      <div className="flex items-center gap-2 px-4 first:pl-0">
        <ClipboardIcon 
          className="w-4 h-4 text-muted-foreground" 
        />
        <span className="text-xs text-gray-500">Total:</span>
        <span className="text-lg font-semibold text-gray-900">24</span>
      </div>
      <div className="flex items-center gap-2 px-4">
        <CheckmarkCircle01Icon 
          className="w-4 h-4 text-foreground" 
        />
        <span className="text-xs text-gray-500">Completed:</span>
        <span className="text-lg font-semibold text-foreground">18</span>
      </div>
      <div className="flex items-center gap-2 px-4">
        <Clock01Icon 
          className="w-4 h-4 text-muted-foreground" 
        />
        <span className="text-xs text-gray-500">In Progress:</span>
        <span className="text-lg font-semibold text-muted-foreground">4</span>
      </div>
      <div className="flex items-center gap-2 px-4">
        <AlertCircle 
          className="w-4 h-4 text-destructive" 
        />
        <span className="text-xs text-gray-500">Overdue:</span>
        <span className="text-lg font-semibold text-destructive">2</span>
      </div>
    </div>
  </CardContent>
</Card>`}
              </pre>
            </div>
          </TabsContent>

          {/* Status Badge Template */}
          <TabsContent value="status-badge" className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-indigo-900 mb-2">Status & Priority Badges</h4>
              <p className="text-xs text-primary mb-3">All available badge variants for work orders</p>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                {`// Work Order Status Badges
<Badge variant="status-open">Open</Badge>
<Badge variant="status-in-progress">In Progress</Badge>
<Badge variant="status-completed">Completed</Badge>
<Badge variant="status-on-hold">On Hold</Badge>
<Badge variant="status-cancelled">Cancelled</Badge>

// Priority Badges
<Badge variant="priority-critical">Critical</Badge>
<Badge variant="priority-high">High</Badge>
<Badge variant="priority-medium">Medium</Badge>
<Badge variant="priority-low">Low</Badge>

// Generic Color Badges
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="purple">Purple</Badge>
<Badge variant="green">Green</Badge>
<Badge variant="blue">Blue</Badge>
<Badge variant="orange">Orange</Badge>
<Badge variant="red">Red</Badge>
<Badge variant="yellow">Yellow</Badge>
<Badge variant="gray">Gray</Badge>`}
              </pre>
            </div>
          </TabsContent>

          {/* Action Menu Template */}
          <TabsContent value="action-menu" className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-indigo-900 mb-2">Dropdown Action Menu</h4>
              <p className="text-xs text-primary mb-3">Context menu for row actions and bulk operations</p>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                {`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      Actions
      <MoreVerticalIcon className="w-4 h-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Work Order Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <Edit className="w-4 h-4 mr-2" />
      Edit Details
    </DropdownMenuItem>
    <DropdownMenuItem>
      <UserIcon className="w-4 h-4 mr-2" />
      Assign Technician
    </DropdownMenuItem>
    <DropdownMenuItem>
      <RefreshIcon className="w-4 h-4 mr-2" />
      Change Status
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">
      <Trash2 className="w-4 h-4 mr-2" />
      Delete Work Order
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <Alert className="border-indigo-300 bg-primary/10 mt-4">
          <Info className="w-4 h-4 text-primary" />
          <AlertTitle className="text-indigo-900">How to Use These Templates</AlertTitle>
          <AlertDescription className="text-indigo-800">
            <ol className="text-xs space-y-1 mt-2 ml-4 list-decimal">
              <li>Copy the code snippet from the tab above</li>
              <li>Paste into your component file</li>
              <li>Add necessary imports at the top of your file</li>
              <li>Customize the content and handlers for your use case</li>
              <li>Test and adjust styling as needed</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default CodeSnippetsSection;




