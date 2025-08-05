import React from 'react';
import { EuiButton } from '@elastic/eui';

export const MyEuiButton = ({ label }: { label: string }) => {
  return <EuiButton>{label}</EuiButton>;
};
