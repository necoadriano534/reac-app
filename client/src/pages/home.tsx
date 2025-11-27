import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { AlertCircle, FolderOpen } from "lucide-react";
import { socket } from "@/lib/socket";
import { useEffect } from "react";

export default function Dashboard() {
  useEffect(() => {
    // Example socket usage
    socket.emit("dashboard:view");
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Visão geral do sistema.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-muted-foreground font-mono">Sistema Online</span>
          </div>
        </div>

        <Card className="border-dashed border-2 border-border/60 bg-card/20 min-h-[400px] flex flex-col items-center justify-center text-center p-8 backdrop-blur-sm">
          <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4 animate-pulse">
            <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum conteúdo disponível</h3>
          <p className="text-muted-foreground max-w-md">
            O dashboard está vazio no momento. Aguarde atualizações do sistema ou comece a cadastrar dados para visualizar métricas aqui.
          </p>
        </Card>
      </div>
    </Layout>
  );
}
