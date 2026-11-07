import { lazy, Suspense } from "react";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const SportsLabPage = lazy(() => import("./pages/SportsLabPage"));

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={<main className="min-h-screen bg-slate-950 p-8 text-center text-cyan-100">Opening Sports Prediction Absolute…</main>}>
            <Switch>
              <Route path="/" component={SportsLabPage} />
              <Route path="/sports-lab" component={SportsLabPage} />
              <Route><Redirect to="/" /></Route>
            </Switch>
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
