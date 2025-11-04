import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock/store';
import type { JobCreate } from '@/types';

export async function GET() {
  try {
    const jobs = mockStore.getJobs();
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: JobCreate = await request.json();

    
    if (!body.title || !body.description || !body.questions || body.questions.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid job data. Title, description, and at least 3 questions are required.',
        },
        { status: 400 }
      );
    }

    const newJob = mockStore.createJob(body);
    return NextResponse.json({ success: true, data: newJob }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    );
  }
}