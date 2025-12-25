
import { supabase } from '@/integrations/supabase/client';
import {
    DiagnosticCategoryRow,
    DiagnosticQuestionRow,
    DiagnosticOptionRow,
    DiagnosticFollowupQuestionRow,
    DiagnosticQuestion,
    DiagnosticOption,
    DiagnosticFollowupQuestion
} from '@/types/diagnostic';

// --- Categories ---

export const getCategories = async (): Promise<DiagnosticCategoryRow[]> => {
    const { data, error } = await supabase
        .from('diagnostic_categories')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const createCategory = async (category: Omit<DiagnosticCategoryRow, 'id' | 'created_at' | 'updated_at'>): Promise<DiagnosticCategoryRow> => {
    const { data, error } = await supabase
        .from('diagnostic_categories')
        .insert(category)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateCategory = async (id: string, updates: Partial<DiagnosticCategoryRow>): Promise<DiagnosticCategoryRow> => {
    const { data, error } = await supabase
        .from('diagnostic_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('diagnostic_categories')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const reorderCategories = async (orderedIds: string[]): Promise<void> => {
    // This could be optimized with a stored procedure or batch update if supported well
    // For now, simple loop is acceptable for low volume admin action
    const updates = orderedIds.map((id, index) =>
        supabase.from('diagnostic_categories').update({ display_order: index }).eq('id', id)
    );
    await Promise.all(updates);
};


// --- Questions ---

export const getQuestions = async (filters?: { categoryId?: string }): Promise<DiagnosticQuestionRow[]> => {
    let query = supabase
        .from('diagnostic_questions')
        .select('*')
        .order('display_order', { ascending: true });

    if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
};

export const getQuestionById = async (id: string): Promise<DiagnosticQuestionRow | null> => {
    const { data, error } = await supabase
        .from('diagnostic_questions')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
};

// Fetch full question tree node including options and follow-ups
export const getFullQuestionNode = async (id: string): Promise<DiagnosticQuestion & { followups?: DiagnosticFollowupQuestion[] }> => {
    // 1. Fetch Question
    const { data: questionData, error: qError } = await supabase
        .from('diagnostic_questions')
        .select('*')
        .eq('id', id)
        .single();

    if (qError) throw qError;

    // 2. Fetch Options
    const { data: optionsData, error: oError } = await supabase
        .from('diagnostic_options')
        .select('*')
        .eq('question_id', id)
        .order('display_order', { ascending: true });

    if (oError) throw oError;

    // Map DB rows to Application Types
    const options: DiagnosticOption[] = (optionsData || []).map(opt => ({
        id: opt.option_id, // Use logical ID for application flow
        label: opt.label,
        nextQuestionId: opt.next_question_id || undefined,
        isSolution: opt.is_solution,
        solutionText: opt.solution_text || undefined,
        solutionSteps: opt.solution_steps || undefined,
        category: opt.category_id || undefined, // Note: ID not name, might need join if name needed
        subcategory: opt.subcategory || undefined
    }));

    return {
        id: questionData.question_id,
        text: questionData.text,
        type: questionData.question_type,
        options: options,
        helpText: questionData.help_text || undefined,
        category: questionData.category_id || undefined,
        subcategory: questionData.subcategory || undefined
    };
};

// Fetch full question tree node by Logical ID (e.g., 'START') instead of UUID
export const getQuestionByLogicalId = async (logicalId: string): Promise<DiagnosticQuestion & { followups?: DiagnosticFollowupQuestion[] }> => {
    // 1. Fetch Question
    const { data: questionData, error: qError } = await supabase
        .from('diagnostic_questions')
        .select('*')
        .eq('question_id', logicalId)
        .single();

    if (qError) throw qError;

    // 2. Fetch Options
    const { data: optionsData, error: oError } = await supabase
        .from('diagnostic_options')
        .select('*')
        .eq('question_id', questionData.id)
        .order('display_order', { ascending: true });

    if (oError) throw oError;

    // 3. Fetch Follow-up Questions for all options (optimization: fetch all for this question's options)
    // We'll create a map of optionId -> followups
    const optionIds = optionsData?.map(o => o.id) || [];
    let followupsData: DiagnosticFollowupQuestionRow[] = [];

    if (optionIds.length > 0) {
        const { data: fData, error: fError } = await supabase
            .from('diagnostic_followup_questions')
            .select(`
                *,
                question:diagnostic_questions(*)
            `)
            .in('parent_option_id', optionIds)
            .order('display_order', { ascending: true });

        if (fError) throw fError;
        followupsData = fData || [];
    }

    // Map DB rows to Application Types
    const options: DiagnosticOption[] = (optionsData || []).map(opt => {
        // Find follow-ups for this option
        const linkedFollowups = followupsData.filter(f => f.parent_option_id === opt.id);
        const mappedFollowups: DiagnosticFollowupQuestion[] = linkedFollowups.map(lf => ({
            id: (lf as any).question?.question_id, // Logical ID of follow-up question
            text: (lf as any).question?.text,
            type: (lf as any).question?.question_type,
            isRequired: lf.is_required,
            conditionType: lf.condition_type,
            displayOrder: lf.display_order
        }));

        return {
            id: opt.option_id, // Use logical ID for application flow
            label: opt.label,
            nextQuestionId: opt.next_question_id || undefined,
            isSolution: opt.is_solution,
            solutionText: opt.solution_text || undefined,
            solutionSteps: opt.solution_steps || undefined,
            category: opt.category_id || undefined,
            subcategory: opt.subcategory || undefined,
            followups: mappedFollowups.length > 0 ? mappedFollowups : undefined
        };
    });

    return {
        id: questionData.question_id,
        text: questionData.text,
        type: questionData.question_type,
        options: options,
        helpText: questionData.help_text || undefined,
        category: questionData.category_id || undefined,
        subcategory: questionData.subcategory || undefined
    };
};


export const createQuestion = async (question: Omit<DiagnosticQuestionRow, 'id' | 'created_at' | 'updated_at'>): Promise<DiagnosticQuestionRow> => {

    const { data, error } = await supabase
        .from('diagnostic_questions')
        .insert(question)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateQuestion = async (id: string, updates: Partial<DiagnosticQuestionRow>): Promise<DiagnosticQuestionRow> => {
    const { data, error } = await supabase
        .from('diagnostic_questions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteQuestion = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('diagnostic_questions')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// --- Options ---

export const getOptions = async (questionId: string): Promise<DiagnosticOptionRow[]> => {
    const { data, error } = await supabase
        .from('diagnostic_options')
        .select('*')
        .eq('question_id', questionId)
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const createOption = async (option: Omit<DiagnosticOptionRow, 'id' | 'created_at' | 'updated_at'>): Promise<DiagnosticOptionRow> => {
    const { data, error } = await supabase
        .from('diagnostic_options')
        .insert(option)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateOption = async (id: string, updates: Partial<DiagnosticOptionRow>): Promise<DiagnosticOptionRow> => {
    const { data, error } = await supabase
        .from('diagnostic_options')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteOption = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('diagnostic_options')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const reorderOptions = async (orderedIds: string[]): Promise<void> => {
    const updates = orderedIds.map((id, index) =>
        supabase.from('diagnostic_options').update({ display_order: index }).eq('id', id)
    );
    await Promise.all(updates);
};


// --- Follow-up Questions ---

export const getFollowupQuestions = async (optionId: string): Promise<DiagnosticFollowupQuestionRow[]> => {
    const { data, error } = await supabase
        .from('diagnostic_followup_questions')
        .select(`
        *,
        question:diagnostic_questions(*)
    `)
        .eq('parent_option_id', optionId)
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const addFollowupQuestion = async (association: Omit<DiagnosticFollowupQuestionRow, 'id' | 'created_at' | 'updated_at'>): Promise<DiagnosticFollowupQuestionRow> => {
    const { data, error } = await supabase
        .from('diagnostic_followup_questions')
        .insert(association)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const removeFollowupQuestion = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('diagnostic_followup_questions')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const reorderFollowupQuestions = async (orderedIds: string[]): Promise<void> => {
    const updates = orderedIds.map((id, index) =>
        supabase.from('diagnostic_followup_questions').update({ display_order: index }).eq('id', id)
    );
    await Promise.all(updates);
};


// --- Validation & Export ---

export const validateDiagnosticFlow = async (): Promise<{ valid: boolean; errors: string[] }> => {
    // This would involve complex traversal of the graph
    // For MVP, we can just check basic integrity like orphaned questions or broken links
    const errors: string[] = [];

    // Check for broken next_question_id links
    const { data: options } = await supabase.from('diagnostic_options').select('next_question_id, label');
    const { data: questions } = await supabase.from('diagnostic_questions').select('question_id');

    const questionIds = new Set(questions?.map(q => q.question_id) || []);

    options?.forEach(opt => {
        if (opt.next_question_id && !questionIds.has(opt.next_question_id)) {
            errors.push(`Option "${opt.label}" links to non-existent question "${opt.next_question_id}"`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
};

export const getAllOptions = async (): Promise<DiagnosticOptionRow[]> => {
    const { data, error } = await supabase
        .from('diagnostic_options')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
};

export const getAllFollowupQuestions = async (): Promise<DiagnosticFollowupQuestionRow[]> => {
    const { data, error } = await supabase
        .from('diagnostic_followup_questions')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
};
