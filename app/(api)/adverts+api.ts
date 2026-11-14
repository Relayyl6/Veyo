import { dbContent } from '@/lib/db';

export async function GET() {
  try {
    const adverts = await dbContent.getAdverts();
    return Response.json({ data: adverts }, { status: 200 });
  } catch (error: any) {
    console.error('[API /adverts GET] Error:', error);
    return Response.json({ error: error.message || error }, { status: 500 });
  }
}
