import { Wrench, AlertCircle } from 'lucide-react';
import React from 'react';


import { DiagnosticSession } from '@/types/diagnostic';

interface DiagnosticSummaryProps {
    data: {
        diagnosticSession: DiagnosticSession | null;
    };
}

export const DiagnosticSummary: React.FC<DiagnosticSummaryProps> = ({ data }) => {
    const session = data.diagnosticSession;

    if (!session) {
        return (
            <div className="text-muted-foreground text-xs italic py-1">
                No diagnostic information provided
            </div>
        );
    }

    // Get relevant issues from answers
    const issues = session.answers
        ?.filter(a => a.answer && a.answer !== 'no')
        .map(a => a.questionText)
        .slice(0, 3) || [];

    return (
        <div className="mt-1">
            <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/5 text-primary border border-primary/20">
                    <Wrench className="w-5 h-5 mr-0.5" />
                    {session.finalCategory || 'General Issue'}
                </span>
                {session.finalSubcategory && (
                    <span className="text-muted-foreground">/</span>
                )}
                {session.finalSubcategory && (
                    <span className="text-xs text-muted-foreground font-medium">
                        {session.finalSubcategory}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-0.5">
                {issues.length > 0 && (
                    <div className="flex items-start gap-1.5 text-foreground text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                            {issues.join(', ')}
                        </span>
                    </div>
                )}

                {session.summary && (
                    <div className="text-muted-foreground text-xs mt-1">
                        <ul className="list-disc list-inside space-y-0.5">
                            {session.summary.split('\n').filter(line => line.trim()).map((line, idx) => (
                                <li key={idx} className="line-clamp-1 leading-relaxed">{line.trim()}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};



