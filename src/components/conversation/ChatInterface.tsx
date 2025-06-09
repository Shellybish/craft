'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Plus } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { TaskConfirmation } from '@/components/tasks/TaskConfirmation'
import { TaskParseResult, ExtractedTask } from '@/lib/ai/types'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  taskParseResult?: TaskParseResult
}

interface ChatInterfaceProps {
  className?: string
  onNewChat?: () => void
}

export function ChatInterface({ className, onNewChat }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showingTaskConfirmation, setShowingTaskConfirmation] = useState<string | null>(null)
  // Simple client-side task parser function
  const parseTasksFromMessage = (message: string): TaskParseResult => {
    console.log('🏗️ CLIENT: Parsing tasks from message:', message);
    
    const lowerMessage = message.toLowerCase();
    const tasks: ExtractedTask[] = [];
    
    // Enhanced task detection patterns
    const taskIndicators = [
      'need to', 'should', 'have to', 'must', 'create', 'build', 'design', 
      'update', 'fix', 'implement', 'develop', 'review', 'complete', 'finish',
      'prepare', 'setup', 'configure', 'test', 'deploy', 'write', 'draft'
    ];

    const hasTaskIndicator = taskIndicators.some(indicator => lowerMessage.includes(indicator));
    console.log('🔍 CLIENT: Has task indicator:', hasTaskIndicator);

    if (hasTaskIndicator) {
      // Split message into multiple tasks if "and" is present
      const segments = message.split(/\s+and\s+/i);
      console.log('🔍 CLIENT: Message segments:', segments);
      
      segments.forEach((segment) => {
        if (segment.trim()) {
          // Extract task title (first meaningful part)
          const title = segment.trim().replace(/^(I |we |you |they )(need to |should |have to |must )/i, '').trim();
          const cleanTitle = title.charAt(0).toUpperCase() + title.slice(1);
          
          tasks.push({
            title: cleanTitle || 'New task',
            description: `Task extracted from: "${segment.substring(0, 50)}..."`,
            priority: lowerMessage.includes('urgent') || lowerMessage.includes('asap') ? 'urgent' : 
                     lowerMessage.includes('deadline') || lowerMessage.includes('important') ? 'high' : 'medium',
            tags: ['created-from-chat'],
            estimatedHours: 2,
            confidence: 0.85
          });
        }
      });
    }

    const result: TaskParseResult = {
      tasks,
      confidence: tasks.length > 0 ? 0.8 : 0.2,
      suggestions: tasks.length > 0 ? 
        [`Found ${tasks.length} potential task${tasks.length > 1 ? 's' : ''}`] : 
        ["I didn't detect specific tasks. Try phrases like 'I need to...' or 'We should...'"]
    };
    
    console.log('📊 CLIENT: Parse result:', result);
    return result;
  }
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // First, try to parse tasks from the message
      console.log('🔍 CLIENT: Parsing message for tasks:', userMessage.content);
      
      const taskParseResult = parseTasksFromMessage(userMessage.content);

      // If tasks were found with sufficient confidence, show task confirmation
      const hasTask = taskParseResult.tasks.length > 0;
      const hasConfidence = taskParseResult.confidence > 0.3;
      console.log('🔍 CLIENT: Task check:', { hasTask, hasConfidence, taskCount: taskParseResult.tasks.length, confidence: taskParseResult.confidence });
      
      if (hasTask && hasConfidence) {
        console.log('✅ CLIENT: Showing task confirmation UI');
        const taskMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `I found ${taskParseResult.tasks.length} task${taskParseResult.tasks.length !== 1 ? 's' : ''} in your message. Please review and confirm:`,
          role: 'assistant',
          timestamp: new Date(),
          taskParseResult
        }

        console.log('📝 CLIENT: Task message created:', taskMessage);
        setMessages(prev => [...prev, taskMessage])
        setShowingTaskConfirmation(taskMessage.id)
        console.log('🎯 CLIENT: Set showingTaskConfirmation to:', taskMessage.id);
        setIsTyping(false)
        return // This should prevent the API call
      }
      
      console.log('ℹ️ CLIENT: No tasks found or low confidence, proceeding with normal chat');

      // If no tasks found or low confidence, proceed with normal conversation
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: `conv_${Date.now()}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to process message:', error)
      
      // Fallback error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleTaskApproval = async (approvedTasks: ExtractedTask[]) => {
    setShowingTaskConfirmation(null)
    
    // Here we would normally save the tasks to the database
    // For now, just show a success message
    const successMessage: Message = {
      id: Date.now().toString(),
      content: `Great! I've created ${approvedTasks.length} task${approvedTasks.length !== 1 ? 's' : ''} for you:\n\n${approvedTasks.map(task => `• ${task.title}`).join('\n')}\n\nIs there anything else I can help you with?`,
      role: 'assistant',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, successMessage])
  }

  const handleTaskRejection = () => {
    setShowingTaskConfirmation(null)
    
    const rejectionMessage: Message = {
      id: Date.now().toString(),
      content: "No problem! Those tasks have been discarded. Feel free to rephrase or ask me something else.",
      role: 'assistant',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, rejectionMessage])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Chat Header - Simplified based on design */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewChat}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <div className="text-xs text-muted-foreground">
          Today
        </div>
      </div>

      {/* Messages Area */}
                <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3 max-w-lg">
              <div className="text-xl font-normal text-foreground">
                How can I help you today?
              </div>
              <div className="text-sm text-muted-foreground/80">
                I can help you create tasks, manage priorities, generate status updates, and set up projects.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 p-6 max-w-4xl mx-auto">
            {messages.map((message) => {
              const shouldShowConfirmation = message.taskParseResult && showingTaskConfirmation === message.id;
              console.log(`🎨 CLIENT: Rendering message ${message.id}:`, { 
                hasTaskParseResult: !!message.taskParseResult, 
                showingTaskConfirmation, 
                shouldShowConfirmation,
                taskCount: message.taskParseResult?.tasks?.length || 0
              });
              
              return (
                <div key={message.id}>
                  <ChatMessage message={message} />
                  {shouldShowConfirmation && (
                    <div className="mt-4">
                      <TaskConfirmation
                        parseResult={message.taskParseResult!}
                        onApprove={handleTaskApproval}
                        onReject={handleTaskRejection}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 p-6">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="resize-none pr-12 min-h-[48px] bg-background border-border/60 focus:border-border rounded-xl"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground/60 text-center mt-3">
          Press Enter to send
        </div>
      </div>
    </div>
  )
} 