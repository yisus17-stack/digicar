
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background">
        <div className="container mx-auto px-4 py-8 md:py-16 min-h-screen">
            <div className="relative text-center mb-12">
                <div className="absolute top-0 left-0">
                  <Button asChild variant="outline">
                      <Link href="/">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Volver al Inicio
                      </Link>
                  </Button>
                </div>
            </div>
            {children}
        </div>
    </div>
  );
}
