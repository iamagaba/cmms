
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { DiagnosticFollowupQuestionRow, DiagnosticQuestionRow } from '@/types/diagnostic';
import { getFollowupQuestions, addFollowupQuestion, removeFollowupQuestion, getQuestions } from '@/api/diagnosticConfigApi';
import { showSuccess, showError } from '@/utils/toast';

interface FollowupQuestionManagerProps {
    optionId: string;
}

const FollowupQuestionManager = ({ optionId }: FollowupQuestionManagerProps) => {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data: followups, isLoading } = useQuery<DiagnosticFollowupQuestionRow[]>({
        queryKey: ['diagnosticFollowups', optionId],
        queryFn: () => getFollowupQuestions(optionId),
        enabled: !!optionId
    });

    const { data: allQuestions } = useQuery<DiagnosticQuestionRow[]>({
        queryKey: ['diagnosticQuestionsAll'],
        queryFn: () => getQuestions()
    });

    const deleteMutation = useMutation({
        mutationFn: removeFollowupQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnosticFollowups', optionId] });
            showSuccess('Follow-up question removed');
        },
        onError: (err: any) => showError(err.message)
    });

    return (
        <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">Follow-up Questions</h5>
                <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-xs flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    <Icon icon="tabler:plus" className="w-3 h-3" />
                    Add Follow-up
                </button>
            </div>

            {isLoading ? (
                <div className="text-xs text-gray-500">Loading follow-ups...</div>
            ) : (
                <div className="space-y-2">
                    {followups?.map((fq, index) => (
                        <div key={fq.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded text-sm mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs w-4">{index + 1}.</span>
                                <div>
                                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400 mr-2">
                                        {(fq as any).question?.question_id}
                                    </span>
                                    <span className="text-gray-700 dark:text-gray-300">{(fq as any).question?.text}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => deleteMutation.mutate(fq.id)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <Icon icon="tabler:x" className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {followups?.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No follow-up questions linked.</p>
                    )}
                </div>
            )}

            <AddFollowupModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                optionId={optionId}
                allQuestions={allQuestions || []}
                currentCount={followups?.length || 0}
            />
        </div>
    );
};

interface AddFollowupModalProps {
    isOpen: boolean;
    onClose: () => void;
    optionId: string;
    allQuestions: DiagnosticQuestionRow[];
    currentCount: number;
}

const AddFollowupModal = ({ isOpen, onClose, optionId, allQuestions, currentCount }: AddFollowupModalProps) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            question_id: '',
            is_required: true,
            condition_type: 'always'
        }
    });

    const mutation = useMutation({
        mutationFn: (data: any) => addFollowupQuestion({
            ...data,
            parent_option_id: optionId,
            display_order: currentCount
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnosticFollowups', optionId] });
            showSuccess('Follow-up question added');
            onClose();
            reset();
        },
        onError: (err: any) => showError(err.message)
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-[70]">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Follow-up Question</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Question
                            </label>
                            <select
                                {...register('question_id', { required: true })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                            >
                                <option value="">-- Choose Question --</option>
                                {allQuestions.map(q => (
                                    <option key={q.id} value={q.id}>
                                        {q.question_id}: {q.text.substring(0, 30)}...
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" {...register('is_required')} className="rounded text-primary-600" />
                            <label className="text-sm text-gray-700 dark:text-gray-300">Required</label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                            <button type="submit" disabled={mutation.isPending} className="px-3 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700">Add</button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default FollowupQuestionManager;
