import { dbContent } from '@/lib/db';

export async function GET() {
  try {
    const predictions = await dbContent.getAiPredictions();
    return Response.json({ data: predictions }, { status: 200 });
  } catch (error: any) {
    console.error('[API /insights GET] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}
