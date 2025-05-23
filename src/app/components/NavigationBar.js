"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";
import Link from "next/link";

/**
 * NavigationBar component that provides consistent navigation across the application
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Type of navigation: "breadcrumbs" or "back"
 * @param {Array} props.breadcrumbs - Array of breadcrumb items (for breadcrumbs type)
 * @param {string} props.backUrl - URL to navigate back to (for back type)
 * @param {string} props.title - Current page title
 * @param {Object} props.params - URL parameters to maintain during navigation
 * @param {string} props.className - Additional CSS classes
 */
const NavigationBar = ({ 
  type = "back", 
  breadcrumbs = [], 
  backUrl = "", 
  title = "",
  params = {},
  className = ""
}) => {
  const router = useRouter();

  // Construct URL with parameters
  const constructUrl = (baseUrl) => {
    const queryParams = new URLSearchParams();
    
    // Add all params to the URL
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Handle back button click
  const handleBack = () => {
    if (backUrl) {
      router.push(constructUrl(backUrl));
    } else {
      router.back();
    }
  };

  return (
    <div className={`bg-black p-3 flex items-center ${className}`}>
      {type === "back" ? (
        // Back button navigation
        <>
          <button 
            onClick={handleBack} 
            className="text-white mr-3 p-2 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-brand-pink" />
          </button>
          {title && <h1 className="text-white font-medium">{title}</h1>}
        </>
      ) : (
        // Breadcrumbs navigation
        <div className="flex items-center text-sm overflow-x-auto whitespace-nowrap py-1 scrollbar-hide">
          <Link 
            href={constructUrl("/home")} 
            className="text-brand-pink hover:text-pink-400 transition-colors flex items-center"
          >
            <Home className="w-4 h-4 mr-1" />
            <span>Home</span>
          </Link>
          
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <span className="mx-2 text-gray-500">/</span>
              {index === breadcrumbs.length - 1 ? (
                // Current page (not clickable)
                <span className="text-white">{crumb.label}</span>
              ) : (
                // Clickable breadcrumb
                <Link 
                  href={constructUrl(crumb.url)} 
                  className="text-brand-pink hover:text-pink-400 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavigationBar;
