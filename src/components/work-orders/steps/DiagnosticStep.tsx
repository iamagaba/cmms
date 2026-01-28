import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Edit, FileText } from 'lucide-react';
import { Stack, Card } from '@/components/tailwind-components';
import { Button } from '@/components/ui/button';
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
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-foreground w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-xs text-foreground mb-0.5">Diagnostic Complete</h4>
                <p className="text-xs text-muted-foreground">
                  Category: <span className="font-medium">{data.diagnosticSession.finalCategory}</span>
                  {data.diagnosticSession.finalSubcategory && (
                    <> • Subcategory: <span className="font-medium">{data.diagnosticSession.finalSubcategory}</span></>
                  )}
                </p>
              </div>
            </div>

            {/* Solution Status */}
            {data.diagnosticSession.solutionFound && (
              <div className={`p-2 rounded-lg ${data.diagnosticSession.solutionSuccessful
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-amber-50 border border-amber-200'
                }`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {data.diagnosticSession.solutionSuccessful ? (
                    <CheckCircle className="w-4 h-4 text-foreground" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                  )}
                  <span className={`text-xs font-medium ${data.diagnosticSession.solutionSuccessful ? 'text-foreground' : 'text-amber-700'
                    }`}>
                    Solution {data.diagnosticSession.solutionSuccessful ? 'Successful' : 'Attempted'}
                  </span>
                </div>
                <p className={`text-xs ${data.diagnosticSession.solutionSuccessful ? 'text-foreground' : 'text-amber-700'
                  }`}>
                  {data.diagnosticSession.solutionText}
                </p>
              </div>
            )}

            {/* Issue Summary */}
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-1">Issue Description:</h5>
              <div className="bg-muted rounded-lg p-2">
                <ul className="text-xs text-foreground space-y-0.5 list-disc list-inside">
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
            >
              <Edit className="w-4 h-4 mr-1.5" />
              Edit Diagnostic
            </Button>
          </Stack>
        </Card>
      ) : (
        <Card p="lg" className="text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-2">No diagnostic completed yet</p>
          <Button onClick={() => setShowDiagnostic(true)} size="sm">
            Start Diagnostic
          </Button>
        </Card>
      )}

    </Stack>
  );
};


