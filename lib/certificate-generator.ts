import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'

export class CertificateGenerator {
  private canvas
  private ctx

  constructor() {
    this.canvas = createCanvas(1920, 1080)
    this.ctx = this.canvas.getContext('2d')
    
    // Register custom font
    registerFont(path.join(process.cwd(), 'public/fonts/certificate-font.ttf'), {
      family: 'CertificateFont'
    })
  }

  async generateCertificate({
    userName,
    courseTitle,
    completionDate,
    certificateId
  }: {
    userName: string
    courseTitle: string
    completionDate: string
    certificateId: string
  }) {
    // Clear canvas
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(0, 0, 1920, 1080)

    // Load and draw background
    const background = await loadImage(
      path.join(process.cwd(), 'public/images/certificate-template.png')
    )
    this.ctx.drawImage(background, 0, 0, 1920, 1080)

    // Configure text styles
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = '#000000'

    // Draw certificate content
    this.ctx.font = '72px CertificateFont'
    this.ctx.fillText('Certificate of Completion', 960, 300)

    this.ctx.font = '48px CertificateFont'
    this.ctx.fillText('This certifies that', 960, 400)

    this.ctx.font = '64px CertificateFont'
    this.ctx.fillText(userName, 960, 500)

    this.ctx.font = '36px CertificateFont'
    this.ctx.fillText('has successfully completed', 960, 580)

    this.ctx.font = '48px CertificateFont'
    this.ctx.fillText(courseTitle, 960, 660)

    this.ctx.font = '24px CertificateFont'
    this.ctx.fillText(`Completed on ${completionDate}`, 960, 740)
    this.ctx.fillText(`Certificate ID: ${certificateId}`, 960, 780)

    // Return as buffer
    return this.canvas.toBuffer('image/png')
  }
}

export const certificateGenerator = new CertificateGenerator()