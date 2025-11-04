import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const candidate = mockStore.getCandidateById(id);

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    
    const job = mockStore.getJobById(candidate.jobId);

    const candidateDetail = {
      ...candidate,
      job,
    };

    return NextResponse.json({ success: true, data: candidateDetail });
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
    const { status } = body;

    if (status) {
      const updatedCandidate = mockStore.updateCandidateStatus(id, status);

      if (!updatedCandidate) {
        return NextResponse.json(
          { success: false, error: 'Candidate not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: updatedCandidate });
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