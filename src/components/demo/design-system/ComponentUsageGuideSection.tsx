import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';

const ComponentUsageGuideSection: React.FC = () => {
    return (
        <Card className="border-primary bg-accent">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HugeiconsIcon icon={InformationCircleIcon} size={20} />
                    Component Selection Guide
                </CardTitle>
                <CardDescription>
                    Practical guidance on when to use each component (no designer needed!)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="buttons" className="border">
                        <AccordionTrigger className="text-sm font-semibold">
                            When to use each button variant?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm space-y-2">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Button size="sm">Primary</Button>
                                    <div>
                                        <p className="font-medium">Primary (default)</p>
                                        <p className="text-xs">Main actions: Create Work Order, Save, Submit, Confirm</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Button size="sm" variant="secondary">Secondary</Button>
                                    <div>
                                        <p className="font-medium">Secondary</p>
                                        <p className="text-xs">Alternative actions: Cancel, Back, Close</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Button size="sm" variant="outline">Outline</Button>
                                    <div>
                                        <p className="font-medium">Outline</p>
                                        <p className="text-xs">Less prominent actions: View Details, Export, Filter</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Button size="sm" variant="destructive">Destructive</Button>
                                    <div>
                                        <p className="font-medium">Destructive</p>
                                        <p className="text-xs">Dangerous actions: Delete, Remove, Cancel Order</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Button size="sm" variant="ghost">Ghost</Button>
                                    <div>
                                        <p className="font-medium">Ghost</p>
                                        <p className="text-xs">Tertiary actions: Icon buttons, table row actions</p>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="badges" className="border">
                        <AccordionTrigger className="text-sm font-semibold">
                            When to use badges vs buttons?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm">
                            <div className="space-y-3">
                                <div>
                                    <p className="font-medium mb-1">Use Badges for:</p>
                                    <ul className="text-xs space-y-1 ml-4 list-disc">
                                        <li>Status indicators (Open, In Progress, Completed)</li>
                                        <li>Priority levels (Critical, High, Medium, Low)</li>
                                        <li>Categories and tags</li>
                                        <li>Read-only information</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Use Buttons for:</p>
                                    <ul className="text-xs space-y-1 ml-4 list-disc">
                                        <li>Actions that trigger something</li>
                                        <li>Navigation</li>
                                        <li>Form submissions</li>
                                        <li>Interactive elements</li>
                                    </ul>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="dialogs" className="border-purple-200">
                        <AccordionTrigger className="text-sm font-semibold text-purple-900">
                            Dialog vs Popover vs Dropdown?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-purple-800">
                            <div className="space-y-3">
                                <div>
                                    <p className="font-medium mb-1">Dialog (Modal):</p>
                                    <p className="text-xs">Forms, confirmations, important messages that require user attention</p>
                                    <p className="text-xs text-purple-600 mt-1">Example: Create Work Order, Delete Confirmation</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Popover:</p>
                                    <p className="text-xs">Additional information, help text, non-critical content</p>
                                    <p className="text-xs text-purple-600 mt-1">Example: Field descriptions, tooltips</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Dropdown Menu:</p>
                                    <p className="text-xs">List of actions or options</p>
                                    <p className="text-xs text-purple-600 mt-1">Example: Row actions, bulk operations, filters</p>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="forms" className="border-purple-200">
                        <AccordionTrigger className="text-sm font-semibold text-purple-900">
                            Which form component should I use?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-purple-800">
                            <div className="space-y-3">
                                <div>
                                    <p className="font-medium mb-1">Input:</p>
                                    <p className="text-xs">Single-line text (name, email, asset ID)</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Textarea:</p>
                                    <p className="text-xs">Multi-line text (descriptions, notes, comments)</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Select:</p>
                                    <p className="text-xs">Choose one from many options (status, priority, technician)</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Checkbox:</p>
                                    <p className="text-xs">Multiple selections or boolean (send notification, urgent)</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Radio:</p>
                                    <p className="text-xs">Choose one from few options (maintenance type: preventive/corrective)</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Switch:</p>
                                    <p className="text-xs">Toggle settings on/off (enable notifications, auto-assign)</p>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Slider:</p>
                                    <p className="text-xs">Numeric ranges (budget, priority score, completion %)</p>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default ComponentUsageGuideSection;
