import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Input, Badge } from "@/components/ui-elements";
import { useListCustomers, useCreateCustomer, useDeleteCustomer, getListCustomersQueryKey } from "@/lib/mock-api";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Users, ChevronRight, X, UserPlus, Phone, Mail, MapPin, Calendar, MoreVertical, Edit, Trash2, AlertTriangle, DollarSign, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: customers, isLoading } = useListCustomers();
  const createMutation = useCreateCustomer();
  const deleteMutation = useDeleteCustomer();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const filtered = customers?.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.phone.includes(search)
  ) || [];

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createMutation.mutateAsync({
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        address: formData.get("address") as string,
        paymentMethod: formData.get("paymentMethod") as string,
      });
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
    } catch(e) {
      toast({title: "Erro ao cadastrar", variant: "destructive"});
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header com gradiente Zynix */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Clientes</h1>
                <p className="text-blue-100 text-lg">Gerencie a carteira de clientes e fiados</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-blue-100">Total Ativo</p>
                  <p className="text-2xl font-bold">{customers?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-xl border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                <p className="text-3xl font-bold text-gray-900">{customers?.length || 0}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 shadow-xl border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Dívida</p>
                <p className="text-3xl font-bold text-red-600">
                  {customers?.filter(c => c.totalDebt > 0).length || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 shadow-xl border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dívida Total</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(customers?.reduce((sum, c) => sum + c.totalDebt, 0) || 0)}
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="p-6 shadow-xl border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              placeholder="Buscar por nome ou telefone..." 
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando clientes...</h3>
              <p className="text-gray-600">Aguarde um momento</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full p-16 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {search ? 'Tente buscar com outros termos' : 'Comece cadastrando seu primeiro cliente'}
              </p>
              {!search && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Cadastrar Cliente
                </Button>
              )}
            </div>
          ) : (
            filtered.map(customer => (
              <Card 
                key={customer.id} 
                className="p-6 shadow-xl border-gray-100 hover:shadow-2xl transition-all cursor-pointer group"
                onClick={() => setLocation(`/clientes/${customer.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{customer.name}</h3>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {customer.phone}
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {customer.address}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Dívida Ativa:</span>
                    <p className={cn("font-bold text-lg mt-1", customer.totalDebt > 0 ? "text-red-600" : "text-green-600")}>
                      {formatCurrency(customer.totalDebt)}
                    </p>
                  </div>
                  <Badge variant={customer.totalDebt > 0 ? "danger" : "success"}>
                    {customer.totalDebt > 0 ? "Com Dívida" : "Regular"}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Novo Cliente</h2>
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <Input
                      name="name"
                      placeholder="Ex: João Silva"
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <Input
                      name="phone"
                      placeholder="(11) 99999-9999"
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="cliente@email.com"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Pagamento
                    </label>
                    <select name="paymentMethod" className="w-full h-11 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="money">Dinheiro</option>
                      <option value="credit_card">Cartão Crédito</option>
                      <option value="debit_card">Cartão Débito</option>
                      <option value="pix">Pix</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <Input
                    name="address"
                    placeholder="Rua, número, cidade - estado"
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Cadastrar Cliente
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0"
          >
            <Plus className="w-6 h-6" />
          </Button>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
}
