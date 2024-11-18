"use client";
import { useState } from "react";
import { Home, Info, Phone, Folder, Trash2 } from "lucide-react";
import FlipCard from "../components/FlipCard";

const Sidebar = ({ currentComponent, setCurrentComponent }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleUninstall = async (componentName, e) => {
    e.stopPropagation();
    if (confirm(`确定要卸载组件 ${componentName} 吗？`)) {
      try {
        const response = await fetch('/api/uninstall', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ componentName })
        });
        if (response.ok) {
          window.location.reload();
        }
      } catch (error) {
        console.error('卸载失败:', error);
      }
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ${
        isHovered ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ul className="p-4 space-y-4">
        <li
          className={`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded ${
            currentComponent === "Home" ? "bg-gray-700" : ""
          }`}
          onClick={() => setCurrentComponent("Home")}
        >
          <Home className="w-6 h-6" />
          {isHovered && <span>Home</span>}
        </li>
        
        <li
          className={`flex items-center justify-between hover:bg-gray-700 p-2 rounded ${
            currentComponent === "FlipCard" ? "bg-gray-700" : ""
          }`}
          onClick={() => setCurrentComponent("FlipCard")}
        >
          <div className="flex items-center space-x-2">
            <Folder className="w-6 h-6" />
            {isHovered && <span>FlipCard</span>}
          </div>
          {isHovered && (
            <button
              onClick={(e) => handleUninstall("FlipCard", e)}
              className="p-1 rounded-full hover:bg-red-500 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </li>
      </ul>
    </div>
  );
};

export default function Page() {
  const [currentComponent, setCurrentComponent] = useState("Home");

  const renderComponent = () => {
    switch (currentComponent) {
      case "Home":
        return <div className="p-4 text-lg">这是首页组件</div>;
      
      case "FlipCard":
        return (
          <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
            <FlipCard />
          </div>
        );
      default:
        return <div className="p-4 text-lg">未知组件</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        currentComponent={currentComponent}
        setCurrentComponent={setCurrentComponent}
      />
      <main className="ml-16 p-8">
        {renderComponent()}
      </main>
    </div>
  );
}
