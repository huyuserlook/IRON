const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  disabled = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
    outline: "border-2 border-orange-500 text-orange-500 hover:bg-orange-50",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "hover:bg-gray-100 text-gray-600",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Đang xử lý...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
