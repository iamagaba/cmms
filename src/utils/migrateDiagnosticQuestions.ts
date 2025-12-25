
import { supabase } from '@/integrations/supabase/client';
import { DIAGNOSTIC_QUESTIONS } from '@/data/diagnosticQuestions';
import { DIAGNOSTIC_CATEGORIES } from '@/types/diagnostic';

// Type definitions to help with processing
type MigrationResult = {
    categories: number;
    questions: number;
    options: number;
    errors: string[];
    success: boolean;
};

/**
 * Migration Utility for Diagnostic Data
 * 
 * This script migrates:
 * 1. Diagnostic Categories from DIAGNOSTIC_CATEGORIES
 * 2. Diagnostic Questions from DIAGNOSTIC_QUESTIONS
 * 3. Diagnostic Options (nested within questions)
 * 
 * It preserves the relationships and logical links.
 */
export const migrateDiagnosticData = async (): Promise<MigrationResult> => {
    const result: MigrationResult = {
        categories: 0,
        questions: 0,
        options: 0,
        errors: [],
        success: false
    };

    try {
        console.log('Starting Diagnostic Data Migration...');

        // 1. MIGRATE CATEGORIES
        console.log('Migrating Categories...');
        const categoryMap = new Map<string, string>(); // Maps logical ID (e.g., 'ENGINE') to DB UUID

        for (const key of Object.keys(DIAGNOSTIC_CATEGORIES)) {
            const category = DIAGNOSTIC_CATEGORIES[key];

            // Upsert Category
            const { data: catData, error: catError } = await supabase
                .from('diagnostic_categories')
                .upsert({
                    name: category.id, // Using the 'id' field as the unique name
                    label: category.label,
                    icon: category.icon,
                    description: category.description,
                    display_order: Object.keys(DIAGNOSTIC_CATEGORIES).indexOf(key),
                    is_active: true
                }, { onConflict: 'name' })
                .select('id')
                .single();

            if (catError) {
                result.errors.push(`Failed to migrate category ${category.label}: ${catError.message}`);
                continue;
            }

            if (catData) {
                categoryMap.set(category.id, catData.id);
                result.categories++;
            }
        }

        // 2. MIGRATE QUESTIONS
        console.log('Migrating Questions...');
        const questionMap = new Map<string, string>(); // Maps logical ID (e.g., 'START') to DB UUID

        // First pass: Insert Questions to generate UUIDs
        for (const key of Object.keys(DIAGNOSTIC_QUESTIONS)) {
            const question = DIAGNOSTIC_QUESTIONS[key];

            // Resolve Category UUID
            let categoryId = null;
            if (question.category) {
                // Try precise match first
                categoryId = categoryMap.get(question.category);

                // Fallback: try case-insensitive match keys if not found direct
                if (!categoryId) {
                    const matchingKey = Array.from(categoryMap.keys()).find(k => k.toLowerCase() === question.category?.toLowerCase());
                    if (matchingKey) categoryId = categoryMap.get(matchingKey);
                }
            }

            // Upsert Question
            const { data: qData, error: qError } = await supabase
                .from('diagnostic_questions')
                .upsert({
                    question_id: question.id,
                    text: question.text,
                    help_text: question.helpText,
                    question_type: question.type,
                    category_id: categoryId,
                    subcategory: question.subcategory,
                    display_order: 0, // Default, can be refined if we had order data
                    is_active: true
                }, { onConflict: 'question_id' })
                .select('id')
                .single();

            if (qError) {
                result.errors.push(`Failed to migrate question ${question.id}: ${qError.message}`);
                continue;
            }

            if (qData) {
                questionMap.set(question.id, qData.id);
                result.questions++;
            }
        }

        // 3. MIGRATE OPTIONS
        console.log('Migrating Options...');

        // We iterate through questions again to process their options
        for (const key of Object.keys(DIAGNOSTIC_QUESTIONS)) {
            const question = DIAGNOSTIC_QUESTIONS[key];
            const questionDbId = questionMap.get(question.id);

            if (!questionDbId || !question.options) continue;

            let optionOrder = 0;
            for (const option of question.options) {
                // Resolve Category UUID for Option if present
                let optCategoryId = null;
                if (option.category) {
                    optCategoryId = categoryMap.get(option.category);
                    if (!optCategoryId) {
                        const matchingKey = Array.from(categoryMap.keys()).find(k => k.toLowerCase() === option.category?.toLowerCase());
                        if (matchingKey) optCategoryId = categoryMap.get(matchingKey);
                    }
                }

                const { error: optError } = await supabase
                    .from('diagnostic_options')
                    .upsert({
                        question_id: questionDbId,
                        option_id: option.id,
                        label: option.label,
                        next_question_id: option.nextQuestionId || null, // Stores the string ID, which is compatible
                        category_id: optCategoryId,
                        subcategory: option.subcategory,
                        is_solution: option.isSolution || false,
                        solution_text: option.solutionText,
                        solution_steps: option.solutionSteps,
                        display_order: optionOrder++,
                        is_active: true
                    }, { onConflict: 'question_id, option_id' });

                if (optError) {
                    result.errors.push(`Failed to migrate option ${option.id} for question ${question.id}: ${optError.message}`);
                } else {
                    result.options++;
                }
            }
        }

        result.success = result.errors.length === 0;
        console.log('Migration Complete.', result);

    } catch (err: any) {
        console.error('Migration failed with exception:', err);
        result.errors.push(`Unexpected error: ${err.message}`);
        result.success = false;
    }

    return result;
};
