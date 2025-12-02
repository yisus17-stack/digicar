
import { Card, CardContent } from "@/components/ui/card";

export default function PoliticaDePrivacidadPage() {
    return (
        <>
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                    Política de Privacidad
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Última actualización: 1 de Agosto de 2024
                </p>
            </div>
            <Card className="max-w-4xl mx-auto shadow-lg">
                <CardContent className="py-8 prose prose-lg dark:prose-invert max-w-none">
                    <p>En DigiCar, accesible desde digicar.com, una de nuestras principales prioridades es la privacidad de nuestros visitantes. Este documento de Política de Privacidad contiene tipos de información que se recopilan y registran por DigiCar y cómo la usamos.</p>

                    <h2>1. Consentimiento</h2>
                    <p>Al utilizar nuestro sitio web, usted consiente nuestra Política de Privacidad y acepta sus términos.</p>

                    <h2>2. Información que recopilamos</h2>
                    <p>La información personal que se le solicita que proporcione, y las razones por las que se le solicita que la proporcione, se le aclararán en el momento en que le solicitemos que proporcione su información personal.</p>
                    <ul>
                        <li>Si se comunica con nosotros directamente, podemos recibir información adicional sobre usted, como su nombre, dirección de correo electrónico, número de teléfono, el contenido del mensaje y/o los archivos adjuntos que pueda enviarnos, y cualquier otra información que elija proporcionar.</li>
                        <li>Cuando se registra para una cuenta, podemos solicitar su información de contacto, incluidos elementos como nombre, nombre de la empresa, dirección, dirección de correo electrónico y número de teléfono.</li>
                    </ul>

                    <h2>3. Cómo usamos su información</h2>
                    <p>Utilizamos la información que recopilamos de varias maneras, que incluyen:</p>
                    <ul>
                        <li>Proporcionar, operar y mantener nuestro sitio web.</li>
                        <li>Mejorar, personalizar y expandir nuestro sitio web.</li>
                        <li>Comprender y analizar cómo utiliza nuestro sitio web.</li>
                        <li>Desarrollar nuevos productos, servicios, características y funcionalidades.</li>
                        <li>Comunicarnos con usted, ya sea directamente o a través de uno de nuestros socios, incluido el servicio al cliente, para proporcionarle actualizaciones y otra información relacionada con el sitio web, y con fines de marketing y promoción.</li>
                        <li>Enviarle correos electrónicos.</li>
                        <li>Encontrar y prevenir fraudes.</li>
                    </ul>

                    <h2>4. Archivos de Registro</h2>
                    <p>DigiCar sigue un procedimiento estándar de uso de archivos de registro. Estos archivos registran a los visitantes cuando visitan los sitios web. Todas las empresas de alojamiento hacen esto y es parte del análisis de los servicios de alojamiento. La información recopilada por los archivos de registro incluye direcciones de protocolo de Internet (IP), tipo de navegador, proveedor de servicios de Internet (ISP), marca de fecha y hora, páginas de referencia/salida y, posiblemente, el número de clics. Estos no están vinculados a ninguna información que sea personalmente identificable. El propósito de la información es analizar tendencias, administrar el sitio, rastrear el movimiento de los usuarios en el sitio web y recopilar información demográfica.</p>
                </CardContent>
            </Card>
        </>
    );
}
