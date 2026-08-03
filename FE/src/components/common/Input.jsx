const Input = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  error = "",
  icon = null,
  className = "",
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`
            w-full border rounded-xl py-3 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent
            ${icon ? "pl-11 pr-4" : "px-4"}
            ${
              error
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-orange-200"
            }
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
