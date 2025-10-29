import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock/store';

// POST /api/interviews/[token]/submit - Submit interview responses
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json();
    const { responses } = body;

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No responses provided' },
        { status: 400 }
      );
    }

    const invite = mockStore.getInviteByToken(params.token);

    if (!invite) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invite token' },
        { status: 404 }
      );
    }

    // Find the candidate associated with this invite
    const candidates = mockStore.getCandidatesByJobId(invite.jobId);
    const candidate = candidates.find(c => c.email === invite.email);

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Save responses and mark interview as submitted
    responses.forEach((response: any) => {
      mockStore.saveResponse({
        ...response,
        candidateId: candidate.id,
      });
    });

    const success = mockStore.submitInterview(candidate.id);

    if (success) {
      return NextResponse.json({
        success: true,
        data: { message: 'Interview submitted successfully' },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to submit interview' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to submit interview' },
      { status: 500 }
    );
  }
}