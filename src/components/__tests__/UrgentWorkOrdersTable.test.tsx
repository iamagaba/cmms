import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UrgentWorkOrdersTable from '@/components/UrgentWorkOrdersTable';
import { WorkOrder, Technician, Vehicle } from '@/types/supabase';

describe('UrgentWorkOrdersTable', () => {
  it('renders license plate from vehicle lookup (snake_case)', () => {
    const workOrders: WorkOrder[] = [
      {
        id: 'wo-1',
        workOrderNumber: 'WO-1',
        status: 'Open',
        priority: 'High',
        channel: 'phone',
        assignedTechnicianId: null,
        locationId: null,
        service: 'Repair',
        serviceNotes: null,
        partsUsed: null,
        activityLog: null,
        slaDue: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        completedAt: null,
        customerLat: null,
        customerLng: null,
        customerAddress: '123 Test St',
        onHoldReason: null,
        appointmentDate: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customerId: null,
        vehicleId: 'veh-1',
        vehicleModel: 'Model X',
        created_by: null,
        service_category_id: null,
        confirmed_at: null,
        work_started_at: null,
        sla_timers_paused_at: null,
        total_paused_duration_seconds: null,
        initialDiagnosis: null,
        issueType: null,
        faultCode: null,
        maintenanceNotes: null,
      },
    ];

    const vehicles: Vehicle[] = [
      {
        id: 'veh-1',
        vin: 'VIN123',
        make: 'Make',
        model: 'Model X',
        year: 2020,
        license_plate: 'ABC-123',
        battery_capacity: null,
        customer_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        date_of_manufacture: null,
        release_date: null,
        motor_number: null,
        mileage: null,
        customers: null,
      },
    ];

    const technicians: Technician[] = [];

    render(<UrgentWorkOrdersTable workOrders={workOrders} vehicles={vehicles} technicians={technicians} />);

    // Expect the license plate to appear in the table
    const plate = screen.getByText('ABC-123');
    expect(plate).toBeInTheDocument();
  });
});
