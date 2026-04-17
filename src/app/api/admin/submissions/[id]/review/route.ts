import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://cre-8-backend.vercel.app/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || 
                  request.cookies.get('token')?.value;
    
    // Forward to backend
    const response = await fetch(`${API_BASE_URL}/admin/submissions/${id}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Submission review proxy error:', error);
    return NextResponse.json(
      { message: 'Failed to review submission' },
      { status: 500 }
    );
  }
}
