import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { WorkOrder } from '@/types/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, FileDown } from 'lucide-react';
import { PrintableWorkOrder } from './PrintableWorkOrder';
import { showSuccess, showError } from '@/utils/toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface WorkOrderPrintDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
}

export const WorkOrderPrintDialog: React.FC<WorkOrderPrintDialogProps> = ({
    open,
    onOpenChange,
    workOrder,
    ...printProps
}) => {
    const printRef = useRef<HTMLDivElement>(null);

    // Handle browser print
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Work-Order-${workOrder.work_order_number || workOrder.id}`,
        onAfterPrint: () => {
            showSuccess('Print dialog opened');
        },
    });

    // Handle PDF export
    const handleExportPDF = async () => {
        if (!printRef.current) return;

        try {
            showSuccess('Generating PDF...');

            // Capture the component as canvas
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });

            // Calculate PDF dimensions (A4)
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            let position = 0;

            // Add image to PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add new pages if content is longer than one page
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save PDF
            const fileName = `Work-Order-${workOrder.work_order_number || workOrder.id}.pdf`;
            pdf.save(fileName);

            showSuccess('PDF exported successfully');
        } catch (error) {
            console.error('PDF export error:', error);
            showError('Failed to export PDF');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Print Work Order</span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportPDF}
                                className="gap-2"
                            >
                                <FileDown className="w-4 h-4" />
                                Export PDF
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handlePrint}
                                className="gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {/* Print Preview */}
                <div className="border rounded-lg overflow-hidden bg-white">
                    <div ref={printRef}>
                        <PrintableWorkOrder workOrder={workOrder} serviceName={printProps.serviceName} {...printProps} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WorkOrderPrintDialog;
