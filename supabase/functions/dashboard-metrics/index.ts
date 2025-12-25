import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import dayjs from 'https://esm.sh/dayjs@1.11.7';
import isBetween from 'https://esm.sh/dayjs@1.11.7/plugin/isBetween';

dayjs.extend(isBetween);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // Fetch work orders
        // We fetch only necessary fields to minimize data transfer from DB
        const { data: orders, error: woError } = await supabaseClient
            .from('work_orders')
            .select('id, status, created_at, completed_at, due_date, work_started_at, location_id')
            .order('created_at', { ascending: false });

        if (woError) throw woError;

        const now = dayjs();
        const todayStart = now.startOf('day');
        const weekStart = now.startOf('week');
        const lastWeekStart = weekStart.subtract(1, 'week');

        // 1. Calculate Summary Metrics
        const totalOrders = orders.length;

        const openOrders = orders.filter((o: any) => o.status !== 'Completed').length;

        const completedToday = orders.filter((o: any) =>
            o.status === 'Completed' &&
            o.completed_at &&
            dayjs(o.completed_at).isAfter(todayStart)
        ).length;

        const overdueOrders = orders.filter((o: any) =>
            o.due_date &&
            dayjs(o.due_date).isBefore(now) &&
            o.status !== 'Completed'
        ).length;

        // 2. Calculate Weekly Trend
        const thisWeekOrders = orders.filter((o: any) =>
            dayjs(o.created_at).isAfter(weekStart)
        ).length;

        const lastWeekOrders = orders.filter((o: any) =>
            dayjs(o.created_at).isBetween(lastWeekStart, weekStart)
        ).length;

        const weeklyTrend = lastWeekOrders > 0
            ? ((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100
            : 0;

        // 3. Calculate Average Response Time
        let totalResponseTime = 0;
        let responseTimeCount = 0;

        orders.forEach((o: any) => {
            if (o.work_started_at && o.created_at) {
                totalResponseTime += dayjs(o.work_started_at).diff(dayjs(o.created_at), 'hour', true); // Use float hours
                responseTimeCount++;
            }
        });

        const avgResponseTime = responseTimeCount > 0
            ? (totalResponseTime / responseTimeCount).toFixed(1) + 'h'
            : '0h';

        // 4. Calculate Chart Data (Last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = dayjs().subtract(i, 'day');
            return {
                date: d.format('MMM DD'),
                fullDate: d.format('YYYY-MM-DD'),
                count: 0
            };
        }).reverse();

        orders.forEach((order: any) => {
            if (!order.created_at) return;
            const created = dayjs(order.created_at);
            const dayStr = created.format('YYYY-MM-DD');

            const dayData = last7Days.find(d => d.fullDate === dayStr);
            if (dayData) {
                dayData.count++;
            }
        });

        const payload = {
            metrics: {
                totalOrders,
                openOrders,
                completedToday,
                overdueOrders,
                avgResponseTime,
                weeklyTrend
            },
            chartData: last7Days
        };

        return new Response(JSON.stringify(payload), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
