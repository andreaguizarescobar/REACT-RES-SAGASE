import { useState } from "react";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { MainContent } from "../../components/MainContent";

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState("home");

  const handleGoHome = () => {
    setCurrentView("home");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onGoHome={handleGoHome}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onSelectView={setCurrentView} />
        <MainContent currentView={currentView} />
      </div>
    </div>
  );
}
