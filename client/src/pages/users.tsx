import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Grid, 
  List, 
  Filter,
  Upload,
  UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "@/components/ui/password-input";

// Mock data for users
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "client";
  status: "active" | "inactive";
  avatar?: string;
  lastActive: string;
}

const initialUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@nexus.com",
    role: "admin",
    status: "active",
    avatar: "https://github.com/shadcn.png",
    lastActive: "2 min atrás"
  },
  {
    id: "2",
    name: "Maria Costa",
    email: "maria.costa@cliente.com",
    role: "client",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    lastActive: "5 horas atrás"
  },
  {
    id: "3",
    name: "Pedro Santos",
    email: "pedro.santos@cliente.com",
    role: "client",
    status: "inactive",
    lastActive: "2 dias atrás"
  },
  {
    id: "4",
    name: "Ana Oliveira",
    email: "ana.oliveira@nexus.com",
    role: "admin",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    lastActive: "1 hora atrás"
  },
  {
    id: "5",
    name: "Lucas Lima",
    email: "lucas.lima@cliente.com",
    role: "client",
    status: "active",
    lastActive: "30 min atrás"
  }
];

// Validation schema for user form
const userSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "client"]),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal('')),
});

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "client">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Form handling
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "client",
      password: ""
    }
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isDialogOpen) {
      if (editingUser) {
        form.reset({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          password: "" // Don't show password on edit
        });
      } else {
        form.reset({
          name: "",
          email: "",
          role: "client",
          password: ""
        });
      }
    }
  }, [isDialogOpen, editingUser, form]);

  const onSubmit = (data: z.infer<typeof userSchema>) => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
      toast({
        title: "Usuário atualizado",
        description: `O usuário ${data.name} foi atualizado com sucesso.`
      });
    } else {
      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        email: data.email,
        role: data.role,
        status: "active",
        lastActive: "Agora"
      };
      setUsers([...users, newUser]);
      toast({
        title: "Usuário criado",
        description: `O usuário ${data.name} foi criado com sucesso.`
      });
    }
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (userId: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      setUsers(users.filter(u => u.id !== userId));
      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido do sistema."
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  // Mock image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a fake local URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      // In a real app, we would upload this to server/S3
      // For this mock, we just need to update the user avatar if we are editing
      // Or store it temporarily for new user creation (simplified here)
      toast({
        title: "Foto carregada",
        description: "A foto de perfil foi atualizada (simulação)."
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Gerenciar Usuários</h1>
            <p className="text-muted-foreground mt-1">Visualize, crie e gerencie os usuários do sistema.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingUser(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? "Editar Usuário" : "Criar Novo Usuário"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para {editingUser ? "atualizar" : "cadastrar"} o usuário.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative group cursor-pointer">
                    <Avatar className="w-24 h-24 border-4 border-secondary">
                      <AvatarImage src={editingUser?.avatar} />
                      <AvatarFallback className="text-2xl bg-secondary">{editingUser?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <Upload className="w-6 h-6 text-white" />
                      </Label>
                      <Input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" {...form.register("name")} placeholder="Nome completo" />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" {...form.register("email")} placeholder="email@exemplo.com" />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <Select 
                    onValueChange={(val: "admin" | "client") => form.setValue("role", val)} 
                    defaultValue={form.getValues("role")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.role && (
                    <p className="text-xs text-destructive">{form.formState.errors.role.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha {editingUser && "(deixe em branco para manter)"}</Label>
                  <PasswordInput 
                    id="password" 
                    {...form.register("password")} 
                    placeholder={editingUser ? "********" : "Senha segura"} 
                  />
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>
                
                <DialogFooter>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    {editingUser ? "Salvar Alterações" : "Criar Usuário"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg w-fit">
                <Button 
                  variant={viewMode === "table" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => setViewMode("table")}
                >
                  <List className="w-4 h-4 mr-2" /> Lista
                </Button>
                <Button 
                  variant={viewMode === "grid" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4 mr-2" /> Grade
                </Button>
              </div>
              
              <div className="flex items-center gap-2 flex-1 md:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nome ou email..." 
                    className="pl-9 bg-background/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por função</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setRoleFilter("all")}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRoleFilter("admin")}>
                      Administradores
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRoleFilter("client")}>
                      Clientes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "table" ? (
              <div className="rounded-md border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary/30">
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="group hover:bg-secondary/20 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-border/50">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span>{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                              {user.role === "admin" ? "Admin" : "Cliente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-gray-400"}`} />
                              <span className="text-sm capitalize">{user.status === "active" ? "Ativo" : "Inativo"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {user.lastActive}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(user)}>
                                  <Pencil className="w-4 h-4 mr-2" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(user.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredUsers.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground bg-secondary/10 rounded-lg border border-dashed border-border">
                    Nenhum usuário encontrado com os filtros atuais.
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <Card key={user.id} className="overflow-hidden hover:border-primary/50 transition-colors group">
                      <div className="h-24 bg-gradient-to-r from-primary/20 to-purple-600/20 relative">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Pencil className="w-4 h-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(user.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <CardContent className="pt-0 -mt-10 flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-lg mb-3">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-lg leading-none mb-1">{user.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                        
                        <div className="w-full grid grid-cols-2 gap-2 text-sm mb-4">
                          <div className="flex flex-col bg-secondary/30 p-2 rounded-md">
                            <span className="text-xs text-muted-foreground">Função</span>
                            <span className="font-medium capitalize">{user.role === "admin" ? "Admin" : "Cliente"}</span>
                          </div>
                          <div className="flex flex-col bg-secondary/30 p-2 rounded-md">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <span className="font-medium capitalize flex items-center justify-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-gray-400"}`} />
                              {user.status === "active" ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full text-xs h-8" onClick={() => handleEdit(user)}>
                          Gerenciar Perfil
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
