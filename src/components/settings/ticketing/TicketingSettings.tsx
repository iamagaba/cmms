
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryManagement from './CategoryManagement';
import SLAManagement from './SLAManagement';

export default function TicketingSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Ticketing</h2>
                <p className="text-muted-foreground">
                    Manage categories, SLAs, and preferences.
                </p>
            </div>

            <Tabs defaultValue="categories" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="sla">SLA Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>
                                Organize issues for reporting and routing.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryManagement />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sla" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>SLAs</CardTitle>
                            <CardDescription>
                                Set response and resolution times.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SLAManagement />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
