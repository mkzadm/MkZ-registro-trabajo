import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { ClockRecord, ClockType } from '../types';
import Spinner from './Spinner';

interface DailyHours {
  id: string;
  userName: string;
  date: string;
  hours: number;
}

const DailyHoursTable: React.FC = () => {
  const [dailyHours, setDailyHours] = useState<DailyHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof DailyHours, direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc'});

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

        const processedData: DailyHours[] = [];

        Object.values(recordsByUser).forEach(userRecords => {
          const sortedRecords = userRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          const dailyTotals: { [date: string]: number } = {};
          let lastClockIn: Date | null = null;

          sortedRecords.forEach(record => {
            if (record.type === ClockType.IN) {
              lastClockIn = new Date(record.timestamp);
            } else if (record.type === ClockType.OUT && lastClockIn) {
              const durationMillis = new Date(record.timestamp).getTime() - lastClockIn.getTime();
              // Group by the date of clock IN
              const dateStr = lastClockIn.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
              
              dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + durationMillis;
              lastClockIn = null;
            }
          });

          for (const [date, totalMillis] of Object.entries(dailyTotals)) {
            processedData.push({
              id: `${userRecords[0]?.userId}-${date}`,
              userName: userRecords[0]?.userName || 'Unknown',
              date: date,
              hours: totalMillis / (1000 * 60 * 60)
            });
          }
        });
        setDailyHours(processedData);
      } catch (error) {
        console.error("Failed to process daily hours data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    processRecords();
  }, []);

  const requestSort = (key: keyof DailyHours) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedAndFilteredRecords = useMemo(() => {
    let sortableItems = [...dailyHours];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Special handling for date sorting
        if (sortConfig.key === 'date') {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems.filter(record =>
      record.userName.toLowerCase().includes(filter.toLowerCase())
    );
  }, [dailyHours, filter, sortConfig]);
  
  const SortableHeader = ({ tkey, label }: {tkey: keyof DailyHours, label: string}) => {
    const isSorted = sortConfig?.key === tkey;
    const sortIcon = isSorted ? (sortConfig?.direction === 'asc' ? '▲' : '▼') : '↕';
    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(tkey)}>
            {label} <span className="text-gray-400">{sortIcon}</span>
        </th>
    );
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
       <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Daily Hours Breakdown</h2>
       <div className="mb-4">
            <input
                type="text"
                placeholder="Filter by name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full max-w-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <SortableHeader tkey="userName" label="Employee" />
              <SortableHeader tkey="date" label="Date" />
              <SortableHeader tkey="hours" label="Hours Worked" />
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedAndFilteredRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{record.hours.toFixed(2)}</td>
              </tr>
            ))}
             {sortedAndFilteredRecords.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-500 dark:text-gray-400">
                        No data available.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyHoursTable;