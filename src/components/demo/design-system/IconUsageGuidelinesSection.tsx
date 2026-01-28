import { Calendar, CheckCircle, ClipboardList, Info, Plus, Settings, User } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";



const IconUsageGuidelinesSection: React.FC = () => {
    return (
        <Card className="border-sky-200 bg-sky-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sky-900">
                    <Tag01Icon className="w-5 h-5" />
                    Icon Usage Guidelines
                </CardTitle>
                <CardDescription className="text-sky-700">
                    Icon sizes, colors, placement, and common mappings
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Icon Sizes */}
                <div className="bg-white rounded-lg border border-sky-200 p-4">
                    <h3 className="text-sm font-semibold text-sky-900 mb-4">Icon Sizes</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 bg-sky-50 rounded border border-sky-200">
                            <CheckCircle className="w-4 h-4 text-sky-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">className="w-4 h-4" - Small</p>
                                <p className="text-xs text-gray-600">Inline with text, badges, small buttons</p>
                            </div>
                            <code className="text-xs text-sky-700 bg-white px-2 py-1 rounded">14px</code>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-sky-50 rounded border border-sky-200">
                            <CheckCircle className="w-4 h-4 text-sky-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">className="w-4 h-4" - Base (Default)</p>
                                <p className="text-xs text-gray-600">Buttons, form labels, navigation items</p>
                            </div>
                            <code className="text-xs text-sky-700 bg-white px-2 py-1 rounded">16px</code>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-sky-50 rounded border border-sky-200">
                            <CheckCircle className="w-5 h-5 text-sky-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">className="w-5 h-5" - Medium</p>
                                <p className="text-xs text-gray-600">Card headers, section titles, alerts</p>
                            </div>
                            <code className="text-xs text-sky-700 bg-white px-2 py-1 rounded">20px</code>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-sky-50 rounded border border-sky-200">
                            <CheckCircle className="w-6 h-6 text-sky-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">className="w-6 h-6" - Large</p>
                                <p className="text-xs text-gray-600">Page headers, stat cards, feature highlights</p>
                            </div>
                            <code className="text-xs text-sky-700 bg-white px-2 py-1 rounded">24px</code>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-sky-50 rounded border border-sky-200">
                            <CheckCircle className="w-8 h-8 text-sky-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">className="w-8 h-8" - XL</p>
                                <p className="text-xs text-gray-600">Empty states, hero sections, major features</p>
                            </div>
                            <code className="text-xs text-sky-700 bg-white px-2 py-1 rounded">32px</code>
                        </div>
                    </div>
                </div>

                {/* Icon Colors */}
                <div className="bg-white rounded-lg border border-sky-200 p-4">
                    <h3 className="text-sm font-semibold text-sky-900 mb-4">Icon Colors</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                            <User className="w-5 h-5 text-gray-700" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Match Text Color (Default)</p>
                                <p className="text-xs text-gray-600">Icons inherit text color for consistency</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted rounded">
                            <CheckCircle className="w-5 h-5 text-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Semantic Colors</p>
                                <p className="text-xs text-gray-600">Green for success, red for error, blue for info</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded">
                            <Settings className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Disabled/Inactive</p>
                                <p className="text-xs text-gray-600">Use text-gray-400 for disabled states</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Icon Placement */}
                <div className="bg-white rounded-lg border border-sky-200 p-4">
                    <h3 className="text-sm font-semibold text-sky-900 mb-4">Icon Placement</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Left of Text (Actions, Navigation)</p>
                            <div className="flex gap-2">
                                <Button size="sm">
                                    <Plus className="w-5 h-5" />
                                    Create
                                </Button>
                                <Button size="sm" variant="outline">
                                    <PencilEdit01Icon className="w-4 h-4" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Right of Text (External Links, Dropdowns)</p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                    Export
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                    More
                                    <MoreVerticalIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Above Text (Empty States, Feature Cards)</p>
                            <Card className="max-w-xs">
                                <CardContent className="pt-6 text-center">
                                    <InboxIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">No items found</p>
                                    <p className="text-xs text-gray-600 mt-1">Create your first item</p>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Standalone (Icon Buttons, Status Indicators)</p>
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost">
                                    <Settings className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost">
                                    <MoreVerticalIcon className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-foreground" />
                                    <span className="text-sm">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Common Icon Mappings */}
                <div className="bg-white rounded-lg border border-sky-200 p-4">
                    <h3 className="text-sm font-semibold text-sky-900 mb-4">Common CMMS Icon Mappings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <Plus className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Plus</p>
                                <p className="text-xs text-gray-600">Create, Add, New</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <PencilEdit01Icon className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">PencilEdit01Icon</p>
                                <p className="text-xs text-gray-600">Edit, Modify, Update</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <Trash2 className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Trash2</p>
                                <p className="text-xs text-gray-600">Delete, Remove, Trash</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <ClipboardList className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">ClipboardIcon</p>
                                <p className="text-xs text-gray-600">Work Orders, Tasks</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <Car className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Car</p>
                                <p className="text-xs text-gray-600">Assets, Vehicles</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <Package className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Package</p>
                                <p className="text-xs text-gray-600">Inventory, Parts</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <User className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">UserIcon</p>
                                <p className="text-xs text-gray-600">Technicians, Users</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <Calendar className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Calendar01Icon</p>
                                <p className="text-xs text-gray-600">Schedule, Dates</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <Settings className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Settings02Icon</p>
                                <p className="text-xs text-gray-600">Settings, Config</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <CheckCircle className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">CheckmarkCircle01Icon</p>
                                <p className="text-xs text-gray-600">Success, Complete</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <AlertCircle className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">AlertCircle</p>
                                <p className="text-xs text-gray-600">Error, Warning, Alert</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <Info className="w-4 h-4 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">InformationCircleIcon</p>
                                <p className="text-xs text-gray-600">Info, Help, Details</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Alert className="border-sky-300 bg-sky-100">
                    <CheckCircle className="w-4 h-4 text-sky-700" />
                    <AlertTitle className="text-sky-900">Icon Usage Best Practices</AlertTitle>
                    <AlertDescription className="text-sky-800">
                        <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
                            <li>Use className="w-4 h-4" for most UI elements (buttons, navigation)</li>
                            <li>Use className="w-5 h-5" for section headers and card titles</li>
                            <li>Use className="w-8 h-8" for empty states and hero sections</li>
                            <li>Match icon color to text color by default</li>
                            <li>Use semantic colors for status (green=success, red=error)</li>
                            <li>Place icons left of text for actions and navigation</li>
                            <li>Use consistent icons across the app (same icon = same meaning)</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default IconUsageGuidelinesSection;


