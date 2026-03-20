import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Input } from "@/components/ui-elements";
import { useCreateProduct, useUpdateProduct, useGetProduct, getListProductsQueryKey } from "@/lib/api";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductForm() {
  const params = useParams();
  const isEditing = !!params.id;
  const productId = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingProduct, isLoading: isLoadingExisting } = useGetProduct(productId, { query: { enabled: isEditing } });
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    category: "",
    stock_quantity: "",
    unit: "un",
    barcode: "",
    status: "active"
  });

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        description: existingProduct.description || "",
        price: existingProduct.price.toString(),
        cost: existingProduct.cost?.toString() || "",
        category: existingProduct.category || "",
        stock_quantity: existingProduct.stock_quantity?.toString() || "",
        unit: existingProduct.unit || "un",
        barcode: existingProduct.barcode || "",
        status: existingProduct.status
      });
    }
  }, [existingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock_quantity) {
      toast({ title: "Preencha os campos obrigatórios (*)", variant: "destructive" });
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      category: formData.category || null,
      stock_quantity: parseInt(formData.stock_quantity),
      unit: formData.unit,
      barcode: formData.barcode || null,
      status: formData.status
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: productId.toString(), ...productData });
        toast({ title: "Produto atualizado com sucesso!" });
      } else {
        await createMutation.mutateAsync(productData);
        toast({ title: "Produto criado com sucesso!" });
      }
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      setLocation("/products");
    } catch (error) {
      toast({ 
        title: "Erro ao salvar produto", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isEditing && isLoadingExisting) return <Layout><div className="p-8">Carregando...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setLocation("/produtos")} className="flex items-center text-muted-foreground hover:text-foreground mb-6 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Produtos
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">{isEditing ? "Editar Produto" : "Novo Produto"}</h1>
          <p className="text-muted-foreground mt-1">Preencha as informações do item no catálogo.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Nome do Produto *" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Ex: Cimento 50kg" 
                autoFocus
              />
              <Input 
                label="Descrição" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Ex: Notebook Dell Core i5 8GB 256GB" 
              />
              
              <Input 
                label="Preço de Venda (R$) *" 
                name="price" 
                type="number" 
                step="0.01" 
                value={formData.price} 
                onChange={handleChange} 
                placeholder="0.00" 
              />
              <Input 
                label="Custo (R$)" 
                name="cost" 
                type="number" 
                step="0.01" 
                value={formData.cost} 
                onChange={handleChange} 
                placeholder="0.00" 
              />

              <Input 
                label="Categoria" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                placeholder="Ex: Materiais Básicos" 
              />
              <Input 
                label="Estoque Atual *" 
                name="stock" 
                type="number" 
                value={formData.stock} 
                onChange={handleChange} 
                placeholder="0" 
              />

              <Input 
                label="URL da Imagem" 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange} 
                placeholder="https://..." 
                className="md:col-span-2"
              />

              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setLocation("/produtos")}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Salvar Alterações" : "Criar Produto"}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </Layout>
  );
}
