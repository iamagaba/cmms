import { DiagnosticQuestion } from '@/types/diagnostic';

// Diagnostic Question Tree
export const DIAGNOSTIC_QUESTIONS: Record<string, DiagnosticQuestion> = {
  // Initial Question
  START: {
    id: 'START',
    text: 'What type of issue is the customer experiencing?',
    type: 'single-choice',
    helpText: 'Select the category that best describes the problem',
    options: [
      { id: 'engine', label: 'Engine Problems', nextQuestionId: 'ENGINE_SYMPTOM' },
      { id: 'electrical', label: 'Electrical Issues', nextQuestionId: 'ELECTRICAL_SYMPTOM' },
      { id: 'brakes', label: 'Brake Problems', nextQuestionId: 'BRAKE_SYMPTOM' },
      { id: 'suspension', label: 'Suspension & Steering', nextQuestionId: 'SUSPENSION_SYMPTOM' },
      { id: 'transmission', label: 'Transmission Issues', nextQuestionId: 'TRANSMISSION_SYMPTOM' },
      { id: 'tires', label: 'Tire/Wheel Problems', nextQuestionId: 'TIRE_SYMPTOM' },
      { id: 'hvac', label: 'Heating/Cooling Issues', nextQuestionId: 'HVAC_SYMPTOM' },
      { id: 'body', label: 'Body & Exterior', nextQuestionId: 'BODY_SYMPTOM' },
      { id: 'fuel', label: 'Fuel System', nextQuestionId: 'FUEL_SYMPTOM' },
      { id: 'other', label: 'Other/Not Sure', nextQuestionId: 'OTHER_DESCRIPTION' }
    ]
  },

  // ENGINE QUESTIONS
  ENGINE_SYMPTOM: {
    id: 'ENGINE_SYMPTOM',
    text: 'What specific engine symptom is occurring?',
    type: 'single-choice',
    category: 'engine',
    options: [
      { id: 'wont_start', label: "Won't start", nextQuestionId: 'ENGINE_WONT_START' },
      { id: 'strange_noise', label: 'Strange noises', nextQuestionId: 'ENGINE_NOISE' },
      { id: 'overheating', label: 'Overheating', nextQuestionId: 'ENGINE_OVERHEATING' },
      { id: 'loss_power', label: 'Loss of power', nextQuestionId: 'ENGINE_POWER_LOSS' },
      { id: 'smoke', label: 'Smoke or unusual smell', nextQuestionId: 'ENGINE_SMOKE' },
      { id: 'stalling', label: 'Engine stalling', nextQuestionId: 'ENGINE_STALLING' }
    ]
  },

  ENGINE_WONT_START: {
    id: 'ENGINE_WONT_START',
    text: 'When you turn the key, what happens?',
    type: 'single-choice',
    category: 'engine',
    subcategory: 'starting',
    options: [
      {
        id: 'no_sound',
        label: 'Nothing happens (no sound)',
        isSolution: true,
        solutionText: 'Check Battery',
        solutionSteps: [
          'Turn off all accessories and lights',
          'Check if battery terminals are clean and tight',
          'Try jump-starting the vehicle',
          'If jump-start works, battery may need replacement'
        ],
        category: 'engine',
        subcategory: 'starting'
      },
      {
        id: 'clicking',
        label: 'Clicking sound',
        isSolution: true,
        solutionText: 'Check Battery Connections',
        solutionSteps: [
          'Turn off the vehicle',
          'Open the hood safely',
          'Check if battery terminals are tight',
          'Clean any corrosion on terminals',
          'Try starting again'
        ],
        category: 'engine',
        subcategory: 'starting'
      },
      {
        id: 'cranks_no_start',
        label: 'Engine cranks but won\'t start',
        category: 'engine',
        subcategory: 'starting'
      },
      {
        id: 'starts_dies',
        label: 'Starts then immediately dies',
        category: 'engine',
        subcategory: 'starting'
      }
    ]
  },

  ENGINE_NOISE: {
    id: 'ENGINE_NOISE',
    text: 'What type of noise is coming from the engine?',
    type: 'single-choice',
    category: 'engine',
    subcategory: 'noise',
    options: [
      { id: 'knocking', label: 'Knocking or pinging', category: 'engine', subcategory: 'noise' },
      { id: 'squealing', label: 'Squealing or screeching', category: 'engine', subcategory: 'noise' },
      { id: 'rattling', label: 'Rattling', category: 'engine', subcategory: 'noise' },
      { id: 'hissing', label: 'Hissing or whistling', category: 'engine', subcategory: 'noise' }
    ]
  },

  ENGINE_OVERHEATING: {
    id: 'ENGINE_OVERHEATING',
    text: 'Is the temperature gauge showing hot, or is there steam/smoke?',
    type: 'single-choice',
    category: 'engine',
    subcategory: 'overheating',
    options: [
      {
        id: 'gauge_hot',
        label: 'Temperature gauge is in the red',
        isSolution: true,
        solutionText: 'Immediate Action Required',
        solutionSteps: [
          'Pull over safely and turn off the engine immediately',
          'Do NOT open the radiator cap while hot',
          'Wait 30 minutes for engine to cool',
          'Check coolant level when cool',
          'Do not drive - needs immediate service'
        ],
        category: 'engine',
        subcategory: 'overheating'
      },
      { id: 'steam', label: 'Steam coming from hood', category: 'engine', subcategory: 'overheating' },
      { id: 'smell', label: 'Sweet smell (coolant)', category: 'engine', subcategory: 'overheating' }
    ]
  },

  // ELECTRICAL QUESTIONS
  ELECTRICAL_SYMPTOM: {
    id: 'ELECTRICAL_SYMPTOM',
    text: 'What electrical problem is occurring?',
    type: 'single-choice',
    category: 'electrical',
    options: [
      { id: 'battery_dead', label: 'Battery keeps dying', nextQuestionId: 'ELECTRICAL_BATTERY' },
      { id: 'lights_not_working', label: 'Lights not working', nextQuestionId: 'ELECTRICAL_LIGHTS' },
      { id: 'accessories', label: 'Accessories not working', nextQuestionId: 'ELECTRICAL_ACCESSORIES' },
      { id: 'warning_light', label: 'Battery warning light on', category: 'electrical', subcategory: 'charging' }
    ]
  },

  ELECTRICAL_BATTERY: {
    id: 'ELECTRICAL_BATTERY',
    text: 'How old is the battery?',
    type: 'single-choice',
    category: 'electrical',
    subcategory: 'battery',
    options: [
      {
        id: 'old_battery',
        label: 'More than 3 years old',
        isSolution: true,
        solutionText: 'Battery Replacement Likely Needed',
        solutionSteps: [
          'Batteries typically last 3-5 years',
          'Have battery tested at service center',
          'May need replacement',
          'Check charging system as well'
        ],
        category: 'electrical',
        subcategory: 'battery'
      },
      { id: 'new_battery', label: 'Less than 3 years old', category: 'electrical', subcategory: 'charging' },
      { id: 'unknown', label: 'Not sure', category: 'electrical', subcategory: 'battery' }
    ]
  },

  ELECTRICAL_LIGHTS: {
    id: 'ELECTRICAL_LIGHTS',
    text: 'Which lights are not working?',
    type: 'multiple-choice',
    category: 'electrical',
    subcategory: 'lights',
    options: [
      { id: 'headlights', label: 'Headlights', category: 'electrical', subcategory: 'lights' },
      { id: 'brake_lights', label: 'Brake lights', category: 'electrical', subcategory: 'lights' },
      { id: 'turn_signals', label: 'Turn signals', category: 'electrical', subcategory: 'lights' },
      { id: 'interior', label: 'Interior lights', category: 'electrical', subcategory: 'lights' }
    ]
  },

  // BRAKE QUESTIONS
  BRAKE_SYMPTOM: {
    id: 'BRAKE_SYMPTOM',
    text: 'What brake problem is occurring?',
    type: 'single-choice',
    category: 'brakes',
    options: [
      { id: 'noise', label: 'Squealing or grinding noise', nextQuestionId: 'BRAKE_NOISE' },
      { id: 'soft_pedal', label: 'Soft or spongy brake pedal', category: 'brakes', subcategory: 'pedal_feel' },
      { id: 'hard_pedal', label: 'Hard brake pedal', category: 'brakes', subcategory: 'pedal_feel' },
      { id: 'pulling', label: 'Vehicle pulls to one side', category: 'brakes', subcategory: 'performance' },
      { id: 'warning_light', label: 'Brake warning light on', category: 'brakes', subcategory: 'warning_light' },
      { id: 'vibration', label: 'Vibration when braking', category: 'brakes', subcategory: 'performance' }
    ]
  },

  BRAKE_NOISE: {
    id: 'BRAKE_NOISE',
    text: 'When does the noise occur?',
    type: 'single-choice',
    category: 'brakes',
    subcategory: 'noise',
    options: [
      {
        id: 'always',
        label: 'Every time I brake',
        isSolution: true,
        solutionText: 'Brake Inspection Needed',
        solutionSteps: [
          'Squealing usually means brake pads are worn',
          'Grinding means pads are completely worn',
          'Do not delay - safety issue',
          'Schedule immediate inspection'
        ],
        category: 'brakes',
        subcategory: 'noise'
      },
      { id: 'sometimes', label: 'Only sometimes', category: 'brakes', subcategory: 'noise' },
      { id: 'wet', label: 'Only when wet', category: 'brakes', subcategory: 'noise' }
    ]
  },

  // HVAC QUESTIONS
  HVAC_SYMPTOM: {
    id: 'HVAC_SYMPTOM',
    text: 'What heating or cooling problem is occurring?',
    type: 'single-choice',
    category: 'hvac',
    options: [
      { id: 'ac_not_cold', label: 'AC not blowing cold', nextQuestionId: 'HVAC_AC_NOT_COLD' },
      { id: 'heater_not_hot', label: 'Heater not blowing hot', category: 'hvac', subcategory: 'heater_not_hot' },
      { id: 'no_air', label: 'No air coming out', category: 'hvac', subcategory: 'fan_not_working' },
      { id: 'smell', label: 'Bad smell from vents', category: 'hvac', subcategory: 'smell' },
      { id: 'noise', label: 'Strange noise from AC', category: 'hvac', subcategory: 'noise' }
    ]
  },

  HVAC_AC_NOT_COLD: {
    id: 'HVAC_AC_NOT_COLD',
    text: 'Is any air coming out of the vents?',
    type: 'yes-no',
    category: 'hvac',
    subcategory: 'ac_not_cold',
    options: [
      { id: 'yes', label: 'Yes, but not cold', category: 'hvac', subcategory: 'ac_not_cold' },
      { id: 'no', label: 'No air at all', category: 'hvac', subcategory: 'fan_not_working' }
    ]
  },

  // OTHER/DESCRIPTION
  OTHER_DESCRIPTION: {
    id: 'OTHER_DESCRIPTION',
    text: 'Please describe the issue in detail',
    type: 'text-input',
    category: 'other',
    subcategory: 'unknown'
  }
};

// Helper function to get next question
export function getNextQuestion(
  currentQuestionId: string,
  answer: string | string[]
): DiagnosticQuestion | null {
  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentQuestionId];
  if (!currentQuestion) return null;

  // If single answer, find the selected option
  if (typeof answer === 'string' && currentQuestion.options) {
    const selectedOption = currentQuestion.options.find(opt => opt.id === answer);
    if (selectedOption?.nextQuestionId) {
      return DIAGNOSTIC_QUESTIONS[selectedOption.nextQuestionId] || null;
    }
  }

  // If question has a direct nextQuestionId
  if (currentQuestion.nextQuestionId && typeof currentQuestion.nextQuestionId === 'string') {
    return DIAGNOSTIC_QUESTIONS[currentQuestion.nextQuestionId] || null;
  }

  return null;
}

// Generate summary from diagnostic session
export function generateDiagnosticSummary(answers: Array<{ questionText: string; answer: string | string[] }>): string {
  const parts: string[] = [];
  
  answers.forEach(({ questionText, answer }) => {
    if (Array.isArray(answer)) {
      parts.push(`${questionText}: ${answer.join(', ')}`);
    } else {
      parts.push(`${questionText}: ${answer}`);
    }
  });

  return parts.join('\n');
}
