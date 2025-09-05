import { Card, CardActionArea, CardContent, Typography, Box, Badge } from '@mui/material';
import { Place, Build } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Location, WorkOrder } from '@/data/mockData';

interface LocationCardProps {
  location: Location;
  workOrders: WorkOrder[];
}

export const LocationCard = ({ location, workOrders }: LocationCardProps) => {
  const openWorkOrders = workOrders.filter(wo => wo.locationId === location.id && wo.status !== 'Completed').length;

  return (
    <Card sx={{ height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
      <CardActionArea component={Link} to={`/locations/${location.id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>{location.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Place fontSize="small" />
            {location.address}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={openWorkOrders} color="primary">
              <Build fontSize="small" />
            </Badge>
            <Typography variant="body2">Open Work Orders</Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};