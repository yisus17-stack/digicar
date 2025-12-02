
import { Card, CardContent } from "@/components/ui/card";

export default function LegalLayout({ children, title }: { children: React.ReactNode, title: string, breadcrumbLabel: string }) {
  return (
    <div className="bg-background">
        <div className="container mx-auto px-4 py-8 md:py-16 min-h-screen">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                    {title}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Última actualización: 1 de Agosto de 2024
                </p>
            </div>
            <Card className="max-w-4xl mx-auto shadow-lg">
                <CardContent className="py-8 prose prose-lg dark:prose-invert max-w-none">
                    {children}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
