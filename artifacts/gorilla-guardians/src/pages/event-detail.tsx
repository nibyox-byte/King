import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, MapPin, Globe, Clock, Users, ArrowLeft, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetEvent, getGetEventQueryKey } from "@workspace/api-client-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

const DEMO_EVENTS: Record<number, any> = {
  1: {
    id: 1,
    title: "Umuganura Harvest Festival",
    type: "festival",
    description: "Rwanda's traditional harvest festival at Gorilla Guardians Village. Traditional dances, music, food, and artisan showcase. Join hundreds of community members and international visitors to celebrate the harvest and honor the artisans who sustain this village.",
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Musanze, Rwanda",
    isOnline: false,
    image: null,
    highlights: ["Traditional Intore dance performances", "Artisan market with 50+ makers", "Rwandan feast with local ingredients", "Gorilla conservation talk", "Basket weaving demonstration"],
    capacity: 200,
  },
  2: {
    id: 2,
    title: "Virtual Artisan Showcase: Meet the Makers",
    type: "exhibition",
    description: "Live online event with Gorilla Guardians artisans. Watch live craft demonstrations, ask questions directly to the makers, place custom orders, and hear the stories behind each piece. A unique opportunity to connect with Rwandan artisans from anywhere in the world.",
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: null,
    location: null,
    isOnline: true,
    image: null,
    highlights: ["Live basket weaving demonstration", "Imigongo painting session", "Wood carving Q&A with Emmanuel", "Custom order consultation", "Conservation impact update"],
    capacity: 500,
  },
  3: {
    id: 3,
    title: "Imigongo Exhibition: Patterns of Rwanda",
    type: "exhibition",
    description: "Curated exhibition of contemporary Imigongo art featuring 25 artists from across Rwanda. Opening night reception with traditional music and Rwandan cuisine. The exhibition explores how ancient geometric traditions are being reimagined by a new generation of artists.",
    startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Kigali Convention Centre, Rwanda",
    isOnline: false,
    image: null,
    highlights: ["25 contemporary Imigongo artists", "Opening night reception", "Artist talks and workshops", "Collector preview evening", "Cultural heritage panel discussion"],
    capacity: 300,
  },
};

const TYPE_COLORS: Record<string, string> = {
  festival: "bg-accent/20 text-amber-800",
  exhibition: "bg-blue-100 text-blue-800",
  workshop: "bg-green-100 text-green-800",
};

export default function EventDetailPage() {
  const [, params] = useRoute("/events/:id");
  const id = Number(params?.id);
  const { toast } = useToast();

  const { data: event, isLoading } = useGetEvent(id, { query: { enabled: !!id, queryKey: getGetEventQueryKey(id) } });
  const resolvedEvent = (event as any) ?? DEMO_EVENTS[id] ?? null;

  const handleRegister = () => {
    toast({
      title: "Interest registered!",
      description: `We'll send you updates about ${resolvedEvent?.title} as the date approaches.`,
    });
  };

  if (isLoading && !resolvedEvent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!resolvedEvent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Event not found</h2>
          <Link href="/events"><Button>Back to Events</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const e = resolvedEvent;
  const startDate = new Date(e.startDate);
  const endDate = e.endDate ? new Date(e.endDate) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/events" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className={`capitalize text-xs ${TYPE_COLORS[e.type] ?? "bg-muted"}`}>{e.type}</Badge>
              {e.isOnline && (
                <Badge variant="outline" className="text-xs gap-1 border-white/30 text-white"><Globe className="w-3 h-3" /> Online Event</Badge>
              )}
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4">{e.title}</h1>
            <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {startDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  {endDate && ` – ${endDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
                </span>
              </div>
              {e.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{e.location}</span>
                </div>
              )}
              {e.isOnline && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Online — join from anywhere</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center imigongo-pattern">
              <Calendar className="w-20 h-20 text-primary/20" />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold mb-3">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed">{e.description}</p>
            </div>

            {e.highlights?.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-4">Event Highlights</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {e.highlights.map((item: string) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <Card className="sticky top-24 shadow-xl border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="text-center bg-primary/5 rounded-xl py-5">
                  <div className="text-4xl font-serif font-bold text-primary">{startDate.getDate()}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide">
                    {startDate.toLocaleDateString("en-US", { month: "long" })}
                  </div>
                  <div className="text-sm text-muted-foreground">{startDate.getFullYear()}</div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  {e.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span>{e.location}</span>
                    </div>
                  )}
                  {e.isOnline && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary shrink-0" />
                      <span>Online event</span>
                    </div>
                  )}
                  {e.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary shrink-0" />
                      <span>Up to {e.capacity} attendees</span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleRegister}
                  data-testid="button-event-register"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Register Interest
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We'll send you details and reminders as the event approaches.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
