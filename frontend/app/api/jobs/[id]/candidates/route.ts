import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const candidates = mockStore.getCandidatesByJobId(id);

    
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