import { AppState } from '@/types';
import { getStorageData } from './storage';

export const fetchData = async (): Promise<AppState> => {
  return getStorageData();
};