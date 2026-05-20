import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const FAQS = [
  { q: "Are the products really handmade?", a: "Yes. Every single product sold through Gorilla Guardians Village is handmade by an artisan in our community in Musanze, Rwanda. We do not stock mass-produced items. Each product page names the artisan who created it.", cat: "Products" },
  { q: "How long does shipping take?", a: "Standard international shipping takes 7–14 business days from Musanze, Rwanda. Express shipping (3–5 days) is available at checkout. All items are shipped with full customs documentation and tracking.", cat: "Shipping" },
  { q: "What is your returns policy?", a: "We accept returns within 30 days of delivery for items in original condition. Because these are handmade items with natural variations, we ask that you contact us first to describe the issue. We will arrange a prepaid return label.", cat: "Returns" },
  { q: "How much of my purchase goes to the artisan?", a: "72% of every dollar you spend goes directly to the artisan or their family. 18% funds community conservation programs. 10% supports the Volcanoes National Park protection fund.", cat: "Impact" },
  { q: "Can I contact the artisan directly?", a: "Yes! Once you have made a purchase, you can send a message directly to the artisan through your customer dashboard. Many customers build ongoing relationships with artisans and commission custom pieces.", cat: "Artisans" },
  { q: "Are custom/commissioned pieces available?", a: "Absolutely. Most of our artisans accept custom orders for specific colours, sizes, or patterns. Contact us or message an artisan directly to discuss your ideas.", cat: "Products" },
  { q: "How do experiences work?", a: "You select an experience, choose your date and number of participants, and submit a booking request. We confirm availability within 24 hours and send detailed instructions. Payment is only taken once confirmed.", cat: "Experiences" },
  { q: "Is Gorilla Guardians Village a registered charity?", a: "We are a registered social enterprise in Rwanda (not a charity). This means 100% of our revenue must be reinvested in artisan programs and conservation — we have no shareholders.", cat: "Impact" },
  { q: "How do I become a Gorilla Guardians artisan?", a: "We run community enrollment twice per year. Contact us through the form on this page or email hello@gorillaguardians.rw. Preference is given to families in the park's buffer zone.", cat: "Artisans" },
  { q: "Do you offer wholesale pricing for retailers?", a: "Yes, we have a wholesale program for ethical retailers. Minimum order is $500. Write to us at wholesale@gorillaguardians.rw with information about your shop.", cat: "Products" },
];

const CATS = ["All", "Products", "Shipping", "Returns", "Impact", "Artisans", "Experiences"];

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = FAQS.filter(f =>
    (cat === "All" || f.cat === cat) &&
    (search === "" || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Badge className="bg-accent text-accent-foreground mb-4">Help & Support</Badge>
          <h1 className="font-serif text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="opacity-80">Everything you need to know about shopping, shipping, and supporting Rwandan artisans.</p>
          <div className="relative mt-8 max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search FAQs..."
              className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              data-testid="input-search-faq"
            />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATS.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}
              data-testid={`button-faq-cat-${c.toLowerCase()}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No FAQs found for your search. <a href="mailto:hello@gorillaguardians.rw" className="text-primary hover:underline">Email us</a> for help.</p>
          ) : (
            filtered.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden" data-testid={`faq-item-${i}`}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/40 transition-colors"
                  data-testid={`button-faq-toggle-${i}`}
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {faq.a}
                        <Badge variant="outline" className="ml-3 text-xs">{faq.cat}</Badge>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 text-center bg-primary/5 rounded-2xl p-8">
          <h2 className="font-serif text-2xl font-bold mb-3">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">Our team in Musanze responds within 24 hours.</p>
          <a href="mailto:hello@gorillaguardians.rw">
            <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">Email Us</button>
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
