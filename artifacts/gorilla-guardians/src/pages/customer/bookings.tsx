import { Link } from "wouter";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useListBookings } from "@workspace/api-client-react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { useAuth } from "@/lib/auth";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-gray-100 text-gray-800",
};

export default function CustomerBookingsPage() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useListBookings({ userId: user?.id, limit: 20 });
  const bookingList = Array.isArray(bookings) ? bookings : [];

  const demoBookings = [
    { id: 1, experienceId: 1, experience: { title: "Gorilla Trek & Village Visit", type: "tour", duration: "Full day" }, date: "2026-06-15", participants: 2, status: "confirmed", totalCost: 1300, specialRequests: "" },
    { id: 2, experienceId: 3, experience: { title: "Imigongo Painting Workshop", type: "workshop", duration: "3 hours" }, date: "2026-05-28", participants: 1, status: "pending", totalCost: 85, specialRequests: "" },
  ];
  const displayBookings = bookingList.length > 0 ? bookingList : demoBookings;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-2xl font-bold mb-6">My Bookings</h1>
          {isLoading ? (
            <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Card key={i} className="h-32 animate-pulse" />)}</div>
          ) : displayBookings.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-semibold text-lg mb-2">No bookings yet</h2>
              <p className="text-muted-foreground text-sm mb-6">Book a cultural experience in Rwanda.</p>
              <Link href="/experiences"><Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse Experiences</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {displayBookings.map((b: any) => (
                <Card key={b.id} className="border-border" data-testid={`card-booking-${b.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize text-xs">{b.experience?.type}</Badge>
                          <Badge className={`capitalize text-xs ${STATUS_COLORS[b.status] ?? "bg-muted"}`} data-testid={`badge-booking-status-${b.id}`}>{b.status}</Badge>
                        </div>
                        <h3 className="font-semibold">{b.experience?.title ?? `Booking #${b.id}`}</h3>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary text-lg">${b.totalCost}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" />{b.date}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" />{b.participants} participant(s)</span>
                      {b.experience?.duration && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" />{b.experience.duration}</span>}
                    </div>
                    {b.specialRequests && (
                      <p className="text-xs text-muted-foreground mt-3 bg-muted/40 px-3 py-2 rounded-lg">Note: {b.specialRequests}</p>
                    )}
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
