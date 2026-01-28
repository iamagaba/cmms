import React from 'react';
import { Trash, Edit } from 'lucide-react';
import dayjs from 'dayjs';

interface Shift {
  id: string;
  start_datetime: string;
  end_datetime: string;
  location_id: string;
  location?: { name: string };
  notes?: string;
  status: 'draft' | 'published';
}

interface ShiftBlockProps {
  shift: Shift;
  onEdit: (shift: Shift) => void;
  onDelete: (shiftId: string) => void;
  locationColor?: string;
}

export const ShiftBlock: React.FC<ShiftBlockProps> = ({
  shift,
  onEdit,
  onDelete,
  locationColor = 'bg-blue-500',
}) => {
  const startTime = dayjs(shift.start_datetime).format('ha');
  const endTime = dayjs(shift.end_datetime).format('ha');
  const duration = dayjs(shift.end_datetime).diff(dayjs(shift.start_datetime), 'hour', true);

  return (
    <div
      className={`group relative ${locationColor} text-white rounded px-2 py-1.5 text-xs cursor-pointer hover:opacity-90 transition-opacity ${shift.status === 'draft' ? 'border-2 border-dashed border-white/50' : ''
        }`}
      onClick={() => onEdit(shift)}
    >
      <div className="font-medium">
        {startTime} - {endTime}
      </div>
      {shift.location && (
        <div className="text-white/90 truncate text-xs">
          {shift.location.name}
        </div>
      )}
      {shift.notes && (
        <div className="text-white/80 truncate text-xs mt-0.5">
          {shift.notes}
        </div>
      )}

      {/* Hover actions */}
      <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(shift);
          }}
          className="p-1 bg-white/20 hover:bg-white/30 rounded backdrop-blur-sm"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(shift.id);
          }}
          className="p-1 bg-white/20 hover:bg-destructive rounded backdrop-blur-sm"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};



