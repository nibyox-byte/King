import { Bell, Check, CheckCheck, Package, Tag, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

const TYPE_ICONS: Record<string, any> = { order: Package, promotion: Tag, system: Info };

export default function CustomerNotificationsPage() {
  const { data: notifications, isLoading } = useListNotifications({});
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();

  const notifList = Array.isArray(notifications) ? notifications : [];
  const demoNotifs = [
    { id: 1, type: "order", title: "Order Shipped", message: "Your order #1001 has been shipped via DHL. Expected delivery: 7-14 days.", isRead: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), link: "/customer/orders/1001" },
    { id: 2, type: "promotion", title: "New Arrivals: Umuganura Collection", message: "Our special harvest festival collection is now live. Get 15% off with code HARVEST15.", isRead: false, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), link: "/products" },
    { id: 3, type: "system", title: "Welcome to Gorilla Guardians Village", message: "Thank you for joining. Every purchase supports artisan families and protects mountain gorillas.", isRead: true, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), link: "/impact" },
  ];
  const displayNotifs = notifList.length > 0 ? notifList : demoNotifs;

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }) });
  };
  const handleMarkAll = () => {
    markAll.mutate(undefined, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }) });
  };

  const unreadCount = displayNotifs.filter((n: any) => !n.isRead).length;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && <p className="text-sm text-muted-foreground mt-0.5">{unreadCount} unread</p>}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAll} className="gap-1.5" data-testid="button-mark-all-read">
                <CheckCheck className="w-4 h-4" /> Mark all read
              </Button>
            )}
          </div>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Card key={i} className="h-20 animate-pulse" />)}</div>
          ) : displayNotifs.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayNotifs.map((n: any) => {
                const Icon = TYPE_ICONS[n.type] ?? Bell;
                return (
                  <Card key={n.id} className={`border-border transition-all ${n.isRead ? "" : "border-primary/20 bg-primary/3"}`} data-testid={`card-notification-${n.id}`}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.isRead ? "bg-muted" : "bg-primary/10"}`}>
                        <Icon className={`w-4 h-4 ${n.isRead ? "text-muted-foreground" : "text-primary"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm">{n.title}</div>
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          {!n.isRead && (
                            <button onClick={() => handleMarkRead(n.id)} className="text-xs text-primary hover:underline" data-testid={`button-mark-read-${n.id}`}>
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
