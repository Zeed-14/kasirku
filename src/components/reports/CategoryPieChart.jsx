import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Warna yang telah ditentukan untuk setiap slice pai
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const formatCurrency = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;

export const CategoryPieChart = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-80">
      <h3 className="font-bold text-gray-800 mb-2">Pendapatan per Kategori</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip formatter={formatCurrency} />
          <Legend iconType="circle" />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
