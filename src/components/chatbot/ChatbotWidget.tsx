
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, User, Loader, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { responderChat } from '@/ai/flows/chatbot-flow';

export type Mensaje = {
  role: 'user' | 'model';
  content: string;
};

const mensajeInicial: Mensaje[] = [
    {
      role: 'model',
      content: '¡Hola! Soy Digi, tu asistente virtual. ¿Cómo puedo ayudarte a encontrar tu próximo auto?',
    },
];

const sugerencias = [
    "¿Qué autos familiares tienen?",
    "Busco un auto deportivo",
    "Compara el Camry vs el Model 3",
    "Opciones de financiamiento"
];

export default function ChatbotWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajeInicial);
  const [entrada, setEntrada] = useState('');
  const [cargando, iniciarTransicion] = useTransition();
  const finMensajesRef = useRef<HTMLDivElement>(null);

  const alternarChatbot = () => {
    setAbierto(!abierto);
  };
  
  const reiniciarChat = () => {
    setMensajes(mensajeInicial);
  };

  const enviarMensaje = (contenidoMensaje?: string) => {
    const mensajeAEnviar = contenidoMensaje || entrada;
    if (mensajeAEnviar.trim() === '') return;

    const nuevoMensajeUsuario: Mensaje = { role: 'user', content: mensajeAEnviar };
    const nuevoHistorial = [...mensajes, nuevoMensajeUsuario];
    setMensajes(nuevoHistorial);
    setEntrada('');

    iniciarTransicion(async () => {
      try {
        const resultado = await responderChat(nuevoHistorial);
        const nuevoMensajeModelo: Mensaje = { role: 'model', content: resultado.respuesta };
        setMensajes(prev => [...prev, nuevoMensajeModelo]);
      } catch (error) {
        console.error("Error al obtener respuesta del chatbot:", error);
        const mensajeError: Mensaje = { role: 'model', content: 'Lo siento, estoy teniendo problemas para conectarme. Por favor, intenta de nuevo más tarde.' };
        setMensajes(prev => [...prev, mensajeError]);
      }
    });
  };

  useEffect(() => {
    finMensajesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  return (
    <>
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm"
          >
            <Card className="flex h-[70vh] flex-col shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-6 w-6 text-primary" />
                  Asistente DigiCar
                </CardTitle>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={reiniciarChat} className="h-8 w-8">
                      <RefreshCcw className="h-4 w-4" />
                      <span className="sr-only">Reiniciar chat</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={alternarChatbot} className="h-8 w-8">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Cerrar chat</span>
                    </Button>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1">
                <CardContent className="space-y-4">
                  {mensajes.map((mensaje, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${
                        mensaje.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {mensaje.role === 'model' && (
                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                          <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-xs rounded-xl px-4 py-2 ${
                          mensaje.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{mensaje.content}</p>
                      </div>
                       {mensaje.role === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {cargando && (
                      <div className="flex items-start gap-3 justify-start">
                           <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                            </Avatar>
                           <div className="max-w-xs rounded-xl px-4 py-2 bg-muted flex items-center">
                                <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                           </div>
                      </div>
                  )}
                  <div ref={finMensajesRef} />
                </CardContent>
              </ScrollArea>
                {mensajes.length <= 1 && (
                    <div className="px-6 py-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">O prueba una de estas sugerencias:</p>
                        <div className="flex flex-wrap gap-2">
                            {sugerencias.map(sug => (
                                <Button key={sug} variant="outline" size="sm" onClick={() => enviarMensaje(sug)}>
                                    {sug}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
              <CardFooter className="pt-4 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    enviarMensaje();
                  }}
                  className="flex w-full items-center gap-2"
                >
                  <Input
                    value={entrada}
                    onChange={(e) => setEntrada(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    disabled={cargando}
                    autoComplete="off"
                  />
                  <Button type="submit" size="icon" disabled={cargando || entrada.trim() === ''}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={alternarChatbot}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {abierto ? (
            <motion.div key="x" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }}>
              <X className="h-8 w-8" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0 }}>
              <Bot className="h-8 w-8" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </>
  );
}
