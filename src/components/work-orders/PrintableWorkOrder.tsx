import React from 'react';
import { WorkOrder } from '@/types/supabase';
import { format } from 'date-fns';
import { getWorkOrderNumber } from '@/utils/work-order-display';
import './PrintableWorkOrder.css';

interface PrintableWorkOrderProps {
    workOrder: WorkOrder;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    vehiclePlate?: string;
    vehicleVin?: string;
    technicianName?: string;
    locationName?: string;
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
    showPricing?: boolean;
    companyName?: string;
    companyLogo?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyEmail?: string;
    companyWebsite?: string;
}

export const PrintableWorkOrder: React.FC<PrintableWorkOrderProps> = ({
    workOrder,
    customerName = 'N/A',
    customerPhone = 'N/A',
    customerEmail = 'N/A',
    customerType = 'Individual',
    vehicleMake = 'N/A',
    vehicleModel = 'N/A',
    vehicleYear,
    vehiclePlate = 'N/A',
    vehicleVin = 'N/A',
    technicianName = 'Unassigned',
    locationName = 'N/A',
    parts = [],
    laborItems = [],
    showPricing = true,
    companyName = 'Fleet CMMS',
    companyLogo,
    companyAddress = '123 Service Street, Kampala, Uganda',
    companyPhone = '+256 700 000 000',
    companyEmail = 'info@fleetcmms.com',
    companyWebsite = 'www.fleetcmms.com',
}) => {
    // Calculate totals
    const partsTotal = parts.reduce((sum, part) => sum + part.price * part.quantity, 0);
    const laborTotal = laborItems.reduce((sum, item) => sum + item.hours * item.rate, 0);
    const subtotal = partsTotal + laborTotal;
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + tax;

    // Status badge styling
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in progress':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'on hold':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
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
            <div className="wo-header">
                <div className="wo-header-left">
                    {companyLogo ? (
                        <img src={companyLogo} alt={companyName} className="company-logo" />
                    ) : (
                        <div className="company-logo-placeholder">
                            <span className="text-2xl font-bold">{companyName.charAt(0)}</span>
                        </div>
                    )}
                    <div className="company-info">
                        <h1 className="company-name">{companyName}</h1>
                    </div>
                </div>
                <div className="wo-header-right">
                    <h2 className="wo-title">WORK ORDER</h2>
                    <div className="wo-number">#{getWorkOrderNumber(workOrder)}</div>
                    <div className="wo-badges">
                        <span className={`wo-badge ${getStatusColor(workOrder.status)}`}>
                            {workOrder.status}
                        </span>
                        <span className={`wo-badge ${getPriorityColor(workOrder.priority)}`}>
                            {workOrder.priority} Priority
                        </span>
                    </div>
                    <div className="wo-dates">
                        <div className="wo-date-item">
                            <span className="label">Issued:</span>
                            <span className="value">{formatDate(workOrder.created_at, 'MMM dd, yyyy')}</span>
                        </div>
                        {workOrder.appointment_date && (
                            <div className="wo-date-item">
                                <span className="label">Due:</span>
                                <span className="value">{formatDate(workOrder.appointment_date, 'MMM dd, yyyy')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Customer & Vehicle Information */}
            <div className="wo-section-grid">
                <div className="wo-info-box">
                    <h3 className="wo-section-title">CUSTOMER</h3>
                    <div className="wo-info-content">
                        <div className="wo-info-row">
                            <span className="label">Name:</span>
                            <span className="value">{customerName}</span>
                        </div>
                        <div className="wo-info-row">
                            <span className="label">Phone:</span>
                            <span className="value">{customerPhone}</span>
                        </div>
                        <div className="wo-info-row">
                            <span className="label">Email:</span>
                            <span className="value">{customerEmail}</span>
                        </div>
                        <div className="wo-info-row">
                            <span className="label">Type:</span>
                            <span className="value">{customerType}</span>
                        </div>
                    </div>
                </div>

                <div className="wo-info-box">
                    <h3 className="wo-section-title">VEHICLE</h3>
                    <div className="wo-info-content">
                        <div className="wo-info-row">
                            <span className="label">Make:</span>
                            <span className="value">{vehicleMake}</span>
                        </div>
                        <div className="wo-info-row">
                            <span className="label">Model:</span>
                            <span className="value">{vehicleModel}</span>
                        </div>
                        {vehicleYear && (
                            <div className="wo-info-row">
                                <span className="label">Year:</span>
                                <span className="value">{vehicleYear}</span>
                            </div>
                        )}
                        <div className="wo-info-row">
                            <span className="label">Plate:</span>
                            <span className="value">{vehiclePlate}</span>
                        </div>
                        <div className="wo-info-row">
                            <span className="label">VIN:</span>
                            <span className="value">{vehicleVin}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Details */}
            <div className="wo-section avoid-break">
                <h3 className="wo-section-title">SERVICE INFORMATION</h3>
                <div className="wo-section-content">
                    <div className="wo-info-row">
                        <span className="label">Service Type:</span>
                        <span className="value">{workOrder.service || 'General Service'}</span>
                    </div>
                    {workOrder.service_notes && (
                        <div className="wo-description">
                            <span className="label">Description:</span>
                            <p className="value">{workOrder.service_notes}</p>
                        </div>
                    )}
                    <div className="wo-info-row">
                        <span className="label">Assigned Technician:</span>
                        <span className="value">{technicianName}</span>
                    </div>
                    <div className="wo-info-row">
                        <span className="label">Location:</span>
                        <span className="value">{locationName}</span>
                    </div>
                </div>
            </div>

            {/* Parts & Materials */}
            {showPricing && parts.length > 0 && (
                <div className="wo-section avoid-break">
                    <h3 className="wo-section-title">PARTS & MATERIALS</h3>
                    <table className="wo-table">
                        <thead>
                            <tr>
                                <th>QTY</th>
                                <th>DESCRIPTION</th>
                                <th>UNIT</th>
                                <th className="text-right">PRICE</th>
                                <th className="text-right">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.map((part, index) => (
                                <tr key={index}>
                                    <td>{part.quantity}</td>
                                    <td>{part.name}</td>
                                    <td>{part.unit}</td>
                                    <td className="text-right">{formatCurrency(part.price)}</td>
                                    <td className="text-right">{formatCurrency(part.price * part.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Labor */}
            {showPricing && laborItems.length > 0 && (
                <div className="wo-section avoid-break">
                    <h3 className="wo-section-title">LABOR</h3>
                    <table className="wo-table">
                        <thead>
                            <tr>
                                <th>HOURS</th>
                                <th>DESCRIPTION</th>
                                <th className="text-right">RATE</th>
                                <th className="text-right">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laborItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.hours}</td>
                                    <td>{item.description}</td>
                                    <td className="text-right">{formatCurrency(item.rate)}/hr</td>
                                    <td className="text-right">{formatCurrency(item.hours * item.rate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Timeline */}
            <div className="wo-section avoid-break">
                <h3 className="wo-section-title">TIMELINE</h3>
                <div className="wo-section-content">
                    <div className="wo-info-row">
                        <span className="label">Created:</span>
                        <span className="value">{formatDate(workOrder.created_at, 'MMM dd, yyyy hh:mm a')}</span>
                    </div>
                    {workOrder.work_started_at && (
                        <div className="wo-info-row">
                            <span className="label">Started:</span>
                            <span className="value">{formatDate(workOrder.work_started_at, 'MMM dd, yyyy hh:mm a')}</span>
                        </div>
                    )}
                    {workOrder.completed_at && (
                        <div className="wo-info-row">
                            <span className="label">Completed:</span>
                            <span className="value">{formatDate(workOrder.completed_at, 'MMM dd, yyyy hh:mm a')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Technician Notes */}
            {workOrder.service_notes && (
                <div className="wo-section avoid-break">
                    <h3 className="wo-section-title">TECHNICIAN NOTES</h3>
                    <div className="wo-section-content">
                        <p className="wo-notes">{workOrder.service_notes}</p>
                    </div>
                </div>
            )}

            {/* Cost Summary */}
            {showPricing && (parts.length > 0 || laborItems.length > 0) && (
                <div className="wo-cost-summary">
                    <div className="cost-row">
                        <span className="label">Parts:</span>
                        <span className="value">{formatCurrency(partsTotal)}</span>
                    </div>
                    <div className="cost-row">
                        <span className="label">Labor:</span>
                        <span className="value">{formatCurrency(laborTotal)}</span>
                    </div>
                    <div className="cost-row">
                        <span className="label">Tax (18%):</span>
                        <span className="value">{formatCurrency(tax)}</span>
                    </div>
                    <div className="cost-row total">
                        <span className="label">TOTAL:</span>
                        <span className="value">{formatCurrency(total)}</span>
                    </div>
                </div>
            )}

            {/* Signature Section */}
            <div className="wo-signatures avoid-break">
                <div className="signature-box">
                    <h4>TECHNICIAN SIGNATURE</h4>
                    <div className="signature-line"></div>
                    <div className="signature-info">
                        <div>Name: {technicianName}</div>
                        <div>Date: _________________</div>
                    </div>
                </div>
                <div className="signature-box">
                    <h4>CUSTOMER SIGNATURE</h4>
                    <div className="signature-line"></div>
                    <div className="signature-info">
                        <div>Name: _________________</div>
                        <div>Date: _________________</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="wo-footer">
                <div className="footer-terms">
                    <strong>Terms & Conditions:</strong> Warranty valid for 30 days from completion date.
                    Parts warranty as per manufacturer specifications.
                </div>
                <div className="footer-contact">
                    {companyAddress} | {companyPhone} | {companyEmail} | {companyWebsite}
                </div>
            </div>
        </div>
    );
};

export default PrintableWorkOrder;
