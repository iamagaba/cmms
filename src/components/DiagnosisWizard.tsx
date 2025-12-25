import React, { useState } from 'react';
import { Card, Steps, Button, Radio, Checkbox, Input, Typography, Space, Result } from 'antd';
import { diagnosisFlow } from './diagnosisFlow';

const { TextArea } = Input;

function getStepIndexById(id: string) {
  return diagnosisFlow.findIndex((s) => s.id === id);
}

export const DiagnosisWizard: React.FC = () => {
  const [currentStepId, setCurrentStepId] = useState(diagnosisFlow[0].id);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [completed, setCompleted] = useState(false);

  const step = diagnosisFlow.find((s) => s.id === currentStepId)!;
  const stepIndex = getStepIndexById(currentStepId);
  const isSummary = step.id === 'summary';

  const handleNext = () => {
    if (isSummary) {
      setCompleted(true);
      return;
    }
    let nextId: string | undefined;
    if (typeof step.next === 'function') {
      nextId = step.next(answers[step.id]);
    }
    if (!nextId) {
      // fallback: go to next in array
      nextId = diagnosisFlow[stepIndex + 1]?.id;
    }
    if (nextId) setCurrentStepId(nextId);
  };

  const handleBack = () => {
    if (stepIndex === 0) return;
    // Find previous step that isn't summary
    let prevIdx = stepIndex - 1;
    while (diagnosisFlow[prevIdx]?.id === 'summary' && prevIdx > 0) prevIdx--;
    setCurrentStepId(diagnosisFlow[prevIdx].id);
  };


  // For auto-advance: if not input, go to next step after answer
  const handleAnswer = (value: any) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
    if (step.type === 'single' || step.type === 'multi') {
      setTimeout(() => handleNext(), 150); // slight delay for UX
    }
  };

  // Render input for current step
  let inputNode = null;
  if (step.type === 'single') {
    inputNode = (
      <Radio.Group
        value={answers[step.id]}
        onChange={(e) => handleAnswer(e.target.value)}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {step.options?.map((opt) => (
          <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
        ))}
      </Radio.Group>
    );
  } else if (step.type === 'multi') {
    inputNode = (
      <Checkbox.Group
        value={answers[step.id]}
        onChange={handleAnswer}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {step.options?.map((opt) => (
          <Checkbox key={opt.value} value={opt.value}>{opt.label}</Checkbox>
        ))}
      </Checkbox.Group>
    );
  } else if (step.type === 'input') {
    inputNode = (
      <TextArea
        value={answers[step.id]}
        onChange={(e) => handleAnswer(e.target.value)}
        rows={3}
        placeholder="Type your answer here..."
      />
    );
  }

  // Summary
  if (completed) {
    const summaryStep = diagnosisFlow.find((s) => s.id === 'summary');
    const recommendation = summaryStep?.recommendation?.(answers);
    return (
      <Result
        status="success"
        title="Diagnosis Complete"
        subTitle={recommendation}
        extra={[
          <Button type="primary" key="restart" onClick={() => { setAnswers({}); setCurrentStepId(diagnosisFlow[0].id); setCompleted(false); }}>
            Start Over
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: 400 }}>
          <Typography.Title level={5}>Your Answers</Typography.Title>
          <ul>
            {Object.entries(answers).map(([k, v]) => (
              k !== 'summary' && <li key={k}><b>{diagnosisFlow.find(s => s.id === k)?.title}:</b> {Array.isArray(v) ? v.join(', ') : v}</li>
            ))}
          </ul>
        </div>
      </Result>
    );
  }

  return (
  <Card size="small" style={{ maxWidth: 480, margin: '0 auto' }}>
      <Steps
        current={stepIndex}
        size="small"
        items={diagnosisFlow.filter(s => s.id !== 'summary').map((s) => ({ title: s.title }))}
        style={{ marginBottom: 24 }}
      />
      <Typography.Title level={5} style={{ marginBottom: 8 }}>{step.title}</Typography.Title>
      <Typography.Paragraph>{step.question}</Typography.Paragraph>
      <div style={{ marginBottom: 24 }}>{inputNode}</div>
      <Space>
        <Button onClick={handleBack} disabled={stepIndex === 0}>Back</Button>
        {step.type === 'input' && (
          <Button type="primary" onClick={handleNext} disabled={answers[step.id] == null || answers[step.id]?.length === 0}>
            {isSummary ? 'Finish' : 'Next'}
          </Button>
        )}
      </Space>
    </Card>
  );
};

export default DiagnosisWizard;
