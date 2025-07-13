import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { formatCurrency, Currency } from '@/lib/utils';
import { InvestmentData } from '@/types/investment';

interface PerformanceVsPlanProps {
  data: InvestmentData[];
  currency: Currency;
  currentDay: number;
}

const PerformanceVsPlan: React.FC<PerformanceVsPlanProps> = ({ 
  data, 
  currency, 
  currentDay 
}) => {
  // Calcola la performance dall'inizio al giorno attuale
  const calculatePerformanceVsPlan = () => {
    if (!data.length || currentDay === 0) {
      return {
        actualReturn: 0,
        plannedReturn: 0,
        difference: 0,
        isOutperforming: false,
        actualCapital: 0,
        plannedCapital: 0,
        message: "Nessun dato disponibile"
      };
    }

    // Trova il dato del giorno attuale o il più vicino
    const currentDayData = data.find(d => d.day === currentDay) || data[data.length - 1];
    
    if (!currentDayData) {
      return {
        actualReturn: 0,
        plannedReturn: 0,
        difference: 0,
        isOutperforming: false,
        actualCapital: 0,
        plannedCapital: 0,
        message: "Dati non disponibili"
      };
    }

    // CAPITALE REALE (con tutti i rendimenti modificati dal giorno 1 ad oggi)
    const initialCapital = data[0].capitalBeforePAC;
    const actualCapital = currentDayData.finalCapital;
    
    // CAPITALE PIANIFICATO (usando SOLO il tasso standard originale per tutti i giorni)
    // Trova il primo giorno per ottenere il tasso di rendimento standard originale
    const firstDay = data.find(d => d.day === 1);
    if (!firstDay) {
      return {
        actualReturn: 0,
        plannedReturn: 0,
        difference: 0,
        isOutperforming: false,
        actualCapital: 0,
        plannedCapital: 0,
        message: "Dati del primo giorno non disponibili"
      };
    }

    // Ottieni il tasso di rendimento standard (quello che era configurato inizialmente)
    // Se il primo giorno ha un rendimento personalizzato, dovremmo avere il tasso originale
    // Per ora usiamo il tasso dal primo giorno disponibile non personalizzato
    let standardDailyRate = firstDay.dailyReturn;
    
    // Cerca il primo giorno senza rendimento personalizzato per ottenere il tasso standard
    for (const dayData of data) {
      if (!dayData.isCustomReturn) {
        standardDailyRate = dayData.dailyReturn;
        break;
      }
    }

    // Simula il piano originale usando sempre il tasso standard
    let plannedCapital = initialCapital;
    
    for (let day = 1; day <= currentDay; day++) {
      const dayData = data.find(d => d.day === day);
      if (dayData) {
        // Aggiungi il PAC del giorno (usando i PAC effettivamente investiti)
        plannedCapital += dayData.pacAmount;
        
        // Applica SEMPRE il tasso di rendimento standard originale
        plannedCapital = plannedCapital * (1 + standardDailyRate / 100);
      }
    }

    // Calcola i tassi di crescita complessivi dal giorno 1 ad oggi
    const totalInvested = currentDayData.totalPACInvested + initialCapital;
    const actualGrowthRate = totalInvested > 0 ? ((actualCapital - totalInvested) / totalInvested) * 100 : 0;
    
    const plannedTotalInvested = totalInvested; // Stesso investimento totale
    const plannedGrowthRate = plannedTotalInvested > 0 ? ((plannedCapital - plannedTotalInvested) / plannedTotalInvested) * 100 : 0;
    
    // Differenza tra performance reale e pianificata
    const difference = actualGrowthRate - plannedGrowthRate;
    const isOutperforming = difference > 0;

    let message = "In linea con il piano originale";
    if (Math.abs(difference) > 0.1) {
      message = isOutperforming 
        ? `Strategia sovraperformante del ${Math.abs(difference).toFixed(2)}%`
        : `Strategia sottoperformante del ${Math.abs(difference).toFixed(2)}%`;
    }

    return {
      actualReturn: actualGrowthRate,
      plannedReturn: plannedGrowthRate,
      difference,
      isOutperforming,
      actualCapital,
      plannedCapital,
      message
    };
  };

  const performance = calculatePerformanceVsPlan();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance vs Piano
          </CardTitle>
          <Badge 
            variant={Math.abs(performance.difference) <= 0.1 ? "default" : performance.isOutperforming ? "secondary" : "destructive"}
            className="px-3 py-1"
          >
            {Math.abs(performance.difference) <= 0.1 ? "In linea" : (performance.isOutperforming ? "+" : "") + performance.difference.toFixed(2) + "%"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {performance.message}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rendimento Reale */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm font-medium">Rendimento Reale</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">
                {performance.actualReturn.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Capitale attuale: {formatCurrency(performance.actualCapital, currency)}
              </div>
            </div>
          </div>

          {/* Rendimento Atteso */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
              <span className="text-sm font-medium">Piano Originale</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-muted-foreground">
                {performance.plannedReturn.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Capitale atteso: {formatCurrency(performance.plannedCapital, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Differenza */}
        {Math.abs(performance.difference) > 0.1 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {performance.isOutperforming ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  Differenza vs Piano
                </span>
              </div>
              <div className={`text-lg font-semibold ${
                performance.isOutperforming ? 'text-green-600' : 'text-red-600'
              }`}>
                {performance.isOutperforming ? '+' : ''}{performance.difference.toFixed(2)}%
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Differenza capitale: {formatCurrency(performance.actualCapital - performance.plannedCapital, currency)}
            </div>
          </div>
        )}

        {/* Progress bar visivo */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Giorno {currentDay}</span>
            <span>Dal inizio del piano</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, Math.max(0, (currentDay / Math.max(1, data.length - 1)) * 100))}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceVsPlan;