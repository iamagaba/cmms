
import React, { useState } from 'react';
import { useTicketCategories, useTicketSubcategories, useTicketSettingsMutations } from '@/hooks/useTicketing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, Save, X } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { showSuccess, showError } from '@/utils/toast';
import { TicketCategory, TicketSubcategory } from '@/types/ticketing';

export default function CategoryManagement() {
    const { data: categories, isLoading: isLoadingCategories } = useTicketCategories();
    const { data: allSubcategories, isLoading: isLoadingSubcategories } = useTicketSubcategories(); // Fetch all
    const { createCategory, updateCategory, deleteCategory, createSubcategory, updateSubcategory, deleteSubcategory } = useTicketSettingsMutations();

    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        setIsSubmitting(true);
        try {
            await createCategory.mutateAsync({
                name: newCategoryName,
                is_active: true,
                sort_order: (categories?.length || 0) + 1,
            });
            showSuccess('Category added successfully');
            setNewCategoryName('');
            setIsAddCategoryOpen(false);
        } catch (error) {
            showError('Failed to add category');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingCategories) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Categories & Subcategories</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage ticket categories and their specific sub-issues.
                    </p>
                </div>
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Category</DialogTitle>
                            <DialogDescription>
                                Create a new main category for tickets.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="col-span-3"
                                    placeholder="e.g. Hardware"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddCategory} disabled={isSubmitting}>
                                {isSubmitting ? 'Adding...' : 'Add Category'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {categories?.map((category) => (
                    <CategoryItem
                        key={category.id}
                        category={category}
                        subcategories={allSubcategories?.filter(s => s.category_id === category.id) || []}
                    />
                ))}
                {categories?.length === 0 && (
                    <div className="text-center py-10 border rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">No categories found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function CategoryItem({ category, subcategories }: { category: TicketCategory; subcategories: TicketSubcategory[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(category.name);
    const { updateCategory, deleteCategory, createSubcategory } = useTicketSettingsMutations();

    const [isAddSubOpen, setIsAddSubOpen] = useState(false);
    const [newSubName, setNewSubName] = useState('');

    const handleUpdate = async () => {
        if (!editName.trim() || editName === category.name) {
            setIsEditing(false);
            return;
        }
        try {
            await updateCategory.mutateAsync({ id: category.id, updates: { name: editName } });
            showSuccess('Category updated');
            setIsEditing(false);
        } catch (error) {
            showError('Failed to update category');
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure? This will delete the category and all its subcategories.')) {
            try {
                await deleteCategory.mutateAsync(category.id);
                showSuccess('Category deleted');
            } catch (error) {
                showError('Failed to delete category');
            }
        }
    };

    const handleAddSubcategory = async () => {
        if (!newSubName.trim()) return;
        try {
            await createSubcategory.mutateAsync({
                category_id: category.id,
                name: newSubName,
                is_active: true,
                sort_order: (subcategories.length || 0) + 1,
            });
            showSuccess('Subcategory added');
            setNewSubName('');
            setIsAddSubOpen(false);
            setIsOpen(true); // Auto expand
        } catch (error) {
            showError('Failed to add subcategory');
        }
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-md bg-card">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2 flex-1">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    </CollapsibleTrigger>

                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-8 w-60"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdate();
                                    if (e.key === 'Escape') setIsEditing(false);
                                }}
                            />
                            <Button size="sm" variant="ghost" onClick={handleUpdate}><Save className="h-4 w-4 text-green-600" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}><X className="h-4 w-4 text-red-600" /></Button>
                        </div>
                    ) : (
                        <span className="font-medium">{category.name}</span>
                    )}

                    <Badge variant="secondary" className="ml-2 text-xs">
                        {subcategories.length} subcategories
                    </Badge>
                </div>

                <div className="flex items-center gap-1">
                    <Dialog open={isAddSubOpen} onOpenChange={setIsAddSubOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                <Plus className="h-4 w-4 mr-1" /> Add Subcategory
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Subcategory to {category.name}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="subname" className="text-right">Name</Label>
                                    <Input id="subname" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddSubOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddSubcategory}>Add</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
            </div>

            <CollapsibleContent className="border-t bg-muted/30 px-4 py-2">
                <div className="space-y-2 pl-8">
                    {subcategories.map(sub => (
                        <SubcategoryItem key={sub.id} subcategory={sub} />
                    ))}
                    {subcategories.length === 0 && (
                        <p className="text-sm text-muted-foreground italic py-2">No subcategories defined.</p>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

function SubcategoryItem({ subcategory }: { subcategory: TicketSubcategory }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(subcategory.name);
    const { updateSubcategory, deleteSubcategory } = useTicketSettingsMutations();

    const handleUpdate = async () => {
        if (!editName.trim() || editName === subcategory.name) {
            setIsEditing(false);
            return;
        }
        try {
            await updateSubcategory.mutateAsync({ id: subcategory.id, updates: { name: editName } });
            showSuccess('Subcategory updated');
            setIsEditing(false);
        } catch (error) {
            showError('Failed to update');
        }
    };

    const handleDelete = async () => {
        if (confirm('Delete this subcategory?')) {
            try {
                await deleteSubcategory.mutateAsync(subcategory.id);
                showSuccess('Subcategory deleted');
            } catch (error) {
                showError('Failed to delete');
            }
        }
    };

    return (
        <div className="flex items-center justify-between group py-1">
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 w-56 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdate();
                            if (e.key === 'Escape') setIsEditing(false);
                        }}
                    />
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleUpdate}><Save className="h-3 w-3 text-green-600" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setIsEditing(false)}><X className="h-3 w-3 text-red-600" /></Button>
                </div>
            ) : (
                <span className="text-sm">{subcategory.name}</span>
            )}

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDelete}>
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </Button>
            </div>
        </div>
    );
}
