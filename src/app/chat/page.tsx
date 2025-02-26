import { ChatMovie } from '@/components/chat-movie'

export default function ChatPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Chat2Movie</h1>
      <p className="text-center text-gray-600 mb-8">
        Describe the type of movie you're looking for, and I'll help you find it!
      </p>
      <ChatMovie />
    </div>
  )
} 