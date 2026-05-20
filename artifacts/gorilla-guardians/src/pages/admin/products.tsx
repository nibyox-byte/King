import { useState } from "react";
import { Link } from "wouter";
import { Plus, Search, Edit, Trash2, Package, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useListProducts, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const { data: productsData, isLoading } = useListProducts({ search: search || undefined, limit: 50 });
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const products = productsData?.products ?? [];

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteProduct.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Product deleted" });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-2xl font-bold">Products</h1>
              <p className="text-sm text-muted-foreground">{products.length} products total</p>
            </div>
            <Link href="/admin/products/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </Link>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 max-w-sm" data-testid="input-search-products-admin" />
          </div>

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : (
            <Card className="border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Artisan</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rating</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p: any) => (
                      <tr key={p.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`row-admin-product-${p.id}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                              {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full imigongo-pattern" />}
                            </div>
                            <div>
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">{p.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.artisan?.name ?? "—"}</td>
                        <td className="px-4 py-3 font-medium">${p.discountPrice ?? p.price}</td>
                        <td className="px-4 py-3">
                          <span className={p.stock < 5 ? "text-destructive font-medium" : ""}>{p.stock}</span>
                        </td>
                        <td className="px-4 py-3">
                          {p.averageRating ? (
                            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-accent text-accent" />{p.averageRating}</span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={p.active ? "secondary" : "outline"} className="text-xs">{p.active ? "Active" : "Inactive"}</Badge>
                          {p.featured && <Badge className="bg-accent/20 text-amber-800 text-xs ml-1">Featured</Badge>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/products/${p.id}/edit`}>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" data-testid={`button-edit-product-${p.id}`}>
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id, p.name)} data-testid={`button-delete-product-${p.id}`}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
