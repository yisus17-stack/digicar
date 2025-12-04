
// This is a placeholder file to ensure the `api` directory is created.
// You can delete this file once you have other files in this directory.
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ message: 'Hello from the API!' });
}
