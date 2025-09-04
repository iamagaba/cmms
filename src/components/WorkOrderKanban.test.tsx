import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import WorkOrderKanban from './WorkOrderKanban';
import { workOrders, technicians, locations } from '@/data/mockData';

const priorityColumns = [
    { id: 'High', title: 'High' },
    { id: 'Medium', title: 'Medium' },
    { id: 'Low', title: 'Low' },
];

describe('WorkOrderKanban', () => {
  it('should display the correct color for each priority', () => {
    render(
      <MemoryRouter>
        <WorkOrderKanban workOrders={workOrders} technicians={technicians} locations={locations} groupBy="priority" columns={priorityColumns} />
      </MemoryRouter>
    );

    const highPriorityTag = screen.getByTestId('priority-tag-High');
    expect(highPriorityTag.className).toContain('ant-tag-red');

    const mediumPriorityTag = screen.getByTestId('priority-tag-Medium');
    expect(mediumPriorityTag.className).toContain('ant-tag-orange');

    const lowPriorityTag = screen.getByTestId('priority-tag-Low');
    expect(lowPriorityTag.className).toContain('ant-tag-green');
  });
});
