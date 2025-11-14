
import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { ClockRecord, ClockType } from '../types';
import Spinner from './Spinner';

const RecordsTable: React.FC = () => {
  const [records, setRecords] = useState<ClockRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // Stores date as YYYY-MM-DD
  const [sortConfig, setSortConfig] = useState<{ key: keyof ClockRecord, direction: 'asc' | 'desc' } | null>({ key: 'timestamp', direction: 'desc'});

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getRecords();
        setRecords(data);
      } catch (error) {
        console.error("Failed to fetch records:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const requestSort = (key: keyof ClockRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedAndFilteredRecords = useMemo(() => {
    let sortableItems = [...records];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems.filter(record => {
      const nameMatch = record.userName.toLowerCase().includes(filter.toLowerCase());

      if (!dateFilter) {
        return nameMatch;
      }

      // Convert record timestamp to YYYY-MM-DD in local timezone for accurate comparison
      const recordDate = new Date(record.timestamp);
      const year = recordDate.getFullYear();
      const month = (recordDate.getMonth() + 1).toString().padStart(2, '0');
      const day = recordDate.getDate().toString().padStart(2, '0');
      const recordDateString = `${year}-${month}-${day}`;
      
      const dateMatch = recordDateString === dateFilter;

      return nameMatch && dateMatch;
    });
  }, [records, filter, dateFilter, sortConfig]);

  const SortableHeader = ({ tkey, label }: {tkey: keyof ClockRecord, label: string}) => {
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
       <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
                type="text"
                placeholder="Filter by name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto max-w-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
             {dateFilter && (
                <button 
                    onClick={() => setDateFilter('')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                    Clear Date
                </button>
            )}
        </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <SortableHeader tkey="userName" label="Employee" />
              <SortableHeader tkey="timestamp" label="Timestamp" />
              <SortableHeader tkey="type" label="Type" />
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location (Lat, Long)</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedAndFilteredRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(record.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.type === ClockType.IN ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {record.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {record.location ? `${record.location.latitude.toFixed(4)}, ${record.location.longitude.toFixed(4)}` : 'N/A'}
                </td>
              </tr>
            ))}
             {sortedAndFilteredRecords.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">
                        No records match the current filters.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordsTable;