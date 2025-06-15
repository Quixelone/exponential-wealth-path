
import React, { useState } from 'react';
import { InvestmentData } from '@/types/investment';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Download, TrendingUp, TrendingDown, Edit3, Save, XCircle, Info } from 'lucide-react';
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/ModernTooltip';
import { formatCurrency } from '@/lib/utils';

interface ReportTableRowProps {
  item: InvestmentData;
  editingDay: number | null;
  setEditingDay: (day: number | null) => void;
  editValue: string;
  setEditValue: (val: string) => void;
  handleEdit: (item: InvestmentData) => void;
  handleSave: (day: number) => void;
  handleCancel: () => void;

  editingPACDay: number | null;
  setEditingPACDay: (day: number | null) => void;
  editPACValue: string;
  setEditPACValue: (val: string) => void;
  handleEditPAC: (item: InvestmentData) => void;
  handleSavePAC: (day: number) => void;
  handleCancelPAC: () => void;

  onRemovePACOverride?: (day: number) => void;
  formatDate: (dateString: string) => string;
}

const ReportTableRow: React.FC<ReportTableRowProps> = ({
  item,
  editingDay,
  setEditingDay,
  editValue,
  setEditValue,
  handleEdit,
  handleSave,
  handleCancel,
  editingPACDay,
  setEditingPACDay,
  editPACValue,
  setEditPACValue,
  handleEditPAC,
  handleSavePAC,
  handleCancelPAC,
  onRemovePACOverride,
  formatDate
}) => {
  const dailyGain = item.interestEarnedDaily;
  const isPositiveGain = dailyGain >= 0;
  const isEditingThisRow = editingDay === item.day;
  const isEditingThisPACRow = editingPACDay === item.day;

  return (
    <TableRow key={item.day} className={`hover:bg-muted/50 ${isEditingThisRow ? 'bg-primary/5' : ''}`}>
      <TableCell className="font-medium text-center">{item.day}</TableCell>
      <TableCell className="text-sm">{formatDate(item.date)}</TableCell>
      <TableCell className="text-right font-mono">{formatCurrency(item.capitalBeforePAC)}</TableCell>
      <TableCell className="text-right font-mono group">
        {isEditingThisPACRow ? (
          <Input
            type="number"
            value={editPACValue}
            min={0}
            step="0.01"
            onChange={(e) => setEditPACValue(e.target.value)}
            className="h-8 text-right w-24"
            autoFocus
          />
        ) : (
          <span className="flex items-center gap-1 justify-end">
            {formatCurrency(item.pacAmount)}
            <ModernTooltip>
              <ModernTooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary hover:text-primary/80 opacity-60 group-hover:opacity-100"
                  onClick={() => handleEditPAC(item)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </ModernTooltipTrigger>
              <ModernTooltipContent>
                <p>Modifica PAC per il giorno {item.day}</p>
              </ModernTooltipContent>
            </ModernTooltip>
            {item.isCustomPAC && (
              <ModernTooltip>
                <ModernTooltipTrigger>
                  <Badge variant="secondary" className="text-xs cursor-default">Custom</Badge>
                </ModernTooltipTrigger>
                <ModernTooltipContent>
                  <p>Importo PAC personalizzato</p>
                </ModernTooltipContent>
              </ModernTooltip>
            )}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right font-mono">{formatCurrency(item.capitalAfterPAC)}</TableCell>
      <TableCell className={`text-right font-mono ${item.dailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {isEditingThisRow ? (
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            step="0.001"
            className="h-8 text-right w-24"
            autoFocus
          />
        ) : (
          `${item.dailyReturn.toFixed(3)}%`
        )}
      </TableCell>
      <TableCell className={`text-right font-mono ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
        <div className="flex items-center justify-end gap-1">
          {isPositiveGain ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {formatCurrency(dailyGain)}
        </div>
      </TableCell>
      <TableCell className="text-right font-mono font-semibold">{formatCurrency(item.finalCapital)}</TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          {isEditingThisPACRow ? (
            <>
              <ModernTooltip>
                <ModernTooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => handleSavePAC(item.day)}>
                    <Save className="h-4 w-4" />
                  </Button>
                </ModernTooltipTrigger>
                <ModernTooltipContent><p>Salva Modifica PAC</p></ModernTooltipContent>
              </ModernTooltip>
              <ModernTooltip>
                <ModernTooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={handleCancelPAC}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </ModernTooltipTrigger>
                <ModernTooltipContent><p>Annulla</p></ModernTooltipContent>
              </ModernTooltip>
            </>
          ) : (
            <>
              {isEditingThisRow ? (
                <>
                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => handleSave(item.day)}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent><p>Salva Modifiche % Ricavo</p></ModernTooltipContent>
                  </ModernTooltip>
                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={handleCancel}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent><p>Annulla</p></ModernTooltipContent>
                  </ModernTooltip>
                </>
              ) : (
                <>
                  <ModernTooltip>
                    <ModernTooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary/80" onClick={() => handleEdit(item)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </ModernTooltipTrigger>
                    <ModernTooltipContent><p>Modifica % Ricavo per Giorno {item.day}</p></ModernTooltipContent>
                  </ModernTooltip>
                  {item.isCustomReturn && (
                    <ModernTooltip>
                      <ModernTooltipTrigger>
                        <Badge variant="secondary" className="text-xs cursor-default">Custom</Badge>
                      </ModernTooltipTrigger>
                      <ModernTooltipContent><p>Rendimento personalizzato</p></ModernTooltipContent>
                    </ModernTooltip>
                  )}
                  {item.pacAmount > 0 && !item.isCustomPAC && (
                    <ModernTooltip>
                      <ModernTooltipTrigger>
                        <Badge variant="outline" className="text-xs cursor-default">PAC</Badge>
                      </ModernTooltipTrigger>
                      <ModernTooltipContent><p>Versamento PAC eseguito</p></ModernTooltipContent>
                    </ModernTooltip>
                  )}
                  {item.isCustomPAC && typeof onRemovePACOverride === 'function' && (
                    <ModernTooltip>
                      <ModernTooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-yellow-600 hover:text-yellow-700"
                          onClick={() => onRemovePACOverride(item.day)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </ModernTooltipTrigger>
                      <ModernTooltipContent><p>Ripristina PAC da default</p></ModernTooltipContent>
                    </ModernTooltip>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ReportTableRow;
