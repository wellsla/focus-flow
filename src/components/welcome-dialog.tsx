"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2 } from "lucide-react";

const WELCOME_SHOWN_KEY = "focus-flow:v1:welcome-shown";

/**
 * Welcome dialog shown to first-time users
 * Explains the app philosophy and key features
 */
export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasShownWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!hasShownWelcome) {
      // Show welcome dialog after a brief delay
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">
              Bem-vindo ao Focus Flow
            </DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-4 pt-4">
            <p>
              Um sistema ADHD-friendly para transição de carreira, construído
              com o princípio de{" "}
              <span className="font-semibold text-foreground">
                ritual &gt; gamificação
              </span>
              .
            </p>

            <div className="space-y-3 py-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">
                    Foco sem distração
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pomodoro, rotinas diárias e modo de foco profundo com Wake
                    Lock API
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">
                    Progresso visível
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sistema de pontos, badges e streaks para motivação
                    sustentável
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Reflexão diária</p>
                  <p className="text-sm text-muted-foreground">
                    Diário de 3 linhas + exportação em PDF para revisão
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Dados privados</p>
                  <p className="text-sm text-muted-foreground">
                    Tudo armazenado localmente no seu navegador. Zero servidores
                    externos.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4 mt-4">
              <p className="text-sm">
                <span className="font-semibold text-foreground">
                  Começamos carregando:
                </span>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                <li>• 20 rotinas padrão organizadas por categoria</li>
                <li>• 6 lembretes ao longo do dia</li>
                <li>• Configurações otimizadas para ADHD</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Você pode personalizar tudo nas páginas de Routines, Reminders e
                Settings.
              </p>
            </div>

            <p className="text-sm italic text-muted-foreground mt-4">
              "Seja gentil consigo mesmo. Progresso de 1% por dia é tudo que
              você precisa."
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleClose} size="lg" className="w-full sm:w-auto">
            Começar Jornada
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
