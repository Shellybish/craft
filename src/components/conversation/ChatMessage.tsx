import React from 'react'
import { cn } from '@/lib/utils'
import { Message } from './ChatInterface'

interface ChatMessageProps {
  message: Message
  className?: string
}

export function ChatMessage({ message, className }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div className={cn('flex w-full', className)}>
      <div className={cn(
        'max-w-[85%] space-y-2',
        isUser && 'ml-auto',
        isAssistant && 'mr-auto'
      )}>
        {/* User message with subtle bubble */}
        {isUser && (
          <div className="bg-muted/30 rounded-2xl px-4 py-3 border border-border/30">
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        )}

        {/* AI message as plain text */}
        {isAssistant && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground/60 font-medium">
              Assistant
            </div>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className={cn(
          'text-xs text-muted-foreground',
          isUser ? 'text-right' : 'text-left'
        )}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  )
} 