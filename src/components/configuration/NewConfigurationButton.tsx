
import React from 'react';
import NewConfigurationDialog from './NewConfigurationDialog';

interface NewConfigurationButtonProps {
  onCreateNew: (name: string, copyFromCurrent: boolean) => void;
  hasCurrentConfig: boolean;
  currentConfigName: string;
}

const NewConfigurationButton: React.FC<NewConfigurationButtonProps> = ({
  onCreateNew,
  hasCurrentConfig,
  currentConfigName
}) => {
  return (
    <NewConfigurationDialog
      onCreateNew={onCreateNew}
      hasCurrentConfig={hasCurrentConfig}
      currentConfigName={currentConfigName}
    />
  );
};

export default NewConfigurationButton;
