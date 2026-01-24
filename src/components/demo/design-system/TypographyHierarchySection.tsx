import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';

const TypographyHierarchySection: React.FC = () => {
    return (
        <Card className="border-teal-200 bg-teal-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-900">
                    <HugeiconsIcon icon={PencilEdit01Icon} size={20} />
                    Typography Hierarchy System
                </CardTitle>
                <CardDescription className="text-teal-700">
                    Clear guidance on text sizes, weights, and when to use them
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Page Titles */}
                <div className="bg-white rounded-lg border border-teal-200 p-4">
                    <h3 className="text-sm font-semibold text-teal-900 mb-4">Page Titles</h3>
                    <div className="space-y-3">
                        <div className="border-l-4 border-teal-600 pl-4">
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Work Orders</h1>
                            <code className="text-xs text-teal-700">text-2xl (24px) • font-bold • text-gray-900</code>
                            <p className="text-xs text-gray-600 mt-2">Usage: Main page heading (e.g., "Work Orders", "Assets", "Dashboard")</p>
                        </div>
                    </div>
                </div>

                {/* Section Titles */}
                <div className="bg-white rounded-lg border border-teal-200 p-4">
                    <h3 className="text-sm font-semibold text-teal-900 mb-4">Section Titles</h3>
                    <div className="space-y-3">
                        <div className="border-l-4 border-teal-500 pl-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-1">Recent Activity</h2>
                            <code className="text-xs text-teal-700">text-lg (18px) • font-semibold • text-gray-900</code>
                            <p className="text-xs text-gray-600 mt-2">Usage: Card headers, section dividers, major subsections</p>
                        </div>
                    </div>
                </div>

                {/* Subsection Titles */}
                <div className="bg-white rounded-lg border border-teal-200 p-4">
                    <h3 className="text-sm font-semibold text-teal-900 mb-4">Subsection Titles</h3>
                    <div className="space-y-3">
                        <div className="border-l-4 border-teal-400 pl-4">
                            <h3 className="text-base font-medium text-gray-900 mb-1">Asset Details</h3>
                            <code className="text-xs text-teal-700">text-base (16px) • font-medium • text-gray-900</code>
                            <p className="text-xs text-gray-600 mt-2">Usage: Form sections, table groups, minor subsections</p>
                        </div>
                    </div>
                </div>

                {/* Body Text */}
                <div className="bg-white rounded-lg border border-teal-200 p-4">
                    <h3 className="text-sm font-semibold text-teal-900 mb-4">Body Text</h3>
                    <div className="space-y-3">
                        <div className="border-l-4 border-gray-400 pl-4">
                            <p className="text-sm font-normal text-gray-700 mb-1">
                                This is the standard body text used throughout the application for descriptions, content, and general information.
                            </p>
                            <code className="text-xs text-teal-700">text-sm (14px) • font-normal • text-gray-700</code>
                            <p className="text-xs text-gray-600 mt-2">Usage: Descriptions, help text, table content, most UI text</p>
                        </div>
                    </div>
                </div>

                {/* Labels */}
                <div className="bg-white rounded-lg border border-teal-200 p-4">
                    <h3 className="text-sm font-semibold text-teal-900 mb-4">Labels</h3>
                    <div className="space-y-3">
                        <div className="border-l-4 border-gray-500 pl-4">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Asset Name</label>
                            <code className="text-xs text-teal-700">text-sm (14px) • font-medium • text-gray-700</code>
                            <p className="text-xs text-gray-600 mt-2">Usage: Form labels, table headers, field names</p>
                        </div>
                    </div>
                </div>

                {/* Captions */}
                <div className="bg-white rounded-lg border border-teal-200 p-4">
                    <h3 className="text-sm font-semibold text-teal-900 mb-4">Captions & Metadata</h3>
                    <div className="space-y-3">
                        <div className="border-l-4 border-gray-300 pl-4">
                            <p className="text-xs font-normal text-gray-500 mb-1">
                                Created on Dec 21, 2024 at 3:45 PM
                            </p>
                            <code className="text-xs text-teal-700">text-xs (12px) • font-normal • text-gray-500</code>
                            <p className="text-xs text-gray-600 mt-2">Usage: Timestamps, metadata, hints, secondary information</p>
                        </div>
                    </div>
                </div>

                {/* Text Colors */}
                <div className="bg-white rounded-lg border border-teal-200 p-4">
                    <h3 className="text-sm font-semibold text-teal-900 mb-4">Text Color Hierarchy</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-900 font-medium">Primary Text</span>
                            <code className="text-xs text-teal-700">text-gray-900</code>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">Secondary Text</span>
                            <code className="text-xs text-teal-700">text-gray-700</code>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">Tertiary Text</span>
                            <code className="text-xs text-teal-700">text-gray-600</code>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-500">Muted Text</span>
                            <code className="text-xs text-teal-700">text-gray-500</code>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-400">Disabled Text</span>
                            <code className="text-xs text-teal-700">text-gray-400</code>
                        </div>
                    </div>
                </div>

                <Alert className="border-teal-300 bg-teal-100">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-teal-700" />
                    <AlertTitle className="text-teal-900">Typography Best Practices</AlertTitle>
                    <AlertDescription className="text-teal-800">
                        <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
                            <li>Use text-2xl for page titles only (one per page)</li>
                            <li>Use text-lg for major sections (2-3 per page)</li>
                            <li>Use text-sm for most UI text (body, tables, forms)</li>
                            <li>Use text-xs for metadata and timestamps</li>
                            <li>Maintain consistent color hierarchy (900 → 700 → 600 → 500 → 400)</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default TypographyHierarchySection;
