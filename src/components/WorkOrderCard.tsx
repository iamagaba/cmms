import { Card, CardContent, Chip, Avatar, Tooltip, Typography, Select, MenuItem, Box, FormControl } from "@mui/material";
import { LocationOn, CalendarToday } from "@mui/icons-material";
import { WorkOrder, Technician, Location, technicians as allTechnicians } from "../data/mockData";
import { formatDistanceToNow } from 'date-fns';
import { Link } from "react-router-dom";

interface WorkOrderCardProps {
  order: WorkOrder;
  technician: Technician | undefined;
  location: Location | undefined;
  onUpdateWorkOrder: (id: string, field: keyof WorkOrder, value: any) => void;
}

const WorkOrderCard = ({ order, technician, location, onUpdateWorkOrder }: WorkOrderCardProps) => {
  const slaDue = new Date(order.slaDue);
  const isOverdue = slaDue < new Date();

  const priorityColors = {
    High: "error",
    Medium: "warning",
    Low: "success",
  };

  const priorityBorderColors = {
      High: "error.main",
      Medium: "warning.main",
      Low: "transparent",
  }

  const statusColors = {
    Open: "info",
    "In Progress": "warning",
    "On Hold": "secondary",
    Completed: "success",
  };

  return (
    <Card 
      sx={{ 
        borderLeft: `4px solid`, 
        borderColor: priorityBorderColors[order.priority],
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ mb: 0 }}>
              <Link to={`/work-orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{order.vehicleId}</Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">{order.customerName} • {order.vehicleModel}</Typography>
          </Box>
          <FormControl variant="standard" sx={{ m: -1, minWidth: 90 }}>
            <Select
              value={order.priority}
              onChange={(e) => onUpdateWorkOrder(order.id, 'priority', e.target.value)}
              sx={{ '.MuiSelect-select': { p: 0.5 } }}
            >
              {['High', 'Medium', 'Low'].map(p => (
                <MenuItem key={p} value={p}>
                  <Chip label={p} color={priorityColors[p as keyof typeof priorityColors] as any} size="small" />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Typography variant="body1" sx={{ display: 'block', mb: 1.5 }}>{order.service}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{location?.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday fontSize="small" sx={{ color: 'text.secondary' }} />
            <Tooltip title={`SLA: ${slaDue.toLocaleString()}`}>
              <Typography variant="caption" color={isOverdue ? 'error' : 'text.secondary'}>
                Due {formatDistanceToNow(slaDue, { addSuffix: true })}
              </Typography>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControl variant="standard" sx={{ minWidth: 150 }}>
            <Select
              value={order.assignedTechnicianId || ''}
              onChange={(e) => onUpdateWorkOrder(order.id, 'assignedTechnicianId', e.target.value === '' ? null : e.target.value)}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <em style={{color: 'grey'}}>Unassigned</em>;
                }
                const tech = allTechnicians.find(t => t.id === selected);
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }} src={tech?.avatar}>{tech?.name.split(' ').map(n => n[0]).join('')}</Avatar>
                    {tech?.name}
                  </Box>
                );
              }}
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {allTechnicians.map(tech => (
                <MenuItem key={tech.id} value={tech.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }} src={tech.avatar}>{tech?.name.split(' ').map(n => n[0]).join('')}</Avatar>
                    {tech.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="standard" sx={{ minWidth: 120 }}>
            <Select
              value={order.status}
              onChange={(e) => onUpdateWorkOrder(order.id, 'status', e.target.value)}
            >
              {['Open', 'In Progress', 'On Hold', 'Completed'].map(status => (
                <MenuItem key={status} value={status}>
                  <Chip label={status} color={statusColors[status as keyof typeof statusColors] as any} size="small" />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WorkOrderCard;