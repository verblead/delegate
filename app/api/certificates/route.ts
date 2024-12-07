import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { certificateGenerator } from '@/lib/certificate-generator'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { courseId } = await request.json()

  try {
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get course details
    const { data: course } = await supabase
      .from('training_courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Generate certificate
    const certificateId = uuidv4()
    const certificateBuffer = await certificateGenerator.generateCertificate({
      userName: user.user_metadata.full_name || user.email,
      courseTitle: course.title,
      completionDate: new Date().toLocaleDateString(),
      certificateId
    })

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('certificates')
      .upload(`${user.id}/${certificateId}.png`, certificateBuffer, {
        contentType: 'image/png'
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('certificates')
      .getPublicUrl(`${user.id}/${certificateId}.png`)

    // Save certificate record
    const { error: dbError } = await supabase
      .from('certificates')
      .insert({
        id: certificateId,
        user_id: user.id,
        course_id: courseId,
        certificate_url: publicUrl
      })

    if (dbError) throw dbError

    return NextResponse.json({ certificateUrl: publicUrl })
  } catch (error) {
    console.error('Certificate generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    )
  }
} 