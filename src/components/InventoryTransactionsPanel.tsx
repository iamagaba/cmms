import React, { useState } from 'react';
import { ArrowDown, X, ArrowRight, ArrowLeftRight, CheckCircle, AlertCircle } from 'lucide-react';
import { StockReceiptDialog } from './StockReceiptDialog';
import { StockTransferDialog } from './StockTransferDialog';
import { CycleCountDialog } from './CycleCountDialog';
import { ShrinkageRecordDialog } from './ShrinkageRecordDialog';

interface InventoryTransactionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TransactionType = 'receipt' | 'transfer' | 'cycle_count' | 'shrinkage' | null;

const TRANSACTION_OPTIONS = [
  {
    type: 'receipt' as const,
    title: 'Receive Stock',
    description: 'Log incoming inventory from suppliers',
    icon: 'tabler:package-import',
    color: 'emerald',
  },
  {
    type: 'transfer' as const,
    title: 'Transfer Stock',
    description: 'Move inventory between locations',
    icon: 'tabler:transfer',
    color: 'blue',
  },
  {
    type: 'cycle_count' as const,
    title: 'Cycle Count',
    description: 'Verify inventory accuracy',
    icon: 'tabler:clipboard-check',
    color: 'purple',
  },
  {
    type: 'shrinkage' as const,
    title: 'Record Shrinkage',
    description: 'Log inventory loss or damage',
    icon: 'tabler:alert-triangle',
    color: 'red',
  },
];

const COLOR_CLASSES = {
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
  },
  purple: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    hover: 'hover:bg-primary/20',
    border: 'border-primary/20',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    hover: 'hover:bg-red-50 dark:hover:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
  },
};

export const InventoryTransactionsPanel: React.FC<InventoryTransactionsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTransaction, setActiveTransaction] = useState<TransactionType>(null);

  const handleOpenTransaction = (type: TransactionType) => {
    setActiveTransaction(type);
  };

  const handleCloseTransaction = () => {
    setActiveTransaction(null);
  };

  const handleTransactionSuccess = () => {
    setActiveTransaction(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Inventory Transactions</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Select a transaction type</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Transaction Options */}
          <div className="p-3 space-y-2">
            {TRANSACTION_OPTIONS.map(option => {
              const colors = COLOR_CLASSES[option.color];
              return (
                <button
                  key={option.type}
                  onClick={() => handleOpenTransaction(option.type)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border ${colors.border} ${colors.hover} transition-colors text-left`}
                >
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    {option.type === 'receipt' ? (
                      <ArrowDown className={`w-5 h-5 ${colors.text}`} />
                    ) : option.type === 'transfer' ? (
                      <ArrowLeftRight className={`w-5 h-5 ${colors.text}`} />
                    ) : option.type === 'cycle_count' ? (
                      <CheckCircle className={`w-5 h-5 ${colors.text}`} />
                    ) : (
                      <AlertCircle className={`w-5 h-5 ${colors.text}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{option.description}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction Dialogs */}
      <StockReceiptDialog
        isOpen={activeTransaction === 'receipt'}
        onClose={handleCloseTransaction}
        onSuccess={handleTransactionSuccess}
      />
      <StockTransferDialog
        isOpen={activeTransaction === 'transfer'}
        onClose={handleCloseTransaction}
        onSuccess={handleTransactionSuccess}
      />
      <CycleCountDialog
        isOpen={activeTransaction === 'cycle_count'}
        onClose={handleCloseTransaction}
        onSuccess={handleTransactionSuccess}
      />
      <ShrinkageRecordDialog
        isOpen={activeTransaction === 'shrinkage'}
        onClose={handleCloseTransaction}
        onSuccess={handleTransactionSuccess}
      />
    </>
  );
};
