import React, { useState, useEffect, useMemo } from 'react';
import { Button, Radio, Space, Typography, List, Card, Empty, Row, Col } from 'antd';
import { Icon } from '@iconify/react'; // Import Icon from Iconify

const { Text, Title, Paragraph } = Typography;

interface DiagnosticOption {
  label: string;
  nextQuestionId: string | 'END_FLOW';
  summaryText: string;
}

interface DiagnosticQuestion {
  id: string;
  question: string;
  options: DiagnosticOption[];
}

// Hardcoded diagnostic flow for initial implementation
const diagnosticFlow: DiagnosticQuestion[] = [
  {
    id: 'start',
    question: 'What is the primary issue the client is reporting?',
    options: [
      { label: 'Vehicle not starting/power issue', nextQuestionId: 'power_issue', summaryText: 'Vehicle not starting/power issue' },
      { label: 'Motor/engine noise or malfunction', nextQuestionId: 'motor_issue', summaryText: 'Motor/engine noise or malfunction' },
      { label: 'Brake system problem', nextQuestionId: 'brake_issue', summaryText: 'Brake system problem' },
      { label: 'Lights/electrical accessories not working', nextQuestionId: 'electrical_issue', summaryText: 'Lights/electrical accessories not working' },
      { label: 'Physical damage/accident', nextQuestionId: 'physical_damage', summaryText: 'Physical damage/accident' },
      { label: 'Other / Unsure', nextQuestionId: 'other_issue', summaryText: 'Other / Unsure issue reported' },
    ],
  },
  {
    id: 'power_issue',
    question: 'Describe the power issue:',
    options: [
      { label: 'Completely dead, no lights', nextQuestionId: 'END_FLOW', summaryText: 'Completely dead, no lights' },
      { label: 'Lights on, but motor not engaging', nextQuestionId: 'END_FLOW', summaryText: 'Lights on, but motor not engaging' },
      { label: 'Intermittent power loss', nextQuestionId: 'END_FLOW', summaryText: 'Intermittent power loss' },
      { label: 'Battery draining quickly', nextQuestionId: 'END_FLOW', summaryText: 'Battery draining quickly' },
    ],
  },
  {
    id: 'motor_issue',
    question: 'What kind of motor/engine noise or malfunction?',
    options: [
      { label: 'Loud grinding/whining noise', nextQuestionId: 'END_FLOW', summaryText: 'Loud grinding/whining noise from motor' },
      { label: 'Motor cuts out intermittently', nextQuestionId: 'END_FLOW', summaryText: 'Motor cuts out intermittently' },
      { label: 'Loss of power/acceleration', nextQuestionId: 'END_FLOW', summaryText: 'Loss of power/acceleration' },
      { label: 'Motor overheating warning', nextQuestionId: 'END_FLOW', summaryText: 'Motor overheating warning' },
    ],
  },
  {
    id: 'brake_issue',
    question: 'What is the brake system problem?',
    options: [
      { label: 'Brakes feel spongy/soft', nextQuestionId: 'END_FLOW', summaryText: 'Brakes feel spongy/soft' },
      { label: 'Brakes making squealing/grinding noise', nextQuestionId: 'END_FLOW', summaryText: 'Brakes making squealing/grinding noise' },
      { label: 'Brakes not engaging properly', nextQuestionId: 'END_FLOW', summaryText: 'Brakes not engaging properly' },
      { label: 'Brake light on dashboard', nextQuestionId: 'END_FLOW', summaryText: 'Brake light on dashboard' },
    ],
  },
  {
    id: 'electrical_issue',
    question: 'Which electrical accessories are affected?',
    options: [
      { label: 'Headlights/Taillights not working', nextQuestionId: 'END_FLOW', summaryText: 'Headlights/Taillights not working' },
      { label: 'Turn signals/Hazard lights faulty', nextQuestionId: 'END_FLOW', summaryText: 'Turn signals/Hazard lights faulty' },
      { label: 'Horn not working', nextQuestionId: 'END_FLOW', summaryText: 'Horn not working' },
      { label: 'Dashboard display issues', nextQuestionId: 'END_FLOW', summaryText: 'Dashboard display issues' },
    ],
  },
  {
    id: 'physical_damage',
    question: 'Describe the physical damage:',
    options: [
      { label: 'Body panel damage', nextQuestionId: 'END_FLOW', summaryText: 'Body panel damage' },
      { label: 'Broken mirror/windshield', nextQuestionId: 'END_FLOW', summaryText: 'Broken mirror/windshield' },
      { label: 'Flat tire/wheel damage', nextQuestionId: 'END_FLOW', summaryText: 'Flat tire/wheel damage' },
      { label: 'Other structural damage', nextQuestionId: 'END_FLOW', summaryText: 'Other structural damage' },
    ],
  },
  {
    id: 'other_issue',
    question: 'Please provide more details about the issue:',
    options: [
      { label: 'Unusual sounds (specify)', nextQuestionId: 'END_FLOW', summaryText: 'Unusual sounds reported' },
      { label: 'Vibration while riding', nextQuestionId: 'END_FLOW', summaryText: 'Vibration while riding' },
      { label: 'Fluid leak (specify type)', nextQuestionId: 'END_FLOW', summaryText: 'Fluid leak reported' },
      { label: 'Performance degradation (general)', nextQuestionId: 'END_FLOW', summaryText: 'General performance degradation' },
    ],
  },
];

interface DiagnosticFlowInputProps {
  onDiagnosisComplete: (summary: string) => void;
  initialInitialDiagnosis?: string | null; // Changed prop name
}

export const DiagnosticFlowInput: React.FC<DiagnosticFlowInputProps> = ({ onDiagnosisComplete, initialInitialDiagnosis }) => { // Changed prop name
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('start');
  const [answeredOptions, setAnsweredOptions] = useState<string[]>([]);
  const [flowHistory, setFlowHistory] = useState<string[]>([]); // Stores previous question IDs

  const currentQuestion = useMemo(() => {
    return diagnosticFlow.find(q => q.id === currentQuestionId);
  }, [currentQuestionId]);

  useEffect(() => {
    // If there's an initial client report, we assume it's a manual entry or from a previous flow.
    // For now, we'll just display it as the summary and disable the flow.
    // A more advanced implementation might try to parse it back into flow answers.
    if (initialInitialDiagnosis) { // Changed prop name
      setAnsweredOptions([initialInitialDiagnosis]); // Changed prop name
      setCurrentQuestionId('END_FLOW'); // Effectively ends the flow
    } else {
      handleReset(); // Ensure clean state if no initial report
    }
  }, [initialInitialDiagnosis]); // Changed prop name

  useEffect(() => {
    const summary = answeredOptions.map(text => `- ${text}`).join('\n');
    onDiagnosisComplete(summary);
  }, [answeredOptions, onDiagnosisComplete]);

  const handleOptionSelect = (option: DiagnosticOption) => {
    setFlowHistory(prev => [...prev, currentQuestionId]);
    setAnsweredOptions(prev => [...prev, option.summaryText]);
    setCurrentQuestionId(option.nextQuestionId);
  };

  const handleBack = () => {
    if (flowHistory.length > 0) {
      const previousQuestionId = flowHistory[flowHistory.length - 1];
      setFlowHistory(prev => prev.slice(0, -1));
      setAnsweredOptions(prev => prev.slice(0, -1));
      setCurrentQuestionId(previousQuestionId);
    }
  };

  const handleReset = () => {
    setCurrentQuestionId('start');
    setAnsweredOptions([]);
    setFlowHistory([]);
  };

  const isFlowEnded = currentQuestionId === 'END_FLOW';

  return (
    <Card
      title="Client Issue Diagnosis"
      extra={
        <Space>
          <Button
            icon={<Icon icon="ph:arrow-left-fill" />}
            onClick={handleBack}
            disabled={flowHistory.length === 0 || isFlowEnded}
            size="small"
          >
            Back
          </Button>
          <Button
            icon={<Icon icon="ph:rotate-clockwise-fill" />}
            onClick={handleReset}
            disabled={currentQuestionId === 'start' && answeredOptions.length === 0}
            size="small"
          >
            Reset
          </Button>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={5} style={{ margin: 0 }}>Current Summary:</Title>
          {answeredOptions.length > 0 ? (
            <List
              size="small"
              dataSource={answeredOptions}
              renderItem={item => <List.Item style={{ padding: '4px 0' }}><Text>{item}</Text></List.Item>}
              style={{ marginTop: 8 }}
            />
          ) : (
            <Paragraph type="secondary">No diagnostic steps taken yet.</Paragraph>
          )}
        </Col>
        <Col span={24}>
          {isFlowEnded ? (
            <Empty description="Diagnosis complete. You can reset to start over or manually edit the report below." />
          ) : (
            currentQuestion ? (
              <>
                <Title level={5}>{currentQuestion.question}</Title>
                <Radio.Group onChange={(e) => handleOptionSelect(e.target.value)} value={null} style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {currentQuestion.options.map(option => (
                      <Radio key={option.nextQuestionId} value={option}>
                        {option.label}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </>
            ) : (
              <Empty description="Diagnostic flow not found or ended." />
            )
          )}
        </Col>
      </Row>
    </Card>
  );
};