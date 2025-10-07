
import React from 'react';
import NewConfigurationDialog from './NewConfigurationDialog';

interface NewConfigurationButtonProps {
  onCreateNew: (name: string, copyFromCurrent: boolean, currency: 'EUR' | 'USD' | 'USDT') => void;
  hasCurrentConfig: boolean;
  currentConfigName: string;
  hasUnsavedChanges?: boolean;
}

const NewConfigurationButton: React.FC<NewConfigurationButtonProps> = ({
  onCreateNew,
  hasCurrentConfig,
  currentConfigName,
  hasUnsavedChanges = false
}) => {
  return (
    <NewConfigurationDialog
      onCreateNew={onCreateNew}
      hasCurrentConfig={hasCurrentConfig}
      currentConfigName={currentConfigName}
      hasUnsavedChanges={hasUnsavedChanges}
    />
  );
};

export default NewConfigurationButton;
