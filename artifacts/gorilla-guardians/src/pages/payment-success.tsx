import { useLocation, useSearch } from "wouter";
import { CheckCircle2, Package, ShoppingBag, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);

  const orderId = params.get("orderId");
  const trackingNumber = params.get("tracking");
  const total = params.get("total");
  const paymentRef = params.get("ref") ?? `GG-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-green-100 mx-auto mb-5 flex items-center justify-center">
            <CheckCircle2 className="w-11 h-11 text-green-600" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-primary mb-3">Payment Successful!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for supporting Rwandan artisans. Your order has been confirmed.
          </p>
        </div>

        <Card className="mb-6 border-green-200 bg-green-50/40">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg mb-4 text-primary">Order Details</h2>

            {orderId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order</span>
                <span className="font-semibold">#{orderId}</span>
              </div>
            )}

            {trackingNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tracking Number</span>
                <span className="font-mono font-semibold text-primary">{trackingNumber}</span>
              </div>
            )}

            {total && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-primary">${total}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Reference</span>
              <span className="font-mono text-xs text-muted-foreground">{paymentRef}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="text-green-700 font-semibold">✓ Confirmed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">What Happens Next?</h3>
            <div className="space-y-3">
              {[
                { icon: "📧", text: "You'll receive an email confirmation shortly" },
                { icon: "🎨", text: "Your artisan will begin crafting your order" },
                { icon: "📦", text: "Tracking information will be emailed when shipped" },
                { icon: "🌍", text: "International delivery in 7–14 business days" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            onClick={() => setLocation("/customer/orders")}
            data-testid="button-view-orders"
          >
            <ShoppingBag className="w-4 h-4" />
            View My Orders
          </Button>
          {trackingNumber && (
            <Button
              variant="outline"
              className="gap-2 border-primary text-primary"
              onClick={() => setLocation(`/track?number=${trackingNumber}`)}
              data-testid="button-track-order"
            >
              <Package className="w-4 h-4" />
              Track Order
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setLocation("/products")}
            data-testid="button-continue-shopping"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
