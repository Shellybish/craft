import { NextRequest, NextResponse } from 'next/server'
import { ConversationEngine } from '@/lib/ai/conversation-engine'
import { TaskParser } from '@/lib/ai/task-parser'
import { ConversationContext, ConversationMessage, AIModelConfig } from '@/lib/ai/types'

// Initialize AI components with mock mode for development
const aiConfig: AIModelConfig = {
  provider: 'claude',
  model: 'claude-sonnet-4',
  maxTokens: 2000,
  temperature: 0.7
}
const conversationEngine = new ConversationEngine(aiConfig, true) // mock mode = true
const taskParser = new TaskParser(true) // mock mode = true

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationId, context } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Create user message
    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: {}
    }

    // Get or create conversation context
    let conversationContext: ConversationContext = context || {
      userId: 'user_1', // TODO: Get from auth
      conversationId: conversationId || `conv_${Date.now()}`,
      messages: [],
      context: {
        createdAt: new Date(),
        lastActivity: new Date()
      }
    }

    // Add user message to context
    conversationContext = await conversationEngine.addMessage(
      conversationContext,
      userMessage
    )

    // Process the message with AI
    const aiResponse = await conversationEngine.generateResponse(
      conversationContext,
      message
    )

    // Check if the message contains task-related content
    let extractedTasks = null
    try {
      const taskAnalysis = await taskParser.parseMessage(message)
      if (taskAnalysis.tasks && taskAnalysis.tasks.length > 0) {
        extractedTasks = taskAnalysis.tasks
      }
    } catch (error) {
      console.warn('Task parsing failed:', error)
      // Continue without task extraction
    }

    // Create AI response message
    const aiMessage: ConversationMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      metadata: {
        extractedTasks,
        processingTime: Date.now() - userMessage.timestamp.getTime()
      }
    }

    // Add AI response to context
    conversationContext = await conversationEngine.addMessage(
      conversationContext,
      aiMessage
    )

    // Return the response
    return NextResponse.json({
      message: aiResponse,
      conversationId: conversationContext.conversationId,
      context: conversationContext,
      extractedTasks
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'Chat API is running',
    timestamp: new Date().toISOString(),
    services: {
      conversationEngine: 'available',
      taskParser: 'available'
    }
  })
} 