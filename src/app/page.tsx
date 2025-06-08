export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Craft</h1>
        <p className="text-gray-600">Conversational Task Management</p>
        <a 
          href="/chat/simple" 
          className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Start Chat
        </a>
      </div>
    </div>
  )
}
