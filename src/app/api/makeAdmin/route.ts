
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { uid } = body;

  if (!uid) {
    return NextResponse.json({ error: 'Falta el UID' }, { status: 400 });
  }
  
  try {
    // Check if the user making the request is the super admin
    // In a real app, you'd have more robust checks here
    // For now, we trust the client-side check, but this is where you'd add server-side validation.
    
    await getAuth(admin.app()).setCustomUserClaims(uid, { admin: true });
    return NextResponse.json({ message: `Usuario ${uid} ahora es admin` });
  } catch (error) {
    console.error("Error asignando admin:", error);
    const errorMessage = error instanceof Error ? error.message : "No se pudo asignar admin";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
