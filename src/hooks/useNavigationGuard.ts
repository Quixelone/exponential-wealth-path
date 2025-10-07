import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseNavigationGuardProps {
  hasUnsavedChanges: boolean;
  onNavigateAway?: () => void;
}

export const useNavigationGuard = ({ hasUnsavedChanges, onNavigateAway }: UseNavigationGuardProps) => {
  const [showAlert, setShowAlert] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Intercept programmatic navigation
  const guardedNavigate = (path: string) => {
    if (hasUnsavedChanges && location.pathname !== path) {
      setPendingNavigation(path);
      setShowAlert(true);
    } else {
      navigate(path);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      onNavigateAway?.();
      navigate(pendingNavigation);
      setPendingNavigation(null);
      setShowAlert(false);
    }
  };

  const cancelNavigation = () => {
    setPendingNavigation(null);
    setShowAlert(false);
  };

  return {
    guardedNavigate,
    showAlert,
    confirmNavigation,
    cancelNavigation,
  };
};
