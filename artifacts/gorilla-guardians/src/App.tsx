import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, type UserRole } from "@/lib/auth";

// Public pages
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import ProductsPage from "@/pages/products";
import ProductDetailPage from "@/pages/product-detail";
import ArtisansPage from "@/pages/artisans";
import ArtisanDetailPage from "@/pages/artisan-detail";
import ExperiencesPage from "@/pages/experiences";
import ExperienceDetailPage from "@/pages/experience-detail";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import ImpactPage from "@/pages/impact";
import StoriesPage from "@/pages/stories";
import StoryDetailPage from "@/pages/story-detail";
import EventsPage from "@/pages/events";
import AboutPage from "@/pages/about";
import FaqPage from "@/pages/faq";
import ContactPage from "@/pages/contact";
import NotFound from "@/pages/not-found";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";

// Staff pages
import StaffDashboard from "@/pages/staff/dashboard";

// Artisan pages
import ArtisanDashboard from "@/pages/artisan/dashboard";

// Customer pages
import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerOrders from "@/pages/customer/orders";
import CustomerBookings from "@/pages/customer/bookings";
import CustomerWishlist from "@/pages/customer/wishlist";
import CustomerMessages from "@/pages/customer/messages";
import CustomerNotifications from "@/pages/customer/notifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

function ProtectedRoute({
  component: Component,
  roles,
}: {
  component: React.ComponentType;
  roles?: UserRole[];
}) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Redirect to="/" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/artisans" component={ArtisansPage} />
      <Route path="/artisans/:id" component={ArtisanDetailPage} />
      <Route path="/experiences" component={ExperiencesPage} />
      <Route path="/experiences/:id" component={ExperienceDetailPage} />
      <Route path="/stories" component={StoriesPage} />
      <Route path="/stories/:id" component={StoryDetailPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/impact" component={ImpactPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/faq" component={FaqPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />

      {/* Customer */}
      <Route path="/customer/dashboard">
        {() => <ProtectedRoute component={CustomerDashboard} roles={["customer"]} />}
      </Route>
      <Route path="/customer/orders">
        {() => <ProtectedRoute component={CustomerOrders} roles={["customer"]} />}
      </Route>
      <Route path="/customer/bookings">
        {() => <ProtectedRoute component={CustomerBookings} roles={["customer"]} />}
      </Route>
      <Route path="/customer/wishlist">
        {() => <ProtectedRoute component={CustomerWishlist} roles={["customer"]} />}
      </Route>
      <Route path="/customer/messages">
        {() => <ProtectedRoute component={CustomerMessages} roles={["customer"]} />}
      </Route>
      <Route path="/customer/notifications">
        {() => <ProtectedRoute component={CustomerNotifications} roles={["customer"]} />}
      </Route>

      {/* Staff */}
      <Route path="/staff/dashboard">
        {() => <ProtectedRoute component={StaffDashboard} roles={["staff", "admin", "super_admin"]} />}
      </Route>

      {/* Artisan */}
      <Route path="/artisan/dashboard">
        {() => <ProtectedRoute component={ArtisanDashboard} roles={["artisan"]} />}
      </Route>

      {/* Admin */}
      <Route path="/admin/dashboard">
        {() => <ProtectedRoute component={AdminDashboard} roles={["admin", "super_admin"]} />}
      </Route>
      <Route path="/admin/products">
        {() => <ProtectedRoute component={AdminProducts} roles={["admin", "super_admin", "staff"]} />}
      </Route>

      {/* Catch-all */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
