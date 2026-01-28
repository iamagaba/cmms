
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
                <h4 className="text-sm font-medium text-foreground">Answer Options</h4>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCreate}
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Option
                </Button>
            </div>

            {isLoadingOptions ? (
                <div className="text-xs text-muted-foreground">Loading options...</div>
            ) : (
                <div className="space-y-2">
                    {options?.map((opt, index) => (
                        <div key={opt.id} className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg group">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                        {opt.is_solution ? (
                                            <span className="flex items-center gap-1 text-foreground">
                                                <Check className="w-4 h-4" />
                                                Solution
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <ArrowRight className="w-4 h-4" />
                                                To: {opt.next_question_id || 'End'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(opt)}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(opt.id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {options?.length === 0 && (
                        <p className="text-xs text-muted-foreground italic text-center py-2">No options defined yet.</p>
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
                <Dialog.Panel className="mx-auto max-w-md w-full bg-background rounded-xl shadow-xl border border-border flex flex-col">
                    <div className="p-4 border-b border-border">
                        <Dialog.Title className="text-lg font-semibold text-foreground">
                            {isEditing ? 'Edit Option' : 'New Option'}
                        </Dialog.Title>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
                        <div>
                            <Label htmlFor="label" className="text-xs">
                                Option Label <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="label"
                                type="text"
                                {...register('label', { required: 'Label is required' })}
                                placeholder="e.g., Yes, the noise is loud"
                            />
                            {errors.label && <p className="text-xs text-destructive mt-1">{errors.label.message as string}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...register('is_solution')}
                                className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                            />
                            <label className="text-sm font-medium text-foreground">
                                This is a solution (End of flow)
                            </label>
                        </div>

                        {isSolution ? (
                            <div>
                                <Label htmlFor="solution_text" className="text-xs">
                                    Solution Text/Steps
                                </Label>
                                <Textarea
                                    id="solution_text"
                                    {...register('solution_text')}
                                    rows={3}
                                    placeholder="Describe the fix..."
                                />
                            </div>
                        ) : (
                            <div>
                                <Label htmlFor="next_question_id" className="text-xs">
                                    Next Question
                                </Label>
                                <select
                                    id="next_question_id"
                                    {...register('next_question_id')}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                >
                                    <option value="">-- Select Next Question --</option>
                                    {allQuestions.filter(q => q.id !== questionId).map(q => (
                                        <option key={q.id} value={q.question_id}>
                                            {q.question_id}: {q.text.substring(0, 40)}{q.text.length > 40 ? '...' : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">Leave empty if this is just an information step (not common)</p>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="display_order" className="text-xs">
                                Display Order
                            </Label>
                            <Input
                                id="display_order"
                                type="number"
                                {...register('display_order')}
                            />
                        </div>

                        {isEditing && initialData && (
                            <div className="pt-2">
                                <FollowupQuestionManager optionId={initialData.id} />
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? 'Saving...' : 'Save Option'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default OptionManager;


