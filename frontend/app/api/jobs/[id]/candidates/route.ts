import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock/store';

// GET /api/jobs/[id]/candidates - Get candidates for a specific job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidates = mockStore.getCandidatesByJobId(params.id);

    // Transform candidates to row format for the table
    const candidateRows = candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      stage: candidate.status,
      score: candidate.scores?.overall,
      submittedAt: candidate.submittedAt?.toISOString(),
      updatedAt: candidate.lastActivityAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: candidateRows });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}