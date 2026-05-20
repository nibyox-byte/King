import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetWishlist, useRemoveFromWishlist, useAddToCart, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useGetWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const items = Array.isArray(wishlist) ? wishlist : [];

  const handleRemove = (productId: number) => {
    removeFromWishlist.mutate({ productId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() }),
    });
  };

  const handleAddToCart = (productId: number, name: string) => {
    addToCart.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => toast({ title: "Added to cart", description: `${name} moved to your cart.` }),
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-2xl font-bold mb-6">My Wishlist ({items.length})</h1>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Card key={i} className="h-60 animate-pulse" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-semibold text-lg mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground text-sm mb-6">Save items you love for later.</p>
              <Link href="/products"><Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse Products</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((item: any) => (
                <Card key={item.productId} className="group overflow-hidden border-border" data-testid={`card-wishlist-${item.productId}`}>
                  <Link href={`/products/${item.productId}`} className="block">
                    <div className="aspect-square bg-muted overflow-hidden">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full imigongo-pattern" />
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">{item.product?.artisan?.name}</p>
                    <h3 className="text-sm font-medium line-clamp-2 mb-2">{item.product?.name}</h3>
                    <p className="font-bold text-primary text-sm mb-3">${item.product?.discountPrice ?? item.product?.price}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-xs" onClick={() => handleAddToCart(item.productId, item.product?.name ?? "Product")} data-testid={`button-wishlist-add-cart-${item.productId}`}>
                        <ShoppingCart className="w-3 h-3 mr-1" /> Add to Cart
                      </Button>
                      <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/5" onClick={() => handleRemove(item.productId)} data-testid={`button-wishlist-remove-${item.productId}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
