import React, { useMemo, useState } from 'react';
import { Card, Typography, Button, Space, Segmented, Alert, InputNumber, Divider } from 'antd';
import { diagnosticFlows, ProblemId, Step, YesNoKey } from './bikeDiagnosisFlow';

export interface BikeDiagnosisWizardProps {
  onComplete: (summaryText: string) => void;
}

const { Title, Paragraph, Text } = Typography;

export const BikeDiagnosisWizard: React.FC<BikeDiagnosisWizardProps> = ({ onComplete }) => {
  const [problemId, setProblemId] = useState<ProblemId | null>(null);
  const [stepId, setStepId] = useState<string | null>(null);
  const [, setAnswers] = useState<Record<string, unknown>>({});
  const [summary, setSummary] = useState<string[]>([]);
  const [tip, setTip] = useState<string | null>(null);
  const [numericError, setNumericError] = useState<string | null>(null);

  const problem = problemId ? diagnosticFlows[problemId] : null;
  const step: Step | null = useMemo(() => {
    if (!problem || !stepId) return null;
    return problem.steps[stepId];
  }, [problem, stepId]);

  const startProblem = (id: ProblemId) => {
    setProblemId(id);
    setStepId(diagnosticFlows[id].firstStepId);
    setAnswers({});
    setSummary([diagnosticFlows[id].label]);
    setTip(null);
    setNumericError(null);
  };

  const goNext = (next: string) => {
    setStepId(next);
    setTip(null);
    setNumericError(null);
  };

  const addSummary = (line: string) => {
    if (!line) return;
    setSummary((prev) => [...prev, line]);
  };

  const handleYesNo = (choice: YesNoKey) => {
    if (!step || step.type !== 'yesno') return;
    const route = step.answers[choice];
    setAnswers((prev) => ({ ...prev, [step.id]: choice }));
    addSummary(route.summaryAdd);
    if (route.tip) setTip(route.tip);
    setTimeout(() => goNext(route.next), route.tip ? 900 : 0);
  };

  const handleChoice = (val: string) => {
    if (!step || step.type !== 'choice') return;
    setAnswers((prev) => ({ ...prev, [step.id]: val }));
    const opt = step.options.find((o) => o.value === val);
    if (!opt) return;
    addSummary(opt.summaryAdd);
    if (opt.tip) setTip(opt.tip);
    setTimeout(() => goNext(opt.next), opt.tip ? 900 : 0);
  };

  const handleNumeric = (val: number | null) => {
    if (!step || step.type !== 'numeric') return;
    const err = step.validate ? step.validate(val) : null;
    setNumericError(err);
    if (val == null || err) return;
    setAnswers((prev) => ({ ...prev, [step.id]: val }));
    const route = step.routes.find((r) => r.when(val));
    if (!route) return;
    addSummary(route.summaryAdd(val));
    if (route.tip) setTip(route.tip);
    setTimeout(() => goNext(route.next), route.tip ? 900 : 0);
  };

  const restart = () => {
    setProblemId(null);
    setStepId(null);
    setAnswers({});
    setSummary([]);
    setTip(null);
    setNumericError(null);
  };

  return (
    <Card title="Client Issue Diagnosis" style={{ marginBottom: 16 }}>
      {!problem && (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Title level={5} style={{ margin: 0 }}>What is the issue you are calling for?</Title>
          <Segmented
            block
            options={[
              { label: 'The bike is not moving', value: 'bike_not_moving' },
              { label: 'My lights are off', value: 'lights_off' },
              { label: 'Issue with the motor', value: 'motor_issue' },
            ]}
            onChange={(v) => startProblem(v as ProblemId)}
          />
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Select the closest issue to begin guided troubleshooting.
          </Paragraph>
        </Space>
      )}

      {problem && step && step.type !== 'end' && (
        <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Title level={5} style={{ margin: 0 }}>{step.title}</Title>
            <Button type="link" size="small" onClick={restart} style={{ paddingInline: 0 }}>Restart</Button>
          </div>
          {step.question && <Text strong>{step.question}</Text>}

          {step.type === 'yesno' && (
            <Segmented
              options={[{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }]}
              onChange={(v) => handleYesNo(v as YesNoKey)}
              block
            />
          )}

          {step.type === 'choice' && (
            <Segmented
              options={(step.options).map((o) => ({ label: o.label, value: o.value }))}
              onChange={(v) => handleChoice(v as string)}
              block
            />
          )}

          {step.type === 'numeric' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <InputNumber
                style={{ width: 180 }}
                min={step.min}
                max={step.max}
                step={0.1}
                precision={step.precision ?? 1}
                placeholder={step.placeholder}
                onChange={(v) => setAnswers((prev) => ({ ...prev, [step.id]: v }))}
                onPressEnter={(e) => {
                  const target = e.target as HTMLInputElement;
                  const val = Number(target.value);
                  handleNumeric(Number.isNaN(val) ? null : val);
                }}
                onBlur={(e) => {
                  const val = Number((e.target as HTMLInputElement).value);
                  handleNumeric(Number.isNaN(val) ? null : val);
                }}
              />
              <span style={{ opacity: 0.7 }}>V</span>
              <Button
                type="primary"
                onClick={() => {
                  const el = document.activeElement as HTMLInputElement | null;
                  const val = el ? Number(el.value) : NaN;
                  handleNumeric(Number.isNaN(val) ? null : val);
                }}
              >
                Continue
              </Button>
            </div>
          )}

          {tip && (
            <Alert type="info" showIcon message={tip} style={{ marginTop: 8 }} />
          )}

          {numericError && (
            <Alert type="error" showIcon message={numericError} style={{ marginTop: 8 }} />
          )}

          <Divider style={{ margin: '12px 0' }} />

          <div>
            <Text type="secondary">Summary so far:</Text>
            <ul style={{ margin: '6px 0 0', paddingInlineStart: 18, listStyleType: 'disc' }}>
              {summary.map((line, idx) => (
                <li key={idx}><Text>{line}</Text></li>
              ))}
            </ul>
          </div>
        </Space>
      )}

      {problem && step && step.type === 'end' && (
        <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 8 }}>
          <Title level={5} style={{ margin: 0 }}>{step.title}</Title>
          <Paragraph>
            {step.outcome === 'resolved'
              ? 'We were able to resolve the issue with basic troubleshooting.'
              : 'We could not resolve the issue. Please inform the customer that the case will be escalated to a technician.'}
          </Paragraph>
          <div>
            <Text type="secondary">Summary:</Text>
            <ul style={{ margin: '6px 0 0', paddingInlineStart: 18, listStyleType: 'disc' }}>
              {[...(summary || []), (step.summaryAdd || '')]
                .filter(Boolean)
                .map((line, idx) => (<li key={idx}><Text>{line}</Text></li>))}
            </ul>
          </div>
          <div>
            <Button
              type="primary"
              onClick={() => onComplete(summaryToText([...(summary || []), (step.summaryAdd || '')]))}
            >
              Save to Work Order
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={restart}>Start Over</Button>
          </div>
        </Space>
      )}
    </Card>
  );
};

export default BikeDiagnosisWizard;

function summaryToText(lines: string[]) {
  const items = lines.filter(Boolean);
  if (!items.length) return '';
  return items.map((l) => `- ${l}`).join('\n');
}
