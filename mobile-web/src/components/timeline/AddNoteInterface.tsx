'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { MessageSquare, Send, X, Bold, Italic, List, Loader2 } from 'lucide-react'
import { timelineService } from '@/services/timeline-service'
import type { Activity } from '@/types/activity-timeline'

interface AddNoteInterfaceProps {
  workOrderId: string
  onNoteAdded: (activity: Activity) => void
  onCancel?: () => void
  className?: string
}

/**
 * Rich text formatting options for mobile
 */
interface FormattingOption {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  prefix: string
  suffix: string
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
]

/**
 * AddNoteInterface - Mobile-optimized note input with touch interactions
 * Features touch-friendly controls, rich text formatting, and proper keyboard handling
 */
export function AddNoteInterface({
  workOrderId,
  onNoteAdded,
  onCancel,
  className = ''
}: AddNoteInterfaceProps) {
  // State management
  const [content, setContent] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFormatting, setShowFormatting] = useState(false)

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Constants
  const MAX_CHARACTERS = 10000
  const MIN_CHARACTERS = 1
  const characterCount = content.length
  const isValid = content.trim().length >= MIN_CHARACTERS && characterCount <= MAX_CHARACTERS

  /**
   * Handle textarea expansion with mobile-optimized focus
   */
  const handleExpand = useCallback(() => {
    setIsExpanded(true)
    setError(null)
    
    // Focus textarea after expansion with mobile considerations
    setTimeout(() => {
      textareaRef.current?.focus()
      // Scroll into view on mobile
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [])

  /**
   * Handle collapse/cancel
   */
  const handleCancel = useCallback(() => {
    setContent('')
    setIsExpanded(false)
    setError(null)
    setShowFormatting(false)
    onCancel?.()
  }, [onCancel])

  /**
   * Apply rich text formatting with mobile-optimized selection handling
   */
  const applyFormatting = useCallback((option: FormattingOption) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    let newContent: string
    let newCursorPos: number

    if (option.key === 'list') {
      // Handle list formatting
      const lines = content.split('\n')
      const startLine = content.substring(0, start).split('\n').length - 1
      const endLine = content.substring(0, end).split('\n').length - 1
      
      for (let i = startLine; i <= endLine; i++) {
        if (!lines[i].startsWith('- ')) {
          lines[i] = '- ' + lines[i]
        }
      }
      
      newContent = lines.join('\n')
      newCursorPos = end + (endLine - startLine + 1) * 2
    } else {
      // Handle bold/italic formatting
      if (selectedText) {
        newContent = content.substring(0, start) + 
                    option.prefix + selectedText + option.suffix + 
                    content.substring(end)
        newCursorPos = end + option.prefix.length + option.suffix.length
      } else {
        newContent = content.substring(0, start) + 
                    option.prefix + option.suffix + 
                    content.substring(start)
        newCursorPos = start + option.prefix.length
      }
    }

    setContent(newContent)
    
    // Restore cursor position (mobile-friendly)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [content])

  /**
   * Handle note submission
   */
  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Get current user ID (in a real app, this would come from auth context)
      const userId = 'current-user-id' // TODO: Get from auth context
      
      const newActivity = await timelineService.addNote(workOrderId, content.trim(), userId)
      
      // Reset form
      setContent('')
      setIsExpanded(false)
      setShowFormatting(false)
      
      // Notify parent
      onNoteAdded(newActivity)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add note'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [workOrderId, content, isValid, isSubmitting, onNoteAdded])

  /**
   * Auto-resize textarea for mobile
   */
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
    }
  }, [content])

  if (!isExpanded) {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>
        <button
          onClick={handleExpand}
          className="flex items-center gap-3 w-full p-4 text-left text-slate-500 
                     hover:text-slate-700 active:bg-slate-50 transition-colors
                     min-h-[44px] touch-manipulation"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm">Add a note...</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border-2 border-primary-200 ${className}`}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-slate-900">Add Note</span>
          </div>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50
                       min-h-[44px] min-w-[44px] touch-manipulation
                       flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rich Text Formatting Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {FORMATTING_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.key}
                  onClick={() => applyFormatting(option)}
                  disabled={isSubmitting}
                  className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 
                             rounded-lg disabled:opacity-50 min-h-[44px] min-w-[44px]
                             touch-manipulation flex items-center justify-center"
                  title={option.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setShowFormatting(!showFormatting)}
            disabled={isSubmitting}
            className="px-3 py-2 text-xs text-slate-600 hover:text-slate-800 
                       hover:bg-slate-100 rounded-lg disabled:opacity-50
                       min-h-[44px] touch-manipulation"
          >
            Formatting
          </button>
        </div>

        {/* Formatting Help */}
        {showFormatting && (
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <div className="text-xs font-medium text-slate-700">Formatting Help:</div>
            <div className="space-y-1 text-xs text-slate-600">
              <div><code className="bg-slate-200 px-1 rounded">**bold text**</code> → <strong>bold text</strong></div>
              <div><code className="bg-slate-200 px-1 rounded">_italic text_</code> → <em>italic text</em></div>
              <div><code className="bg-slate-200 px-1 rounded">- list item</code> → • list item</div>
            </div>
          </div>
        )}

        {/* Textarea */}
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your note here..."
            disabled={isSubmitting}
            className={`
              w-full min-h-[100px] p-3 border border-slate-300 rounded-lg
              text-sm text-slate-900 placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:bg-slate-50 disabled:text-slate-500
              resize-none touch-manipulation
              ${error ? 'border-red-500 focus:ring-red-500' : ''}
            `}
            rows={4}
          />
          
          {/* Character Count and Error */}
          <div className="flex items-center justify-between text-xs">
            <div>
              {error && (
                <span className="text-red-600">{error}</span>
              )}
            </div>
            <span className={`
              px-2 py-1 rounded-full text-xs
              ${characterCount > MAX_CHARACTERS 
                ? 'bg-red-100 text-red-700' 
                : 'bg-slate-100 text-slate-600'
              }
            `}>
              {characterCount}/{MAX_CHARACTERS}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Tip: Use formatting buttons above
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800
                         disabled:opacity-50 min-h-[44px] touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium
                         hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50
                         transition-colors min-h-[44px] touch-manipulation
                         flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Add Note
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}