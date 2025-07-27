
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';

export type Currency = 'EUR' | 'USD' | 'USDT';

interface CurrencyConfigurationProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const CurrencyConfiguration: React.FC<CurrencyConfigurationProps> = ({
  selectedCurrency,
  onCurrencyChange
}) => {
  // Debug currency changes
  React.useEffect(() => {
    console.log('💱 CurrencyConfiguration currency updated:', selectedCurrency);
  }, [selectedCurrency]);
  const handleCurrencyChange = (value: Currency) => {
    console.log('💱 CurrencyConfiguration: Changing currency to:', value);
    onCurrencyChange(value);
  };

  const currencies = [
    { value: 'EUR' as Currency, label: 'Euro (€)', symbol: '€' },
    { value: 'USD' as Currency, label: 'US Dollar ($)', symbol: '$' },
    { value: 'USDT' as Currency, label: 'Tether (USDT)', symbol: '₮' }
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-primary" />
          Valuta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currency-select">Seleziona Valuta</Label>
          <Select
            value={selectedCurrency}
            onValueChange={handleCurrencyChange}
          >
            <SelectTrigger id="currency-select">
              <SelectValue placeholder="Seleziona una valuta" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currency.symbol}</span>
                    <span>{currency.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800 mb-1">Valuta Selezionata</p>
              <p className="text-blue-700">
                {currencies.find(c => c.value === selectedCurrency)?.label}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyConfiguration;
