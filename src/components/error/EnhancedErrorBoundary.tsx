import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useErrorReporting } from './ErrorReporting';

export interface EnhancedErrorBoundaryProps {
    children: React.ReactNode;
    feature?: string;
    level?: 'page' | 'section' | 'component';
    showReporting?: boolean;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function EnhancedErrorBoundary({
    children,
    feature,
    level = 'component',
    showReporting = true,
    fallback,
    onError
}: EnhancedErrorBoundaryProps) {
    const { openErrorReport, ErrorReportingComponent } = useErrorReporting();

    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
        onError?.(error, errorInfo);

        if (showReporting && level === 'page') {
            // Auto-open error reporting for page-level errors
            const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            openErrorReport(error, errorId, feature);
        }
    };

    return (
        <>
            <ErrorBoundary
                feature={feature}
                level={level}
                fallback={fallback}
                onError={handleError}
            >
                {children}
            </ErrorBoundary>
            {ErrorReportingComponent}
        </>
    );
}
