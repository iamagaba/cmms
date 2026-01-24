import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  FileIcon,
  StethoscopeIcon,
  Tick01Icon,
  NoteIcon
} from '@hugeicons/core-free-icons';
import { WorkOrder } from '@/types/supabase';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Note {
  id: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: string;
  type: 'note' | 'diagnosis' | 'resolution';
}

interface WorkOrderNotesCardProps {
  workOrder: WorkOrder;
  onAddNote?: (content: string, type: 'note' | 'diagnosis' | 'resolution') => void;
  profileMap?: Map<string, string>;
}

export const WorkOrderNotesCard: React.FC<WorkOrderNotesCardProps> = ({
  workOrder,
  onAddNote,
  profileMap = new Map(),
}) => {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'diagnosis' | 'resolution'>('note');
  const [isExpanded, setIsExpanded] = useState(false);

  // Combine existing notes from work order fields
  const existingNotes: Note[] = [];

  if (workOrder.initialDiagnosis) {
    existingNotes.push({
      id: 'diagnosis',
      content: workOrder.initialDiagnosis,
      author: 'Initial Diagnosis',
      authorId: '',
      timestamp: workOrder.created_at || '',
      type: 'diagnosis',
    });
  }

  if (workOrder.serviceNotes) {
    existingNotes.push({
      id: 'service-notes',
      content: workOrder.serviceNotes,
      author: 'Service Notes',
      authorId: '',
      timestamp: workOrder.created_at || '',
      type: 'note',
    });
  }

  if (workOrder.maintenanceNotes) {
    existingNotes.push({
      id: 'maintenance-notes',
      content: workOrder.maintenanceNotes,
      author: 'Maintenance Notes',
      authorId: '',
      timestamp: workOrder.completedAt || workOrder.created_at || '',
      type: 'resolution',
    });
  }

  const typeConfig = {
    note: { icon: NoteIcon, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Note' },
    diagnosis: { icon: StethoscopeIcon, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Diagnosis' },
    resolution: { icon: Tick01Icon, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Resolution' },
  };

  const handleSubmit = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(newNote.trim(), noteType);
      setNewNote('');
      setIsExpanded(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
      {onAddNote && (
        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-end">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <HugeiconsIcon icon={Add01Icon} size={12} />
            Add
          </button>
        </div>
      )}

      <div className="px-3 py-2 space-y-2">
        {/* Add Note Form */}
        {isExpanded && onAddNote && (
          <div className="bg-gray-50 rounded p-2 space-y-2">
            <div className="flex gap-1">
              {(['note', 'diagnosis', 'resolution'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setNoteType(type)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${noteType === type
                    ? `${typeConfig[type].bg} ${typeConfig[type].color}`
                    : 'bg-white text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  {typeConfig[type].label}
                </button>
              ))}
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={2}
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newNote.trim()}
                className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Existing Notes */}
        {existingNotes.length === 0 ? (
          <div className="text-center py-4">
            <HugeiconsIcon icon={FileIcon} size={24} className="text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-400">No notes yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {existingNotes.map((note) => {
              const config = typeConfig[note.type];
              return (
                <div key={note.id} className="flex gap-2 py-2 first:pt-0 last:pb-0">
                  <div className={`w-6 h-6 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <HugeiconsIcon icon={config.icon} size={12} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                      {note.timestamp && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400">{dayjs(note.timestamp).fromNow()}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{note.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderNotesCard;
