import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings01Icon, TreeIcon, ListViewIcon, FlowIcon } from '@hugeicons/core-free-icons';
import CategoryManager from '@/components/diagnostic/config/CategoryManager';
import QuestionTreeView from '@/components/diagnostic/config/QuestionTreeView';
import QuestionFlowView from '@/components/diagnostic/config/QuestionFlowView';
import { DiagnosticCategoryRow } from '@/types/diagnostic';

const DiagnosticsTab = () => {
    const [activeCategory, setActiveCategory] = useState<DiagnosticCategoryRow | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'flow'>('list');

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">

                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'list'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <HugeiconsIcon icon={ListViewIcon} size={16} />
                        Questions List
                    </button>
                    <button
                        onClick={() => setViewMode('flow')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'flow'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <HugeiconsIcon icon={FlowIcon} size={16} />
                        Flow Visualizer
                    </button>
                </div>
            </div>

            {viewMode === 'flow' ? (
                <QuestionFlowView />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Categories Sidebar */}
                    <div className="lg:col-span-1">
                        <CategoryManager
                            selectedCategory={activeCategory}
                            onSelectCategory={setActiveCategory}
                            viewMode="sidebar"
                        />
                    </div>

                    {/* Questions Content */}
                    <div className="lg:col-span-3">
                        <QuestionTreeView
                            selectedCategory={activeCategory}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiagnosticsTab;
