import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Badge, Input } from "@/components/ui-elements";
import { useListProfiles, useUpdateProfile, getListProfilesQueryKey } from "@/lib/api";
import { Search, Plus, Users, ChevronRight, X, Shield, Mail, Phone, MapPin, Calendar, MoreVertical, UserCheck, UserX, Edit, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Mock roles (manter por enquanto)
const mockRoles = [
  { id: 1, name: "Administrador", description: "Acesso total ao sistema", permissions: ["users", "settings", "reports", "backup"] },
  { id: 2, name: "Gerente", description: "Gerenciar vendas e clientes", permissions: ["vendas", "clientes", "produtos", "reports"] },
  { id: 3, name: "Vendedor", description: "Realizar vendas e cadastrar clientes", permissions: ["vendas", "clientes"] },
];

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { data: users, isLoading } = useListProfiles();
  const updateMutation = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredUsers = (users || []).filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    (user.phone && user.phone.includes(search))
  );

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      // Em um sistema real, aqui faria a chamada à API
      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso.",
      });
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await updateMutation.mutateAsync({ id: user.id, status: newStatus as any });
      toast({
        title: `Status alterado`,
        description: `O usuário ${user.name} agora está ${newStatus === 'active' ? 'ativo' : 'inativo'}.`,
      });
    } catch {
      toast({ title: "Erro ao alterar status", variant: "destructive" });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "Admin", color: "danger" },
      manager: { label: "Gerente", color: "warning" },
      user: { label: "Vendedor", color: "success" },
    };
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    return <Badge variant={config.color as any}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'active' ? 'success' : 'outline'}>
        {status === 'active' ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
            <p className="text-muted-foreground">Gerencie os usuários e permissões do sistema</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Novo Usuário
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar usuários..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold text-foreground">{users?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold text-success">
                  {users?.filter((u: any) => u.status === 'active').length || 0}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-success" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold text-danger">
                  {users?.filter((u: any) => u.role === 'admin').length || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-danger" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-warning">
                  {users?.filter((u: any) => u.status === 'inactive').length || 0}
                </p>
              </div>
              <X className="h-8 w-8 text-warning" />
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {user.phone}
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === 'active' ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {search ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'Tente buscar com outros termos' : 'Comece cadastrando seu primeiro usuário'}
            </p>
            {!search && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Cadastrar Usuário
              </Button>
            )}
          </div>
        )}

        {/* User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nome Completo *
                    </label>
                    <Input
                      placeholder="Ex: João Silva"
                      defaultValue={editingUser?.name || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="exemplo@email.com"
                      defaultValue={editingUser?.email || ''}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Telefone *
                    </label>
                    <Input
                      placeholder="(11) 99999-9999"
                      defaultValue={editingUser?.phone || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Função
                    </label>
                    <select className="w-full h-11 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm">
                      <option value="user">Vendedor</option>
                      <option value="manager">Gerente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Endereço
                  </label>
                  <Input
                    placeholder="Rua, número, cidade - estado"
                    defaultValue={editingUser?.address || ''}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button>
                    {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
