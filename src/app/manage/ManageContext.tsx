'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import HomeService from '@/api/service/HomeService';

interface ManageContextType {
  centers: UserCenter[];
  selectedCenter: UserCenter | null;
  setSelectedCenter: (center: UserCenter) => void;
  isLoadingCenters: boolean;
}

const ManageContext = createContext<ManageContextType | undefined>(undefined);

export function ManageProvider({ children }: { children: React.ReactNode }) {
  const [centers, setCenters] = useState<UserCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<UserCenter | null>(null);
  const [isLoadingCenters, setIsLoadingCenters] = useState(true);

  useEffect(() => {
    const fetchCenters = async () => {
      setIsLoadingCenters(true);
      try {
        const res = await HomeService.getMyCenters();
        const list = res?.list ?? [];
        setCenters(list);

        const savedCenterId = localStorage.getItem('selectedCenterId');
        const saved = list.find(c => c.centerId === savedCenterId);
        const activeCenter = saved ?? list[0] ?? null;
        setSelectedCenter(activeCenter);
        if (activeCenter) {
          localStorage.setItem('selectedCenterId', activeCenter.centerId);
        }
      } catch (e) {
        console.error('[ManageContext] fetchCenters error', e);
      } finally {
        setIsLoadingCenters(false);
      }
    };

    fetchCenters();
  }, []);

  const handleSetSelectedCenter = (center: UserCenter) => {
    setSelectedCenter(center);
    localStorage.setItem('selectedCenterId', center.centerId);
  };

  return (
    <ManageContext.Provider
      value={{
        centers,
        selectedCenter,
        setSelectedCenter: handleSetSelectedCenter,
        isLoadingCenters,
      }}
    >
      {children}
    </ManageContext.Provider>
  );
}

export function useManage() {
  const context = useContext(ManageContext);
  if (context === undefined) {
    throw new Error('useManage must be used within a ManageProvider');
  }
  return context;
}
