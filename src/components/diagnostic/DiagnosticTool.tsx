import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loading03Icon, AlertCircleIcon, StarIcon, CheckmarkCircle01Icon, Cancel01Icon, ArrowLeft01Icon, InformationCircleIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Stack, Button, Group, Card } from '@/components/tailwind-components';
import { DiagnosticSession, DiagnosticAnswer, DiagnosticOption } from '@/types/diagnostic';
import { getQuestionByLogicalId } from '@/api/diagnosticConfigApi';
import { v4 as uuidv4 } from 'uuid';

interface DiagnosticToolProps {
  onComplete: (session: DiagnosticSession) => void;
  onCancel: () => void;
  initialSession?: DiagnosticSession;
}

export const DiagnosticTool: React.FC<DiagnosticToolProps> = ({
  onComplete,
  onCancel,
  initialSession
}) => {
  const [session, setSession] = useState<DiagnosticSession>(
    initialSession || {
      id: uuidv4(),
      startedAt: new Date().toISOString(),
      answers: [],
      summary: '',
      currentQuestionId: 'START',
      questionQueue: []
    }
  );

  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>('');
  const [showSolution, setShowSolution] = useState(false);
  const [solutionOption, setSolutionOption] = useState<DiagnosticOption | null>(null);

  // Fetch current question
  const { data: currentQuestion, isLoading, error } = useQuery({
    queryKey: ['diagnosticQuestion', session.currentQuestionId],
    queryFn: () => getQuestionByLogicalId(session.currentQuestionId),
    retry: 1,
    enabled: !!session.currentQuestionId
  });

  const progress = Math.min(100, (session.answers.length / 5) * 100);

  const handleAnswer = (answer: string | string[]) => {
    if (!currentQuestion) return;

    const selectedOption = typeof answer === 'string'
      ? currentQuestion.options?.find((opt: DiagnosticOption) => opt.id === answer)
      : undefined;

    // Check if this answer leads to a solution
    if (selectedOption?.isSolution) {
      setSolutionOption(selectedOption);
      setShowSolution(true);
      setCurrentAnswer(answer);
      return;
    }

    // Add answer to session
    const newAnswer: DiagnosticAnswer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      answer: typeof answer === 'string' ? selectedOption?.label || answer : answer,
      selectedOption,
      timestamp: new Date().toISOString()
    };

    const updatedAnswers = [...session.answers, newAnswer];

    // Logic for determining next question
    let nextQuestionId = selectedOption?.nextQuestionId || (currentQuestion as any).nextQuestionId;
    let newQueue = session.questionQueue ? [...session.questionQueue] : [];

    // If options has follow-ups, prepend them to the queue
    if (selectedOption?.followups && selectedOption.followups.length > 0) {
      const followUpIds = selectedOption.followups.map(f => f.id);
      if (nextQuestionId) {
        newQueue = [...followUpIds, nextQuestionId, ...newQueue];
      } else {
        newQueue = [...followUpIds, ...newQueue];
      }
    } else {
      // If no next question ID but we have a queue, consume the queue
      if (!nextQuestionId && newQueue.length > 0) {
        nextQuestionId = newQueue.shift();
      }
    }

    // If still no next Id (and queue empty or just consumed), we are done?
    // Wait, the logic above for consuming queue was conditional.
    // Let's refine:

    if (!nextQuestionId && newQueue.length > 0) {
      nextQuestionId = newQueue.shift();
    }

    if (!nextQuestionId) {
      // End of diagnostic flow
      completeSession(updatedAnswers, selectedOption);
    } else {
      setSession({
        ...session,
        answers: updatedAnswers,
        currentQuestionId: nextQuestionId,
        questionQueue: newQueue,
        finalCategory: selectedOption?.category || session.finalCategory,
        finalSubcategory: selectedOption?.subcategory || session.finalSubcategory
      });
      setCurrentAnswer('');
    }
  };

  const handleSolutionResponse = (successful: boolean) => {
    if (!solutionOption) return;

    const newAnswer: DiagnosticAnswer = {
      questionId: currentQuestion?.id || '',
      questionText: currentQuestion?.text || '',
      answer: solutionOption.label,
      selectedOption: solutionOption,
      timestamp: new Date().toISOString()
    };

    const updatedAnswers = [...session.answers, newAnswer];

    completeSession(updatedAnswers, solutionOption, true, successful);
  };

  const completeSession = (
    answers: DiagnosticAnswer[],
    lastOption?: DiagnosticOption,
    solutionAttempted: boolean = false,
    solutionSuccessful: boolean = false
  ) => {
    const summary = generateSummary(
      answers.map(a => ({ questionText: a.questionText, answer: a.answer }))
    );

    const completedSession: DiagnosticSession = {
      ...session,
      answers,
      completedAt: new Date().toISOString(),
      finalCategory: lastOption?.category || session.finalCategory || 'other',
      finalSubcategory: lastOption?.subcategory || session.finalSubcategory || 'unknown',
      solutionFound: solutionAttempted,
      solutionText: solutionOption?.solutionText,
      solutionSteps: solutionOption?.solutionSteps,
      solutionAttempted,
      solutionSuccessful,
      summary
    };

    onComplete(completedSession);
  };

  const handleBack = () => {
    if (showSolution) {
      setShowSolution(false);
      setSolutionOption(null);
      return;
    }

    if (session.answers.length === 0) {
      onCancel();
      return;
    }

    const previousAnswers = session.answers.slice(0, -1);
    const previousQuestionId = previousAnswers.length > 0
      ? previousAnswers[previousAnswers.length - 1].questionId
      : 'START';

    setSession({
      ...session,
      answers: previousAnswers,
      currentQuestionId: previousQuestionId
    });
    setCurrentAnswer('');
  };

  function generateSummary(answers: Array<{ questionText: string; answer: string | string[] }>): string {
    return answers.map(a => {
      const ans = Array.isArray(a.answer) ? a.answer.join(', ') : a.answer;
      return `${a.questionText}: ${ans}`;
    }).join('\n');
  }

  if (isLoading) {
    return (
      <Card p="lg" className="flex justify-center py-6">
        <HugeiconsIcon icon={Loading03Icon} size={24} className="animate-spin text-primary-600" />
      </Card>
    );
  }

  if (error || !currentQuestion) {
    return (
      <Card p="lg" className="text-center">
        <HugeiconsIcon icon={AlertCircleIcon} size={32} className="text-red-500 mx-auto mb-2" />
        <p className="text-xs text-gray-700">
          {error ? 'Failed to load question.' : 'Diagnostic question not found.'}
        </p>
        <p className="text-[10px] text-gray-500 mt-1">ID: {session.currentQuestionId}</p>
        <Button onClick={onCancel} className="mt-2" size="xs">Close</Button>
      </Card>
    );
  }

  // Solution Screen
  if (showSolution && solutionOption) {
    return (
      <Card p="md" shadow="md">
        <Stack gap="sm">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <HugeiconsIcon icon={StarIcon} size={16} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Possible Solution Found</h3>
              <p className="text-[10px] text-gray-500">Try this troubleshooting step</p>
            </div>
          </div>

          {/* Solution */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <h4 className="font-semibold text-xs text-blue-900 mb-2">{solutionOption.solutionText}</h4>
            {solutionOption.solutionSteps && (
              <ol className="space-y-1">
                {solutionOption.solutionSteps.map((step, index) => (
                  <li key={index} className="flex gap-1.5 text-[10px] text-blue-800">
                    <span className="font-semibold">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Question */}
          <div className="text-center py-2">
            <p className="text-xs text-gray-700 font-medium mb-2">Did this solve the problem?</p>
            <Group justify="center" gap="xs">
              <Button
                variant="filled"
                size="xs"
                onClick={() => handleSolutionResponse(true)}
                leftSection={<HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />}
                className="bg-green-600 hover:bg-green-700"
              >
                Yes, Issue Resolved
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleSolutionResponse(false)}
                leftSection={<HugeiconsIcon icon={Cancel01Icon} size={12} />}
              >
                No, Still Having Issues
              </Button>
            </Group>
          </div>

          {/* Back Button */}
          <Button variant="subtle" size="xs" onClick={handleBack} className="w-full">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={10} className="mr-1" />
            Go Back
          </Button>
        </Stack>
      </Card>
    );
  }

  // Question Screen
  return (
    <Card p="sm" shadow="md" className="overflow-hidden">
      <Stack gap="sm">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Diagnostic Progress</span>
            <span className="text-[10px] text-gray-500">Step {session.answers.length + 1}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-primary-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Question */}
            <div className="mb-3">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HugeiconsIcon icon={InformationCircleIcon} size={12} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-900 mb-0.5">
                    {currentQuestion.text}
                  </h3>
                  {currentQuestion.helpText && (
                    <p className="text-[10px] text-gray-500">{currentQuestion.helpText}</p>
                  )}
                </div>
              </div>

              {/* Answer Options */}
              {currentQuestion.type === 'single-choice' && currentQuestion.options && (
                <Stack gap="xs">
                  {currentQuestion.options.map((option: DiagnosticOption) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      className="w-full text-left px-2.5 py-2 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs text-gray-900 group-hover:text-primary-700 transition-colors">{option.label}</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </Stack>
              )}

              {currentQuestion.type === 'yes-no' && currentQuestion.options && (
                <Group gap="xs">
                  {currentQuestion.options.map((option: DiagnosticOption) => (
                    <Button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      variant="outline"
                      size="xs"
                      className="flex-1 hover:bg-primary-50 hover:border-primary-500 hover:text-primary-700 transition-all"
                    >
                      {option.label}
                    </Button>
                  ))}
                </Group>
              )}

              {currentQuestion.type === 'text-input' && (
                <div>
                  <textarea
                    value={currentAnswer as string}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    rows={3}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Button
                    onClick={() => handleAnswer(currentAnswer)}
                    disabled={!currentAnswer}
                    size="xs"
                    className="mt-2"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <Group justify="space-between" className="pt-1.5 border-t border-gray-100 mt-1">
          <Button variant="subtle" size="xs" onClick={handleBack} disabled={session.answers.length === 0}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={10} className="mr-1" />
            Back
          </Button>
          <Button variant="outline" size="xs" onClick={onCancel}>
            Cancel
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default DiagnosticTool;
