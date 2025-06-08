import { ChatInterface } from '@/components/conversation/ChatInterface'

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <ChatInterface 
        className="flex-1"
        onNewChat={() => {
          console.log('New chat started')
        }}
      />
    </div>
  )
} 