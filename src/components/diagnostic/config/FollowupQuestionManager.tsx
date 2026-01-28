
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
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
        <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-foreground">Follow-up Questions</h5>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Follow-up
                </Button>
            </div>

            {isLoading ? (
                <div className="text-xs text-muted-foreground">Loading follow-ups...</div>
            ) : (
                <div className="space-y-2">
                    {followups?.map((fq, index) => (
                        <div key={fq.id} className="flex items-center justify-between p-2 bg-background border border-border rounded text-sm mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs w-4">{index + 1}.</span>
                                <div>
                                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground mr-2">
                                        {(fq as any).question?.question_id}
                                    </span>
                                    <span className="text-foreground">{(fq as any).question?.text}</span>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMutation.mutate(fq.id)}
                                className="text-destructive hover:text-destructive"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {followups?.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">No follow-up questions linked.</p>
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
                <Dialog.Panel className="mx-auto max-w-sm w-full bg-background rounded-xl shadow-xl border border-border p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Add Follow-up Question</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Select Question
                            </label>
                            <select
                                {...register('question_id', { required: true })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
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
                            <input type="checkbox" {...register('is_required')} className="rounded text-primary" />
                            <label className="text-sm text-foreground">Required</label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                            <Button type="submit" size="sm" disabled={mutation.isPending}>Add</Button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default FollowupQuestionManager;


