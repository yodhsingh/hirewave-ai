import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock/store';

// GET /api/candidates/[id] - Get a specific candidate
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidate = mockStore.getCandidateById(params.id);

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Get the job details for this candidate
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

// PATCH /api/candidates/[id] - Update a candidate
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (status) {
      const updatedCandidate = mockStore.updateCandidateStatus(params.id, status);

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