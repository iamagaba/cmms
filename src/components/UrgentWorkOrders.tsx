import { Card, CardHeader, List, ListItem, ListItemText, Chip, Typography, Box, Avatar } from '@mui/material';
import { WarningAmber, PersonOutline } from '@mui/icons-material';
import { WorkOrder, Technician } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, isPast } from 'date-fns';

interface UrgentWorkOrdersProps {
  workOrders: WorkOrder[];
  technicians: Technician[];
}

const UrgentWorkOrders = ({ workOrders, technicians }: UrgentWorkOrdersProps) => {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const urgentOrders = workOrders
    .filter(wo => {
      if (wo.status === 'Completed') return false;
      const dueDate = new Date(wo.slaDue);
      return isPast(dueDate) || dueDate < twentyFourHoursFromNow;
    })
    .sort((a, b) => new Date(a.slaDue).getTime() - new Date(b.slaDue).getTime());

  if (urgentOrders.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        avatar={<WarningAmber sx={{ color: 'warning.main' }} />}
        title={<Typography variant="h6">Urgent Work Orders</Typography>}
      />
      <List disablePadding>
        {urgentOrders.map(order => {
          const dueDate = new Date(order.slaDue);
          const isOverdue = isPast(dueDate);
          const technician = technicians.find(t => t.id === order.assignedTechnicianId);

          return (
            <ListItem
              key={order.id}
              secondaryAction={
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    label={isOverdue ? 'Overdue' : 'Due Soon'}
                    color={isOverdue ? 'error' : 'warning'}
                    size="small"
                  />
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    {formatDistanceToNow(dueDate, { addSuffix: true })}
                  </Typography>
                </Box>
              }
            >
              <ListItemText
                primary={<Link to={`/work-orders/${order.id}`}>{order.vehicleId} - {order.service}</Link>}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    {technician ? (
                      <>
                        <Avatar sx={{ width: 24, height: 24 }} src={technician.avatar}>
                          <PersonOutline fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">{technician.name}</Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Unassigned</Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Card>
  );
};

export default UrgentWorkOrders;