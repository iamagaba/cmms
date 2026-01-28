
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@headlessui/react';
import { Edit, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
                <Dialog.Panel className="mx-auto max-w-2xl w-full bg-background rounded-xl shadow-xl border border-border flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <Dialog.Title className="text-lg font-semibold text-foreground flex items-center gap-2">
                            {isEditing ? <Edit className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                            {isEditing ? 'Edit Question' : 'New Question'}
                        </Dialog.Title>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="question_id" className="text-xs">
                                    Question ID <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="question_id"
                                    type="text"
                                    {...register('question_id', { required: 'Question ID is required' })}
                                    placeholder="e.g., ENGINE_NOISE"
                                />
                                {errors.question_id && <p className="text-xs text-destructive mt-1">{errors.question_id.message as string}</p>}
                                <p className="text-xs text-muted-foreground mt-1">Unique identifier used in logic (e.g. BATTERY_CHECK)</p>
                            </div>

                            <div>
                                <Label htmlFor="category_id" className="text-xs">
                                    Category
                                </Label>
                                <select
                                    id="category_id"
                                    {...register('category_id')}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                >
                                    <option value="">Select Category...</option>
                                    {categories?.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="text" className="text-xs">
                                Question Text <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="text"
                                type="text"
                                {...register('text', { required: 'Question text is required' })}
                                placeholder="e.g., Is the engine making a noise?"
                            />
                            {errors.text && <p className="text-xs text-destructive mt-1">{errors.text.message as string}</p>}
                        </div>

                        <div>
                            <Label htmlFor="help_text" className="text-xs">
                                Help Text / Instructions
                            </Label>
                            <Textarea
                                id="help_text"
                                {...register('help_text')}
                                rows={3}
                                placeholder="Additional instructions for the technician..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="question_type" className="text-xs">
                                    Question Type
                                </Label>
                                <select
                                    id="question_type"
                                    {...register('question_type')}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
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
                                        className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                                    />
                                    <span className="text-sm text-foreground">Active (Visible in flow)</span>
                                </label>
                            </div>
                        </div>

                        {isEditing && questionId && (
                            <div className="pt-6 border-t border-border">
                                <OptionManager questionId={questionId} />
                            </div>
                        )}
                    </form>

                    <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/50 rounded-b-xl">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSubmit(onSubmit)}
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                            {isEditing ? 'Save' : 'Create Question'}
                        </Button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default QuestionEditor;


