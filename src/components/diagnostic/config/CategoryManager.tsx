
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Folder, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
                <h3 className="text-lg font-medium text-foreground">Categories</h3>
                <Button
                    onClick={handleCreate}
                    size="sm"
                >
                    <Plus className="w-4 h-4 mr-1.5" />
                    {viewMode === 'full' && "Add Category"}
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
                </div>
            ) : (
                <div className={`grid ${gridClass} gap-4`}>
                    {categories?.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => onSelectCategory && onSelectCategory(cat)}
                            className={`bg-background border rounded-lg p-4 group transition-colors cursor-pointer ${selectedCategory?.id === cat.id
                                    ? 'border-primary ring-1 ring-primary bg-primary/5'
                                    : 'border-border hover:border-primary'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                        <Folder className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-semibold text-foreground">{cat.label}</h4>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => handleEdit(cat, e)}
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => handleDelete(cat.id, cat.label, e)}
                                        title="Delete"
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{cat.description || "No description provided."}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className={`px-2 py-0.5 rounded ${cat.is_active ? 'bg-muted text-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    {cat.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {categories?.length === 0 && (
                        <div className="col-span-full py-8 text-center text-muted-foreground bg-muted/50 rounded-lg border border-dashed border-border">
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
            <div className="bg-background w-full max-w-md rounded-xl shadow-2xl border border-border">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">
                        {initialData ? 'Edit Category' : 'New Category'}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="label" className="text-xs">Label</Label>
                        <Input
                            id="label"
                            {...register('label', { required: 'Label is required' })}
                            placeholder="e.g. Engine Issues"
                        />
                        {errors.label && <p className="text-destructive text-xs mt-1">{errors.label.message as string}</p>}
                    </div>

                    <div>
                        <Label htmlFor="name" className="text-xs">ID (Internal Name)</Label>
                        <Input
                            id="name"
                            {...register('name', { required: 'ID is required' })}
                            placeholder="e.g. ENGINE"
                            disabled={!!initialData}
                            className="font-mono text-sm"
                        />
                        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message as string}</p>}
                    </div>

                    <div>
                        <Label htmlFor="icon" className="text-xs">Icon (Iconify string)</Label>
                        <Input
                            id="icon"
                            {...register('icon')}
                            placeholder="e.g. tabler:engine"
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Use Iconify names (e.g. tabler:car, mdi:engine)</p>
                    </div>

                    <div>
                        <Label htmlFor="description" className="text-xs">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Brief description of this category..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="display_order" className="text-xs">Display Order</Label>
                            <Input
                                id="display_order"
                                type="number"
                                {...register('display_order', { valueAsNumber: true })}
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('is_active')}
                                    className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-foreground">Active</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
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
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                            {initialData ? 'Save' : 'Create Category'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryManager;



