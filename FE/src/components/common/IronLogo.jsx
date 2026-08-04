import { Link } from "react-router-dom";
import logoImg from "../../assets/img/LOGO.png";

const IronLogo = ({
  to = "/",
  size = "md",
  className = "",
  asLink = true,
  hideText = false,
  ...props
}) => {
  const sizes = {
    sm: {
      icon: "h-9 w-9 sm:h-10 sm:w-10",
      text: "text-3xl sm:text-4xl",
      gap: "gap-1.5",
    },
    md: {
      icon: "h-12 w-12 sm:h-16 sm:w-16",
      text: "text-4xl sm:text-5xl",
      gap: "gap-2",
    },
    lg: {
      icon: "h-16 w-16 sm:h-24 sm:w-24 lg:h-[120px] lg:w-[120px]",
      text: "text-5xl sm:text-6xl lg:text-[80px]",
      gap: "gap-2 sm:gap-3",
    },
  };

  const s = sizes[size];

  const content = (
    <>
      <img
        src={logoImg}
        alt="Iron logo"
        className={`${s.icon} object-contain select-none`}
      />
      {!hideText && (
        <span
          className={`font-teko font-semibold leading-none tracking-wide text-iron-yellow ${s.text}`}
        >
          IRON
        </span>
      )}
    </>
  );
  const classes = `inline-flex items-center ${s.gap} ${className}`;
  if (!asLink) {
    return (
      <div className={classes} aria-label="Iron Moto" {...props}>
        {content}
      </div>
    );
  }
  return (
    <Link to={to} className={classes} aria-label="Iron Moto" {...props}>
      {content}
    </Link>
  );
};

export default IronLogo;
