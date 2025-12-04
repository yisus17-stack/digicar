
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
    // Use the initialized admin SDK to set the custom claim
    await getAuth(admin.app()).setCustomUserClaims(uid, { admin: true });
    return NextResponse.json({ message: `¡Éxito! El usuario ${uid} ahora es administrador. Por favor, cierra sesión y vuelve a iniciarla para aplicar los cambios.` });
  } catch (error) {
    console.error("Error asignando admin:", error);
    const errorMessage = error instanceof Error ? error.message : "No se pudo asignar el rol de administrador. Verifica los registros del servidor.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
