"use client"

export default function ErrorPage({ message }: { message: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Error</h1>
      <p className="text-gray-500">{message}</p>
    </div>
  )
}
