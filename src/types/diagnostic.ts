// Diagnostic Tool Type Definitions

export type QuestionType = 'single-choice' | 'multiple-choice' | 'text-input' | 'yes-no';

export interface DiagnosticFollowupQuestion extends DiagnosticQuestion {
  isRequired: boolean;
  conditionType: 'always' | 'conditional';
  displayOrder?: number;
}

export interface DiagnosticOption {
  id: string;
  label: string;
  nextQuestionId?: string;
  isSolution?: boolean;
  solutionText?: string;
  solutionSteps?: string[];
  category?: string;
  subcategory?: string;
  followups?: DiagnosticFollowupQuestion[];
}

export interface DiagnosticQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: DiagnosticOption[];
  nextQuestionId?: string | ((answer: any) => string);
  category?: string;
  subcategory?: string;
  helpText?: string;
}

export interface DiagnosticAnswer {
  questionId: string;
  questionText: string;
  answer: string | string[];
  selectedOption?: DiagnosticOption;
  timestamp: string;
}

export interface DiagnosticSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  answers: DiagnosticAnswer[];
  finalCategory?: string;
  finalSubcategory?: string;
  solutionFound?: boolean;
  solutionText?: string;
  solutionSteps?: string[];
  solutionAttempted?: boolean;
  solutionSuccessful?: boolean;
  summary: string;
  currentQuestionId: string;
  questionQueue?: string[];
}

export interface DiagnosticCategory {
  id: string;
  label: string;
  icon: string;
  subcategories: string[];
  description?: string;
}

export const DIAGNOSTIC_CATEGORIES: Record<string, DiagnosticCategory> = {
  ENGINE: {
    id: 'engine',
    label: 'Engine Issues',
    icon: 'tabler:engine',
    subcategories: ['starting', 'performance', 'overheating', 'noise', 'emissions', 'stalling'],
    description: 'Problems with engine operation, starting, or performance'
  },
  ELECTRICAL: {
    id: 'electrical',
    label: 'Electrical Issues',
    icon: 'tabler:bolt',
    subcategories: ['battery', 'lights', 'charging', 'accessories', 'wiring', 'fuses'],
    description: 'Electrical system problems including battery, lights, and accessories'
  },
  BRAKES: {
    id: 'brakes',
    label: 'Brake System',
    icon: 'tabler:brake',
    subcategories: ['noise', 'performance', 'warning_light', 'pedal_feel', 'fluid_leak'],
    description: 'Brake system issues including noise, performance, or warning lights'
  },
  SUSPENSION: {
    id: 'suspension',
    label: 'Suspension & Steering',
    icon: 'tabler:steering-wheel',
    subcategories: ['noise', 'handling', 'alignment', 'ride_quality', 'steering_difficulty'],
    description: 'Suspension, steering, and handling problems'
  },
  TRANSMISSION: {
    id: 'transmission',
    label: 'Transmission',
    icon: 'tabler:manual-gearbox',
    subcategories: ['shifting', 'noise', 'slipping', 'fluid_leak', 'warning_light'],
    description: 'Transmission shifting, noise, or performance issues'
  },
  TIRES: {
    id: 'tires',
    label: 'Tires & Wheels',
    icon: 'tabler:wheel',
    subcategories: ['flat', 'wear', 'vibration', 'pressure', 'damage'],
    description: 'Tire and wheel problems including flats, wear, or vibration'
  },
  HVAC: {
    id: 'hvac',
    label: 'Heating & Cooling',
    icon: 'tabler:air-conditioning',
    subcategories: ['ac_not_cold', 'heater_not_hot', 'noise', 'smell', 'fan_not_working'],
    description: 'Air conditioning, heating, and ventilation issues'
  },
  BODY: {
    id: 'body',
    label: 'Body & Exterior',
    icon: 'tabler:car',
    subcategories: ['damage', 'lights', 'locks', 'windows', 'wipers', 'mirrors'],
    description: 'Body, exterior, and accessory problems'
  },
  FUEL: {
    id: 'fuel',
    label: 'Fuel System',
    icon: 'tabler:gas-station',
    subcategories: ['leak', 'consumption', 'smell', 'gauge_issue'],
    description: 'Fuel system leaks, consumption, or gauge problems'
  },
  OTHER: {
    id: 'other',
    label: 'Other Issues',
    icon: 'tabler:help-circle',
    subcategories: ['unknown', 'multiple', 'general_maintenance'],
    description: 'Other issues or general maintenance requests'
  }
};

// Database Row Interfaces
export interface DiagnosticCategoryRow {
  id: string;
  name: string;
  label: string;
  icon: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface DiagnosticQuestionRow {
  id: string;
  question_id: string;
  text: string;
  help_text: string | null;
  question_type: QuestionType;
  category_id: string | null;
  subcategory: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface DiagnosticOptionRow {
  id: string;
  question_id: string;
  option_id: string;
  label: string;
  next_question_id: string | null;
  category_id: string | null;
  subcategory: string | null;
  is_solution: boolean;
  solution_text: string | null;
  solution_steps: string[] | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticFollowupQuestionRow {
  id: string;
  parent_option_id: string;
  question_id: string;
  display_order: number;
  is_required: boolean;
  condition_type: 'always' | 'conditional';
  condition_data: any | null;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticSchemaVersionRow {
  id: string;
  version: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

// Application Extension Types
// DiagnosticFollowupQuestion moved up

