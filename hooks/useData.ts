import { useState, useEffect } from 'react';
import { AppState, Page, Category } from '@/types';
import { fetchData } from '@/lib/api';

export const useData = () => {
  const [data, setData] = useState<AppState>({ pages: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedData = await fetchData();
      setData(fetchedData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = () => {
    loadData();
  };

  return {
    data,
    loading,
    error,
    refreshData,
    setData
  };
};