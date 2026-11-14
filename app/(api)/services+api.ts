import { dbContent } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const stateId = url.searchParams.get('stateId') || undefined;
    const services = await dbContent.getServiceOptions(stateId);
    return Response.json({ data: services }, { status: 200 });
  } catch (error: any) {
    console.error('[API /services GET] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}
