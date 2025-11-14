
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../App';
import { apiService } from '../services/apiService';
import { geolocationService } from '../services/geolocationService';
import { ClockRecord, ClockType } from '../types';
import Spinner from './Spinner';

const Clock: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRecord, setLastRecord] = useState<ClockRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLastRecord = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const record = await apiService.getUserLastRecord(user.id);
      setLastRecord(record);
    } catch (e) {
      setError('Failed to fetch latest record.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLastRecord();
  }, [fetchLastRecord]);

  const handleClockAction = async (type: ClockType) => {
    if (!user) return;
    setIsActionLoading(true);
    setError(null);
    setNotification(null);
    try {
      const location = await geolocationService.getCurrentPosition();
      await apiService.clock(user.id, type, location);
      setNotification(`Successfully clocked ${type === ClockType.IN ? 'in' : 'out'}. Location captured.`);
      fetchLastRecord();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const isClockedIn = lastRecord?.type === ClockType.IN;

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          {currentTime.toLocaleTimeString()}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
          {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {isLoading ? <Spinner /> : (
            <div className="mb-8">
                <p className="text-xl font-semibold">
                    Status: 
                    <span className={`ml-2 px-3 py-1 text-base font-bold rounded-full ${isClockedIn ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {isClockedIn ? 'Clocked In' : 'Clocked Out'}
                    </span>
                </p>
                {lastRecord && (
                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Last action at {new Date(lastRecord.timestamp).toLocaleTimeString()}
                    </p>
                )}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => handleClockAction(ClockType.IN)}
            disabled={isClockedIn || isActionLoading || isLoading}
            className="flex items-center justify-center w-full h-32 text-2xl font-bold text-white bg-green-500 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isActionLoading && !isClockedIn ? <Spinner /> : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                Clock In
                </>
            )}
          </button>
          <button
            onClick={() => handleClockAction(ClockType.OUT)}
            disabled={!isClockedIn || isActionLoading || isLoading}
            className="flex items-center justify-center w-full h-32 text-2xl font-bold text-white bg-red-500 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isActionLoading && isClockedIn ? <Spinner /> : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                Clock Out
                </>
            )}
          </button>
        </div>

        {error && (
            <div className="mt-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
                <span className="font-medium">Error:</span> {error}
            </div>
        )}
        {notification && (
            <div className="mt-6 p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900 dark:text-green-200" role="alert">
                <span className="font-medium">Success:</span> {notification}
            </div>
        )}
      </div>
    </div>
  );
};

export default Clock;
