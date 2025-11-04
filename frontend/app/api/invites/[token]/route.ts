import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock/store';

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

    // Find the candidate
    const candidates = mockStore.getCandidatesByJobId(invite.jobId);
    const candidate = candidates.find(c => c.email === invite.email);

    return NextResponse.json({
      success: true,
      data: {
        jobId: invite.jobId,
        candidate: candidate ? {
          name: candidate.name,
          email: candidate.email,
        } : {
          name: invite.email.split('@')[0],
          email: invite.email,
        },
        job: {
          title: job.title,
          description: job.description,
          department: job.department,
          location: job.location,
          questionCount: job.questions.length,
          estimatedTime: Math.ceil(job.questions.length * 2.5), // ~2.5 min per question
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invite details' },
      { status: 500 }
    );
  }
}