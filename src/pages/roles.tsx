import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Badge, Input } from "@/components/ui-elements";
import { Search, Plus, Shield, ChevronRight, X, Edit, Trash2, CheckCircle, XCircle, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Mock data para permissões
const mockRoles = [
  { 
    id: 1, 
    name: "Administrador", 
    description: "Acesso total ao sistema", 
    permissions: ["users", "settings", "reports", "backup", "vendas", "clientes", "produtos", "financeiro"],
    userCount: 1,
    createdAt: "2024-01-15",
    isDefault: false
  },
  { 
    id: 2, 
    name: "Gerente", 
    description: "Gerenciar vendas e clientes", 
    permissions: ["vendas", "clientes", "produtos", "reports", "financeiro"],
    userCount: 1,
    createdAt: "2024-01-16",
    isDefault: false
  },
  { 
    id: 3, 
    name: "Vendedor", 
    description: "Realizar vendas e cadastrar clientes", 
    permissions: ["vendas", "clientes"],
    userCount: 1,
    createdAt: "2024-01-17",
    isDefault: true
  },
  { 
    id: 4, 
    name: "Financeiro", 
    description: "Gestão financeira completa", 
    permissions: ["financeiro", "reports", "contas-pagar", "contas-receber"],
    userCount: 0,
    createdAt: "2024-01-18",
    isDefault: false
  },
];

const allPermissions = [
  { id: "users", name: "Usuários", description: "Gerenciar usuários do sistema" },
  { id: "settings", name: "Configurações", description: "Configurar parâmetros do sistema" },
  { id: "reports", name: "Relatórios", description: "Acessar relatórios e análises" },
  { id: "backup", name: "Backup", description: "Realizar backups e restaurações" },
  { id: "vendas", name: "Vendas", description: "Realizar e gerenciar vendas" },
  { id: "clientes", name: "Clientes", description: "Cadastrar e gerenciar clientes" },
  { id: "produtos", name: "Produtos", description: "Gerenciar catálogo de produtos" },
  { id: "financeiro", name: "Financeiro", description: "Gestão financeira completa" },
  { id: "contas-pagar", name: "Contas a Pagar", description: "Gerenciar contas a pagar" },
  { id: "contas-receber", name: "Contas a Receber", description: "Gerenciar contas a receber" },
];

export default function Roles() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredRoles = mockRoles.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase()) ||
    role.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta função?')) {
      toast({
        title: "Função excluída",
        description: "A função foi removida com sucesso.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleSaveRole = () => {
    toast({
      title: "Função salva",
      description: "A função foi salva com sucesso.",
    });
    setIsModalOpen(false);
    setEditingRole(null);
    setSelectedPermissions([]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Permissões</h1>
            <p className="text-muted-foreground">Gerencie as funções e permissões do sistema</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Nova Função
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar funções..."
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
                <p className="text-sm font-medium text-muted-foreground">Total de Funções</p>
                <p className="text-2xl font-bold text-foreground">{mockRoles.length}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Funções Ativas</p>
                <p className="text-2xl font-bold text-success">
                  {mockRoles.filter(r => r.userCount > 0).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Funções Padrão</p>
                <p className="text-2xl font-bold text-warning">
                  {mockRoles.filter(r => r.isDefault).length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-warning" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sem Usuários</p>
                <p className="text-2xl font-bold text-danger">
                  {mockRoles.filter(r => r.userCount === 0).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-danger" />
            </div>
          </Card>
        </div>

        {/* Roles Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Permissões
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usuários
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
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{role.name}</p>
                          {role.isDefault && (
                            <Badge variant="outline" className="text-xs">Padrão</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {role.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {role.userCount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          usuários
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(role.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingRole(role);
                            setSelectedPermissions(role.permissions);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!role.isDefault && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredRoles.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {search ? 'Nenhuma função encontrada' : 'Nenhuma função cadastrada'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'Tente buscar com outros termos' : 'Comece cadastrando sua primeira função'}
            </p>
            {!search && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Cadastrar Função
              </Button>
            )}
          </div>
        )}

        {/* Role Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">
                  {editingRole ? 'Editar Função' : 'Nova Função'}
                </h2>
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nome da Função *
                    </label>
                    <Input
                      placeholder="Ex: Vendedor"
                      defaultValue={editingRole?.name || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Descrição *
                    </label>
                    <Input
                      placeholder="Descreva as responsabilidades"
                      defaultValue={editingRole?.description || ''}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-4">
                    Permissões
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, permission.id]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== permission.id));
                            }
                          }}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor={permission.id} className="text-sm text-foreground cursor-pointer">
                          <div>
                            <p className="font-medium">{permission.name}</p>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    defaultChecked={editingRole?.isDefault || false}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm text-foreground">
                    Marcar como função padrão para novos usuários
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveRole}>
                    {editingRole ? 'Salvar Alterações' : 'Cadastrar Função'}
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
