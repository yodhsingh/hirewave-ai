import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock/store';

// POST /api/jobs/[id]/invites - Create invites for a job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email list' },
        { status: 400 }
      );
    }

    const result = mockStore.createInvites(id, emails);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create invites' },
      { status: 500 }
    );
  }
}