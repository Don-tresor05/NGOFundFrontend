import React from 'react';
import { RealTimeFundTracking } from './RealTimeFundTracking';
import { ProjectFundingStatus } from './ProjectFundingStatus';

export const DashboardCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RealTimeFundTracking />
      <ProjectFundingStatus />
    </div>
  );
};
