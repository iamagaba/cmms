// Multistep diagnosis flow config for client issue troubleshooting
// Each step can branch based on answer, and has metadata for rendering

export type DiagnosisStepType = 'single' | 'multi' | 'input';

export interface DiagnosisStep {
  id: string;
  title: string;
  question: string;
  type: DiagnosisStepType;
  options?: { value: string; label: string }[];
  next?: (answer: any) => string | undefined; // function to determine next step id
  recommendation?: (answers: Record<string, any>) => string | undefined; // for summary
}

// Example flow for basic electric vehicle issues
export const diagnosisFlow: DiagnosisStep[] = [
  {
    id: 'main-issue',
    title: 'Main Issue',
    question: 'What is the main issue you are experiencing?',
    type: 'single',
    options: [
      { value: 'battery', label: 'Battery/Power' },
      { value: 'wont-start', label: 'Won’t Start' },
      { value: 'noise', label: 'Unusual Noise' },
      { value: 'lights', label: 'Lights/Electrical' },
      { value: 'other', label: 'Other' },
    ],
    next: (answer) => {
      switch (answer) {
        case 'battery': return 'battery-charging';
        case 'wont-start': return 'wont-start-checks';
        case 'noise': return 'noise-type';
        case 'lights': return 'lights-checks';
        default: return 'other-details';
      }
    },
  },
  {
    id: 'battery-charging',
    title: 'Battery Charging',
    question: 'Is the battery charging when plugged in?',
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not-sure', label: 'Not Sure' },
    ],
    next: (answer) => answer === 'no' ? 'charger-indicator' : 'battery-power-on',
  },
  {
    id: 'charger-indicator',
    title: 'Charger Indicator',
    question: 'Is the charger indicator light on?',
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not-sure', label: 'Not Sure' },
    ],
    next: () => 'battery-power-on',
  },
  {
    id: 'battery-power-on',
    title: 'Power On',
    question: 'Does the vehicle power on after charging?',
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    next: () => 'summary',
  },
  {
    id: 'wont-start-checks',
    title: 'Start Checks',
    question: 'Do you hear any sounds (clicks, whirrs) when trying to start?',
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    next: () => 'summary',
  },
  {
    id: 'noise-type',
    title: 'Noise Type',
    question: 'What type of noise do you hear?',
    type: 'single',
    options: [
      { value: 'grinding', label: 'Grinding' },
      { value: 'clicking', label: 'Clicking' },
      { value: 'buzzing', label: 'Buzzing' },
      { value: 'other', label: 'Other' },
    ],
    next: () => 'summary',
  },
  {
    id: 'lights-checks',
    title: 'Lights/Electrical',
    question: 'Which lights or electrical features are not working?',
    type: 'multi',
    options: [
      { value: 'headlights', label: 'Headlights' },
      { value: 'dashboard', label: 'Dashboard' },
      { value: 'indicators', label: 'Indicators' },
      { value: 'horn', label: 'Horn' },
      { value: 'other', label: 'Other' },
    ],
    next: () => 'summary',
  },
  {
    id: 'other-details',
    title: 'Other Issue',
    question: 'Please describe the issue in your own words.',
    type: 'input',
    next: () => 'summary',
  },
  {
    id: 'summary',
    title: 'Summary',
    question: '',
    type: 'input', // not rendered, just a marker
    recommendation: (answers) => {
      // Simple logic for demo; real logic could be more advanced
      if (answers['main-issue'] === 'battery' && answers['battery-charging'] === 'no') {
        return 'Check charger connection and try a different outlet. If the indicator is off, charger may be faulty.';
      }
      if (answers['main-issue'] === 'wont-start' && answers['wont-start-checks'] === 'no') {
        return 'Possible dead battery or electrical fault. Recommend checking battery terminals and fuses.';
      }
      if (answers['main-issue'] === 'noise') {
        return 'Unusual noises may indicate mechanical issues. Please avoid use and request service.';
      }
      return 'Review the answers and contact support if the issue persists.';
    },
  },
];
