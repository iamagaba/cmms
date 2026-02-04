import { Wrench } from 'lucide-react';
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

    return (
        <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 capitalize">
                    <Wrench className="w-3.5 h-3.5 mr-1.5" />
                    {session.finalCategory && session.finalCategory.length > 20 && session.finalCategory.includes('-')
                        ? 'Engine Problems'
                        : session.finalCategory || 'General Issue'}
                </span>
                {session.finalSubcategory && (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded border border-border/50">
                        {session.finalSubcategory}
                    </span>
                )}
            </div>

            {session.summary && (
                <div className="bg-muted/30 rounded-md border border-border/30 overflow-hidden">
                    {session.summary.split('\n').filter(line => line.trim()).map((line, idx) => {
                        const [question, ...answerParts] = line.split(':');
                        const answer = answerParts.join(':').trim();
                        if (!question || !answer) return null;

                        return (
                            <div key={idx} className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-xs p-2 border-b border-border/30 last:border-0 last:pb-2">
                                <span className="text-muted-foreground font-medium sm:w-1/3 shrink-0">{question.trim()}</span>
                                <span className="text-foreground">{answer}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};



