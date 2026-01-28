import { CheckCircle, X } from 'lucide-react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";



const FormValidationPatternsSection: React.FC = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const validateEmail = (value: string) => {
        if (!value) {
            setEmailError('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setEmailError('Invalid email format');
        } else {
            setEmailError('');
        }
    };

    return (
        <Card className="border-lime-200 bg-muted">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lime-900">
                    <Tick02Icon className="w-5 h-5" />
                    Form Validation Patterns
                </CardTitle>
                <CardDescription className="text-foreground">
                    Real-time validation and error display patterns
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Real-time Validation */}
                <div className="bg-white rounded-lg border border-lime-200 p-4">
                    <h3 className="text-sm font-semibold text-lime-900 mb-4">Real-time Validation (On Blur)</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email-validation">
                                Email Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email-validation"
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => validateEmail(email)}
                                className={emailError ? 'border-destructive' : ''}
                            />
                            {emailError && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {emailError}
                                </p>
                            )}
                            {!emailError && email && (
                                <p className="text-xs text-foreground flex items-center gap-1">
                                    <CheckCircle className="w-5 h-5" />
                                    Valid email address
                                </p>
                            )}
                        </div>
                        <div className="bg-muted p-3 rounded border border-lime-200">
                            <p className="text-xs text-lime-800">
                                <strong>Best Practice:</strong> Validate on blur (when user leaves field), not on every keystroke. Show success checkmark for valid fields.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Inline Field Errors */}
                <div className="bg-white rounded-lg border border-lime-200 p-4">
                    <h3 className="text-sm font-semibold text-lime-900 mb-4">Inline Field Errors</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title-error">
                                Work Order Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title-error"
                                placeholder="Enter title"
                                className="border-destructive"
                            />
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Title is required
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="asset-error">
                                Asset <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="asset-error"
                                placeholder="Select asset"
                                className="border-destructive"
                            />
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Please select an asset
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Error Alert */}
                <div className="bg-white rounded-lg border border-lime-200 p-4">
                    <h3 className="text-sm font-semibold text-lime-900 mb-4">Form Error Alert (Multiple Errors)</h3>
                    <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle>Unable to save work order</AlertTitle>
                        <AlertDescription>
                            Please fix the following errors:
                            <ul className="list-disc ml-4 mt-2 text-xs space-y-1">
                                <li>Title is required</li>
                                <li>Asset must be selected</li>
                                <li>Due date cannot be in the past</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                    <div className="mt-3 bg-muted p-3 rounded border border-lime-200">
                        <p className="text-xs text-lime-800">
                            Show a summary alert at the top of the form when there are multiple errors. List all errors so users can fix them at once.
                        </p>
                    </div>
                </div>

                {/* Required Fields */}
                <div className="bg-white rounded-lg border border-lime-200 p-4">
                    <h3 className="text-sm font-semibold text-lime-900 mb-4">Required Field Indicators</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="required-1">
                                Asset Name <span className="text-destructive">*</span>
                            </Label>
                            <Input id="required-1" placeholder="Enter asset name" />
                            <p className="text-xs text-gray-500">Required field</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="optional-1">
                                Notes <span className="text-gray-400">(Optional)</span>
                            </Label>
                            <Input id="optional-1" placeholder="Add notes" />
                        </div>
                    </div>
                    <div className="mt-4 bg-muted p-3 rounded border border-lime-200">
                        <p className="text-xs text-lime-800">
                            <strong>Mark required fields with asterisk (*)</strong> in the label. Optionally mark optional fields with "(Optional)" text.
                        </p>
                    </div>
                </div>

                {/* Validation Timing */}
                <div className="bg-white rounded-lg border border-lime-200 p-4">
                    <h3 className="text-sm font-semibold text-lime-900 mb-4">Validation Timing Guidelines</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-muted rounded border border-emerald-200">
                            <CheckCircle className="w-5 h-5 text-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">On Blur (Recommended)</p>
                                <p className="text-xs text-gray-600">Validate when user leaves the field. Best user experience.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">On Submit (Fallback)</p>
                                <p className="text-xs text-gray-600">Validate all fields when form is submitted. Show all errors at once.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-red-50 rounded border border-destructive/20">
                            <X className="w-5 h-5 text-destructive mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">On Change (Avoid)</p>
                                <p className="text-xs text-gray-600">Don't validate on every keystroke - it's annoying and distracting.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complete Form Example */}
                <div className="bg-white rounded-lg border border-lime-200 p-4">
                    <h3 className="text-sm font-semibold text-lime-900 mb-4">Complete Form with Validation</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="complete-title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="complete-title"
                                placeholder="e.g., Replace brake pads"
                                className="border-emerald-500"
                            />
                            <p className="text-xs text-foreground flex items-center gap-1">
                                <CheckCircle className="w-5 h-5" />
                                Valid title
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="complete-asset">
                                Asset <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="complete-asset"
                                placeholder="Select asset"
                                className="border-destructive"
                            />
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Asset is required
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="complete-notes">
                                Notes <span className="text-gray-400">(Optional)</span>
                            </Label>
                            <textarea
                                id="complete-notes"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Add any additional notes..."
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline">Cancel</Button>
                            <Button>Create Work Order</Button>
                        </div>
                    </div>
                </div>

                <Alert className="border-lime-300 bg-muted">
                    <CheckCircle className="w-4 h-4 text-foreground" />
                    <AlertTitle className="text-lime-900">Form Validation Best Practices</AlertTitle>
                    <AlertDescription className="text-lime-800">
                        <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
                            <li>Validate on blur, not on every keystroke</li>
                            <li>Show specific error messages (not just "Invalid")</li>
                            <li>Mark required fields with asterisk (*)</li>
                            <li>Show success indicators for valid fields</li>
                            <li>Display all errors at once on submit</li>
                            <li>Use red border + red text for errors</li>
                            <li>Include icon with error message for visibility</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default FormValidationPatternsSection;




