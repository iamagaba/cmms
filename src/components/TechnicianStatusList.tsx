import { Card, CardHeader, List, ListItem, ListItemAvatar, ListItemText, Avatar, LinearProgress, Typography, Box, Tooltip } from "@mui/material";
import { technicians, workOrders } from "../data/mockData";
import { Link } from "react-router-dom";

const statusColors: Record<typeof technicians[0]['status'], string> = {
  available: "success.main",
  busy: "warning.main",
  offline: "grey.500",
};

const TechnicianStatusList = () => {
  const techData = technicians.map(tech => {
    const openTasks = workOrders.filter(wo => wo.assignedTechnicianId === tech.id && wo.status !== 'Completed').length;
    const maxTasks = tech.max_concurrent_orders || 5;
    return { ...tech, openTasks, maxTasks };
  });

  return (
    <Card>
      <CardHeader title={<Typography variant="h6">Technician Status</Typography>} />
      <List disablePadding>
        {techData.map(tech => (
          <ListItem key={tech.id}>
            <ListItemAvatar>
              <Tooltip title={tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}>
                <Avatar 
                  src={tech.avatar} 
                  sx={{ border: `2px solid`, borderColor: statusColors[tech.status] }} 
                />
              </Tooltip>
            </ListItemAvatar>
            <ListItemText
              primary={<Link to={`/technicians/${tech.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{tech.name}</Link>}
              secondary={
                <Box sx={{ width: '100%', mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" component="span">
                    {tech.specialization}
                  </Typography>
                  <Tooltip title={`${tech.openTasks} / ${tech.maxTasks} open tasks`}>
                    <LinearProgress
                      variant="determinate"
                      value={(tech.openTasks / tech.maxTasks) * 100}
                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    />
                  </Tooltip>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default TechnicianStatusList;