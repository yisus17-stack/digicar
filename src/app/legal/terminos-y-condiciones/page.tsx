
import { Card, CardContent } from "@/components/ui/card";

export default function TerminosYCondicionesPage() {
  return (
    <>
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                Términos y Condiciones
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Última actualización: 1 de Agosto de 2024
            </p>
        </div>
        <Card className="max-w-4xl mx-auto shadow-lg">
            <CardContent className="py-8 prose prose-lg dark:prose-invert max-w-none">
                <p>Bienvenido a DigiCar. Estos términos y condiciones describen las reglas y regulaciones para el uso del sitio web de DigiCar, ubicado en digicar.com.</p>
                <p>Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones. No continúes usando DigiCar si no estás de acuerdo con todos los términos y condiciones establecidos en esta página.</p>
                
                <h2>1. Licencia</h2>
                <p>A menos que se indique lo contrario, DigiCar y/o sus licenciantes poseen los derechos de propiedad intelectual de todo el material en DigiCar. Todos los derechos de propiedad intelectual están reservados. Puedes acceder a esto desde DigiCar para tu uso personal sujeto a las restricciones establecidas en estos términos y condiciones.</p>
                <p>No debes:</p>
                <ul>
                    <li>Volver a publicar material de DigiCar</li>
                    <li>Vender, alquilar o sublicenciar material de DigiCar</li>
                    <li>Reproducir, duplicar o copiar material de DigiCar</li>
                    <li>Redistribuir contenido de DigiCar</li>
                </ul>
                
                <h2>2. Cuentas de usuario</h2>
                <p>Si creas una cuenta en nuestro sitio web, eres responsable de mantener la seguridad de tu cuenta y eres totalmente responsable de todas las actividades que ocurran bajo la cuenta y cualquier otra acción tomada en conexión con ella. Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta o cualquier otra violación de seguridad.</p>

                <h2>3. Contenido del usuario</h2>
                <p>En estos Términos y Condiciones, "tu contenido de usuario" significará cualquier material de audio, video, texto, imágenes u otro material que elijas mostrar en este Sitio Web. Al mostrar tu contenido de usuario, otorgas a DigiCar una licencia no exclusiva, mundial, irrevocable y sublicenciable para usarlo, reproducirlo, adaptarlo, publicarlo, traducirlo y distribuirlo en cualquier medio.</p>

                <h2>4. Limitación de responsabilidad</h2>
                <p>En ningún caso DigiCar, ni ninguno de sus funcionarios, directores y empleados, serán responsables de nada que surja de o esté relacionado de alguna manera con tu uso de este sitio web, ya sea que dicha responsabilidad esté bajo contrato. DigiCar, incluidos sus funcionarios, directores y empleados, no serán responsables de ninguna responsabilidad indirecta, consecuente o especial que surja de o esté relacionada de alguna manera con tu uso de este sitio web.</p>
            </CardContent>
        </Card>
    </>
  );
}
