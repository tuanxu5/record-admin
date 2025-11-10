import { useState, useRef, useEffect, useMemo } from "react";

const SearchableSelect = ({ 
  label, 
  options = [], 
  value = "", 
  onChange, 
  placeholder = "Chọn...", 
  disabled = false,
  getOptionLabel = (option) => `${option.value || option.id} - ${option.label || option.name || ""}`,
  getOptionValue = (option) => option.value || option.id || "",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter((option) => {
    const label = getOptionLabel(option).toLowerCase();
    const search = searchTerm.toLowerCase();
    return label.includes(search);
  });

  const selectedOption = useMemo(() => {
    if (!value || value === "" || options.length === 0) return null;
    
    return options.find((opt) => {
      const optValue = getOptionValue(opt);
      if (!optValue && optValue !== 0 && optValue !== false) return false;
      return String(optValue).trim() === String(value).trim();
    }) || null;
  }, [options, value, getOptionValue]);
  
  const displayValue = useMemo(() => {
    if (selectedOption) {
      return getOptionLabel(selectedOption);
    }
    if (value) {
      return String(value);
    }
    return "";
  }, [selectedOption, value, getOptionLabel]);
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both button and dropdown menu
      const isClickOutsideButton = buttonRef.current && !buttonRef.current.contains(event.target);
      const isClickOutsideDropdown = dropdownMenuRef.current && !dropdownMenuRef.current.contains(event.target);
      const isClickOutsideContainer = dropdownRef.current && !dropdownRef.current.contains(event.target);
      
      if (isClickOutsideButton && isClickOutsideDropdown && isClickOutsideContainer) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const updatePosition = () => {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width
        });
      }
    };

    if (isOpen) {
      updatePosition();
      // Use click instead of mousedown to allow click events to fire first
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside, true);
      }, 0);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    const optionValue = getOptionValue(option);
    
    if (!optionValue || optionValue === "") {
      setIsOpen(false);
      setSearchTerm("");
      return;
    }
    
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    }
  };

  return (
    <>
      <div className={`relative ${className}`} ref={dropdownRef}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className={`w-full p-2 md:p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left flex items-center gap-2 ${
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <span className={`flex-1 truncate ${value ? "" : "text-gray-400 dark:text-gray-400"}`}>
              {value ? (displayValue || String(value)) : placeholder}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {value && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Xóa chọn"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {isOpen && (
        <div 
          ref={dropdownMenuRef}
          className="fixed z-[9999] bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl max-h-[280px] overflow-hidden"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-[220px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const isSelected = String(optionValue) === String(value) && value !== "";

                return (
                  <div
                    key={optionValue || index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 ${
                      isSelected ? "bg-blue-100 dark:bg-gray-700 font-semibold" : ""
                    }`}
                  >
                    {optionLabel}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                Không tìm thấy
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchableSelect;

