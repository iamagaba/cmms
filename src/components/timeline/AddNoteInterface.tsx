/**
 * AddNoteInterface Component
 * Inline note addition interface for desktop timeline
 * Uses shadcn/ui components with default styling as per application isolation rules
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bold, Italic, List, Loader2 } from 'lucide-react';

// shadcn/ui components with default styling
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';
import { timelineService } from '@/services/timeline-service';
import type { AddNoteInterfaceProps, Activity } from '@/types/activity-timeline';

/**
 * Rich text formatting options
 */
interface FormattingOption {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prefix: string;
  suffix: string;
}

const FORMATTING_OPTIONS: FormattingOption[] = [
  {
    key: 'bold',
    label: 'Bold',
    icon: Bold,
    prefix: '**',
    suffix: '**'
  },
  {
    key: 'italic',
    label: 'Italic',
    icon: Italic,
    prefix: '_',
    suffix: '_'
  },
  {
    key: 'list',
    label: 'List',
    icon: List,
    prefix: '- ',
    suffix: ''
  }
];

/**
 * AddNoteInterface - Expandable note input with rich text support
 * 
 * Features:
 * - Expandable textarea with rich text formatting
 * - Character count indicator with validation
 * - Save/cancel actions with loading states
 * - Uses shadcn/ui Form components with validation
 * - Follows Requirements 5.1, 5.2, 5.3
 */
export function AddNoteInterface({
  workOrderId,
  onNoteAdded,
  onCancel,
  className
}: AddNoteInterfaceProps) {
  // State management
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFormatting, setShowFormatting] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Constants
  const MAX_CHARACTERS = 10000;
  const MIN_CHARACTERS = 1;
  const characterCount = content.length;
  const isValid = content.trim().length >= MIN_CHARACTERS && characterCount <= MAX_CHARACTERS;

  /**
   * Handle textarea expansion
   */
  const handleExpand = useCallback(() => {
    setIsExpanded(true);
    setError(null);
    
    // Focus textarea after expansion
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, []);

  /**
   * Handle collapse/cancel
   */
  const handleCancel = useCallback(() => {
    setContent('');
    setIsExpanded(false);
    setError(null);
    setShowFormatting(false);
    onCancel?.();
  }, [onCancel]);

  /**
   * Apply rich text formatting
   */
  const applyFormatting = useCallback((option: FormattingOption) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newContent: string;
    let newCursorPos: number;

    if (option.key === 'list') {
      // Handle list formatting differently
      const lines = content.split('\n');
      const startLine = content.substring(0, start).split('\n').length - 1;
      const endLine = content.substring(0, end).split('\n').length - 1;
      
      for (let i = startLine; i <= endLine; i++) {
        if (!lines[i].startsWith('- ')) {
          lines[i] = '- ' + lines[i];
        }
      }
      
      newContent = lines.join('\n');
      newCursorPos = end + (endLine - startLine + 1) * 2;
    } else {
      // Handle bold/italic formatting
      if (selectedText) {
        newContent = content.substring(0, start) + 
                    option.prefix + selectedText + option.suffix + 
                    content.substring(end);
        newCursorPos = end + option.prefix.length + option.suffix.length;
      } else {
        newContent = content.substring(0, start) + 
                    option.prefix + option.suffix + 
                    content.substring(start);
        newCursorPos = start + option.prefix.length;
      }
    }

    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content]);

  /**
   * Handle note submission
   */
  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user ID (in a real app, this would come from auth context)
      const userId = 'current-user-id'; // TODO: Get from auth context
      
      const newActivity = await timelineService.addNote(workOrderId, content.trim(), userId);
      
      // Reset form
      setContent('');
      setIsExpanded(false);
      setShowFormatting(false);
      
      // Notify parent
      onNoteAdded(newActivity);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add note';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [workOrderId, content, isValid, isSubmitting, onNoteAdded]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isValid) {
      e.preventDefault();
      handleSubmit();
    }
    
    // Escape to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
    
    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      applyFormatting(FORMATTING_OPTIONS[0]);
    }
    
    // Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      applyFormatting(FORMATTING_OPTIONS[1]);
    }
  }, [isValid, handleSubmit, handleCancel, applyFormatting]);

  /**
   * Auto-resize textarea
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [content]);

  if (!isExpanded) {
    return (
      <Card className={cn('cursor-pointer hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          <button
            onClick={handleExpand}
            className="flex items-center gap-3 w-full text-left text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm">Add a note...</span>
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Add Note</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Rich Text Formatting Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {FORMATTING_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.key}
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting(option)}
                  disabled={isSubmitting}
                  title={`${option.label} (${option.key === 'bold' ? 'Ctrl+B' : option.key === 'italic' ? 'Ctrl+I' : ''})`}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFormatting(!showFormatting)}
            disabled={isSubmitting}
          >
            <span className="text-xs">Formatting</span>
          </Button>
        </div>

        {/* Formatting Help */}
        {showFormatting && (
          <div className="bg-muted rounded-lg p-3 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Formatting Help:</div>
            <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
              <div><code>**bold text**</code> → <strong>bold text</strong></div>
              <div><code>_italic text_</code> → <em>italic text</em></div>
              <div><code>- list item</code> → • list item</div>
            </div>
          </div>
        )}

        {/* Textarea */}
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your note here... (Ctrl+Enter to save, Escape to cancel)"
            disabled={isSubmitting}
            className={cn(
              'min-h-[100px] resize-none',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
          />
          
          {/* Character Count */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {error && (
                <span className="text-destructive">{error}</span>
              )}
            </div>
            <Badge 
              variant={characterCount > MAX_CHARACTERS ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {characterCount}/{MAX_CHARACTERS}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Tip: Use Ctrl+Enter to save quickly
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AddNoteInterface;