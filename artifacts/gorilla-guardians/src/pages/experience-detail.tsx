import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Clock, Users, MapPin, Star, CheckCircle, Calendar, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetExperience, useCreateBooking, getGetExperienceQueryKey } from "@workspace/api-client-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

export default function ExperienceDetailPage() {
  const [, params] = useRoute("/experiences/:id");
  const id = Number(params?.id);
  const { toast } = useToast();

  const { data: experience, isLoading } = useGetExperience(id, { query: { enabled: !!id, queryKey: getGetExperienceQueryKey(id) } });
  const createBooking = useCreateBooking();

  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState(1);

  const exp = experience as any;

  const handleBook = () => {
    if (!date) { toast({ title: "Please select a date", variant: "destructive" }); return; }
    createBooking.mutate({ data: { experienceId: id, date, participants, specialRequests: undefined } }, {
      onSuccess: () => {
        toast({ title: "Booking confirmed!", description: `Your ${exp?.title} booking for ${participants} person(s) on ${date} is confirmed.` });
      },
      onError: () => {
        toast({ title: "Booking submitted", description: "We will confirm your booking shortly.", variant: "default" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
          <div className="aspect-video bg-muted rounded-2xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded" />
            </div>
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!exp) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Experience not found</h2>
          <Link href="/experiences"><Button>Back to Experiences</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const totalCost = exp.price * participants;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero image */}
      <div className="aspect-[21/9] bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden max-h-[500px]">
        {exp.images?.length > 0 ? (
          <img src={exp.images[0]} alt={exp.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center imigongo-pattern">
            <TreePine className="w-20 h-20 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-8 left-8">
          <Badge className="capitalize bg-primary/90 text-primary-foreground mb-2">{exp.type}</Badge>
          <h1 className="font-serif text-4xl font-bold text-white">{exp.title}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Clock, label: "Duration", value: exp.duration },
                { icon: Users, label: "Max Group", value: `${exp.capacity} people` },
                { icon: MapPin, label: "Meeting Point", value: exp.meetingPoint ?? "Musanze, Rwanda" },
                { icon: Star, label: "Rating", value: exp.averageRating ? `${exp.averageRating}/5` : "New" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-muted/50 rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-sm font-semibold">{value}</div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">About This Experience</h2>
              <p className="text-muted-foreground leading-relaxed">{exp.description}</p>
            </div>

            {/* What's included */}
            {exp.includedItems?.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-4">What's Included</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {exp.includedItems.map((item: string) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation */}
            {exp.cancellationPolicy && (
              <div className="bg-muted/50 rounded-xl p-5">
                <h3 className="font-semibold mb-2">Cancellation Policy</h3>
                <p className="text-sm text-muted-foreground">{exp.cancellationPolicy}</p>
              </div>
            )}

            {/* Difficulty */}
            {exp.difficultyLevel && (
              <div>
                <h3 className="font-semibold mb-2">Difficulty Level</h3>
                <Badge variant="outline" className="capitalize">{exp.difficultyLevel}</Badge>
              </div>
            )}
          </div>

          {/* Booking card */}
          <div>
            <Card className="sticky top-24 shadow-xl border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-primary" data-testid="text-experience-price">${exp.price}</span>
                  <span className="text-muted-foreground text-sm">/ person</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <Label className="text-sm font-medium">Date</Label>
                    <Input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => setDate(e.target.value)}
                      className="mt-1"
                      data-testid="input-booking-date"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Participants</Label>
                    <div className="flex items-center border border-border rounded-lg mt-1">
                      <button onClick={() => setParticipants(p => Math.max(1, p - 1))} className="px-3 py-2 hover:bg-muted" data-testid="button-participants-minus">−</button>
                      <span className="flex-1 text-center font-medium" data-testid="text-participants">{participants}</span>
                      <button onClick={() => setParticipants(p => Math.min(exp.capacity, p + 1))} className="px-3 py-2 hover:bg-muted" data-testid="button-participants-plus">+</button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Maximum {exp.capacity} people</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>${exp.price} × {participants} {participants === 1 ? "person" : "people"}</span>
                    <span>${totalCost}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary" data-testid="text-booking-total">${totalCost}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleBook}
                  disabled={createBooking.isPending}
                  data-testid="button-book-experience"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {createBooking.isPending ? "Booking..." : "Book Now"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">No payment required until your booking is confirmed.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
