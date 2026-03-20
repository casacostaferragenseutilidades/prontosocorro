import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Input, Badge } from "@/components/ui-elements";
import { useListSuppliers, useCreateSupplier, useDeleteSupplier, getListSuppliersQueryKey, Supplier } from "@/lib/supabase-api";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Building2, ChevronRight, X, Phone, Mail, MapPin, Edit, Trash2, Truck } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Suppliers() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: suppliers, isLoading } = useListSuppliers();
  const createMutation = useCreateSupplier();
  const deleteMutation = useDeleteSupplier();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: "", phone: "", email: "", cnpj: "", address: "" });

  const filtered = suppliers?.filter((s: Supplier) => 
    s.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      return toast({title: "Nome e Telefone são obrigatórios", variant: "destructive"});
    }
    
    try {
      await createMutation.mutateAsync({
        name: formData.name, phone: formData.phone, 
        email: formData.email || null, cnpj: formData.cnpj || null, address: formData.address || null
      });
      toast({title: "Fornecedor cadastrado!"});
      setIsModalOpen(false);
      setFormData({name: "", phone: "", email: "", cnpj: "", address: ""});
      queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey() });
    } catch(e) {
      toast({title: "Erro", variant: "destructive"});
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Fornecedores</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus contatos comerciais.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="lg" className="shrink-0">
          <Plus className="w-5 h-5 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            placeholder="Buscar por nome..." 
            className="pl-10 bg-secondary/50 border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="p-4 font-semibold text-sm text-muted-foreground">Nome</th>
              <th className="p-4 font-semibold text-sm text-muted-foreground">Contato</th>
              <th className="p-4 font-semibold text-sm text-muted-foreground">CNPJ</th>
              <th className="p-4 font-semibold text-sm text-muted-foreground text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="p-16 text-center text-muted-foreground"><Truck className="mx-auto w-12 h-12 mb-2 opacity-50" />Nenhum fornecedor encontrado</td></tr>
            ) : (
              filtered.map((supplier: Supplier) => (
                <tr key={supplier.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4 font-bold text-foreground">{supplier.name}</td>
                  <td className="p-4 text-sm">
                    <div>{supplier.phone}</div>
                    <div className="text-muted-foreground">{supplier.email || '-'}</div>
                  </td>
                  <td className="p-4 text-sm">{supplier.cnpj || '-'}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={async () => {
                      if(confirm('Excluir?')) {
                        await deleteMutation.mutateAsync({ id: supplier.id });
                        queryClient.invalidateQueries({queryKey: getListSuppliersQueryKey()});
                      }
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Novo Fornecedor</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nome *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
              <Input label="Telefone *" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <Input label="CNPJ" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
              <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" isLoading={createMutation.isPending}>Salvar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
}
