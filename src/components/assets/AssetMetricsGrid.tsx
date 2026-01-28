import { AlertCircle, Check, Wrench } from 'lucide-react';
// import { SimpleGrid } from '@/components/tailwind-components'; // Removed unused


import { AssetMetrics } from '@/hooks/useAssetManagement';
import { motion } from 'framer-motion';

interface AssetMetricsGridProps {
    metrics: AssetMetrics;
}

export const AssetMetricsGrid = ({ metrics }: AssetMetricsGridProps) => {
    const stats = [
        {
            label: 'Total Assets',
            value: metrics.total,
            icon: Package,
            color: 'bg-primary-50 text-primary-600',
            borderColor: 'border-primary-100',
        },
        {
            label: 'Operational',
            value: metrics.operational,
            icon: Check,
            color: 'bg-muted text-foreground',
            borderColor: 'border-emerald-100',
        },
        {
            label: 'Maintenance',
            value: metrics.maintenance,
            icon: Wrench,
            color: 'bg-amber-50 text-amber-600',
            borderColor: 'border-amber-100',
        },
        {
            label: 'Down',
            value: metrics.down,
            icon: AlertCircle,
            color: 'bg-rose-50 text-rose-600',
            borderColor: 'border-rose-100',
        },
        {
            label: 'Avg Health',
            value: `${metrics.averageHealthScore}%`,
            icon: HeartbeatIcon,
            color: 'bg-primary/5 text-primary',
            borderColor: 'border-primary/20',
        },
        {
            label: 'Critical Issues',
            value: metrics.criticalIssues,
            icon: AlertCircle,
            color: 'bg-rose-50 text-rose-600',
            borderColor: 'border-rose-100',
        }
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg border border-border px-3 py-2.5 shadow-sm flex items-center gap-3 hover:border-gray-300 transition-colors"
                >
                    <div className={`p-1.5 rounded-md ${stat.color} shrink-0`}>
                        <stat.icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide leading-none mb-0.5 truncate">{stat.label}</p>
                        <p className="text-lg font-bold text-foreground leading-tight">
                            {stat.value}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};


