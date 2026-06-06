import { useLocation, useSearch } from "wouter";
import { XCircle, RefreshCw, ShoppingCart, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PaymentFailedPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const reason = params.get("reason") ?? "Your payment could not be processed.";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-red-100 mx-auto mb-5 flex items-center justify-center">
            <XCircle className="w-11 h-11 text-red-500" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Payment Failed</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {reason}
          </p>
        </div>

        <Card className="mb-6 border-red-200 bg-red-50/40">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4 text-red-800">What You Can Do</h2>
            <ul className="space-y-3">
              {[
                "Check your card details and try again",
                "Try a different payment method",
                "Contact your bank if the issue persists",
                "Reach out to our support team for help",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-400 shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Your cart items are still saved. No payment was taken.
            </p>
            <p className="text-sm font-medium text-primary">
              You can safely return to checkout and try again.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            onClick={() => setLocation("/checkout")}
            data-testid="button-retry-payment"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Payment
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setLocation("/cart")}
            data-testid="button-return-cart"
          >
            <ShoppingCart className="w-4 h-4" />
            Return to Cart
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setLocation("/contact")}
            data-testid="button-contact-support"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Need immediate help? Email us at{" "}
          <a href="mailto:support@gorillaguardians.rw" className="text-primary underline underline-offset-2">
            support@gorillaguardians.rw
          </a>
        </p>
      </main>
      <Footer />
    </div>
  );
}
