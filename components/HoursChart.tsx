
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiService } from '../services/apiService';
import { ClockRecord, ClockType } from '../types';
import Spinner from './Spinner';

interface ChartData {
  name: string;
  hours: number;
}

const HoursChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processRecords = async () => {
      setIsLoading(true);
      try {
        const records = await apiService.getRecords();
        const recordsByUser: { [userId: number]: ClockRecord[] } = {};
        
        records.forEach(record => {
          if (!recordsByUser[record.userId]) {
            recordsByUser[record.userId] = [];
          }
          recordsByUser[record.userId].push(record);
        });

        const data: ChartData[] = Object.values(recordsByUser).map(userRecords => {
          // Sort records chronologically
          const sortedRecords = userRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          let totalMillis = 0;
          let lastClockIn: Date | null = null;
          
          sortedRecords.forEach(record => {
            if (record.type === ClockType.IN) {
              lastClockIn = new Date(record.timestamp);
            } else if (record.type === ClockType.OUT && lastClockIn) {
              totalMillis += new Date(record.timestamp).getTime() - lastClockIn.getTime();
              lastClockIn = null; // Reset after clock out
            }
          });

          return {
            name: userRecords[0]?.userName || 'Unknown',
            hours: totalMillis / (1000 * 60 * 60)
          };
        }).filter(d => d.hours > 0);
        
        setChartData(data);
      } catch (error) {
        console.error("Failed to process chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    processRecords();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6" style={{ height: '500px' }}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Total Hours Worked by Employee</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
          <XAxis dataKey="name" stroke="rgb(156 163 175)" />
          <YAxis stroke="rgb(156 163 175)"/>
          <Tooltip 
            contentStyle={{ 
                backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                borderColor: 'rgba(75, 85, 99, 1)',
                color: '#ffffff'
            }}
            formatter={(value: number) => [`${value.toFixed(2)} hours`, "Total time"]}
          />
          <Legend />
          <Bar dataKey="hours" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HoursChart;
