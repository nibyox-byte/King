import { Link } from "wouter";
import { ShoppingBag, Package, MessageSquare, AlertTriangle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListOrders, useListProducts } from "@workspace/api-client-react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
};

export default function StaffDashboard() {
  const { data: pendingOrders } = useListOrders({ status: "pending", limit: 8 });
  const { data: productsData } = useListProducts({ limit: 5 });

  const orders = pendingOrders?.orders ?? [];
  const products = productsData?.products ?? [];
  const lowStock = products.filter((p: any) => p.stock < 5);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold">Staff Dashboard</h1>
            <p className="text-muted-foreground mt-1">Today's tasks and alerts</p>
          </div>

          {/* Alerts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: ShoppingBag, label: "Pending Orders", value: orders.length || 5, color: "bg-yellow-50 text-yellow-700", href: "/staff/orders" },
              { icon: AlertTriangle, label: "Low Stock Items", value: lowStock.length || 3, color: "bg-red-50 text-red-700", href: "/staff/products" },
              { icon: MessageSquare, label: "New Messages", value: 2, color: "bg-blue-50 text-blue-700", href: "/staff/messages" },
            ].map(({ icon: Icon, label, value, color, href }) => (
              <Link key={label} href={href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-border">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${color.split(" ")[0]} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${color.split(" ")[1]}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="text-sm text-muted-foreground">{label}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pending orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Orders to Process</CardTitle>
              <Link href="/staff/orders">
                <Button variant="ghost" size="sm" className="text-primary">View all <ChevronRight className="w-3 h-3 ml-1" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="space-y-3">
                  {[
                    { id: "ORD-101", customer: "Sarah Johnson", amount: 210, status: "pending", items: "Imigongo Panel + Necklace" },
                    { id: "ORD-102", customer: "Pierre Martin", amount: 85, status: "processing", items: "Peace Basket" },
                    { id: "ORD-103", customer: "Amira Khan", amount: 450, status: "pending", items: "Gorilla Sculpture + Ceramics" },
                  ].map(o => (
                    <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors" data-testid={`row-staff-order-${o.id}`}>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{o.id}</div>
                        <div className="text-xs text-muted-foreground">{o.customer} · {o.items}</div>
                      </div>
                      <div className="text-sm font-bold">${o.amount}</div>
                      <Badge className={`text-xs ${STATUS_COLORS[o.status] ?? "bg-muted"}`}>{o.status}</Badge>
                      <Button size="sm" variant="outline" className="text-xs">Update</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o: any) => (
                    <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors" data-testid={`row-staff-order-${o.id}`}>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Order #{o.id}</div>
                        <div className="text-xs text-muted-foreground">${o.total}</div>
                      </div>
                      <Badge className={`text-xs ${STATUS_COLORS[o.status] ?? "bg-muted"}`}>{o.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
