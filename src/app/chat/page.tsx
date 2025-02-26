import { ChatMovie } from '@/components/chat-movie'

export default function ChatPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Movie Finder AI</h1>
      <p className="text-center text-gray-600 mb-8">
        Tell me what kind of movie you're in the mood for, and I'll help you find the perfect match!
      </p>
      <ChatMovie />
    </div>
  )
} 