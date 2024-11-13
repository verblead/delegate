'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DocumentViewerProps {
  content: string
  onProgress: (progress: number) => void
  onComplete: () => void
}

export function DocumentViewer({ content, onProgress, onComplete }: DocumentViewerProps) {
  const [scrollProgress, setScrollProgress] = useState(0)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const progress = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100
    setScrollProgress(progress)
    onProgress(progress)
    
    if (progress >= 90) {
      onComplete()
    }
  }

  return (
    <Card className="p-6">
      <div 
        className="prose max-w-none h-[600px] overflow-y-auto"
        onScroll={handleScroll}
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>
    </Card>
  )
} 