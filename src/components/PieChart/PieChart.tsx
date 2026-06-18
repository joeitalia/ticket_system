'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const STATUS_COLORS = {
  New: '#A259FF',       // Purple
  Open: '#0088FE',      // Blue
  Pending: '#FFBB28',   // Yellow
  Resolved: '#36CFC9',  // Teal
  Closed: '#00C49F',    // Green
};

export default function MyPieChart() {

  const [closed, setClosed] = useState(0);
  const [open, setOpen] = useState(0);
  const [pending, setPending] = useState(0);
  const [newTickets, setNewTickets] = useState(0);
  const [resolved, setResolved] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/tickets/totalCount?showStatus=true');
      const data = await res.json();
      setClosed(data.statusCounts.find((d: any) => d._id === 'Closed')?.count || 0);
      setOpen(data.statusCounts.find((d: any) => d._id === 'Open')?.count || 0);
      setPending(data.statusCounts.find((d: any) => d._id === 'Pending')?.count || 0);
      setNewTickets(data.statusCounts.find((d: any) => d._id === 'New')?.count || 0);
      setResolved(data.statusCounts.find((d: any) => d._id === 'Resolved')?.count || 0);
    }
    fetchData();
  }, []);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={[
              { name: 'Open', value: open },
              { name: 'Closed', value: closed },
              { name: 'Pending', value: pending },
              { name: 'New', value: newTickets },
              { name: 'Resolved', value: resolved },
            ]}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            dataKey="value"
            label={({ name, percent = 0 }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {[
              { name: 'Open', value: open },
              { name: 'Closed', value: closed },
              { name: 'Pending', value: pending },
              { name: 'New', value: newTickets },
              { name: 'Resolved', value: resolved },
            ].map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}