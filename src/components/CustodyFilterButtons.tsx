import { Icon } from '@iconify/react';

interface CustodyFilterButtonsProps {
  activeFilter: 'all' | 'in-custody' | 'with-customer';
  onFilterChange: (filter: 'all' | 'in-custody' | 'with-customer') => void;
  inCustodyCount?: number;
  withCustomerCount?: number;
}

/**
 * Filter buttons for asset custody status.
 * Allows users to quickly filter work orders by where the bike is located.
 */
export const CustodyFilterButtons = ({
  activeFilter,
  onFilterChange,
  inCustodyCount,
  withCustomerCount
}: CustodyFilterButtonsProps) => {
  const buttonClass = (filter: typeof activeFilter) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      activeFilter === filter
        ? 'bg-blue-500 text-white shadow-sm'
        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
    }`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 font-medium mr-2">Asset Location:</span>
      
      <button
        onClick={() => onFilterChange('all')}
        className={buttonClass('all')}
      >
        <Icon icon="tabler:list" width={16} height={16} />
        All
      </button>

      <button
        onClick={() => onFilterChange('in-custody')}
        className={buttonClass('in-custody')}
      >
        <Icon icon="tabler:tool" width={16} height={16} />
        In Custody
        {inCustodyCount !== undefined && (
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeFilter === 'in-custody' ? 'bg-blue-600' : 'bg-blue-100 text-blue-700'
          }`}>
            {inCustodyCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onFilterChange('with-customer')}
        className={buttonClass('with-customer')}
      >
        <Icon icon="tabler:user" width={16} height={16} />
        With Customer
        {withCustomerCount !== undefined && (
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            activeFilter === 'with-customer' ? 'bg-blue-600' : 'bg-gray-100 text-gray-700'
          }`}>
            {withCustomerCount}
          </span>
        )}
      </button>
    </div>
  );
};
