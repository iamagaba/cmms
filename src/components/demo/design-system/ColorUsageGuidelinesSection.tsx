import { CheckCircle, Info, Palette, AlertCircle, Tag } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";



const ColorUsageGuidelinesSection: React.FC = () => {
    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                    <Palette className="w-5 h-5 text-primary" />
                    Color Usage Guidelines
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    When to use each color and semantic meanings
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Status Colors */}
                <div className="bg-card rounded-lg border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Status Colors</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-muted rounded border border-blue-200">
                            <Badge variant="status-open" className="mt-0.5">New</Badge>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Blue (status-open)</p>
                                <p className="text-xs text-gray-600">New, unstarted, pending, awaiting assignment</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded border border-amber-200">
                            <Badge variant="status-in-progress" className="mt-0.5">In Progress</Badge>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Amber (status-in-progress)</p>
                                <p className="text-xs text-gray-600">Active, ongoing, currently being worked on</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted rounded border border-emerald-200">
                            <Badge variant="status-completed" className="mt-0.5">Completed</Badge>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Emerald (status-completed)</p>
                                <p className="text-xs text-gray-600">Done, successful, finished, resolved</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted rounded border border-orange-200">
                            <Badge variant="status-on-hold" className="mt-0.5">On Hold</Badge>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Orange (status-on-hold)</p>
                                <p className="text-xs text-gray-600">Paused, waiting for parts, blocked</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                            <Badge variant="status-cancelled" className="mt-0.5">Cancelled</Badge>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Gray (status-cancelled)</p>
                                <p className="text-xs text-gray-600">Inactive, archived, no longer needed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Priority Colors */}
                <div className="bg-card rounded-lg border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Priority Colors</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-red-50 rounded border border-destructive/20">
                            <Badge variant="priority-critical" className="mt-0.5">Critical</Badge>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Red (priority-critical)</p>
                                <p className="text-xs text-gray-600">Immediate action required, safety issue, system down</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted rounded border border-orange-200">
                            <Badge variant="priority-high" className="mt-0.5">High</Badge>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Orange (priority-high)</p>
                                <p className="text-xs text-gray-600">Important, urgent, needs attention soon</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                            <Badge variant="priority-medium" className="mt-0.5">Medium</Badge>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Yellow (priority-medium)</p>
                                <p className="text-xs text-gray-600">Normal priority, standard timeline</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted rounded border border-blue-200">
                            <Badge variant="priority-low" className="mt-0.5">Low</Badge>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Blue (priority-low)</p>
                                <p className="text-xs text-gray-600">Can wait, nice to have, low impact</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Semantic Colors */}
                <div className="bg-card rounded-lg border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Semantic Colors</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-red-50 rounded border border-destructive/20">
                            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Red</p>
                                <p className="text-xs text-gray-600">Errors, destructive actions, critical alerts, danger</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted rounded border border-orange-200">
                            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Orange</p>
                                <p className="text-xs text-gray-600">Warnings, caution, needs attention</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted rounded border border-emerald-200">
                            <CheckCircle className="w-5 h-5 text-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Emerald</p>
                                <p className="text-xs text-gray-600">Success, completion, positive actions</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted rounded border border-blue-200">
                            <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Blue</p>
                                <p className="text-xs text-gray-600">Information, neutral actions, links</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-primary/5 rounded border border-primary/20">
                            <Tag className="w-5 h-5 text-primary mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Purple</p>
                                <p className="text-xs text-gray-600">Primary brand, highlights, featured items</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Colors */}
                <div className="bg-card rounded-lg border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Text Color Hierarchy</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-900 font-semibold">text-gray-900</span>
                            <span className="text-xs text-gray-600">Primary text (headings, important content)</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">text-gray-700</span>
                            <span className="text-xs text-gray-600">Body text (descriptions, content)</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-500">text-gray-500</span>
                            <span className="text-xs text-gray-600">Secondary text (labels, metadata)</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-400">text-gray-400</span>
                            <span className="text-xs text-gray-600">Tertiary text (placeholders, disabled)</span>
                        </div>
                    </div>
                </div>

                {/* Background Colors */}
                <div className="bg-card rounded-lg border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Background Colors</h3>
                    <div className="space-y-2">
                        <div className="p-3 bg-white border border-gray-200 rounded">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">bg-white</span>
                                <span className="text-xs text-gray-600">Cards, modals, elevated surfaces</span>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">bg-gray-50</span>
                                <span className="text-xs text-gray-600">Page background, subtle sections</span>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-100 border border-gray-200 rounded">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">bg-gray-100</span>
                                <span className="text-xs text-gray-600">Hover states, disabled fields</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Alert className="border-amber-300 bg-amber-100">
                    <CheckCircle className="w-4 h-4 text-amber-700" />
                    <AlertTitle className="text-amber-900">Color Usage Best Practices</AlertTitle>
                    <AlertDescription className="text-amber-800">
                        <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
                            <li>Use red only for errors and destructive actions</li>
                            <li>Use emerald for success and completion</li>
                            <li>Use blue for information and neutral actions</li>
                            <li>Use orange for warnings and caution</li>
                            <li>Never rely on color alone - always include icons or text</li>
                            <li>Maintain consistent color meanings across the app</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default ColorUsageGuidelinesSection;



