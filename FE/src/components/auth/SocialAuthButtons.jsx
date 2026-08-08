import { Chrome, LoaderCircle } from "lucide-react";

const SocialAuthButtons = ({
  onGoogle,
  loadingProvider = null,
  className = "",
}) => {
  const isGoogleLoading = loadingProvider === "google";

  const buttonBase =
    "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed";

  return (
    <div className={`grid gap-4 ${className}`}>
      <button
        type="button"
        onClick={onGoogle}
        disabled={loadingProvider != null}
        className={`${buttonBase} border border-white/30 bg-white/45 text-[#1f1f1f] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.45)] backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/55 focus:ring-black/20`}
      >
        {isGoogleLoading ? (
          <LoaderCircle size={18} className="animate-spin text-[#d64531]" />
        ) : (
          <Chrome size={18} className="text-[#d64531]" />
        )}
        Google
      </button>
    </div>
  );
};

export default SocialAuthButtons;
