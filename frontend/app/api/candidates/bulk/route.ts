import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/mock/store';
import type { CandidateStatus } from '@/types';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, status }: { ids: string[]; status: CandidateStatus } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid candidate IDs' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const updated = mockStore.bulkUpdateCandidates(ids, status);

    return NextResponse.json({ success: true, data: { updated } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update candidates' },
      { status: 500 }
    );
  }
}