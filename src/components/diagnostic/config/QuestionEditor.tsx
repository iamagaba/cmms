
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@headlessui/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit01Icon, Add01Icon, Cancel01Icon, Loading01Icon } from '@hugeicons/core-free-icons';
import { DiagnosticQuestionRow, DiagnosticCategoryRow } from '@/types/diagnostic';
import { createQuestion, updateQuestion, getCategories } from '@/api/diagnosticConfigApi';
import { showSuccess, showError } from '@/utils/toast';
import OptionManager from './OptionManager';


interface QuestionEditorProps {
    isOpen: boolean;
    onClose: () => void;
    questionId: string | null; // null for new question
    initialData?: DiagnosticQuestionRow | null;
}

const QuestionEditor = ({ isOpen, onClose, questionId, initialData }: QuestionEditorProps) => {
    const queryClient = useQueryClient();
    const isEditing = !!questionId;

    const { data: categories } = useQuery<DiagnosticCategoryRow[]>({
        queryKey: ['diagnosticCategories'],
        queryFn: getCategories
    });

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            question_id: '',
            text: '',
            help_text: '',
            question_type: 'selection',
            category_id: '',
            is_active: true
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                question_id: initialData.question_id,
                text: initialData.text,
                help_text: initialData.help_text || '',
                question_type: initialData.question_type,
                category_id: initialData.category_id || '',
                is_active: initialData.is_active
            });
        } else {
            reset({
                question_id: '',
                text: '',
                help_text: '',
                question_type: 'selection',
                category_id: '',
                is_active: true
            });
        }
    }, [initialData, reset, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (isEditing && initialData) {
                return updateQuestion(initialData.id, data);
            } else {
                return createQuestion(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnosticQuestions'] });
            showSuccess(`Question ${isEditing ? 'updated' : 'created'} successfully`);
            onClose();
        },
        onError: (err: any) => showError(err.message)
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                        <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <HugeiconsIcon icon={isEditing ? Edit01Icon : Add01Icon} size={20} className="text-primary-600 dark:text-primary-400" />
                            {isEditing ? 'Edit Question' : 'New Question'}
                        </Dialog.Title>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            <HugeiconsIcon icon={Cancel01Icon} size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Question ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('question_id', { required: 'Question ID is required' })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                                    placeholder="e.g., ENGINE_NOISE"
                                />
                                {errors.question_id && <p className="text-xs text-red-500 mt-1">{errors.question_id.message as string}</p>}
                                <p className="text-xs text-gray-500 mt-1">Unique identifier used in logic (e.g. BATTERY_CHECK)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category
                                </label>
                                <select
                                    {...register('category_id')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="">Select Category...</option>
                                    {categories?.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Question Text <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register('text', { required: 'Question text is required' })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                                placeholder="e.g., Is the engine making a noise?"
                            />
                            {errors.text && <p className="text-xs text-red-500 mt-1">{errors.text.message as string}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Help Text / Instructions
                            </label>
                            <textarea
                                {...register('help_text')}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                                placeholder="Additional instructions for the technician..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Question Type
                                </label>
                                <select
                                    {...register('question_type')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="selection">Selection (Single Choice)</option>
                                    <option value="boolean">Yes / No</option>
                                    <option value="text">Text Input</option>
                                    <option value="number">Numeric Input</option>
                                </select>
                            </div>

                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        {...register('is_active')}
                                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Active (Visible in flow)</span>
                                </label>
                            </div>
                        </div>

                        {isEditing && questionId && (
                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                <OptionManager questionId={questionId} />
                            </div>
                        )}
                    </form>

                    <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={mutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {mutation.isPending && <HugeiconsIcon icon={Loading01Icon} size={16} className="animate-spin" />}
                            {isEditing ? 'Save Changes' : 'Create Question'}
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default QuestionEditor;
