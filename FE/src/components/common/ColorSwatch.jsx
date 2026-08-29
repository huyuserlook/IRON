const parseHexAlpha = (hex) => {
  // handles #RRGGBBAA
  if (!hex || typeof hex !== "string") return null;
  const h = hex.replace("#", "");
  if (h.length === 8) {
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const a = parseInt(h.substring(6, 8), 16) / 255;
    return { r, g, b, a };
  }
  return null;
};

const ColorSwatch = ({ color, size = 18, className = "" }) => {
  const swatchSize = `${size}px`;
  let isTransparent = false;
  let style = {};

  if (!color) isTransparent = true;
  const lower = (color || "").toLowerCase();
  if (
    lower === "transparent" ||
    lower === "trong suot" ||
    lower === "trong suốt"
  ) {
    isTransparent = true;
  }

  const parsed = parseHexAlpha(color);
  if (parsed) {
    if (parsed.a === 0) isTransparent = true;
    style.backgroundColor = `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})`;
  } else if (!isTransparent && color) {
    style.backgroundColor = color;
  }

  return (
    <span
      className={`inline-block rounded-full overflow-hidden border ${className}`}
      style={{ width: swatchSize, height: swatchSize }}
      aria-hidden
    >
      {isTransparent ? (
        <span className="checkerboard w-full h-full block" />
      ) : (
        <span className="w-full h-full block" style={style} />
      )}
    </span>
  );
};

export default ColorSwatch;
