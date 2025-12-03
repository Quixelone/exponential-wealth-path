import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, X, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ValidationResult, ValidationWarning, ValidationError } from '@/hooks/useOptionValidation';

interface ValidationFeedbackProps {
  validation: ValidationResult;
  onDismissWarning?: (field: string) => void;
  onHighWarningsAcknowledged?: (acknowledged: boolean) => void;
  showShake?: boolean;
}

export function ValidationFeedback({
  validation,
  onDismissWarning,
  onHighWarningsAcknowledged,
  showShake = false
}: ValidationFeedbackProps) {
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());
  const [highWarningsAcknowledged, setHighWarningsAcknowledged] = useState(false);

  const { errors, warnings, hasHighWarnings } = validation;

  // Filter out dismissed warnings
  const activeWarnings = warnings.filter(w => !dismissedWarnings.has(w.field));
  const highWarnings = activeWarnings.filter(w => w.severity === 'high');
  const mediumWarnings = activeWarnings.filter(w => w.severity === 'medium');
  const lowWarnings = activeWarnings.filter(w => w.severity === 'low');

  // Reset acknowledgment when warnings change
  useEffect(() => {
    setHighWarningsAcknowledged(false);
  }, [JSON.stringify(highWarnings)]);

  useEffect(() => {
    onHighWarningsAcknowledged?.(highWarningsAcknowledged || highWarnings.length === 0);
  }, [highWarningsAcknowledged, highWarnings.length, onHighWarningsAcknowledged]);

  const handleDismiss = (field: string) => {
    setDismissedWarnings(prev => new Set([...prev, field]));
    onDismissWarning?.(field);
  };

  if (errors.length === 0 && activeWarnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Errors - Red Box */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              x: showShake ? [0, -10, 10, -10, 10, 0] : 0
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: showShake ? 0.4 : 0.2 }}
            className="rounded-lg border border-red-500/50 bg-red-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-red-500">
                  {errors.length === 1 ? 'Errore di validazione' : `${errors.length} errori di validazione`}
                </p>
                <ul className="space-y-1 text-sm text-red-400">
                  {errors.map((error, idx) => (
                    <li key={`${error.field}-${idx}`} className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>{error.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High Warnings - Orange Box with Checkbox */}
      <AnimatePresence>
        {highWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-orange-500/50 bg-orange-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-3">
                <p className="font-medium text-orange-500">
                  {highWarnings.length === 1 ? 'Attenzione richiesta' : `${highWarnings.length} avvisi importanti`}
                </p>
                <ul className="space-y-2">
                  {highWarnings.map((warning, idx) => (
                    <WarningItem
                      key={`${warning.field}-${idx}`}
                      warning={warning}
                      onDismiss={() => handleDismiss(warning.field)}
                      showDismiss={false}
                    />
                  ))}
                </ul>
                
                {/* Acknowledgment Checkbox */}
                <div className="flex items-center gap-2 pt-2 border-t border-orange-500/20">
                  <Checkbox
                    id="acknowledge-warnings"
                    checked={highWarningsAcknowledged}
                    onCheckedChange={(checked) => setHighWarningsAcknowledged(checked === true)}
                    className="border-orange-500 data-[state=checked]:bg-orange-500"
                  />
                  <Label 
                    htmlFor="acknowledge-warnings" 
                    className="text-sm text-orange-400 cursor-pointer"
                  >
                    Ho verificato i dati e confermo che sono corretti
                  </Label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medium Warnings - Yellow Box */}
      <AnimatePresence>
        {mediumWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-yellow-500">Suggerimenti</p>
                <ul className="space-y-2">
                  {mediumWarnings.map((warning, idx) => (
                    <WarningItem
                      key={`${warning.field}-${idx}`}
                      warning={warning}
                      onDismiss={() => handleDismiss(warning.field)}
                      showDismiss={true}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low Warnings - Blue Box */}
      <AnimatePresence>
        {lowWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-blue-500">Informazioni</p>
                <ul className="space-y-2">
                  {lowWarnings.map((warning, idx) => (
                    <WarningItem
                      key={`${warning.field}-${idx}`}
                      warning={warning}
                      onDismiss={() => handleDismiss(warning.field)}
                      showDismiss={true}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual warning item component
function WarningItem({ 
  warning, 
  onDismiss, 
  showDismiss 
}: { 
  warning: ValidationWarning;
  onDismiss: () => void;
  showDismiss: boolean;
}) {
  const severityColors = {
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400'
  };

  return (
    <li className={cn("flex items-start justify-between gap-2 text-sm", severityColors[warning.severity])}>
      <div className="flex items-start gap-2">
        <span className="opacity-60">•</span>
        <span>{warning.message}</span>
      </div>
      {showDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-transparent opacity-50 hover:opacity-100"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </li>
  );
}

// Settlement consistency feedback component
interface SettlementFeedbackProps {
  consistent: boolean;
  message: string;
}

export function SettlementFeedback({ consistent, message }: SettlementFeedbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-lg border p-3 text-sm flex items-start gap-2",
        consistent
          ? "border-green-500/50 bg-green-500/10 text-green-400"
          : "border-orange-500/50 bg-orange-500/10 text-orange-400"
      )}
    >
      {consistent ? (
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </motion.div>
  );
}
