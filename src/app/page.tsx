// src\app\page.tsx
"use client";

import { useState } from "react";
import { Home, Info, Phone } from "lucide-react";

const Sidebar = () => {
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
        <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
          <Home className="w-6 h-6" />
          {isHovered && <span>Home</span>}
        </li>
        <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
          <Info className="w-6 h-6" />
          {isHovered && <span>About</span>}
        </li>
        <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded">
          <Phone className="w-6 h-6" />
          {isHovered && <span>Contact</span>}
        </li>
      </ul>
    </div>
  );
};

export default function Page() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-16 p-4 transition-all duration-300">
        <h1 className="text-3xl font-bold">Welcome to Sidebar Navigation</h1>
        <p className="mt-4">Hover over the sidebar to see it expand.</p>
      </main>
    </div>
  );
}
