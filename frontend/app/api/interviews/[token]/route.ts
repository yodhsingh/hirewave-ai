import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock/store';

// GET /api/interviews/[token] - Get interview questions for a candidate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invite = mockStore.getInviteByToken(token);

    if (!invite) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invite token' },
        { status: 404 }
      );
    }

    const job = mockStore.getJobById(invite.jobId);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Return questions and settings for the interview
    return NextResponse.json({
      success: true,
      data: {
        questions: job.questions,
        settings: {
          allowRetakes: true,
          maxRetakes: 1,
          showTimer: true,
          allowPause: false,
          autoSave: true,
          autoSaveInterval: 30,
          practiceQuestion: true,
          requireConsent: true,
          consentText: 'By proceeding, you consent to recording your interview responses.',
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch interview data' },
      { status: 500 }
    );
  }
}