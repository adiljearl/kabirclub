import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth-context";
import { Layout } from "@/components/layout/layout";
import { Home } from "@/pages/home";
import { Product } from "@/pages/product";
import { Category } from "@/pages/category";
import { Contact } from "@/pages/contact";
import { Cart } from "@/pages/cart";
import { Login } from "@/pages/login";
import { Register } from "@/pages/register";
import { Account } from "@/pages/account";
import {Dashboard} from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/product/:id" component={Product} />
        <Route path="/category/:slug" component={Category} />
        <Route path="/contact" component={Contact} />
        <Route path="/cart" component={Cart} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/account" component={Account} />
        <Route path="/admin" component={Dashboard}/>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
