import React from 'react';
import ComplianceRegistry from '../../components/ComplianceRegistry';

export const ComplianceManager: React.FC<{ isDark?: boolean }> = ({ isDark = true }) => {
  return <ComplianceRegistry isDark={isDark} />;
};

export default ComplianceManager;
