"use client";
import { useState } from "react";
import { Home, Info, Phone, Folder } from "lucide-react";
import FolderStructureLayout from "../components/FolderStructureLayout";

const Sidebar = ({ currentComponent, setCurrentComponent }) => {
  const [isHovered, setIsHovered] = useState(false);
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
          className={`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded ${
            currentComponent === "About" ? "bg-gray-700" : ""
          }`}
          onClick={() => setCurrentComponent("About")}
        >
          <Info className="w-6 h-6" />
          {isHovered && <span>About</span>}
        </li>
        <li
          className={`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded ${
            currentComponent === "Contact" ? "bg-gray-700" : ""
          }`}
          onClick={() => setCurrentComponent("Contact")}
        >
          <Phone className="w-6 h-6" />
          {isHovered && <span>Contact</span>}
        </li>
        <li
          className={`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded ${
            currentComponent === "FolderStructureLayout" ? "bg-gray-700" : ""
          }`}
          onClick={() => setCurrentComponent("FolderStructureLayout")}
        >
          <Folder className="w-6 h-6" />
          {isHovered && <span>Folder Structure</span>}
        </li>
      </ul>
    </div>
  );
};

export default function Page() {
  const [currentComponent, setCurrentComponent] = useState("FolderStructureLayout");

  const renderComponent = () => {
    switch (currentComponent) {
      case "Home":
        return <div className="p-4 text-lg">这是首页组件</div>;
      case "About":
        return <div className="p-4 text-lg">这是关于页面组件</div>;
      case "Contact":
        return <div className="p-4 text-lg">这是联系页面组件</div>;
      case "FolderStructureLayout":
        return (
          <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
            <FolderStructureLayout />
          </div>
        );
      default:
        return <div className="p-4 text-lg">未知组件</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar
        currentComponent={currentComponent}
        setCurrentComponent={setCurrentComponent}
      />
      {/* 主内容区域 */}
      <main className="ml-16 p-8">
        {renderComponent()}
      </main>
    </div>
  );
}