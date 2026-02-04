import { CheckCircle, X, AlertCircle } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';



const DosAndDontsSection: React.FC = () => {
    return (
        <Card className="border-blue-200 bg-muted">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                    <CheckCircle className="w-5 h-5" />
                    Do's and Don'ts
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Visual examples of correct vs incorrect component usage
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Button Usage */}
                <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">Button Usage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-emerald-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-foreground" />
                                <p className="text-foreground font-semibold text-sm">Do</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Button size="sm">Save</Button>
                                    <Button size="sm" variant="outline">Cancel</Button>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Use primary button for main action, outline for secondary
                                </p>
                            </div>
                        </div>
                        <div className="border-2 border-destructive bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-destructive" />
                                <p className="text-destructive font-semibold text-sm">Don't</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Button size="sm">Save</Button>
                                    <Button size="sm">Cancel</Button>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Don't use two primary buttons side by side
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badge Usage */}
                <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">Badge Usage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-emerald-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-foreground" />
                                <p className="text-foreground font-semibold text-sm">Do</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Status:</span>
                                    <Badge variant="status-in-progress">In Progress</Badge>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Use semantic badge variants for status
                                </p>
                            </div>
                        </div>
                        <div className="border-2 border-destructive bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-destructive" />
                                <p className="text-destructive font-semibold text-sm">Don't</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Status:</span>
                                    <Badge variant="default">In Progress</Badge>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Don't use default badge for status indicators
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Layout */}
                <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">Form Layout</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-emerald-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-foreground" />
                                <p className="text-foreground font-semibold text-sm">Do</p>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="good-email">Email Address</Label>
                                    <Input id="good-email" type="email" placeholder="john@example.com" />
                                </div>
                                <p className="text-xs text-gray-600">
                                    Always use labels with form inputs
                                </p>
                            </div>
                        </div>
                        <div className="border-2 border-destructive bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-destructive" />
                                <p className="text-destructive font-semibold text-sm">Don't</p>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Input type="email" placeholder="Email Address" />
                                </div>
                                <p className="text-xs text-gray-600">
                                    Don't rely only on placeholders (accessibility issue)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dialog Usage */}
                <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">Dialog Usage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-emerald-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-foreground" />
                                <p className="text-foreground font-semibold text-sm">Do</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium">Use dialogs for:</p>
                                <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                                    <li>Creating/editing records</li>
                                    <li>Confirmation prompts</li>
                                    <li>Important messages</li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-2 border-destructive bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-destructive" />
                                <p className="text-destructive font-semibold text-sm">Don't</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium">Avoid dialogs for:</p>
                                <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                                    <li>Simple tooltips (use Popover)</li>
                                    <li>Action menus (use Dropdown)</li>
                                    <li>Non-critical info</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Color Usage */}
                <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">Color & Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-emerald-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-foreground" />
                                <p className="text-foreground font-semibold text-sm">Do</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-destructive" />
                                    <Badge variant="priority-critical">Critical</Badge>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Use icons + color for status (accessible)
                                </p>
                            </div>
                        </div>
                        <div className="border-2 border-destructive bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-destructive" />
                                <p className="text-destructive font-semibold text-sm">Don't</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                                    <span className="text-sm">Critical</span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Don't rely on color alone (not accessible)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DosAndDontsSection;



