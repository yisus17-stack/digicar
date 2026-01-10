
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const technologies = {
    frontend: {
      framework: "Next.js (con React)",
      language: "TypeScript",
      styling: "Tailwind CSS",
      components: "ShadCN UI",
      icons: "Lucide React",
      animations: "Framer Motion"
    },
    backend_services: {
      database: "Firebase Firestore",
      authentication: "Firebase Authentication",
      storage: "Supabase Storage"
    },
    server_environment: "Next.js (API Routes / Server Components)"
  };

  return NextResponse.json(technologies);
}
