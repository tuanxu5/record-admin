import { useEffect, useRef } from "react";

export const Dropdown = ({ isOpen, onClose, children, className = "", position }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest(".dropdown-toggle")
      ) {
        onClose();
      }
    };
    setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const style = position 
    ? { 
        position: 'fixed',
        top: `${position.top}px`,
        right: `${position.right}px`,
        zIndex: 999999
      }
    : {
        zIndex: 999999
      };

  return (
    <div
      ref={dropdownRef}
      className={`${position ? 'fixed' : 'absolute'} z-99999 ${!position ? 'right-0 top-full mt-1' : ''} rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
