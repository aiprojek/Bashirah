import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

const PrayerAndZakatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  if (tab === 'zakat') {
    return <Navigate to="/zakat" replace />;
  }
  return <Navigate to="/prayer-times" replace />;
};

export default PrayerAndZakatPage;
