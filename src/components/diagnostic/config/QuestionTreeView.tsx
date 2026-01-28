
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Folder, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getQuestions, getCategories, deleteQuestion } from '@/api/diagnosticConfigApi';
import { DiagnosticQuestionRow, DiagnosticCategoryRow } from '@/types/diagnostic';
import { showSuccess, showError } from '@/utils/toast';
import QuestionEditor from './QuestionEditor';

const QuestionTreeView = ({
    selectedCategory: externalSelectedCategory
}: {
    selectedCategory?: DiagnosticCategoryRow | null;
}) => {
    const queryClient = useQueryClient();
    const [internalSelectedCategory, setInternalSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<DiagnosticQuestionRow | null>(null);

    // Use external category if provided (sidebar mode), otherwise internal (standalone/dropdown mode)
    const activeCategoryId = externalSelectedCategory ? externalSelectedCategory.id : internalSelectedCategory;

    const { data: questions, isLoading: isLoadingQuestions } = useQuery<DiagnosticQuestionRow[]>({
        queryKey: ['diagnosticQuestions'],
        queryFn: () => getQuestions(),
    });

    const { data: categories } = useQuery<DiagnosticCategoryRow[]>({
        queryKey: ['diagnosticCategories'],
        queryFn: getCategories
    });

    const deleteMutation = useMutation({
        mutationFn: deleteQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnosticQuestions'] });
            showSuccess('Question deleted');
        },
        onError: (err: any) => showError(err.message)
    });

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this question? This may break existing flows.')) {
            deleteMutation.mutate(id);
        }
    };

    const handleCreate = () => {
        setEditingQuestion(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (question: DiagnosticQuestionRow) => {
        setEditingQuestion(question);
        setIsEditorOpen(true);
    };

    const filteredQuestions = questions?.filter(q => {
        const matchesCategory = activeCategoryId === 'all' || q.category_id === activeCategoryId;
        const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.question_id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getCategoryName = (catId: string | null) => {
        if (!catId) return 'Uncategorized';
        return categories?.find(c => c.id === catId)?.label || 'Unknown';
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-muted/50 p-4 rounded-lg border border-border">
                <div className="flex flex-1 gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search questions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {!externalSelectedCategory && (
                        <select
                            value={internalSelectedCategory}
                            onChange={(e) => setInternalSelectedCategory(e.target.value)}
                            className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Categories</option>
                            {categories?.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    )}
                </div>

                <Button
                    onClick={handleCreate}
                    size="sm"
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Question
                </Button>
            </div>

            {/* List */}
            {isLoadingQuestions ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredQuestions?.map(q => (
                        <div key={q.id} className="group bg-background border border-border p-4 rounded-lg hover:border-primary transition-colors">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                                            {q.question_id}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Folder className="w-4 h-4" />
                                            {getCategoryName(q.category_id)}
                                        </span>
                                        {!q.is_active && (
                                            <span className="text-xs px-1.5 py-0.5 bg-destructive/10 text-destructive rounded">Inactive</span>
                                        )}
                                    </div>
                                    <h4 className="font-medium text-foreground">{q.text}</h4>
                                    {q.help_text && (
                                        <p className="text-sm text-muted-foreground mt-1 italic">"{q.help_text}"</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(q)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(q.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredQuestions?.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No questions found matching your filters.
                        </div>
                    )}
                </div>
            )}

            <QuestionEditor
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                questionId={editingQuestion?.id || null}
                initialData={editingQuestion}
            />
        </div>
    );
};

export default QuestionTreeView;


