
'use client';

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="bg-background">
        <div className="container mx-auto px-4 py-8 md:py-16 min-h-screen">
            <div className="relative text-center mb-12">
                <div className="absolute top-0 left-0">
                  <Button onClick={handleBack} variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver
                  </Button>
                </div>
            </div>
            {children}
        </div>
    </div>
  );
}
