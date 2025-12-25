import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuestions, getAllOptions, getAllFollowupQuestions } from '@/api/diagnosticConfigApi';
import { Icon } from '@iconify/react';
import { DiagnosticQuestionRow, DiagnosticOptionRow, DiagnosticFollowupQuestionRow } from '@/types/diagnostic';

interface TreeNodeProps {
    questionId: string;
    questions: Map<string, DiagnosticQuestionRow>;
    optionsByQuestion: Map<string, DiagnosticOptionRow[]>;
    followupsByOption: Map<string, DiagnosticFollowupQuestionRow[]>;
    depth?: number;
    visited?: Set<string>;
    isFollowUp?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
    questionId,
    questions,
    optionsByQuestion,
    followupsByOption,
    depth = 0,
    visited = new Set(),
    isFollowUp = false
}) => {
    const question = questions.get(questionId);
    // optionsByQuestion is keyed by Logical ID (e.g. 'START'), so we must use questionId or question.question_id
    const options = optionsByQuestion.get(questionId) || [];

    // Detect cycles
    if (visited.has(questionId)) {
        return (
            <div style={{ marginLeft: depth * 20 }} className="p-2 text-red-500 flex items-center gap-2 bg-red-50 rounded border border-red-100 mb-2">
                <Icon icon="tabler:repeat" />
                <span>Cycle detected: Link back to {question?.text || questionId}</span>
            </div>
        );
    }

    const newVisited = new Set(visited).add(questionId);

    if (!question) {
        if (questionId === 'START') return null; // Wait for load
        return (
            <div style={{ marginLeft: depth * 20 }} className="p-2 text-yellow-600 bg-yellow-50 rounded border border-yellow-100 mb-2">
                Missing Question ID: {questionId}
            </div>
        );
    }

    return (
        <div style={{ marginLeft: depth * 20 }} className="mb-2">
            <div className={`
        p-3 rounded-lg border flex items-start gap-3
        ${isFollowUp
                    ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800'
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }
      `}>
                <div className={`mt-0.5 p-1 rounded ${isFollowUp ? 'bg-purple-100 text-purple-600' : 'bg-primary-100 text-primary-600'}`}>
                    <Icon icon={isFollowUp ? "tabler:arrow-elbow-right" : "tabler:question-mark"} className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1 rounded dark:bg-gray-700 dark:text-gray-400">
                            {question.question_id}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{question.text}</span>
                    </div>
                    {question.help_text && (
                        <p className="text-xs text-gray-500 mt-1 italic">{question.help_text}</p>
                    )}
                </div>
            </div>

            {/* Options */}
            <div className="mt-2 ml-4 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
                {options.map(opt => {
                    const followups = followupsByOption.get(opt.id) || [];

                    return (
                        <div key={opt.id} className="relative mb-4">
                            {/* Option Label */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                                    {opt.label}
                                </span>
                                {opt.is_solution && (
                                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Icon icon="tabler:check" className="w-3 h-3" />
                                        Solution
                                    </span>
                                )}
                            </div>

                            {/* Solution Text */}
                            {opt.is_solution && (
                                <div className="ml-4 mb-2 p-2 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded text-sm text-green-800 dark:text-green-200">
                                    <div className="font-medium flex items-center gap-1 mb-1">
                                        <Icon icon="tabler:tool" className="w-3 h-3" />
                                        Resolution:
                                    </div>
                                    {opt.solution_text}
                                    {opt.solution_steps && opt.solution_steps.length > 0 && (
                                        <ul className="list-disc list-inside mt-1 pl-1 opacity-80">
                                            {opt.solution_steps.map((step, i) => (
                                                <li key={i}>{step}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* Follow-up Questions (Queue) */}
                            {followups.length > 0 && (
                                <div className="ml-4 pl-4 border-l-2 border-purple-100 dark:border-purple-900/30">
                                    <div className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wider flex items-center gap-1">
                                        <Icon icon="tabler:list-numbers" className="w-3 h-3" />
                                        Follow-up Sequence
                                    </div>
                                    {followups.map(fp => {
                                        // Follow-ups link to a question via question_id field being the UUID of the question
                                        // But wait, the API returns `question_id` as the UUID of the question row in `diagnostic_questions`
                                        // My TreeNode expects `logicalId` (e.g. START) or UUID?
                                        // My getQuestions returns rows with `id` (UUID) and `question_id` (Logical).
                                        // The followups table has `question_id` which links to `diagnostic_questions.id` (UUID)

                                        // We need to find the logical ID of the question linked by the followup
                                        const linkedQ = Array.from(questions.values()).find(q => q.id === fp.question_id);
                                        if (!linkedQ) return <div key={fp.id} className="text-red-500 text-xs">Broken Link</div>;

                                        return (
                                            <TreeNode
                                                key={fp.id}
                                                questionId={linkedQ.question_id} // Use Logical ID to match existing map
                                                questions={questions}
                                                optionsByQuestion={optionsByQuestion}
                                                followupsByOption={followupsByOption}
                                                depth={depth + 1}
                                                visited={newVisited}
                                                isFollowUp={true}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {/* Next Question */}
                            {opt.next_question_id && (
                                <TreeNode
                                    questionId={opt.next_question_id}
                                    questions={questions}
                                    optionsByQuestion={optionsByQuestion}
                                    followupsByOption={followupsByOption}
                                    depth={depth + 1}
                                    visited={newVisited}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const QuestionFlowView: React.FC = () => {
    const { data: questionsData, isLoading: qLoading } = useQuery({
        queryKey: ['diagnostic-questions-all'],
        queryFn: () => getQuestions()
    });

    const { data: optionsData, isLoading: oLoading } = useQuery({
        queryKey: ['diagnostic-options-all'],
        queryFn: getAllOptions
    });

    const { data: followupsData, isLoading: fLoading } = useQuery({
        queryKey: ['diagnostic-followups-all'],
        queryFn: getAllFollowupQuestions
    });

    const isLoading = qLoading || oLoading || fLoading;

    const dataMaps = useMemo(() => {
        if (!questionsData || !optionsData || !followupsData) return null;

        const questionsMap = new Map<string, DiagnosticQuestionRow>();
        questionsData.forEach(q => {
            // Index by Logical ID (e.g., START)
            questionsMap.set(q.question_id, q);
        });

        const optionsMap = new Map<string, DiagnosticOptionRow[]>();
        optionsData.forEach(o => {
            const existing = optionsMap.get(o.question_id) || [];
            existing.push(o);
            optionsMap.set(o.question_id, existing);
        });

        // NOTE: optionsMap keys are UUIDs of questions, because `question_id` in options table is UUID.
        // BUT my TreeNode uses Logical ID (e.g. START) as the primary key for traversal.
        // I need to map UUID -> Logical ID or ensure my map lookups use the right ID.

        // Correction:
        // `questionsMap` keys = Logical ID (question_id column)
        // `optionsMap` keys = UUID (question_id column in options table) -> This is problematic for direct lookup if I only pass logical ID.

        // I should create a UUID -> Logical ID map
        const uuidToLogical = new Map<string, string>();
        questionsData.forEach(q => uuidToLogical.set(q.id, q.question_id));

        // Re-key options map to Logical ID
        const optionsByLogicalId = new Map<string, DiagnosticOptionRow[]>();
        optionsData.forEach(o => {
            const logicalId = uuidToLogical.get(o.question_id);
            if (logicalId) {
                const existing = optionsByLogicalId.get(logicalId) || [];
                existing.push(o);
                optionsByLogicalId.set(logicalId, existing);
            }
        });

        const followupsMap = new Map<string, DiagnosticFollowupQuestionRow[]>();
        followupsData.forEach(f => {
            const existing = followupsMap.get(f.parent_option_id) || [];
            existing.push(f);
            followupsMap.set(f.parent_option_id, existing);
        });

        return {
            questions: questionsMap,
            options: optionsByLogicalId,
            followups: followupsMap
        };
    }, [questionsData, optionsData, followupsData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Icon icon="tabler:loader-2" className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!dataMaps) return <div>No data available</div>;

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg min-h-[500px] overflow-auto border border-gray-200 dark:border-gray-800">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Icon icon="tabler:hierarchy-2" className="w-5 h-5 text-primary-600" />
                    Logic Flow Visualization
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary-500" /> Main Question</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> Follow-up</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Solution</span>
                </div>
            </div>

            <div className="pl-2">
                <TreeNode
                    questionId="START" // Assumption: Entry point is always 'START'
                    questions={dataMaps.questions}
                    optionsByQuestion={dataMaps.options}
                    followupsByOption={dataMaps.followups}
                />
            </div>
        </div>
    );
};

export default QuestionFlowView;
