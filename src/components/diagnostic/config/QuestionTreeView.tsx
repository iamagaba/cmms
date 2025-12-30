
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Search01Icon,
  Add01Icon,
  Folder01Icon,
  Edit01Icon,
  Delete01Icon
} from '@hugeicons/core-free-icons';
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
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-1 gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:max-w-xs">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {!externalSelectedCategory && (
                        <select
                            value={internalSelectedCategory}
                            onChange={(e) => setInternalSelectedCategory(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Categories</option>
                            {categories?.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    )}
                </div>

                <button
                    className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium whitespace-nowrap"
                    onClick={handleCreate}
                >
                    <HugeiconsIcon icon={Add01Icon} size={16} />
                    New Question
                </button>
            </div>

            {/* List */}
            {isLoadingQuestions ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredQuestions?.map(q => (
                        <div key={q.id} className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                            {q.question_id}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <HugeiconsIcon icon={Folder01Icon} size={12} />
                                            {getCategoryName(q.category_id)}
                                        </span>
                                        {!q.is_active && (
                                            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded">Inactive</span>
                                        )}
                                    </div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{q.text}</h4>
                                    {q.help_text && (
                                        <p className="text-sm text-gray-500 mt-1 italic">"{q.help_text}"</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                        onClick={() => handleEdit(q)}
                                    >
                                        <HugeiconsIcon icon={Edit01Icon} size={16} />
                                    </button>
                                    <button
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                        onClick={() => handleDelete(q.id)}
                                    >
                                        <HugeiconsIcon icon={Delete01Icon} size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredQuestions?.length === 0 && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
