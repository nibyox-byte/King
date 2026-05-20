import { Link } from "wouter";
import { TreePine, Heart, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">GG</div>
              <div>
                <div className="font-serif text-xl font-bold">Gorilla Guardians</div>
                <div className="text-xs opacity-70">Village, Rwanda</div>
              </div>
            </div>
            <p className="text-sm opacity-70 leading-relaxed mb-4">
              Buy a Craft, Build a Future. Handmade in Rwanda, With Love. Every purchase supports artisan families and protects mountain gorillas.
            </p>
            <div className="flex items-center gap-1 text-accent text-xs font-medium">
              <Heart className="w-3.5 h-3.5" />
              <span>Protecting gorillas since 2015</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider opacity-90">Shop</h4>
            <ul className="space-y-2.5">
              {[
                ["All Products", "/products"],
                ["Imigongo Art", "/products?category=imigongo-art"],
                ["Woven Baskets", "/products?category=woven-baskets"],
                ["Jewelry", "/products?category=jewelry"],
                ["Ceramics", "/products?category=ceramics"],
                ["Experiences", "/experiences"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider opacity-90">Learn</h4>
            <ul className="space-y-2.5">
              {[
                ["Our Artisans", "/artisans"],
                ["Cultural Stories", "/stories"],
                ["Impact Report", "/impact"],
                ["Upcoming Events", "/events"],
                ["About Us", "/about"],
                ["FAQ", "/faq"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider opacity-90">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm opacity-70">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Musanze District, Northern Province, Rwanda</span>
              </li>
              <li className="flex items-center gap-2 text-sm opacity-70">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:hello@gorillaguardians.rw" className="hover:opacity-100">hello@gorillaguardians.rw</a>
              </li>
              <li className="flex items-center gap-2 text-sm opacity-70">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+250788000000" className="hover:opacity-100">+250 788 000 000</a>
              </li>
              <li className="flex items-center gap-2 text-sm opacity-70">
                <TreePine className="w-4 h-4 shrink-0" />
                <span>Near Volcanoes National Park</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-60">
            2026 Gorilla Guardians Village. All rights reserved. Supporting artisans and protecting mountain gorillas.
          </p>
          <div className="flex items-center gap-6 text-xs opacity-60">
            <Link href="/about" className="hover:opacity-100">Privacy Policy</Link>
            <Link href="/faq" className="hover:opacity-100">Terms of Service</Link>
            <Link href="/contact" className="hover:opacity-100">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
