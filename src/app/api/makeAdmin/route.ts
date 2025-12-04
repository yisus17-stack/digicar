
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  const body = await request.json();
  const { uid } = body;

  if (!uid) {
    return NextResponse.json({ error: 'Falta el UID' }, { status: 400 });
  }

  // En un entorno de producción, DEBES proteger esta ruta.
  // Por ejemplo, verificando si el usuario que hace la solicitud ya es admin.
  // const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
  // if (!idToken) {
  //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  // }
  // try {
  //   const decodedToken = await admin.auth().verifyIdToken(idToken);
  //   if (!decodedToken.admin) {
  //     return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 });
  //   }
  // } catch (error) {
  //   return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  // }
  
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    return NextResponse.json({ message: `Usuario ${uid} ahora es admin` });
  } catch (error) {
    console.error("Error asignando admin:", error);
    const errorMessage = error instanceof Error ? error.message : "No se pudo asignar admin";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
