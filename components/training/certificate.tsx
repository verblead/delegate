'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Share2 } from 'lucide-react'

interface CertificateProps {
  courseTitle: string
  userName: string
  issueDate: string
  certificateUrl: string
}

export function Certificate({
  courseTitle,
  userName,
  issueDate,
  certificateUrl
}: CertificateProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${courseTitle} Certificate`,
          text: `Check out my certificate for completing ${courseTitle}!`,
          url: certificateUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Certificate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold">{courseTitle}</h3>
          <p className="text-muted-foreground">Awarded to {userName}</p>
          <p className="text-sm text-muted-foreground">
            Issued on {new Date(issueDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.open(certificateUrl, '_blank')}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 