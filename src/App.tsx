import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as Sonner, Toaster } from "@/components/ui/sonner";
import "./App.css";
import { TooltipProvider } from "./components/ui/tooltip";
import Index from "./pages/Index";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
