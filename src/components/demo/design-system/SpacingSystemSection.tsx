import { CheckCircle } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';



const SpacingSystemSection: React.FC = () => {
    return (
        <Card className="border-cyan-200 bg-muted">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-900">
                    <Layout02Icon className="w-5 h-5" />
                    Spacing System
                </CardTitle>
                <CardDescription className="text-foreground">
                    Consistent spacing rules for professional layouts
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Component Internal Spacing */}
                <div className="bg-white rounded-lg border border-cyan-200 p-4">
                    <h3 className="text-sm font-semibold text-cyan-900 mb-4">Component Internal Spacing</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Buttons</p>
                                <p className="text-xs text-gray-600">Horizontal and vertical padding</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">px-4 py-2</code>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Cards</p>
                                <p className="text-xs text-gray-600">All sides padding</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">p-6</code>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Inputs</p>
                                <p className="text-xs text-gray-600">Horizontal and vertical padding</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">px-3 py-2</code>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Badges</p>
                                <p className="text-xs text-gray-600">Compact padding</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">px-2 py-0.5</code>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Table Cells</p>
                                <p className="text-xs text-gray-600">Horizontal and vertical padding</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">px-4 py-3</code>
                        </div>
                    </div>
                </div>

                {/* Layout Spacing */}
                <div className="bg-white rounded-lg border border-cyan-200 p-4">
                    <h3 className="text-sm font-semibold text-cyan-900 mb-4">Layout Spacing</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Between Sections</p>
                                <p className="text-xs text-gray-600">Major page sections</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">space-y-8 (32px)</code>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Between Cards</p>
                                <p className="text-xs text-gray-600">Card grid spacing</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">gap-6 (24px)</code>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Between Form Fields</p>
                                <p className="text-xs text-gray-600">Vertical form spacing</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">space-y-4 (16px)</code>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Between Related Items</p>
                                <p className="text-xs text-gray-600">Buttons, badges, icons</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">gap-2 (8px)</code>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Between List Items</p>
                                <p className="text-xs text-gray-600">Vertical lists</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">space-y-3 (12px)</code>
                        </div>
                    </div>
                </div>

                {/* Page Margins */}
                <div className="bg-white rounded-lg border border-cyan-200 p-4">
                    <h3 className="text-sm font-semibold text-cyan-900 mb-4">Page Margins</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Desktop</p>
                                <p className="text-xs text-gray-600">Horizontal page padding</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">px-6 (24px)</code>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Mobile</p>
                                <p className="text-xs text-gray-600">Horizontal page padding</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">px-4 (16px)</code>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded border border-cyan-200">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Vertical Sections</p>
                                <p className="text-xs text-gray-600">Top and bottom padding</p>
                            </div>
                            <code className="text-xs text-foreground bg-white px-2 py-1 rounded">py-6 (24px)</code>
                        </div>
                    </div>
                </div>

                {/* Spacing Scale */}
                <div className="bg-white rounded-lg border border-cyan-200 p-4">
                    <h3 className="text-sm font-semibold text-cyan-900 mb-4">Spacing Scale (Multiples of 4px)</h3>
                    <div className="space-y-2">
                        {[
                            { value: '0.5', px: '2px', use: 'Minimal spacing (badge padding)' },
                            { value: '1', px: '4px', use: 'Tiny spacing (icon gaps)' },
                            { value: '2', px: '8px', use: 'Small spacing (related items)' },
                            { value: '3', px: '12px', use: 'Base spacing (list items)' },
                            { value: '4', px: '16px', use: 'Medium spacing (form fields)' },
                            { value: '6', px: '24px', use: 'Large spacing (cards, sections)' },
                            { value: '8', px: '32px', use: 'XL spacing (major sections)' },
                            { value: '12', px: '48px', use: '2XL spacing (page sections)' },
                        ].map((item) => (
                            <div key={item.value} className="flex items-center gap-3 p-2 bg-muted rounded">
                                <div className="w-16 flex items-center justify-center">
                                    <div
                                        className="bg-cyan-600 h-4"
                                        style={{ width: item.px }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs text-foreground font-semibold">{item.value}</code>
                                        <span className="text-xs text-gray-500">({item.px})</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{item.use}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Alert className="border-cyan-300 bg-muted">
                    <CheckCircle className="w-4 h-4 text-foreground" />
                    <AlertTitle className="text-cyan-900">Spacing Rules of Thumb</AlertTitle>
                    <AlertDescription className="text-cyan-800">
                        <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
                            <li>Always use multiples of 4px (4, 8, 12, 16, 24, 32, 48, 64)</li>
                            <li>Smaller spacing (gap-2, gap-3) for related items</li>
                            <li>Medium spacing (gap-4, gap-6) for form fields and cards</li>
                            <li>Larger spacing (gap-8, gap-12) for major sections</li>
                            <li>Consistent spacing creates visual rhythm and professionalism</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default SpacingSystemSection;


