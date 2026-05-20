import { motion } from "framer-motion";
import { TreePine, Users, Globe, Heart, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="bg-accent text-accent-foreground mb-4">Our Mission</Badge>
            <h1 className="font-serif text-5xl font-bold mb-4">About Gorilla Guardians Village</h1>
            <p className="text-xl opacity-80">A conservation economy where every craft sold protects a forest and feeds a family.</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Origin story */}
        <div>
          <h2 className="font-serif text-3xl font-bold mb-6">Our Story</h2>
          <div className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>Gorilla Guardians Village began in 2015 in Musanze District, at the foot of the Virunga Mountains — home to roughly half the world's mountain gorilla population. The project was born from a simple but radical question: what if the communities living alongside the park could benefit more from its existence than from its destruction?</p>
            <p>The answer came in the form of craft. Rwanda has a rich heritage of handmade artistry — Imigongo geometric paintings, intricately woven peace baskets, master woodcarvings, and vibrant textiles. These traditions had been passed down for generations, but artisans struggled to reach global markets that would pay fair prices.</p>
            <p>Gorilla Guardians Village became the bridge — connecting Rwandan artisans with buyers worldwide, paying fair wages, investing in training, and creating cultural experiences that bring visitors directly to the village. The result: artisan incomes tripled, children stayed in school, and former poachers became the park's most passionate defenders.</p>
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="font-serif text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Users, title: "Community First", text: "Every decision is made with the artisan community at the center. We are not a charity — we are a partner." },
              { icon: TreePine, title: "Conservation Through Commerce", text: "We believe the best way to protect nature is to make it economically essential to the communities who live beside it." },
              { icon: Globe, title: "Cultural Preservation", text: "Rwandan craft traditions are not just beautiful — they are living repositories of cultural knowledge, language, and wisdom." },
              { icon: Heart, title: "Radical Transparency", text: "We publish our impact numbers. We name the artisans who made each piece. Every purchase has a face and a story." },
            ].map(({ icon: Icon, title, text }) => (
              <Card key={title} className="border-border">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="font-serif text-3xl font-bold mb-6">Leadership Team</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { name: "Jean-Paul Habimana", role: "Co-Founder & Executive Director", bio: "Born in Musanze, Jean-Paul grew up watching the forest that inspired him. After studies in environmental economics in Kigali, he returned home to build a different kind of conservation." },
              { name: "Marie Uwimana", role: "Co-Founder & Head of Artisan Relations", bio: "Marie is a master basket weaver who became the lead trainer for Gorilla Guardians artisans. She has personally mentored over 80 women artisans." },
            ].map(person => (
              <div key={person.name} className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xl font-serif font-bold text-primary">{person.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{person.name}</h3>
                  <p className="text-sm text-primary mb-2">{person.role}</p>
                  <p className="text-sm text-muted-foreground">{person.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
