import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TreePine, Users, Globe, Heart, TrendingUp, Award, ShoppingBag, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGetImpactStats } from "@workspace/api-client-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function CountUp({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <span ref={ref} className="font-serif text-5xl lg:text-6xl font-bold text-primary block">
      {prefix}{inView ? value.toLocaleString() : "0"}{suffix}
    </span>
  );
}

const STORIES = [
  { name: "Celestine Mukamana", role: "Master Basket Weaver", quote: "I used to set snares in the forest. Now I weave baskets that protect it. My children go to school because people around the world believe in our craft.", transformation: "Former poacher → Conservation Ambassador" },
  { name: "Emmanuel Nkurunziza", role: "Master Woodcarver", quote: "My grandfather taught me that every tree has a spirit. Now I carve to honor that spirit, and every piece I sell is one less tree cut down.", transformation: "Subsistence farmer → Master artisan" },
  { name: "Alphonsine Umubyeyi", role: "Imigongo Artist", quote: "Imigongo is our identity. Through each geometric pattern, I pass on wisdom that's survived genocide and poverty. Art is our greatest act of resistance and resilience.", transformation: "Displaced person → Award-winning artist" },
];

export default function ImpactPage() {
  const { data: impact } = useGetImpactStats();
  const i = impact ?? {
    familiesSupported: 200, artisansEmpowered: 200, countriesReached: 47,
    totalOrders: 3840, conservationAmbassadors: 85, treesProtected: 12500,
    communityIncomeGenerated: 1240000, totalDonations: 45000,
  };

  const stats = [
    { icon: Users, value: i.familiesSupported, suffix: "+", label: "Families Supported", description: "Artisan families earning sustainable income from their craft" },
    { icon: Award, value: i.conservationAmbassadors, label: "Conservation Ambassadors", description: "Former poachers turned park defenders and environmental educators" },
    { icon: Globe, value: i.countriesReached, label: "Countries Reached", description: "Countries where Gorilla Guardians products have been sold" },
    { icon: TreePine, value: i.treesProtected, suffix: "+", label: "Trees Protected", description: "Trees in Volcanoes National Park protected by community conservation" },
    { icon: ShoppingBag, value: i.totalOrders, suffix: "+", label: "Orders Fulfilled", description: "Handcrafted items shipped to buyers around the world" },
    { icon: DollarSign, value: i.totalDonations, prefix: "$", label: "In Donations Received", description: "Direct donations to artisans from generous supporters" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary/80 text-primary-foreground py-24 relative overflow-hidden">
        <div className="absolute inset-0 imigongo-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="bg-accent text-accent-foreground mb-4">By the Numbers</Badge>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold mb-4">Our Impact</h1>
            <p className="text-xl opacity-80 max-w-2xl mx-auto">
              Every purchase you make is a data point in a conservation success story. Here is what we have built together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map(({ icon: Icon, value, suffix, prefix, label, description }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-6 border-border hover:shadow-lg transition-shadow text-center" data-testid={`card-impact-${label.toLowerCase().replace(/\s/g, "-")}`}>
                <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <CountUp value={value} suffix={suffix} prefix={prefix} />
                <h3 className="font-semibold text-lg mt-2 mb-1">{label}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Conservation story */}
      <section className="bg-primary/5 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="text-primary border-primary/30 mb-3">Conservation Science</Badge>
            <h2 className="font-serif text-4xl font-bold mb-3">Why This Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conservation economics is simple: when communities benefit financially from the park's existence, they stop threatening it. Here is the evidence.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, stat: "340%", label: "Income increase", text: "Average household income increased 340% for artisan families since joining the program." },
              { icon: Users, stat: "89%", label: "Poaching reduction", text: "Reported poaching incidents in partner villages fell 89% between 2015 and 2025." },
              { icon: TreePine, stat: "1,000+", label: "Gorillas surviving", text: "Mountain gorilla population has grown from 880 in 2018 to over 1,000 today." },
            ].map(({ icon: Icon, stat, label, text }) => (
              <div key={label} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-serif font-bold text-primary mb-1">{stat}</div>
                <div className="text-sm font-semibold mb-2">{label}</div>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Human stories */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="text-primary border-primary/30 mb-3">Human Stories</Badge>
          <h2 className="font-serif text-4xl font-bold">The People Behind the Numbers</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {STORIES.map((story, i) => (
            <motion.div key={story.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <Card className="border-border h-full">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <span className="text-2xl font-serif font-bold text-primary">{story.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-0.5">{story.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{story.role}</p>
                  <Badge variant="secondary" className="text-xs mb-4">{story.transformation}</Badge>
                  <blockquote className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-3">
                    "{story.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Your purchase */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Heart className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="font-serif text-4xl font-bold mb-4">What Your Purchase Does</h2>
          <p className="text-lg opacity-80 mb-8">Every $1 spent at Gorilla Guardians Village generates an average of $0.72 in direct artisan income, $0.18 in community conservation funds, and $0.10 in park support.</p>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-accent">72%</div>
              <div className="text-xs opacity-70 mt-1">Goes directly to artisans</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-accent">18%</div>
              <div className="text-xs opacity-70 mt-1">Community conservation</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-accent">10%</div>
              <div className="text-xs opacity-70 mt-1">Park protection fund</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
