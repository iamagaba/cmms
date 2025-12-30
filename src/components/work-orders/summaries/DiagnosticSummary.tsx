import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Wrench01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
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
            <div className="text-gray-400 text-sm italic py-2">
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
        <div className="mt-2">
            <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                    <HugeiconsIcon icon={Wrench01Icon} size={12} className="mr-1" />
                    {session.finalCategory || 'General Issue'}
                </span>
                {session.finalSubcategory && (
                    <span className="text-gray-300">/</span>
                )}
                {session.finalSubcategory && (
                    <span className="text-xs text-gray-600 font-medium">
                        {session.finalSubcategory}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-1">
                {issues.length > 0 && (
                    <div className="flex items-start gap-2 text-gray-700 text-sm">
                        <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                            {issues.join(', ')}
                        </span>
                    </div>
                )}

                {session.summary && (
                    <div className="text-gray-600 text-sm mt-2">
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
