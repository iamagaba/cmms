import { ArrowLeft, ChevronRight } from 'lucide-react';
import { ActionIcon } from '../feedback/ActionIcon';
import { Group } from '../layout/Group';
import { Text } from '../typography/Text';


import { clsx } from 'clsx';

export interface PaginationProps {
    total: number;
    value?: number;
    onChange?: (page: number) => void;
    size?: 'sm' | 'md' | 'lg';
    siblings?: number;
    boundaries?: number;
    color?: string;
    withEdges?: boolean;
    withControls?: boolean;
}

export function Pagination({
    total,
    value = 1,
    onChange,
    size = 'md',
    siblings = 1,
    boundaries = 1,
    color = 'blue',
    withEdges = true,
    withControls = true,
}: PaginationProps) {
    const range = (start: number, end: number) => {
        const length = end - start + 1;
        return Array.from({ length }, (_, i) => start + i);
    };

    const activePage = Math.max(1, Math.min(value, total));

    const handlePageChange = (page: number) => {
        if (page !== activePage && page >= 1 && page <= total) {
            onChange?.(page);
        }
    };

    const renderPageParams = () => {
        const totalPageNumbers = siblings * 2 + 3 + boundaries * 2;
        if (totalPageNumbers >= total) {
            return range(1, total);
        }

        const leftSiblingIndex = Math.max(activePage - siblings, 1);
        const rightSiblingIndex = Math.min(activePage + siblings, total);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < total - 2;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftItemCount = 3 + 2 * siblings;
            const leftRange = range(1, leftItemCount);
            return [...leftRange, 'dots', total];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightItemCount = 3 + 2 * siblings;
            const rightRange = range(total - rightItemCount + 1, total);
            return [1, 'dots', ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            const middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [1, 'dots', ...middleRange, 'dots', total];
        }
    };

    const items = renderPageParams() || [];

    const buttonSize = size === 'sm' ? 26 : size === 'md' ? 32 : 38;
    const fontSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

    return (
        <Group gap="xs" align="center">
            {withControls && (
                <ActionIcon
                    onClick={() => handlePageChange(activePage - 1)}
                    disabled={activePage <= 1}
                    variant="subtle"
                    color="gray"
                    style={{ width: buttonSize, height: buttonSize }}
                >
                    <ArrowLeft className="w-5 h-5" />
                </ActionIcon>
            )}

            {items.map((item, index) => {
                if (item === 'dots') {
                    return (
                        <Text key={`dots-${index}`} size="sm" c="dimmed">
                            ...
                        </Text>
                    );
                }

                const page = item as number;
                const isActive = page === activePage;

                return (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={clsx(
                            'flex items-center justify-center rounded transition-colors',
                            fontSize,
                            'font-medium',
                            isActive
                                ? `bg-${color}-600 text-white`
                                : 'hover:bg-gray-100 text-gray-700'
                        )}
                        style={{ width: buttonSize, height: buttonSize }}
                    >
                        {page}
                    </button>
                );
            })}

            {withControls && (
                <ActionIcon
                    onClick={() => handlePageChange(activePage + 1)}
                    disabled={activePage >= total}
                    variant="subtle"
                    color="gray"
                    style={{ width: buttonSize, height: buttonSize }}
                >
                    <ChevronRight className="w-4 h-4" />
                </ActionIcon>
            )}
        </Group>
    );
}

