import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle01Icon, AlertCircleIcon, PencilEdit02Icon, NoteIcon } from '@hugeicons/core-free-icons';
import { Stack, Button, Card } from '@/components/tailwind-components';
import { DiagnosticTool } from '@/components/diagnostic/DiagnosticTool';
import { DiagnosticSession } from '@/types/diagnostic';

interface DiagnosticStepProps {
  data: {
    diagnosticSession: DiagnosticSession | null;
  };
  onChange: (updates: any) => void;
}

export const DiagnosticStep: React.FC<DiagnosticStepProps> = ({
  data,
  onChange
}) => {
  const [showDiagnostic, setShowDiagnostic] = useState(!data.diagnosticSession);

  const handleDiagnosticComplete = (session: DiagnosticSession) => {
    onChange({ diagnosticSession: session });
    setShowDiagnostic(false);

    // Auto-suggest priority based on diagnostic
    if (session.finalCategory === 'brakes' || session.finalCategory === 'engine') {
      onChange({ priority: 'high' });
    } else if (session.solutionSuccessful) {
      onChange({ priority: 'low' });
    }
  };

  const handleEditDiagnostic = () => {
    setShowDiagnostic(true);
  };

  return (
    <Stack gap="sm">
      {showDiagnostic ? (
        <DiagnosticTool
          onComplete={handleDiagnosticComplete}
          onCancel={() => setShowDiagnostic(false)}
          initialSession={data.diagnosticSession || undefined}
        />
      ) : data.diagnosticSession ? (
        <Card p="lg" shadow="sm">
          <Stack gap="md">
            {/* Diagnostic Summary */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="text-green-600" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Diagnostic Complete</h4>
                <p className="text-sm text-gray-600">
                  Category: <span className="font-medium">{data.diagnosticSession.finalCategory}</span>
                  {data.diagnosticSession.finalSubcategory && (
                    <> • Subcategory: <span className="font-medium">{data.diagnosticSession.finalSubcategory}</span></>
                  )}
                </p>
              </div>
            </div>

            {/* Solution Status */}
            {data.diagnosticSession.solutionFound && (
              <div className={`p-3 rounded-lg ${data.diagnosticSession.solutionSuccessful
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
                }`}>
                <div className="flex items-center gap-2 mb-1">
                  <HugeiconsIcon
                    icon={data.diagnosticSession.solutionSuccessful ? CheckmarkCircle01Icon : AlertCircleIcon}
                    className={data.diagnosticSession.solutionSuccessful ? 'text-green-600' : 'text-yellow-600'}
                    size={16}
                  />
                  <span className={`text-sm font-medium ${data.diagnosticSession.solutionSuccessful ? 'text-green-900' : 'text-yellow-900'
                    }`}>
                    Solution {data.diagnosticSession.solutionSuccessful ? 'Successful' : 'Attempted'}
                  </span>
                </div>
                <p className={`text-xs ${data.diagnosticSession.solutionSuccessful ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                  {data.diagnosticSession.solutionText}
                </p>
              </div>
            )}

            {/* Issue Summary */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Issue Description:</h5>
              <div className="bg-gray-50 rounded-lg p-3">
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  {data.diagnosticSession.summary.split('\n').filter(line => line.trim()).map((line, idx) => (
                    <li key={idx} className="leading-relaxed">{line.trim()}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditDiagnostic}
              leftSection={<HugeiconsIcon icon={PencilEdit02Icon} size={16} />}
            >
              Edit Diagnostic
            </Button>
          </Stack>
        </Card>
      ) : (
        <Card p="lg" className="text-center">
          <HugeiconsIcon icon={NoteIcon} className="text-gray-400 mx-auto mb-3" size={48} />
          <p className="text-gray-600 mb-4">No diagnostic completed yet</p>
          <Button onClick={() => setShowDiagnostic(true)}>
            Start Diagnostic
          </Button>
        </Card>
      )}

    </Stack>
  );
};
