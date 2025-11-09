import { NextRequest, NextResponse } from 'next/server';
import { backendClient } from '@/lib/api/backend-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await backendClient.getCandidate(id);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error?.message || 'Candidate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidate' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, tags } = body;

    if (status || notes !== undefined || tags !== undefined) {
      const response = await backendClient.updateCandidateStatus(id, status, notes, tags);

      if (!response.success) {
        return NextResponse.json(
          { success: false, error: response.error?.message || 'Candidate not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: response.data });
    }

    return NextResponse.json(
      { success: false, error: 'No valid updates provided' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update candidate' },
      { status: 500 }
    );
  }
}