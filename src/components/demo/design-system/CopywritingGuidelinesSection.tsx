import { CheckCircle, ClipboardList, User, X, Package } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';



const CopywritingGuidelinesSection: React.FC = () => {
    return (
        <Card className="border-pink-200 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-900">
                    <PencilEdit01Icon className="w-5 h-5" />
                    Professional Copywriting Guidelines
                </CardTitle>
                <CardDescription className="text-primary">
                    Write clear, concise, professional text for buttons, labels, and messages
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Core Principles */}
                <div className="bg-white rounded-lg border border-pink-200 p-4">
                    <h3 className="text-sm font-semibold text-pink-900 mb-3">Core Principles</h3>
                    <div className="space-y-2 text-sm text-pink-800">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Be Concise</p>
                                <p className="text-xs">Use the minimum words needed. Remove filler words.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Be Direct</p>
                                <p className="text-xs">Start with the action verb. Avoid passive voice.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Be Consistent</p>
                                <p className="text-xs">Use the same terms throughout the app.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Be Professional</p>
                                <p className="text-xs">Avoid casual language, emojis, or exclamation marks.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Button Text */}
                <div>
                    <h3 className="text-sm font-semibold text-pink-900 mb-3">Button Text</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-emerald-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-foreground" />
                                <p className="text-foreground font-semibold text-sm">Good</p>
                            </div>
                            <div className="space-y-2">
                                <Button size="sm">Create</Button>
                                <Button size="sm">Save</Button>
                                <Button size="sm">Delete</Button>
                                <Button size="sm">Assign Technician</Button>
                                <Button size="sm">Export Data</Button>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Clear action verbs. No unnecessary words.
                            </p>
                        </div>
                        <div className="border-2 border-destructive bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-destructive" />
                                <p className="text-destructive font-semibold text-sm">Bad</p>
                            </div>
                            <div className="space-y-2">
                                <Button size="sm" variant="outline">Create New Item</Button>
                                <Button size="sm" variant="outline">Save Changes Now</Button>
                                <Button size="sm" variant="outline">Delete This Item</Button>
                                <Button size="sm" variant="outline">Please Assign a Technician</Button>
                                <Button size="sm" variant="outline">Export Your Data</Button>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Too wordy. Unnecessary filler words.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table Headers */}
                <div>
                    <h3 className="text-sm font-semibold text-pink-900 mb-3">Table Headers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-emerald-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-foreground" />
                                <p className="text-foreground font-semibold text-sm">Good</p>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Asset</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Assigned To</TableHead>
                                            <TableHead>Due Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Short, scannable. No articles (a, the).
                            </p>
                        </div>
                        <div className="border-2 border-destructive bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-destructive" />
                                <p className="text-destructive font-semibold text-sm">Bad</p>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">Work Order ID</TableHead>
                                            <TableHead className="text-xs">Asset Name</TableHead>
                                            <TableHead className="text-xs">Current Status</TableHead>
                                            <TableHead className="text-xs">Assigned Technician</TableHead>
                                            <TableHead className="text-xs">Due Date/Time</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Too verbose. Redundant words.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Labels */}
                <div>
                    <h3 className="text-sm font-semibold text-pink-900 mb-3">Form Labels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-emerald-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-foreground" />
                                <p className="text-foreground font-semibold text-sm">Good</p>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label>Title</Label>
                                    <Input placeholder="Enter title" size="sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Asset</Label>
                                    <Input placeholder="Select asset" size="sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Priority</Label>
                                    <Input placeholder="Select priority" size="sm" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Simple nouns. Clear and direct.
                            </p>
                        </div>
                        <div className="border-2 border-destructive bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-destructive" />
                                <p className="text-destructive font-semibold text-sm">Bad</p>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Please Enter the Work Order Title</Label>
                                    <Input placeholder="Type your title here..." size="sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Select an Asset from the List</Label>
                                    <Input placeholder="Choose which asset..." size="sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Choose the Priority Level</Label>
                                    <Input placeholder="What priority level..." size="sm" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Too instructional. Overly polite.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <div>
                    <h3 className="text-sm font-semibold text-pink-900 mb-3">Navigation Items</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-emerald-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-foreground" />
                                <p className="text-foreground font-semibold text-sm">Good</p>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                    <ClipboardList className="w-5 h-5" />
                                    <span>Work Orders</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                    <Car className="w-4 h-4" />
                                    <span>Assets</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                    <Package className="w-4 h-4" />
                                    <span>Inventory</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                    <User className="w-5 h-5" />
                                    <span>Technicians</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Plural nouns. Consistent pattern.
                            </p>
                        </div>
                        <div className="border-2 border-destructive bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-destructive" />
                                <p className="text-destructive font-semibold text-sm">Bad</p>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                    <ClipboardList className="w-5 h-5" />
                                    <span>View All Work Orders</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                    <Car className="w-4 h-4" />
                                    <span>Manage Your Assets</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                    <Package className="w-4 h-4" />
                                    <span>Inventory Management</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                    <User className="w-5 h-5" />
                                    <span>Technician List</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Inconsistent. Too descriptive.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Messages */}
                <div>
                    <h3 className="text-sm font-semibold text-pink-900 mb-3">Status & Error Messages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-emerald-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-foreground" />
                                <p className="text-foreground font-semibold text-sm">Good</p>
                            </div>
                            <div className="space-y-2">
                                <Alert>
                                    <AlertTitle className="text-sm">Work order created</AlertTitle>
                                    <AlertDescription className="text-xs">WO-2024-001 has been assigned to John Doe</AlertDescription>
                                </Alert>
                                <Alert variant="destructive">
                                    <AlertTitle className="text-sm">Unable to save changes</AlertTitle>
                                    <AlertDescription className="text-xs">Asset ID is required</AlertDescription>
                                </Alert>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Clear, specific, actionable.
                            </p>
                        </div>
                        <div className="border-2 border-destructive bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-destructive" />
                                <p className="text-destructive font-semibold text-sm">Bad</p>
                            </div>
                            <div className="space-y-2">
                                <Alert>
                                    <AlertTitle className="text-sm">Success!</AlertTitle>
                                    <AlertDescription className="text-xs">Your work order has been successfully created and saved to the system</AlertDescription>
                                </Alert>
                                <Alert variant="destructive">
                                    <AlertTitle className="text-sm">Oops! Something went wrong</AlertTitle>
                                    <AlertDescription className="text-xs">We couldn't save your changes. Please try again</AlertDescription>
                                </Alert>
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Vague, overly casual, not specific.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Empty States */}
                <div>
                    <h3 className="text-sm font-semibold text-pink-900 mb-3">Empty States</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-2 border-emerald-500 bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-4 h-4 text-foreground" />
                                <p className="text-foreground font-semibold text-sm">Good</p>
                            </div>
                            <Card>
                                <CardContent className="py-8">
                                    <div className="text-center">
                                        <InboxIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <h4 className="text-sm font-medium text-gray-900">No work orders</h4>
                                        <p className="text-xs text-gray-500 mt-1">Create your first work order to get started</p>
                                        <Button size="sm" className="mt-3">Create Work Order</Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <p className="text-xs text-gray-600 mt-3">
                                Concise, clear next action.
                            </p>
                        </div>
                        <div className="border-2 border-destructive bg-white p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <X className="w-4 h-4 text-destructive" />
                                <p className="text-destructive font-semibold text-sm">Bad</p>
                            </div>
                            <Card>
                                <CardContent className="py-8">
                                    <div className="text-center">
                                        <InboxIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <h4 className="text-sm font-medium text-gray-900">You don't have any work orders yet!</h4>
                                        <p className="text-xs text-gray-500 mt-1">It looks like you haven't created any work orders. Would you like to create one now?</p>
                                        <Button size="sm" className="mt-3">Click Here to Create Your First Work Order</Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <p className="text-xs text-gray-600 mt-3">
                                Too conversational, wordy button.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Reference Table */}
                <div className="bg-white rounded-lg border border-pink-200 p-4">
                    <h3 className="text-sm font-semibold text-pink-900 mb-3">Quick Reference: Common Terms</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Use This</TableHead>
                                    <TableHead>Not This</TableHead>
                                    <TableHead>Context</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="text-xs">
                                <TableRow>
                                    <TableCell className="font-medium">Create</TableCell>
                                    <TableCell className="text-destructive">Create New, Add New</TableCell>
                                    <TableCell>Buttons</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Save</TableCell>
                                    <TableCell className="text-destructive">Save Changes, Submit</TableCell>
                                    <TableCell>Form buttons</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Delete</TableCell>
                                    <TableCell className="text-destructive">Remove, Delete This</TableCell>
                                    <TableCell>Destructive actions</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Assign</TableCell>
                                    <TableCell className="text-destructive">Assign To, Please Assign</TableCell>
                                    <TableCell>Assignment actions</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Work Orders</TableCell>
                                    <TableCell className="text-destructive">All Work Orders, Work Order List</TableCell>
                                    <TableCell>Navigation</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Status</TableCell>
                                    <TableCell className="text-destructive">Current Status, Status Type</TableCell>
                                    <TableCell>Table headers</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Due Date</TableCell>
                                    <TableCell className="text-destructive">Due Date/Time, When Due</TableCell>
                                    <TableCell>Table headers</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Assigned To</TableCell>
                                    <TableCell className="text-destructive">Assigned Technician, Who's Assigned</TableCell>
                                    <TableCell>Table headers</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Words to Avoid */}
                <Alert className="border-pink-300 bg-primary/10">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <AlertTitle className="text-pink-900">Words & Phrases to Avoid</AlertTitle>
                    <AlertDescription className="text-pink-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-xs">
                            <div>
                                <p className="font-medium mb-1">Filler Words:</p>
                                <ul className="space-y-0.5 ml-4 list-disc">
                                    <li>Please, Kindly</li>
                                    <li>Your, The, A, An</li>
                                    <li>Now, Here, There</li>
                                    <li>Just, Simply, Easily</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium mb-1">Casual Language:</p>
                                <ul className="space-y-0.5 ml-4 list-disc">
                                    <li>Oops, Uh-oh, Yay</li>
                                    <li>Click here, Tap here</li>
                                    <li>Awesome, Great, Cool</li>
                                    <li>Exclamation marks (!)</li>
                                </ul>
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>

                {/* Writing Checklist */}
                <div className="bg-white rounded-lg border border-pink-200 p-4">
                    <h3 className="text-sm font-semibold text-pink-900 mb-3">Copywriting Checklist</h3>
                    <div className="space-y-2 text-xs text-pink-800">
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 mt-0.5" />
                            <span>Removed all filler words (please, your, the, just, etc.)</span>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 mt-0.5" />
                            <span>Used active voice (not passive)</span>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 mt-0.5" />
                            <span>Started with action verb for buttons</span>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 mt-0.5" />
                            <span>Kept labels to 1-2 words maximum</span>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 mt-0.5" />
                            <span>Used consistent terminology throughout</span>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 mt-0.5" />
                            <span>Avoided casual language and emojis</span>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 mt-0.5" />
                            <span>Made error messages specific and actionable</span>
                        </label>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CopywritingGuidelinesSection;



