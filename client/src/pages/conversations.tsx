import { useState } from "react";
import { Layout } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Send, 
  Copy, 
  Check,
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageSquare,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Monitor,
  MessageCircle,
  History,
  PanelRightOpen,
  PanelRightClose
} from "lucide-react";
import type { Conversation, Message } from "@shared/schema";

const mockConversations: (Conversation & { unreadCount: number; lastMessage: string })[] = [
  {
    id: "1",
    protocol: "ATD-2024-001234",
    clientId: "c1",
    clientName: "MARIA SILVA",
    clientEmail: "maria.silva@email.com",
    clientPhone: "+55 11 99999-1234",
    attendantId: "a1",
    channel: "whatsapp",
    status: "open",
    priority: "high",
    subject: "Problema com pedido",
    latitude: "-23.5505",
    longitude: "-46.6333",
    city: "Sao Paulo",
    state: "SP",
    country: "Brasil",
    lastMessageAt: new Date(),
    closedAt: null,
    createdAt: new Date(),
    unreadCount: 3,
    lastMessage: "Ola, preciso de ajuda com meu pedido #12345",
  },
  {
    id: "2",
    protocol: "ATD-2024-001235",
    clientId: "c2",
    clientName: "JOAO SANTOS",
    clientEmail: "joao.santos@email.com",
    clientPhone: "+55 21 98888-5678",
    attendantId: "a1",
    channel: "web",
    status: "pending",
    priority: "normal",
    subject: "Duvida sobre produto",
    latitude: "-22.9068",
    longitude: "-43.1729",
    city: "Rio de Janeiro",
    state: "RJ",
    country: "Brasil",
    lastMessageAt: new Date(Date.now() - 3600000),
    closedAt: null,
    createdAt: new Date(Date.now() - 86400000),
    unreadCount: 0,
    lastMessage: "Qual o prazo de entrega para minha regiao?",
  },
  {
    id: "3",
    protocol: "ATD-2024-001236",
    clientId: "c3",
    clientName: "ANA OLIVEIRA",
    clientEmail: "ana.oliveira@email.com",
    clientPhone: "+55 31 97777-9012",
    attendantId: null,
    channel: "telegram",
    status: "open",
    priority: "urgent",
    subject: "Reclamacao urgente",
    latitude: "-19.9167",
    longitude: "-43.9345",
    city: "Belo Horizonte",
    state: "MG",
    country: "Brasil",
    lastMessageAt: new Date(Date.now() - 1800000),
    closedAt: null,
    createdAt: new Date(Date.now() - 172800000),
    unreadCount: 5,
    lastMessage: "Preciso resolver isso urgentemente!",
  },
];

const mockMessages: Message[] = [
  {
    id: "m1",
    conversationId: "1",
    senderId: "c1",
    senderType: "client",
    senderName: "Maria Silva",
    content: "Ola, preciso de ajuda com meu pedido #12345",
    contentType: "text",
    fileUrl: null,
    isRead: true,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "m2",
    conversationId: "1",
    senderId: "a1",
    senderType: "attendant",
    senderName: "Suporte",
    content: "Ola Maria! Claro, vou verificar o status do seu pedido. Um momento por favor.",
    contentType: "text",
    fileUrl: null,
    isRead: true,
    createdAt: new Date(Date.now() - 3500000),
  },
  {
    id: "m3",
    conversationId: "1",
    senderId: "a1",
    senderType: "attendant",
    senderName: "Suporte",
    content: "Verifiquei aqui e seu pedido esta em transito. Deve chegar em ate 2 dias uteis.",
    contentType: "text",
    fileUrl: null,
    isRead: true,
    createdAt: new Date(Date.now() - 3400000),
  },
  {
    id: "m4",
    conversationId: "1",
    senderId: "c1",
    senderType: "client",
    senderName: "Maria Silva",
    content: "Obrigada! Mas nao recebi o codigo de rastreamento ainda.",
    contentType: "text",
    fileUrl: null,
    isRead: false,
    createdAt: new Date(Date.now() - 1800000),
  },
];

const mockPreviousConversations = [
  { id: "prev1", protocol: "ATD-2024-000987", date: "15/10/2024", status: "closed" },
  { id: "prev2", protocol: "ATD-2024-000654", date: "02/09/2024", status: "closed" },
];

const channelIcons: Record<string, typeof MessageSquare> = {
  whatsapp: MessageCircle,
  web: Monitor,
  telegram: Smartphone,
  email: Mail,
};

const channelLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  web: "Web Chat",
  telegram: "Telegram",
  email: "E-mail",
};

const statusColors: Record<string, string> = {
  open: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const priorityColors: Record<string, string> = {
  low: "bg-blue-500/20 text-blue-400",
  normal: "bg-gray-500/20 text-gray-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState<typeof mockConversations[0] | null>(mockConversations[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [copiedProtocol, setCopiedProtocol] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const { toast } = useToast();

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.protocol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyProtocol = () => {
    if (selectedConversation) {
      navigator.clipboard.writeText(selectedConversation.protocol);
      setCopiedProtocol(true);
      toast({
        title: "Protocolo copiado",
        description: selectedConversation.protocol,
      });
      setTimeout(() => setCopiedProtocol(false), 2000);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  };

  const ChannelIcon = selectedConversation ? channelIcons[selectedConversation.channel] || MessageSquare : MessageSquare;

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Left Sidebar - Conversations List */}
        <div className="w-80 flex flex-col bg-card/30 rounded-xl border border-border/40 overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <h2 className="text-lg font-semibold mb-3">Conversas</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/50"
                data-testid="input-search-conversations"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all hover-elevate",
                    selectedConversation?.id === conversation.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-secondary/50"
                  )}
                  data-testid={`conversation-item-${conversation.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border border-border/50">
                      <AvatarFallback className="bg-secondary text-xs">
                        {conversation.clientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">
                          {conversation.clientName}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(conversation.lastMessageAt!)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={cn("text-xs", statusColors[conversation.status])}>
                          {conversation.status === "open" ? "Aberto" : conversation.status === "pending" ? "Pendente" : "Fechado"}
                        </Badge>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs h-5 min-w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center - Chat Area */}
        <div className="flex-1 flex flex-col bg-card/30 rounded-xl border border-border/40 overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border/50">
                    <AvatarFallback className="bg-secondary">
                      {selectedConversation.clientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.clientName}</h3>
                    <p className="text-xs text-muted-foreground">{selectedConversation.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(priorityColors[selectedConversation.priority])}>
                    {selectedConversation.priority === "urgent" ? "Urgente" : 
                     selectedConversation.priority === "high" ? "Alta" : 
                     selectedConversation.priority === "low" ? "Baixa" : "Normal"}
                  </Badge>
                  <Badge variant="outline" className={cn(statusColors[selectedConversation.status])}>
                    {selectedConversation.status === "open" ? "Aberto" : 
                     selectedConversation.status === "pending" ? "Pendente" : "Fechado"}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                    data-testid="button-toggle-details"
                  >
                    {isRightSidebarOpen ? (
                      <PanelRightClose className="h-4 w-4" />
                    ) : (
                      <PanelRightOpen className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4" data-testid="messages-area">
                <div className="space-y-4">
                  {mockMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.senderType === "attendant" ? "justify-end" : "justify-start"
                      )}
                      data-testid={`message-${message.id}`}
                    >
                      {message.senderType === "client" && (
                        <Avatar className="h-8 w-8 border border-border/50">
                          <AvatarFallback className="bg-secondary text-xs">
                            {message.senderName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-xl px-4 py-2.5",
                          message.senderType === "attendant"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-secondary/70 rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm" data-testid={`text-message-content-${message.id}`}>{message.content}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          message.senderType === "attendant" ? "text-primary-foreground/70" : "text-muted-foreground"
                        )} data-testid={`text-message-time-${message.id}`}>
                          {formatTime(message.createdAt!)}
                        </p>
                      </div>
                      {message.senderType === "attendant" && (
                        <Avatar className="h-8 w-8 border border-border/50">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            SP
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border/40">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-secondary/50 border-border/50"
                    data-testid="input-message"
                  />
                  <Button size="icon" className="bg-primary" data-testid="button-send-message">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para visualizar</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Conversation Info */}
        {isRightSidebarOpen && (
          <div className="w-80 flex flex-col bg-card/30 rounded-xl border border-border/40 overflow-hidden">
            {selectedConversation ? (
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                {/* Protocol Section */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Protocolo
                  </h4>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <code className="flex-1 text-sm font-mono text-foreground" data-testid="text-protocol-value">
                      {selectedConversation.protocol}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copyProtocol}
                      className="h-8 w-8"
                      data-testid="button-copy-protocol"
                    >
                      {copiedProtocol ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator className="bg-border/40" />

                {/* Channel Section */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Canal de Atendimento
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg" data-testid="info-channel">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ChannelIcon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium" data-testid="text-channel-label">
                      {channelLabels[selectedConversation.channel] || selectedConversation.channel}
                    </span>
                  </div>
                </div>

                <Separator className="bg-border/40" />

                {/* Geolocation Section */}
                <div data-testid="section-geolocation">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Geolocalizacao
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium" data-testid="text-location-city">
                          {selectedConversation.city}, {selectedConversation.state}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid="text-location-country">
                          {selectedConversation.country}
                        </p>
                      </div>
                    </div>
                    {selectedConversation.latitude && selectedConversation.longitude && (
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs font-mono text-muted-foreground" data-testid="text-coordinates">
                          {selectedConversation.latitude}, {selectedConversation.longitude}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-border/40" />

                {/* Attendant Section */}
                <div data-testid="section-attendant">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Atendente
                  </h4>
                  {selectedConversation.attendantId ? (
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg" data-testid="info-attendant">
                      <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          SP
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium" data-testid="text-attendant-name">Suporte Nexus</p>
                        <p className="text-xs text-muted-foreground" data-testid="text-attendant-status">Atendente Online</p>
                      </div>
                      <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" data-testid="status-attendant-online"></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg text-muted-foreground" data-testid="info-attendant-empty">
                      <User className="h-5 w-5" />
                      <span className="text-sm">Nao atribuido</span>
                    </div>
                  )}
                </div>

                <Separator className="bg-border/40" />

                {/* Client Contact Info */}
                <div data-testid="section-client-contact">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Contato do Cliente
                  </h4>
                  <div className="space-y-2">
                    {selectedConversation.clientEmail && (
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm" data-testid="text-client-email">{selectedConversation.clientEmail}</span>
                      </div>
                    )}
                    {selectedConversation.clientPhone && (
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm" data-testid="text-client-phone">{selectedConversation.clientPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-border/40" />

                {/* Previous Conversations */}
                <div data-testid="section-previous-conversations">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Conversas Anteriores
                  </h4>
                  {mockPreviousConversations.length > 0 ? (
                    <div className="space-y-2">
                      {mockPreviousConversations.map((prev) => (
                        <div
                          key={prev.id}
                          className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg cursor-pointer hover-elevate"
                          data-testid={`previous-conversation-${prev.id}`}
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-mono" data-testid={`text-previous-protocol-${prev.id}`}>{prev.protocol}</p>
                            <p className="text-xs text-muted-foreground" data-testid={`text-previous-date-${prev.id}`}>{prev.date}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-secondary/50 rounded-lg text-center" data-testid="empty-previous-conversations">
                      <p className="text-sm text-muted-foreground">Nenhuma conversa anterior</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                <p className="text-sm text-center">Selecione uma conversa para ver os detalhes</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
