const Input = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  error = "",
  helperText = "",
  icon = null,
  suffix = null,
  className = "",
  inputClassName = "",
  labelClassName = "",
  variant = "default",
  radiusClassName = "",
  ...props
}) => {
  const isLine = variant === "line";
  const baseInputClass = isLine
    ? "w-full bg-transparent border-0 border-b border-black/25 rounded-none py-2.5 transition-all duration-200 text-sm focus:outline-none focus:ring-0 focus:border-black/60"
    : `w-full border rounded-xl py-3 transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
        error ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-orange-200"
      }`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          className={`block text-sm font-medium text-gray-700 mb-1.5 ${labelClassName}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 ${
              isLine ? "translate-x-0" : "left-4"
            }`}
          >
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
            ${baseInputClass}
            ${radiusClassName}
            ${icon ? (isLine ? "pl-8" : "pl-11") : isLine ? "pl-0" : "pl-4"}
            ${suffix ? "pr-12" : isLine ? "pr-0" : "pr-4"}
            ${inputClassName}
          `}
          {...props}
        />
        {suffix && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};

export default Input;
