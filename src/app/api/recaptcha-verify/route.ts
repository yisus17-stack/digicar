import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not set');
      return NextResponse.json({ success: false, message: 'El servidor no está configurado para reCAPTCHA.' }, { status: 500 });
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const response = await fetch(verificationUrl, {
      method: 'POST',
    });

    const data = await response.json();

    // La verificación es exitosa si `data.success` es verdadero y el `score` es superior a un umbral (ej: 0.5)
    if (data.success && data.score >= 0.5) {
      return NextResponse.json({ success: true });
    } else {
      console.warn('Falló la verificación de reCAPTCHA:', data['error-codes']);
      return NextResponse.json({ success: false, message: 'Falló la verificación de reCAPTCHA.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en la API de verificación de reCAPTCHA:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor durante la verificación de reCAPTCHA.' }, { status: 500 });
  }
}
