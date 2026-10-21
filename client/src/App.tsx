import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import SermonMode from "@/pages/SermonMode";
import ListenerMode from "@/pages/ListenerMode";
import History from "@/pages/History";
import TranscriptDetail from "@/pages/TranscriptDetail";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";

// Preekmodus (per-sentence editable translation review) is the front door —
// it's the workflow the app was built for. Live/subtitle mode moved to
// /live; /sermon redirects to / so old bookmarks/links keep working.
// /listen is listener mode (CLAUDE.md "Listener mode") — the English-only
// phone view; server/index.ts also redirects "/" and "/live" here for any
// non-loopback (LAN) request, so a listener typing the bare IP lands here
// without needing to know the path.
function Router() {
  return (
    <Switch>
      <Route path="/" component={SermonMode} />
      <Route path="/live" component={Home} />
      <Route path="/listen" component={ListenerMode} />
      <Route path="/history" component={History} />
      <Route path="/transcriptions/:id" component={TranscriptDetail} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/sermon">
        <Redirect to="/" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
