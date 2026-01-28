import { ArrowLeft, CheckCircle, RefreshCw, X, AlertCircle } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";



const ErrorStatesSection: React.FC = () => {
    return (
        <Card className="border-rose-200 bg-rose-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-900">
                    <AlertCircle className="w-5 h-5" />
                    Error States
                </CardTitle>
                <CardDescription className="text-rose-700">
                    Clear error handling patterns for better user experience
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Inline Field Errors */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Inline Field Errors</h3>
                    <div className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <Label htmlFor="error-email">Email Address</Label>
                            <Input
                                id="error-email"
                                type="email"
                                defaultValue="invalid-email"
                                className="border-destructive focus-visible:ring-red-500"
                            />
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Please enter a valid email address
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="error-asset">Asset ID</Label>
                            <Input
                                id="error-asset"
                                className="border-destructive focus-visible:ring-red-500"
                                placeholder="Required field"
                            />
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Asset ID is required
                            </p>
                        </div>
                        <div className="mt-4 bg-rose-50 p-3 rounded border border-rose-200">
                            <code className="text-xs text-rose-800">
                                {`<Input className="border-destructive focus-visible:ring-red-500" />
<p className="text-xs text-destructive flex items-center gap-1">
  <AlertCircle className="w-4 h-4" />
  Error message here
</p>`}
                            </code>
                        </div>
                    </div>
                </div>

                {/* Form Error Alert */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Form Error Alert</h3>
                    <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle>Unable to save work order</AlertTitle>
                        <AlertDescription>
                            Please fix the following errors:
                            <ul className="list-disc ml-4 mt-2 space-y-1">
                                <li>Title is required</li>
                                <li>Asset must be selected</li>
                                <li>Due date cannot be in the past</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                    <div className="mt-4 bg-rose-50 p-3 rounded border border-rose-200">
                        <code className="text-xs text-rose-800">
                            {`<Alert variant="destructive">
  <AlertTitle>Unable to save</AlertTitle>
  <AlertDescription>
    <ul className="list-disc ml-4">
      <li>Error 1</li>
      <li>Error 2</li>
    </ul>
  </AlertDescription>
</Alert>`}
                        </code>
                    </div>
                </div>

                {/* Empty State with Error */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Empty State with Error</h3>
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-destructive" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Failed to load work orders</h3>
                                <p className="text-sm text-gray-600 mt-2">Unable to connect to server</p>
                                <div className="flex items-center justify-center gap-3 mt-4">
                                    <Button variant="outline" size="sm">
                                        <RefreshCw className="w-5 h-5" />
                                        Try Again
                                    </Button>
                                    <Button size="sm">Contact Support</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* API Error Toast */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Error Toast Notification</h3>
                    <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle>Network Error</AlertTitle>
                        <AlertDescription>
                            Failed to update work order status. Please check your connection and try again.
                        </AlertDescription>
                    </Alert>
                    <p className="text-xs text-gray-600 mt-3">
                        Use toast notifications for non-blocking errors that don't require immediate action.
                    </p>
                </div>

                {/* 404 Error State */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">404 Not Found</h3>
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                                <h3 className="text-lg font-semibold text-gray-900">Work Order Not Found</h3>
                                <p className="text-sm text-gray-600 mt-2">
                                    The work order you're looking for doesn't exist or has been deleted.
                                </p>
                                <Button className="mt-4">
                                    <ArrowLeft className="w-5 h-5" />
                                    Back to Work Orders
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Permission Error */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Permission Denied</h3>
                    <Alert variant="destructive">
                        <X className="w-5 h-5" />
                        <AlertTitle>Access Denied</AlertTitle>
                        <AlertDescription>
                            You don't have permission to delete work orders. Contact your administrator for access.
                        </AlertDescription>
                    </Alert>
                </div>

                <Alert className="border-rose-300 bg-rose-100">
                    <CheckCircle className="w-4 h-4 text-rose-700" />
                    <AlertTitle className="text-rose-900">Error State Best Practices</AlertTitle>
                    <AlertDescription className="text-rose-800">
                        <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
                            <li>Be specific: "Email is invalid" not "Error"</li>
                            <li>Be helpful: Explain what went wrong and how to fix it</li>
                            <li>Use red color + icon for visibility</li>
                            <li>Provide action buttons (Try Again, Contact Support)</li>
                            <li>Show inline errors for form fields</li>
                            <li>Use alerts for page-level errors</li>
                            <li>Never show technical error messages to users</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default ErrorStatesSection;



