/**
 * Test Component for Scalable Search
 * 
 * This component tests the useWorkOrderSearch hook to verify it works correctly.
 * 
 * To test:
 * 1. Import this component in App.tsx temporarily
 * 2. Check browser console for results
 * 3. Verify search is fast even with large datasets
 */

import { useWorkOrderSearch } from '@/hooks/useWorkOrderSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export function TestScalableSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading, error, refetch } = useWorkOrderSearch({
    searchQuery,
    page,
    pageSize: 50,
  });

  const startTime = performance.now();
  const loadTime = isLoading ? 0 : Math.round(performance.now() - startTime);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            ) : error ? (
              <XCircle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle className="w-5 h-5 text-success" />
            )}
            Scalable Search Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Search Query (try license plate, work order number, etc.)
            </label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search..."
              className="mb-2"
            />
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Records</div>
              <div className="text-2xl font-bold">
                {data?.totalCount?.toLocaleString() || 0}
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Loaded Records</div>
              <div className="text-2xl font-bold">
                {data?.workOrders?.length || 0}
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Current Page</div>
              <div className="text-2xl font-bold">
                {page + 1}
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Has More</div>
              <div className="text-2xl font-bold">
                {data?.hasMore ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-sm font-medium text-primary mb-2">
              Performance Metrics
            </div>
            <div className="space-y-1 text-sm">
              <div>Load Time: <span className="font-mono font-bold">{loadTime}ms</span></div>
              <div>Status: <span className="font-mono">{isLoading ? 'Loading...' : error ? 'Error' : 'Success'}</span></div>
              {error && (
                <div className="text-destructive">Error: {(error as any).message}</div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1}
            </span>
            <Button
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.hasMore || isLoading}
              variant="outline"
            >
              Next
            </Button>
          </div>

          {/* Refresh */}
          <Button onClick={() => refetch()} className="w-full" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          {/* Sample Data */}
          {data?.workOrders && data.workOrders.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Sample Records (first 3):</div>
              <div className="space-y-2">
                {data.workOrders.slice(0, 3).map((wo) => (
                  <div key={wo.id} className="p-3 bg-muted rounded-lg text-sm">
                    <div className="font-mono font-bold">{wo.workOrderNumber}</div>
                    <div className="text-muted-foreground">{wo.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Status: {wo.status} | Priority: {wo.priority}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="text-sm font-medium mb-2">✅ Test Checklist:</div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Search should return results in &lt;100ms</li>
              <li>• Only 50 records loaded at a time (not all)</li>
              <li>• Pagination works (Previous/Next buttons)</li>
              <li>• Total count shows all matching records</li>
              <li>• Memory usage stays low (check DevTools)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
