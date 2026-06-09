"use client"

import { useEffect, useRef, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const data = [
  { name: 'Jan', newLeads: 400, converted: 240 },
  { name: 'Feb', newLeads: 300, converted: 139 },
  { name: 'Mar', newLeads: 200, converted: 980 },
  { name: 'Apr', newLeads: 278, converted: 390 },
  { name: 'May', newLeads: 189, converted: 480 },
  { name: 'Jun', newLeads: 239, converted: 380 },
  { name: 'Jul', newLeads: 349, converted: 430 },
];

function useChartWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      setWidth(Math.max(0, element.clientWidth));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

export function LeadsChart() {
  const { ref, width } = useChartWidth();

  return (
    <div ref={ref} className="w-full min-w-0 h-[300px] min-h-[300px]">
      {width > 0 && (
          <BarChart
            width={width}
            height={300}
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
            <Bar dataKey="newLeads" name="New leads" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
            <Bar dataKey="converted" name="Converted" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
      )}
    </div>
  );
}
