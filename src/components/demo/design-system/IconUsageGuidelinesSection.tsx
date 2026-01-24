import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Tag01Icon,
    CheckmarkCircle01Icon,
    UserIcon,
    Settings02Icon,
    Add01Icon,
    PencilEdit01Icon,
    ArrowRight01Icon,
    MoreVerticalIcon,
    InboxIcon,
    Delete01Icon,
    ClipboardIcon,
    Car01Icon,
    PackageIcon,
    Calendar01Icon,
    AlertCircleIcon,
    InformationCircleIcon
} from "@hugeicons/core-free-icons";

const IconUsageGuidelinesSection: React.FC = () => {
    return (
        <Card className="border-sky-200 bg-sky-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sky-900">
                    <HugeiconsIcon icon={Tag01Icon} size={20} />
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
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-sky-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">size={14} - Small</p>
                                <p className="text-xs text-gray-600">Inline with text, badges, small buttons</p>
                            </div>
                            <code className="text-xs text-sky-700 bg-white px-2 py-1 rounded">14px</code>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-sky-50 rounded border border-sky-200">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-sky-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">size={16} - Base (Default)</p>
                                <p className="text-xs text-gray-600">Buttons, form labels, navigation items</p>
                            </div>
                            <code className="text-xs text-sky-700 bg-white px-2 py-1 rounded">16px</code>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-sky-50 rounded border border-sky-200">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="text-sky-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">size={20} - Medium</p>
                                <p className="text-xs text-gray-600">Card headers, section titles, alerts</p>
                            </div>
                            <code className="text-xs text-sky-700 bg-white px-2 py-1 rounded">20px</code>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-sky-50 rounded border border-sky-200">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={24} className="text-sky-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">size={24} - Large</p>
                                <p className="text-xs text-gray-600">Page headers, stat cards, feature highlights</p>
                            </div>
                            <code className="text-xs text-sky-700 bg-white px-2 py-1 rounded">24px</code>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-sky-50 rounded border border-sky-200">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={32} className="text-sky-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">size={32} - XL</p>
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
                            <HugeiconsIcon icon={UserIcon} size={20} className="text-gray-700" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Match Text Color (Default)</p>
                                <p className="text-xs text-gray-600">Icons inherit text color for consistency</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="text-emerald-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Semantic Colors</p>
                                <p className="text-xs text-gray-600">Green for success, red for error, blue for info</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded">
                            <HugeiconsIcon icon={Settings02Icon} size={20} className="text-gray-400" />
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
                                    <HugeiconsIcon icon={Add01Icon} size={16} />
                                    Create
                                </Button>
                                <Button size="sm" variant="outline">
                                    <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
                                    Edit
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Right of Text (External Links, Dropdowns)</p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                    Export
                                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                                </Button>
                                <Button size="sm" variant="outline">
                                    More
                                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Above Text (Empty States, Feature Cards)</p>
                            <Card className="max-w-xs">
                                <CardContent className="pt-6 text-center">
                                    <HugeiconsIcon icon={InboxIcon} size={32} className="text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">No items found</p>
                                    <p className="text-xs text-gray-600 mt-1">Create your first item</p>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Standalone (Icon Buttons, Status Indicators)</p>
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost">
                                    <HugeiconsIcon icon={Settings02Icon} size={16} />
                                </Button>
                                <Button size="icon" variant="ghost">
                                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                                </Button>
                                <div className="flex items-center gap-2">
                                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-emerald-600" />
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
                            <HugeiconsIcon icon={Add01Icon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Add01Icon</p>
                                <p className="text-xs text-gray-600">Create, Add, New</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <HugeiconsIcon icon={PencilEdit01Icon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">PencilEdit01Icon</p>
                                <p className="text-xs text-gray-600">Edit, Modify, Update</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <HugeiconsIcon icon={Delete01Icon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Delete01Icon</p>
                                <p className="text-xs text-gray-600">Delete, Remove, Trash</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <HugeiconsIcon icon={ClipboardIcon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">ClipboardIcon</p>
                                <p className="text-xs text-gray-600">Work Orders, Tasks</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <HugeiconsIcon icon={Car01Icon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Car01Icon</p>
                                <p className="text-xs text-gray-600">Assets, Vehicles</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <HugeiconsIcon icon={PackageIcon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">PackageIcon</p>
                                <p className="text-xs text-gray-600">Inventory, Parts</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <HugeiconsIcon icon={UserIcon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">UserIcon</p>
                                <p className="text-xs text-gray-600">Technicians, Users</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <HugeiconsIcon icon={Calendar01Icon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Calendar01Icon</p>
                                <p className="text-xs text-gray-600">Schedule, Dates</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <HugeiconsIcon icon={Settings02Icon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Settings02Icon</p>
                                <p className="text-xs text-gray-600">Settings, Config</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">CheckmarkCircle01Icon</p>
                                <p className="text-xs text-gray-600">Success, Complete</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">AlertCircleIcon</p>
                                <p className="text-xs text-gray-600">Error, Warning, Alert</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-sky-50 rounded">
                            <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-sky-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">InformationCircleIcon</p>
                                <p className="text-xs text-gray-600">Info, Help, Details</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Alert className="border-sky-300 bg-sky-100">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-sky-700" />
                    <AlertTitle className="text-sky-900">Icon Usage Best Practices</AlertTitle>
                    <AlertDescription className="text-sky-800">
                        <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
                            <li>Use size={16} for most UI elements (buttons, navigation)</li>
                            <li>Use size={20} for section headers and card titles</li>
                            <li>Use size={32} for empty states and hero sections</li>
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
