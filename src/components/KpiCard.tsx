import { Card, CardContent, Avatar, Box, Typography } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { ReactNode } from "react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KpiCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  isUpGood?: boolean;
  chartData?: { value: number }[];
}

const KpiCard = ({ title, value, icon, trend, trendDirection, isUpGood = true, chartData }: KpiCardProps) => {
  const isPositive = (trendDirection === 'up' && isUpGood) || (trendDirection === 'down' && !isUpGood);
  const trendColor = isPositive ? 'success.main' : 'error.main';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {trend && trendDirection && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trendDirection === 'up' ? <ArrowUpward sx={{ color: trendColor, fontSize: 16 }} /> : <ArrowDownward sx={{ color: trendColor, fontSize: 16 }} />}
                <Typography variant="caption" sx={{ color: trendColor, mx: 0.5 }}>
                  {trend}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last week
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
            {icon}
          </Avatar>
        </Box>
        {chartData && (
          <Box sx={{ height: 40, mt: 2, mx: -2, mb: -2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="value" stroke={isPositive ? '#52c41a' : '#ff4d4f'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;