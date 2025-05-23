"use client";

import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state in localStorage
 * @param {string} key - The key to store the value under in localStorage
 * @param {any} initialValue - The initial value to use if no value is stored
 * @returns {[any, Function]} - A stateful value and a function to update it
 */
function useLocalStorage(key, initialValue) {
  // Create state based on value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  // Update stored value if the key changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      console.error(`Error updating from localStorage for key "${key}":`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);
  
  return [storedValue, setValue];
}

export default useLocalStorage;
