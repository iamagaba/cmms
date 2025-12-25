// EV Bike: multi-issue diagnostic flows with conditional tips

export type ProblemId = 'bike_not_moving' | 'lights_off' | 'motor_issue';

export type StepType = 'yesno' | 'choice' | 'numeric' | 'end';

export type YesNoKey = 'yes' | 'no';

interface BaseStep {
  id: string;
  type: StepType;
  title: string;
  question?: string;
}

export interface YesNoStep extends BaseStep {
  type: 'yesno';
  answers: Record<YesNoKey, { next: string; tip?: string; summaryAdd: string }>;
}

export interface ChoiceOption {
  value: string;
  label: string;
  next: string;
  tip?: string;
  summaryAdd: string;
}

export interface ChoiceStep extends BaseStep {
  type: 'choice';
  options: ChoiceOption[];
}

export interface NumericRoute {
  when: (v: number) => boolean;
  next: string;
  summaryAdd: (v: number) => string;
  tip?: string;
}

export interface NumericStep extends BaseStep {
  type: 'numeric';
  unit?: string; // e.g., V
  placeholder?: string;
  min?: number;
  max?: number;
  precision?: number;
  routes: NumericRoute[];
  validate?: (v: number | null) => string | null;
}

export interface EndStep extends BaseStep {
  type: 'end';
  outcome: 'resolved' | 'escalate';
  summaryAdd?: string;
}

export type Step = YesNoStep | ChoiceStep | NumericStep | EndStep;

export interface ProblemFlow {
  id: ProblemId;
  label: string;
  firstStepId: string;
  steps: Record<string, Step>;
}

export const diagnosticFlows: Record<ProblemId, ProblemFlow> = {
  bike_not_moving: {
    id: 'bike_not_moving',
    label: 'The bike is not moving',
    firstStepId: 'display_on_1',
    steps: {
      display_on_1: {
        id: 'display_on_1',
        type: 'yesno',
        title: 'Power check',
        question: "Is the bike's display ON?",
        answers: {
          yes: { next: 'connector_check', summaryAdd: 'The display is ON.' },
          no: {
            next: 'display_on_after_restart',
            tip: 'Turn lights off AND turn bike off and wait for 30 seconds. Turn the bike back on.',
            summaryAdd: 'The display is OFF.',
          },
        },
      },
      display_on_after_restart: {
        id: 'display_on_after_restart',
        type: 'yesno',
        title: 'After restart',
        question: 'Is the display ON now?',
        answers: {
          yes: { next: 'connector_check', summaryAdd: 'The display turned ON after restarting.' },
          no: { next: 'end_escalate_display', summaryAdd: 'The display is still OFF after restart.' },
        },
      },
      connector_check: {
        id: 'connector_check',
        type: 'choice',
        title: 'Power connector',
        question: 'Check the main (red) power connector. Is it loose or tight?'
        ,
        options: [
          {
            value: 'loose',
            label: 'It is loose',
            tip: 'Turn off the bike, tighten the connector, then turn the bike back on.',
            next: 'display_on_after_connector',
            summaryAdd: 'The power connector was loose.',
          },
          {
            value: 'tight',
            label: 'It is tight',
            next: 'display_on_after_connector',
            summaryAdd: 'The power connector was tight.',
          },
        ],
      },
      display_on_after_connector: {
        id: 'display_on_after_connector',
        type: 'yesno',
        title: 'After connector check',
        question: 'Is the display ON now?',
        answers: {
          yes: { next: 'battery_voltage', summaryAdd: 'The display is ON after checking the connector.' },
          no: { next: 'end_escalate_display', summaryAdd: 'The display is still OFF after connector check.' },
        },
      },
      battery_voltage: {
        id: 'battery_voltage',
        type: 'numeric',
        title: 'Battery voltage',
        question: 'How many Volts does the display show? (Expected 40.0 – 53.9 V)',
        unit: 'V',
        min: 35,
        max: 60,
        precision: 1,
        placeholder: 'e.g., 43.5',
        validate: (v) => {
          if (v == null) return 'Please enter a voltage reading.';
          if (v < 35 || v > 60) return 'Please enter a realistic reading between 35 and 60 V.';
          return null;
        },
        routes: [
          {
            when: (v) => v < 44,
            next: 'end_escalate_low_voltage',
            summaryAdd: (v) => `Battery voltage is below 44V (${v}V).`,
            tip: 'Battery appears under-voltage. Advise swapping/charging and escalate.',
          },
          {
            when: (v) => v >= 44 && v <= 53.9,
            next: 'confirm_issue',
            summaryAdd: (v) => `Battery voltage is within range (${v}V).`,
          },
          {
            when: (v) => v > 53.9,
            next: 'confirm_issue',
            summaryAdd: (v) => `Battery voltage is above expected range (${v}V).`,
            tip: 'Unusually high reading—verify meter/display calibration if possible.',
          },
        ],
      },
      confirm_issue: {
        id: 'confirm_issue',
        type: 'yesno',
        title: 'Confirm the findings',
        question: 'Do you confirm this is the issue?',
        answers: {
          yes: { next: 'end_resolved', summaryAdd: 'Customer confirmed the diagnosis.' },
          no: { next: 'end_escalate_generic', summaryAdd: 'Customer did not confirm; escalating.' },
        },
      },
      end_escalate_display: {
        id: 'end_escalate_display',
        type: 'end',
        title: 'Escalate',
        outcome: 'escalate',
        summaryAdd: 'Display did not power on after guidance—escalating to technician.',
      },
      end_escalate_low_voltage: {
        id: 'end_escalate_low_voltage',
        type: 'end',
        title: 'Escalate',
        outcome: 'escalate',
        summaryAdd: 'Low battery voltage—escalating to technician.',
      },
      end_escalate_generic: {
        id: 'end_escalate_generic',
        type: 'end',
        title: 'Escalate',
        outcome: 'escalate',
        summaryAdd: 'Issue unresolved after steps—escalating to technician.',
      },
      end_resolved: {
        id: 'end_resolved',
        type: 'end',
        title: 'Resolved',
        outcome: 'resolved',
        summaryAdd: 'Issue resolved through guided troubleshooting.',
      },
    },
  },

  lights_off: {
    id: 'lights_off',
    label: 'My lights are off',
    firstStepId: 'light_switch',
    steps: {
      light_switch: {
        id: 'light_switch',
        type: 'yesno',
        title: 'Light switch',
        question: 'Is the handlebar light switch turned ON?',
        answers: {
          yes: { next: 'light_cable', summaryAdd: 'Light switch is ON.' },
          no: { next: 'end_resolved_light_switch', summaryAdd: 'Light switch was OFF.' },
        },
      },
      end_resolved_light_switch: {
        id: 'end_resolved_light_switch',
        type: 'end',
        title: 'Resolved',
        outcome: 'resolved',
        summaryAdd: 'Lights restored by switching ON at handlebar.',
      },
      light_cable: {
        id: 'light_cable',
        type: 'choice',
        title: 'Wiring check',
        question: 'Inspect the light connector at the head tube. Is it properly seated?',
        options: [
          {
            value: 'seated',
            label: 'Properly seated',
            next: 'light_bulb',
            summaryAdd: 'Headlight connector seated.',
          },
          {
            value: 'loose',
            label: 'Loose / disconnected',
            tip: 'Power off the bike and firmly reconnect the headlight connector until it clicks.',
            next: 'light_after_reseat',
            summaryAdd: 'Headlight connector was loose and re-seated.',
          },
        ],
      },
      light_after_reseat: {
        id: 'light_after_reseat',
        type: 'yesno',
        title: 'After reseat',
        question: 'Are the lights ON now?',
        answers: {
          yes: { next: 'end_resolved_light_reseat', summaryAdd: 'Lights turned ON after reseating.' },
          no: { next: 'light_bulb', summaryAdd: 'Lights still OFF after reseating.' },
        },
      },
      end_resolved_light_reseat: {
        id: 'end_resolved_light_reseat',
        type: 'end',
        title: 'Resolved',
        outcome: 'resolved',
        summaryAdd: 'Lights restored after reseating connector.',
      },
      light_bulb: {
        id: 'light_bulb',
        type: 'choice',
        title: 'Lamp state',
        question: 'Inspect the headlamp. Does the lamp appear damaged or burnt?',
        options: [
          { value: 'ok', label: 'Looks OK', next: 'end_escalate_light', summaryAdd: 'Lamp appears OK.' },
          { value: 'damaged', label: 'Damaged/Burnt', next: 'end_escalate_light', summaryAdd: 'Lamp is damaged/burnt.' },
        ],
      },
      end_escalate_light: {
        id: 'end_escalate_light',
        type: 'end',
        title: 'Escalate',
        outcome: 'escalate',
        summaryAdd: 'Headlight issue requires technician follow-up (possible replacement).',
      },
    },
  },

  motor_issue: {
    id: 'motor_issue',
    label: 'Issue with the motor',
    firstStepId: 'abnormal_noise',
    steps: {
      abnormal_noise: {
        id: 'abnormal_noise',
        type: 'choice',
        title: 'Motor behavior',
        question: 'What do you notice from the motor?',
        options: [
          { value: 'no_response', label: 'No response', next: 'throttle_assist', summaryAdd: 'Motor has no response.' },
          { value: 'clicking', label: 'Clicking / grinding', next: 'end_escalate_motor', summaryAdd: 'Motor is making abnormal noise.' },
          { value: 'intermittent', label: 'Intermittent power', next: 'connector_motor', summaryAdd: 'Motor power is intermittent.' },
        ],
      },
      throttle_assist: {
        id: 'throttle_assist',
        type: 'yesno',
        title: 'Input check',
        question: 'Does the motor respond to throttle or pedal-assist at all?',
        answers: {
          yes: { next: 'connector_motor', summaryAdd: 'Motor responds partially.' },
          no: { next: 'end_escalate_motor', summaryAdd: 'No response to throttle/assist.' },
        },
      },
      connector_motor: {
        id: 'connector_motor',
        type: 'choice',
        title: 'Motor connector',
        question: 'Inspect the motor phase/signal connectors near the rear hub. Are they secure?',
        options: [
          {
            value: 'loose',
            label: 'Loose / disconnected',
            tip: 'Power off the bike and firmly reconnect the motor connectors.',
            next: 'motor_after_reseat',
            summaryAdd: 'Motor connector was loose and re-seated.',
          },
          { value: 'secure', label: 'Secure', next: 'end_escalate_motor', summaryAdd: 'Motor connectors appear secure.' },
        ],
      },
      motor_after_reseat: {
        id: 'motor_after_reseat',
        type: 'yesno',
        title: 'After reseat',
        question: 'Does the motor operate normally now?',
        answers: {
          yes: { next: 'end_resolved_motor_reseat', summaryAdd: 'Motor operates normally after reseating.' },
          no: { next: 'end_escalate_motor', summaryAdd: 'Motor still faulty after reseating.' },
        },
      },
      end_resolved_motor_reseat: {
        id: 'end_resolved_motor_reseat',
        type: 'end',
        title: 'Resolved',
        outcome: 'resolved',
        summaryAdd: 'Motor issue resolved after reseating connectors.',
      },
      end_escalate_motor: {
        id: 'end_escalate_motor',
        type: 'end',
        title: 'Escalate',
        outcome: 'escalate',
        summaryAdd: 'Motor requires technician diagnosis (possible hall sensor/phase wiring/drive issue).',
      },
    },
  },
};

export type AnswersMap = Record<string, string | number | boolean | null>;
