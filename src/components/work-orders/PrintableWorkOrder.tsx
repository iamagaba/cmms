import React from 'react';
import { WorkOrder } from '@/types/supabase';
import { format } from 'date-fns';
import { getWorkOrderNumber } from '@/utils/work-order-display';
import './PrintableWorkOrder.css';

interface PrintableWorkOrderProps {
    workOrder: WorkOrder;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    vehicleVin?: string;
    warrantyEndDate?: string | null;
    technicianName?: string;
    locationName?: string;
    serviceName?: string;
    parts?: Array<{
        name: string;
        quantity: number;
        unit: string;
        price: number;
    }>;
    laborItems?: Array<{
        description: string;
        hours: number;
        rate: number;
    }>;
    companyName?: string;
    companyLogo?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
}

export const PrintableWorkOrder: React.FC<PrintableWorkOrderProps> = ({
    workOrder,
    vehicleMake = 'N/A',
    vehicleModel = 'N/A',
    vehicleYear,
    vehicleVin = 'N/A',
    warrantyEndDate,
    technicianName = 'Unassigned',
    locationName = 'N/A',
    serviceName = 'General Service',
    parts = [],
    laborItems = [],
    companyName = 'Fleet CMMS',
    companyLogo,
    companyAddress = '123 Service Street, Kampala, Uganda',
    companyPhone = '+256 700 000 000',
    companyEmail = 'info@fleetcmms.com',
}) => {
    // Calculate totals
    const partsTotal = parts.reduce((sum, part) => sum + part.price * part.quantity, 0);
    const laborTotal = laborItems.reduce((sum, item) => sum + item.hours * item.rate, 0);
    const subtotal = partsTotal + laborTotal;
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + tax;

    // Calculate warranty status
    const getWarrantyStatus = () => {
        if (!warrantyEndDate) return 'N/A';
        const endDate = new Date(warrantyEndDate);
        const now = new Date();
        if (isNaN(endDate.getTime())) return 'N/A';
        return endDate > now ? 'Active' : 'Expired';
    };



    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Safe date formatter
    const formatDate = (dateValue: string | null | undefined, formatString: string): string => {
        if (!dateValue) return 'N/A';
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return 'N/A';
            return format(date, formatString);
        } catch {
            return 'N/A';
        }
    };

    return (
        <div className="printable-work-order">
            {/* Header Section */}
            <header className="wo-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {companyLogo && (
                        <img src={companyLogo} alt={companyName} className="company-logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                    )}
                    <div>
                        <h1 className="company-name">{companyName}</h1>
                        <div style={{ fontSize: '8pt', color: '#666', marginTop: '2px' }}>
                            {companyAddress} • {companyPhone}
                            {companyEmail && <> • {companyEmail}</>}
                        </div>
                    </div>
                </div>
                <div className="wo-header-right">
                    <h2 className="wo-title">#{getWorkOrderNumber(workOrder)}</h2>
                </div>
            </header>

            <div className="header-divider" />

            {/* Top Metrics Row */}
            <section className="metrics-row">
                <div className="metric-item">
                    <span className="metric-label">Assigned To</span>
                    <span className="metric-value bold">{technicianName}</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Due Date</span>
                    <span className="metric-value">{formatDate(workOrder.appointment_date, 'MMM dd, yyyy')}</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Status</span>
                    <span className="metric-value bold">{workOrder.status}</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label">Priority</span>
                    <span className="metric-value bold" style={{
                        color: workOrder.priority === 'Critical' ? '#D32F2F' :
                            workOrder.priority === 'High' ? '#F57C00' :
                                workOrder.priority === 'Medium' ? '#0288D1' : '#388E3C'
                    }}>
                        {workOrder.priority}
                    </span>
                </div>
            </section>

            {/* Work Order Information */}
            <section className="wo-section-grid">
                <div>
                    <h3 className="section-heading">Work Order Information</h3>
                    <div className="info-grid-row">
                        <div className="column">
                            <div className="field-group">
                                <span className="field-label">Assigned By</span>
                                <span className="field-value">{companyName} Admin</span>
                            </div>
                            <div className="field-group">
                                <span className="field-label">Last Updated</span>
                                <span className="field-value">{formatDate(new Date().toISOString(), 'MM/dd/yy - hh:mm a')}</span>
                            </div>
                            <div className="field-group">
                                <span className="field-label">Assigned Team</span>
                                <span className="field-value">Maintenance</span>
                            </div>
                        </div>
                        <div className="column">
                            <div className="field-group">
                                <span className="field-label">Created On</span>
                                <span className="field-value">{formatDate(workOrder.created_at || (workOrder as any).createdAt, 'MM/dd/yy - hh:mm a')}</span>
                            </div>
                            <div className="field-group">
                                <span className="field-label">Completed On</span>
                                <span className="field-value">{formatDate(workOrder.completed_at || (workOrder as any).completedAt, 'MM/dd/yy - hh:mm a')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="field-group">
                        <span className="field-label">Location</span>
                        <span className="field-value bold">{locationName}</span>
                    </div>
                </div>
            </section>

            <div className="section-divider" />

            {/* Task Description */}
            <section className="wo-section-plain">
                <h3 className="section-heading">Task Description</h3>
                <div className="task-description">
                    <div className="field-group">
                        <span className="field-value bold ">{serviceName}</span>
                        <p>{workOrder.service_notes || "Perform scheduled maintenance task."}</p>
                    </div>
                </div>
            </section>

            <div className="section-divider" />

            {/* Asset Details */}
            <section className="wo-section-plain">
                <h3 className="section-heading">Asset Details</h3>
                <div className="info-grid-row">
                    <div className="column">
                        <div className="field-group">
                            <span className="field-label">Asset Name</span>
                            <span className="field-value bold">{vehicleMake} {vehicleModel} {vehicleYear}</span>
                        </div>
                        <div className="field-group">
                            <span className="field-label">Barcode</span>
                            <span className="field-value bold">{vehicleVin || 'N/A'}</span>
                        </div>
                        <div className="field-group">
                            <span className="field-label">Location Name</span>
                            <span className="field-value bold">{locationName}</span>
                        </div>
                    </div>
                    <div className="column">
                        <div className="field-group">
                            <span className="field-label">Model</span>
                            <span className="field-value bold">{vehicleModel}</span>
                        </div>
                        <div className="field-group">
                            <span className="field-label">Area</span>
                            <span className="field-value bold">{locationName}</span>
                        </div>
                        <div className="field-group">
                            <span className="field-label">Warranty Status</span>
                            <span className="field-value bold">{getWarrantyStatus()}</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="section-divider" />

            {/* Parts & Costs */}
            <section className="wo-section-plain">
                <h3 className="section-heading">Parts & Costs</h3>
                {parts.length === 0 ? (
                    <p className="no-parts">No parts used</p>
                ) : (
                    <>
                        {/* Parts Table */}
                        <table className="wo-table parts-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40%', textAlign: 'left' }}>Part</th>
                                    <th style={{ width: '20%', textAlign: 'right' }}>Cost</th>
                                    <th style={{ width: '20%', textAlign: 'right' }}>Quantity</th>
                                    <th style={{ width: '20%', textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parts.map((p, i) => (
                                    <tr key={`p-${i}`}>
                                        <td>{p.name}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(p.price)}</td>
                                        <td style={{ textAlign: 'right' }}>{p.quantity}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(p.price * p.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Summary Row */}
                        <table className="wo-table summary-table" style={{ marginTop: '15px' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '25%', textAlign: 'left' }}>Time</th>
                                    <th style={{ width: '25%', textAlign: 'right' }}>Additional Cost</th>
                                    <th style={{ width: '25%', textAlign: 'right' }}>Labor Cost</th>
                                    <th style={{ width: '25%', textAlign: 'right' }}>Total Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>0 hours 0 minutes</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(0)}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(laborTotal)}</td>
                                    <td style={{ textAlign: 'right' }} className="text-red bold">{formatCurrency(total)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                )}
            </section>

            <div className="section-divider" />

            {/* Tasks Section Placeholder */}
            <section className="wo-section-plain">
                <h3 className="section-heading">Tasks</h3>
                <div className="task-list">
                    <p style={{ fontSize: '9pt', paddingLeft: '20px' }}>New Task</p>
                </div>
            </section>

            <div className="section-divider" />

            {/* Footer */}
            <footer className="page-footer">
                <div className="footer-brand">
                    <span className="footer-logo-small">⚙</span>
                    <strong>{companyName}</strong> | Page 1 of 1
                </div>
            </footer>
        </div>
    );
};

export default PrintableWorkOrder;
