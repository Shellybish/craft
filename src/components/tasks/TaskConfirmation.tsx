'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Check, 
  X, 
  Edit3, 
  Clock, 
  User, 
  Calendar, 
  Tag,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { ExtractedTask, TaskParseResult } from '@/lib/ai/types'

interface TaskConfirmationProps {
  parseResult: TaskParseResult
  onApprove: (tasks: ExtractedTask[]) => void
  onReject: () => void
  className?: string
}

interface EditableTask extends ExtractedTask {
  isEditing?: boolean
}

export function TaskConfirmation({ 
  parseResult, 
  onApprove, 
  onReject, 
  className 
}: TaskConfirmationProps) {
  const [tasks, setTasks] = useState<EditableTask[]>(parseResult.tasks)
  const [allApproved, setAllApproved] = useState(false)

  const handleTaskEdit = (index: number, field: keyof ExtractedTask, value: any) => {
    setTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    ))
  }

  const toggleTaskEdit = (index: number) => {
    setTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, isEditing: !task.isEditing } : task
    ))
  }

  const handleApproveAll = () => {
    // Remove editing flags before approving
    const cleanTasks = tasks.map(({ isEditing, ...task }) => task)
    setAllApproved(true)
    setTimeout(() => onApprove(cleanTasks), 500) // Small delay for animation
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return null
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (tasks.length === 0) {
    return (
      <Card className={cn('border border-border/50', className)}>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            No tasks were identified in your message.
          </div>
          {parseResult.suggestions.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              <strong>Suggestions:</strong>
              <ul className="mt-2 space-y-1">
                {parseResult.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-left">• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card className="border border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {tasks.length} Task{tasks.length !== 1 ? 's' : ''} Found
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {Math.round(parseResult.confidence * 100)}% confident
            </Badge>
          </div>
          {parseResult.confidence < 0.7 && (
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              Please review these tasks carefully - some details may need adjustment
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Task Cards */}
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <Card 
            key={index} 
            className={cn(
              'border border-border/50 transition-all duration-200',
              task.isEditing && 'ring-2 ring-blue-200 border-blue-300',
              allApproved && 'opacity-50'
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {task.isEditing ? (
                    <Input
                      value={task.title}
                      onChange={(e) => handleTaskEdit(index, 'title', e.target.value)}
                      className="text-base font-medium"
                      placeholder="Task title"
                    />
                  ) : (
                    <CardTitle className="text-base leading-6">{task.title}</CardTitle>
                  )}
                  
                  {task.description && (
                    <div className="mt-2">
                      {task.isEditing ? (
                        <Input
                          value={task.description}
                          onChange={(e) => handleTaskEdit(index, 'description', e.target.value)}
                          className="text-sm"
                          placeholder="Task description"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTaskEdit(index)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  disabled={allApproved}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-3 text-sm">
                {/* Priority */}
                <div className="flex items-center gap-1.5">
                  <Badge className={cn('text-xs', getPriorityColor(task.priority))}>
                    {task.priority}
                  </Badge>
                </div>

                {/* Estimated Hours */}
                {task.estimatedHours && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {task.isEditing ? (
                      <Input
                        type="number"
                        value={task.estimatedHours}
                        onChange={(e) => handleTaskEdit(index, 'estimatedHours', parseFloat(e.target.value))}
                        className="w-16 h-6 text-xs"
                        step="0.5"
                        min="0.5"
                        max="40"
                      />
                    ) : (
                      <span>{task.estimatedHours}h</span>
                    )}
                  </div>
                )}

                {/* Due Date */}
                {task.dueDate && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}

                {/* Assignee */}
                {task.assigneeId && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{task.assigneeId}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence Indicator */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${task.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(task.confidence * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Suggestions */}
      {parseResult.suggestions.length > 0 && (
        <Card className="border border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-800">Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1">
              {parseResult.suggestions.map((suggestion, i) => (
                <li key={i} className="text-sm text-blue-700">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onReject}
          disabled={allApproved}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          onClick={handleApproveAll}
          disabled={allApproved}
          className={cn(
            'gap-2 transition-all duration-300',
            allApproved && 'bg-green-600 hover:bg-green-600'
          )}
        >
          <Check className="h-4 w-4" />
          {allApproved ? 'Creating Tasks...' : `Approve ${tasks.length} Task${tasks.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  )
} 