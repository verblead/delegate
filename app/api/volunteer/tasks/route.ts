import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create volunteer tasks' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, points, due_date } = body;

    const { data: task, error } = await supabase
      .from('volunteer_tasks')
      .insert({
        title,
        description,
        points,
        due_date,
        created_by: session.user.id,
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating volunteer task:', error);
    return NextResponse.json(
      { error: 'Failed to create volunteer task' },
      { status: 500 }
    );
  }
}