import { useState } from "react";
import { Header } from "../../components/Header";
import { SidebarAdmin } from "../../components/SideBarAdmin";
import { MainContentAdmin } from "../../components/MainContentAdmin";

export function AdminDashboard() {
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
        <SidebarAdmin isOpen={sidebarOpen} onSelectView={setCurrentView} />
        <MainContentAdmin currentView={currentView} />
      </div>
    </div>
  );
}
