import React from 'react';
import { Card, Typography, Space, Row, Col, Divider, Tooltip, Grid, theme } from 'antd';
import { Icon } from '@iconify/react'; // Import Icon from Iconify
import dayjs from 'dayjs';
import { WorkOrder } from '@/types/supabase';

const { Paragraph, Text } = Typography;

interface WorkOrderServiceLifecycleCardProps {
  workOrder: WorkOrder;
  handleUpdateWorkOrder: (updates: Partial<WorkOrder>) => void;
  usedPartsCount: number;
}

export const WorkOrderServiceLifecycleCard: React.FC<WorkOrderServiceLifecycleCardProps> = ({ workOrder, handleUpdateWorkOrder: _handleUpdateWorkOrder, usedPartsCount }) => {
  const [cardHover, setCardHover] = React.useState(false);
  const { token } = theme.useToken();
  const cardStyle = {
    borderRadius: token.borderRadiusLG,
    background: token.colorBgContainer,
    border: cardHover ? `1.5px solid ${token.colorBorder}` : `1px solid ${token.colorSplit}`,
    boxShadow: cardHover ? token.boxShadowSecondary : token.boxShadowTertiary,
    transition: 'box-shadow 0.18s, border 0.18s',
  } as React.CSSProperties;
  const isServiceCenterChannel = workOrder.channel === 'Service Center';
  const screens = Grid.useBreakpoint();

  // Helper to format date or return 'N/A'
  const formatDate = (dateString: string | null | undefined) =>
    dateString ? dayjs(dateString).format('MMM D, YYYY h:mm A') : 'N/A';

  return (
  <Card size="small" title="Service Information" style={cardStyle} bodyStyle={{ padding: 12 }} onMouseEnter={() => setCardHover(true)} onMouseLeave={() => setCardHover(false)}>
      {(() => {
        // Fallback: sometimes realtime/query mapping may still have notes under serviceNotes
        const decisionNotes = workOrder.maintenanceNotes || workOrder.serviceNotes || '';
        const visibleCards = isServiceCenterChannel ? 2 : 3;
        const mdSpan = 24 / visibleCards; // 12 for 2 cols, 8 for 3 cols
        const Chevron = () => (
          <div
            style={{
              position: 'absolute',
              right: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.5,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            <Icon icon="ph:caret-right-bold" style={{ fontSize: 18, color: token.colorTextTertiary }} />
          </div>
        );
        return (
          <Row gutter={[16, 16]}>
            {/* Initial Diagnosis */}
            <Col xs={24} md={mdSpan} style={{ position: 'relative' }}>
              <Card
                size="small"
                title={
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon icon="ph:chat-centered-text-fill" />
                      <Text strong>Initial Diagnosis</Text>
                    </div>
                    <Tooltip title={workOrder.created_at ? dayjs(workOrder.created_at).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}>
                      <Text type="secondary">{formatDate(workOrder.created_at)}</Text>
                    </Tooltip>
                  </div>
                }
                bordered
                bodyStyle={{ minHeight: 'var(--app-card-body-min-height)' }}
              >
                {workOrder.initialDiagnosis ? (
                  <Paragraph style={{ margin: 0, textAlign: 'left' }}>
                    <ul style={{ paddingLeft: 16, margin: 0, listStyleType: 'disc', listStylePosition: 'inside' }}>
                      {(workOrder.initialDiagnosis ?? '')
                        .split(/\r?\n/)
                        .map((item: string) => item.replace(/^[-•\s]+/, '').trim())
                        .filter(Boolean)
                        .map((item: string, idx: number) => (
                          <li key={idx} style={{ margin: 0, padding: 0, color: 'inherit', fontSize: '0.98em', lineHeight: 1.35, listStyleType: 'disc', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{item}</li>
                        ))}
                    </ul>
                  </Paragraph>
                ) : (
                  <Text type="secondary">No initial diagnosis provided.</Text>
                )}
              </Card>
              {screens.md && (
                // Show chevron to next column (always at least one next column exists)
                <Chevron />
              )}
            </Col>

            {/* Confirmed Issue (conditional) */}
            {!isServiceCenterChannel && (
              <Col xs={24} md={mdSpan} style={{ position: 'relative' }}>
                <Card
                  size="small"
                  title={
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon icon="ph:question-fill" />
                        <Text strong>Confirmed Issue</Text>
                      </div>
                      <Tooltip title={(workOrder.confirmed_at || workOrder.work_started_at || workOrder.created_at) ? dayjs(workOrder.confirmed_at || workOrder.work_started_at || workOrder.created_at).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}>
                        <Text type="secondary">{formatDate(workOrder.confirmed_at || workOrder.work_started_at || workOrder.created_at)}</Text>
                      </Tooltip>
                    </div>
                  }
                  bordered
                  bodyStyle={{ minHeight: 'var(--app-card-body-min-height)' }}
                >
                  <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }} size={8}>
                    {workOrder.serviceNotes && (
                      <>
                        <Text strong>Confirmation Notes:</Text>
                        <Paragraph type="secondary" style={{ margin: 0 }} ellipsis={{ rows: 4, expandable: true, symbol: 'Show more' }}>
                          <ul style={{ paddingLeft: 16, margin: 0, listStyleType: 'disc', listStylePosition: 'inside' }}>
                            {workOrder.serviceNotes
                              .split(/\r?\n/)
                              .map(item => item.replace(/^[-•\s]+/, '').trim())
                              .filter(Boolean)
                              .map((item, idx) => (
                                <li key={idx} style={{ margin: 0, padding: 0, color: 'inherit', fontSize: '0.98em', lineHeight: 1.35, listStyleType: 'disc', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{item}</li>
                              ))}
                          </ul>
                        </Paragraph>
                      </>
                    )}
                    {workOrder.serviceNotes && workOrder.issueType && (
                      <Divider style={{ margin: '8px 0' }} />
                    )}
                    {workOrder.issueType && (
                      <>
                        <Text strong>Issue Type:</Text>
                        <Paragraph style={{ margin: 0 }}>
                          <ul style={{ paddingLeft: 16, margin: 0, listStyleType: 'disc', listStylePosition: 'inside' }}>
                            {workOrder.issueType
                              .split(/\r?\n/)
                              .map(item => item.replace(/^[-•\s]+/, '').trim())
                              .filter(Boolean)
                              .map((item, idx) => (
                                <li key={idx} style={{ margin: 0, padding: 0, color: 'inherit', fontSize: '0.98em', lineHeight: 1.35, listStyleType: 'disc', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{item}</li>
                              ))}
                          </ul>
                        </Paragraph>
                      </>
                    )}
                    {!workOrder.issueType && !workOrder.serviceNotes && (
                      <Text type="secondary">No issue confirmed yet.</Text>
                    )}
                  </Space>
                </Card>
                {screens.md && (
                  // Only show chevron to next column if a third column will render
                  <Chevron />
                )}
              </Col>
            )}

            {/* Maintenance Decision */}
            <Col xs={24} md={mdSpan}>
              <Card
                size="small"
                title={
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon icon="ph:wrench-fill" />
                      <Text strong>Maintenance Decision</Text>
                    </div>
                    <Tooltip title={workOrder.completedAt ? dayjs(workOrder.completedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}>
                      <Text type="secondary">{formatDate(workOrder.completedAt)}</Text>
                    </Tooltip>
                  </div>
                }
                bordered
                bodyStyle={{ minHeight: 'var(--app-card-body-min-height)' }}
              >
                <Space direction="vertical" style={{ width: '100%', textAlign: 'left' }} size={8}>
                  {workOrder.faultCode && (
                    <>
                      <Text strong>Fault Code:</Text>
                      <Paragraph style={{ margin: 0 }}>
                        <ul style={{ paddingLeft: 16, margin: 0, listStyleType: 'disc', listStylePosition: 'inside' }}>
                          {workOrder.faultCode
                            .split(/\r?\n/)
                            .map(item => item.replace(/^[-•\s]+/, '').trim())
                            .filter(Boolean)
                            .map((item, idx) => (
                              <li key={idx} style={{ margin: 0, padding: 0, color: 'inherit', fontSize: '0.98em', lineHeight: 1.35, listStyleType: 'disc', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{item}</li>
                            ))}
                        </ul>
                      </Paragraph>
                    </>
                  )}
                  {workOrder.faultCode && (decisionNotes || usedPartsCount) && (
                    <Divider style={{ margin: '8px 0' }} />
                  )}
                  {decisionNotes && (
                    <>
                      <Text strong>Repair Notes:</Text>
                      <Paragraph type="secondary" style={{ margin: 0 }} ellipsis={{ rows: 4, expandable: true, symbol: 'Show more' }}>
                        <ul style={{ paddingLeft: 16, margin: 0, listStyleType: 'disc', listStylePosition: 'inside' }}>
                          {decisionNotes
                            .split(/\r?\n/)
                            .map(item => item.replace(/^[-•\s]+/, '').trim())
                            .filter(Boolean)
                            .map((item, idx) => (
                              <li key={idx} style={{ margin: 0, padding: 0, color: 'inherit', fontSize: '0.98em', lineHeight: 1.35, listStyleType: 'disc', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{item}</li>
                            ))}
                        </ul>
                      </Paragraph>
                    </>
                  )}
                  {(decisionNotes && (workOrder.faultCode || (usedPartsCount && usedPartsCount > 0))) && (
                    <Divider style={{ margin: '8px 0' }} />
                  )}
                  {(workOrder.faultCode || decisionNotes) && (
                    <>
                      <Text strong>Parts Used:</Text>
                      <Text>{usedPartsCount} items recorded</Text>
                    </>
                  )}
                  {!workOrder.faultCode && !decisionNotes && (
                    <Text type="secondary">No maintenance decision recorded.</Text>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        );
      })()}
    </Card>
  );
};