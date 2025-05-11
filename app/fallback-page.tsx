export default function FallbackPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Aira AI</h1>
      <p className="text-center mb-8">
        Welcome to Aira AI. This is a fallback page that appears if there are any issues with the main interface.
      </p>
      <div className="flex gap-4">
        <a href="/debug" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Debug Page
        </a>
        <a href="/test-v0" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
          Test Interface
        </a>
      </div>
    </div>
  )
}
