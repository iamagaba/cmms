import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle01Icon, Cancel01Icon, AlertCircleIcon, InboxIcon } from '@hugeicons/core-free-icons';

const DosAndDontsSection: React.FC = () => {
    return (
        <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />
                    Do's and Don'ts
                </CardTitle>
                <CardDescription className="text-blue-700">
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
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-emerald-600" />
                                <p className="text-emerald-700 font-semibold text-sm">Do</p>
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
                        <div className="border-2 border-red-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-red-600" />
                                <p className="text-red-700 font-semibold text-sm">Don't</p>
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
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-emerald-600" />
                                <p className="text-emerald-700 font-semibold text-sm">Do</p>
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
                        <div className="border-2 border-red-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-red-600" />
                                <p className="text-red-700 font-semibold text-sm">Don't</p>
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
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-emerald-600" />
                                <p className="text-emerald-700 font-semibold text-sm">Do</p>
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
                        <div className="border-2 border-red-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-red-600" />
                                <p className="text-red-700 font-semibold text-sm">Don't</p>
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
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-emerald-600" />
                                <p className="text-emerald-700 font-semibold text-sm">Do</p>
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
                        <div className="border-2 border-red-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-red-600" />
                                <p className="text-red-700 font-semibold text-sm">Don't</p>
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
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-emerald-600" />
                                <p className="text-emerald-700 font-semibold text-sm">Do</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-red-600" />
                                    <Badge variant="priority-critical">Critical</Badge>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Use icons + color for status (accessible)
                                </p>
                            </div>
                        </div>
                        <div className="border-2 border-red-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-red-600" />
                                <p className="text-red-700 font-semibold text-sm">Don't</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
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
