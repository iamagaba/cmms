
export interface Condition {
    type: string;
    value: string;
    propertyType?: string; // For asset properties: 'ownership', 'warranty', 'emergency', etc.
}

export interface Action {
    type: string;
    value: string;
    label?: string; // For display purposes
}

export interface RuleDependency {
    rule_id: string;
    execution_order: 'before' | 'after';
    wait_for_completion: boolean;
}

export interface EditorProps {
    disabled?: boolean;
}
