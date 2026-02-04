import React, { useState } from 'react';
import { CheckCircle, AlertCircle, FileText } from 'lucide-react';
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
    <div className="space-y-4">
      {showDiagnostic ? (
        <DiagnosticTool
          onComplete={handleDiagnosticComplete}
          onCancel={() => setShowDiagnostic(false)}
          initialSession={data.diagnosticSession || undefined}
        />
      ) : data.diagnosticSession ? (
        <div className="bg-background rounded-lg border border-border/60 shadow-sm overflow-hidden group">
          {/* Header Strip - "Ticket" Look */}
          <div className="bg-muted/30 border-b border-border/60 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Diagnostic Report</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditDiagnostic}
              className="h-6 text-[10px] uppercase font-bold text-primary hover:text-primary/80 hover:bg-primary/10 -mr-2"
            >
              Modify
            </Button>
          </div>

          <div className="p-3 space-y-3">
            {/* Main Result */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                <CheckCircle className="text-emerald-600 w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-brand font-bold text-base text-foreground capitalize">
                    {/* Check if finalCategory looks like a UUID and provide fallback */}
                    {data.diagnosticSession.finalCategory &&
                      data.diagnosticSession.finalCategory.length > 20 &&
                      data.diagnosticSession.finalCategory.includes('-')
                      ? 'Engine Problems'
                      : data.diagnosticSession.finalCategory || 'General Issue'}
                  </h4>
                  {data.diagnosticSession.finalSubcategory && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">
                      {data.diagnosticSession.finalSubcategory}
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Issue Description</p>
                  <div className="bg-muted/30 rounded-md overflow-hidden border border-border/20">
                    {data.diagnosticSession.summary.split('\n').filter(line => line.trim()).map((line, i) => {
                      const [question, ...answerParts] = line.split(':');
                      const answer = answerParts.join(':').trim();
                      if (!question || !answer) return <div key={i} className="p-2 text-xs text-muted-foreground">{line}</div>;

                      return (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-2.5 border-b border-border/40 last:border-0 hover:bg-muted/40 transition-colors">
                          <span className="text-[11px] font-medium text-muted-foreground sm:w-1/3 shrink-0">{question.trim()}</span>
                          <span className="text-xs font-medium text-foreground">{answer}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Solution Status */}
            {data.diagnosticSession.solutionFound && (
              <div className={`py-2 px-3 rounded text-xs font-medium flex items-center justify-between ${data.diagnosticSession.solutionSuccessful
                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                }`}>
                <span className="flex items-center gap-2">
                  {data.diagnosticSession.solutionSuccessful ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {data.diagnosticSession.solutionText}
                </span>
                <span className="uppercase tracking-wider text-[10px] font-bold opacity-80">
                  {data.diagnosticSession.solutionSuccessful ? 'Resolved' : 'Attempted'}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowDiagnostic(true)}
          className="w-full group relative overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 hover:bg-muted/10 hover:border-primary/50 transition-all duration-300 p-8 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-background border border-border shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300">
              <FileText className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-brand font-bold text-foreground text-sm mt-2">Start New Diagnostic</h3>
            <p className="text-xs text-muted-foreground max-w-[200px]">Run the diagnostic tool to identify issues and suggested services</p>
          </div>
        </button>
      )}

    </div>
  );
};


