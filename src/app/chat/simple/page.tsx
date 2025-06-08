'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Plus, User, Paperclip, Mic, PanelLeft, PenBox } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function SimpleChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand you'd like to create some tasks. Let me help you with that. What specific tasks would you like to add to your project?",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#0f0f10' }}>
      {/* Sidebar */}
      <div 
        className={`w-64 border-r flex flex-col transition-transform duration-400 ease-in-out ${
          sidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`} 
        style={{ backgroundColor: '#1a1a1b', borderColor: '#27272a' }}
      >
        <div className="p-4 border-b" style={{ borderColor: '#27272a' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">C</span>
            </div>
            <h1 className="text-lg font-semibold text-white">Craft</h1>
          </div>
        </div>
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white" style={{ backgroundColor: '#27272a' }}>
              <span>💬</span> Chat
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700">
              <span>✅</span> Tasks
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700">
              <span>📊</span> Projects
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-400 ease-in-out ${
        sidebarVisible ? 'ml-0' : '-ml-64'
      }`}>
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between" style={{ borderColor: '#27272a' }}>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={toggleSidebar}
              className="p-2 text-gray-400 hover:text-white rounded-lg"
            >
              <PanelLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white rounded-lg">
              <PenBox className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#27272a' }}>
              <User className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3 max-w-lg">
                <div className="text-xl text-white">
                  How can I help you today?
                </div>
                <div className="text-sm text-gray-400">
                  I can help you create tasks, manage priorities, generate status updates, and set up projects.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 px-14 py-6 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div key={message.id} className="flex w-full">
                  <div className={`max-w-[85%] space-y-2 ${
                    message.role === 'user' ? 'ml-auto' : 'mr-auto'
                  }`}>
                    {message.role === 'user' ? (
                      <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#141415', border: '1px solid #27272a' }}>
                        <div className="text-sm text-white">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-sm text-white leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex w-full">
                  <div className="max-w-[85%] space-y-2 mr-auto">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                      </div>
                      <span className="text-xs text-gray-400 ml-2">thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-6" style={{ borderColor: '#27272a' }}>
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <div className="flex items-center w-full border rounded-xl" style={{ backgroundColor: '#141415', borderColor: '#27272a' }}>
                <button className="p-3 text-gray-400 hover:text-white">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your projects, create tasks, or get status updates..."
                  className="flex-1 min-h-[48px] px-2 py-3 bg-transparent focus:outline-none focus:ring-0 focus:border-transparent text-sm text-white placeholder-gray-400"
                  style={{ outline: 'none', boxShadow: 'none' }}
                  disabled={isTyping}
                />
                <button className="p-3 text-gray-400 hover:text-white">
                  <Mic className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-3 text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400 text-center mt-3">
            Press Enter to send
          </div>
        </div>
      </div>
    </div>
  )
} 