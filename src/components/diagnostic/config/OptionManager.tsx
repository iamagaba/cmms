
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Tick01Icon, ArrowRight01Icon, Edit01Icon, Delete01Icon } from '@hugeicons/core-free-icons';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { DiagnosticOptionRow, DiagnosticQuestionRow } from '@/types/diagnostic';
import { getOptions, createOption, updateOption, deleteOption, getQuestions } from '@/api/diagnosticConfigApi';
import { showSuccess, showError } from '@/utils/toast';
import FollowupQuestionManager from './FollowupQuestionManager';


interface OptionManagerProps {
    questionId: string;
}

const OptionManager = ({ questionId }: OptionManagerProps) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<DiagnosticOptionRow | null>(null);

    const { data: options, isLoading: isLoadingOptions } = useQuery<DiagnosticOptionRow[]>({
        queryKey: ['diagnosticOptions', questionId],
        queryFn: () => getOptions(questionId),
        enabled: !!questionId
    });

    const { data: allQuestions } = useQuery<DiagnosticQuestionRow[]>({
        queryKey: ['diagnosticQuestionsAll'],
        queryFn: () => getQuestions()
    });

    const deleteMutation = useMutation({
        mutationFn: deleteOption,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnosticOptions', questionId] });
            showSuccess('Option deleted');
        },
        onError: (err: any) => showError(err.message)
    });

    const handleDelete = (id: string) => {
        if (confirm('Delete this option?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleCreate = () => {
        setEditingOption(null);
        setIsModalOpen(true);
    };

    const handleEdit = (option: DiagnosticOptionRow) => {
        setEditingOption(option);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Answer Options</h4>
                <button
                    type="button"
                    onClick={handleCreate}
                    className="text-xs flex items-center gap-1 px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded hover:bg-primary-100 dark:hover:bg-primary-900/50"
                >
                    <HugeiconsIcon icon={Add01Icon} size={12} />
                    Add Option
                </button>
            </div>

            {isLoadingOptions ? (
                <div className="text-xs text-gray-500">Loading options...</div>
            ) : (
                <div className="space-y-2">
                    {options?.map((opt, index) => (
                        <div key={opt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg group">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{opt.label}</p>
                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                        {opt.is_solution ? (
                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                <HugeiconsIcon icon={Tick01Icon} size={12} />
                                                Solution
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                                                To: {opt.next_question_id || 'End'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={() => handleEdit(opt)}
                                    className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                    <HugeiconsIcon icon={Edit01Icon} size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(opt.id)}
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                    <HugeiconsIcon icon={Delete01Icon} size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {options?.length === 0 && (
                        <p className="text-xs text-gray-500 italic text-center py-2">No options defined yet.</p>
                    )}
                </div>
            )}

            <OptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingOption}
                questionId={questionId}
                allQuestions={allQuestions || []}
            />
        </div>
    );
};

interface OptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: DiagnosticOptionRow | null;
    questionId: string;
    allQuestions: DiagnosticQuestionRow[];
}

const OptionModal = ({ isOpen, onClose, initialData, questionId, allQuestions }: OptionModalProps) => {
    const queryClient = useQueryClient();
    const isEditing = !!initialData;

    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            label: '',
            is_solution: false,
            next_question_id: '',
            solution_text: '',
            display_order: 0
        }
    });

    const isSolution = watch('is_solution');

    // Reset logic similar to other modals
    // ... implemented simply inside useEffect or use key to reset
    // For brevity using a simple key approach or explicit useEffect


    // Better:
    /* eslint-disable react-hooks/rules-of-hooks */
    // Since this is inside a component, hooks are fine.

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (isEditing && initialData) {
                return updateOption(initialData.id, data);
            } else {
                return createOption({ ...data, question_id: questionId });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnosticOptions', questionId] });
            showSuccess(`Option ${isEditing ? 'updated' : 'created'}`);
            onClose();
            reset();
        },
        onError: (err: any) => showError(err.message)
    });

    const onSubmit = (data: any) => {
        // Clean up data based on is_solution
        if (data.is_solution) {
            data.next_question_id = null;
        } else {
            data.solution_text = null;
        }
        mutation.mutate(data);
    };

    // Initial data loading effect
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // Initial data loading effect
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (initialData) {
            reset({
                label: initialData.label,
                is_solution: initialData.is_solution,
                next_question_id: initialData.next_question_id || '',
                solution_text: initialData.solution_text || '',
                display_order: initialData.display_order
            });
        } else {
            reset({
                label: '',
                is_solution: false,
                next_question_id: '',
                solution_text: '',
                display_order: 0
            });
        }
    }, [initialData, reset, isOpen]);

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {isEditing ? 'Edit Option' : 'New Option'}
                        </Dialog.Title>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Option Label <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register('label', { required: 'Label is required' })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                                placeholder="e.g., Yes, the noise is loud"
                            />
                            {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label.message as string}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...register('is_solution')}
                                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                This is a solution (End of flow)
                            </label>
                        </div>

                        {isSolution ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Solution Text/Steps
                                </label>
                                <textarea
                                    {...register('solution_text')}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                                    placeholder="Describe the fix..."
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Next Question
                                </label>
                                <select
                                    {...register('next_question_id')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">-- Select Next Question --</option>
                                    {allQuestions.filter(q => q.id !== questionId).map(q => (
                                        <option key={q.id} value={q.question_id}>
                                            {q.question_id}: {q.text.substring(0, 40)}{q.text.length > 40 ? '...' : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Leave empty if this is just an information step (not common)</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Display Order
                            </label>
                            <input
                                type="number"
                                {...register('display_order')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        {isEditing && initialData && (
                            <div className="pt-2">
                                <FollowupQuestionManager optionId={initialData.id} />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">

                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                            >
                                {mutation.isPending ? 'Saving...' : 'Save Option'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default OptionManager;
