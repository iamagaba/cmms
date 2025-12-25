
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { showSuccess, showError } from '@/utils/toast';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
} from '@/api/diagnosticConfigApi';
import { DiagnosticCategoryRow } from '@/types/diagnostic';
// Checking codebase usage... user uses standard Tailwind + headless UI mostly, but encountered Mantine imports in history
// I will stick to Tailwind CSS for consistency with the rest of the recent edits (Settings.tsx) to avoid dependency issues if Mantine isn't fully set up or desired.




const CategoryManager = ({
    selectedCategory,
    onSelectCategory,
    viewMode = 'full'
}: {
    selectedCategory?: DiagnosticCategoryRow | null;
    onSelectCategory?: (category: DiagnosticCategoryRow) => void;
    viewMode?: 'full' | 'sidebar';
}) => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<DiagnosticCategoryRow | null>(null);

    const { data: categories, isLoading } = useQuery({
        queryKey: ['diagnosticCategories'],
        queryFn: getCategories
    });

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnosticCategories'] });
            showSuccess('Category created successfully');
            setIsModalOpen(false);
        },
        onError: (err: any) => showError(err.message)
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<DiagnosticCategoryRow> }) => updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnosticCategories'] });
            showSuccess('Category updated successfully');
            setIsModalOpen(false);
            setEditingCategory(null);
        },
        onError: (err: any) => showError(err.message)
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnosticCategories'] });
            showSuccess('Category deleted');
        },
        onError: (err: any) => showError(err.message)
    });

    const handleDelete = async (id: string, label: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete category "${label}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (category: DiagnosticCategoryRow, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const gridClass = viewMode === 'sidebar'
        ? 'grid-cols-1'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Categories</h3>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                    <Icon icon="tabler:plus" className="w-4 h-4" />
                    {viewMode === 'full' && "Add Category"}
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
                </div>
            ) : (
                <div className={`grid ${gridClass} gap-4`}>
                    {categories?.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => onSelectCategory && onSelectCategory(cat)}
                            className={`bg-white dark:bg-gray-900 border rounded-lg p-4 group transition-colors cursor-pointer ${selectedCategory?.id === cat.id
                                    ? 'border-primary-500 ring-1 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                        <Icon icon={cat.icon || 'tabler:folder'} className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{cat.label}</h4>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleEdit(cat, e)}
                                        className="p-1 text-gray-500 hover:text-primary-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                        title="Edit"
                                    >
                                        <Icon icon="tabler:pencil" className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(cat.id, cat.label, e)}
                                        className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                        title="Delete"
                                    >
                                        <Icon icon="tabler:trash" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{cat.description || "No description provided."}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                <span className={`px-2 py-0.5 rounded ${cat.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>
                                    {cat.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {categories?.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                            No categories found.
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <CategoryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialData={editingCategory}
                    onSubmit={(data) => {
                        if (editingCategory) {
                            updateMutation.mutate({ id: editingCategory.id, data });
                        } else {
                            createMutation.mutate(data);
                        }
                    }}
                    isSubmitting={createMutation.isPending || updateMutation.isPending}
                />
            )}
        </div>
    );
};

const CategoryModal = ({ isOpen, onClose, initialData, onSubmit, isSubmitting }: { isOpen: boolean; onClose: () => void; initialData: DiagnosticCategoryRow | null; onSubmit: (data: any) => void; isSubmitting: boolean }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            label: initialData?.label || '',
            name: initialData?.name || '',
            icon: initialData?.icon || '',
            description: initialData?.description || '',
            display_order: initialData?.display_order ?? 0,
            is_active: initialData?.is_active ?? true
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {initialData ? 'Edit Category' : 'New Category'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Icon icon="tabler:x" className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label</label>
                        <input
                            {...register('label', { required: 'Label is required' })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                            placeholder="e.g. Engine Issues"
                        />
                        {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label.message as string}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID (Internal Name)</label>
                        <input
                            {...register('name', { required: 'ID is required' })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm"
                            placeholder="e.g. ENGINE"
                            disabled={!!initialData} // Lock ID on edit
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (Iconify string)</label>
                        <input
                            {...register('icon')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-mono text-sm"
                            placeholder="e.g. tabler:engine"
                        />
                        <p className="text-xs text-gray-500 mt-1">Use Iconify names (e.g. tabler:car, mdi:engine)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-[80px]"
                            placeholder="Brief description of this category..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
                            <input
                                type="number"
                                {...register('display_order', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('is_active')}
                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <Icon icon="tabler:loader-2" className="w-4 h-4 animate-spin" />}
                            {initialData ? 'Save Changes' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryManager;
