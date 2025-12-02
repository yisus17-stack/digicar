'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PaymentChartProps {
  principal: number;
  interest: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-background border rounded-lg shadow-sm">
        <p className="font-bold">{`${payload[0].name}`}</p>
        <p className="text-foreground">{`$${payload[0].value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}</p>
      </div>
    );
  }

  return null;
};


export default function PaymentChart({ principal, interest }: PaymentChartProps) {
  const data = [
    { name: 'Monto a Financiar (Capital)', value: principal },
    { name: 'Intereses Totales', value: interest },
  ];

  return (
    <div className='w-full h-[250px] text-sm'>
        <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={2}
            >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" />
        </PieChart>
        </ResponsiveContainer>
    </div>
  );
}
