import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { getItem } from "./lib/localStorage";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Verification from "@/pages/verification";
import Payment from "@/pages/payment";
import Dashboard from "@/pages/dashboard";
import { Loader } from "./components/ui/loader";

function Router() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is already authenticated
    const authData = getItem<{isAuthenticated: boolean, username: string}>("lunaflix_auth");
    if (authData && authData.isAuthenticated) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Loader text="Memuat aplikasi..." />;
  }

  return (
    <Switch>
      {isAuthenticated ? (
        <Route path="/" component={Dashboard} />
      ) : (
        <Route path="/" component={Login} />
      )}
      <Route path="/verification" component={Verification} />
      <Route path="/payment" component={Payment} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
