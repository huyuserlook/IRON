import { useCallback, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { useAuth } from "./useAuth";

const fetchGoogleProfile = async (accessToken) => {
  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Không lấy được thông tin Google");
  }

  return response.json();
};

export const useSocialAuth = (redirectTo = "/") => {
  const { handleSocialLogin } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const finishSocialLogin = useCallback(
    async (payload, successMessage) => {
      const ok = await handleSocialLogin(payload, redirectTo);
      if (ok) {
        toast.success(successMessage);
        return true;
      }
      toast.error("Đăng nhập thất bại");
      return false;
    },
    [handleSocialLogin, redirectTo],
  );

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid profile email",
    onSuccess: async (tokenResponse) => {
      try {
        const profile = await fetchGoogleProfile(tokenResponse.access_token);
        await finishSocialLogin(
          {
            email: profile.email,
            fullName: profile.name,
            avatarUrl: profile.picture,
            providerId: profile.sub || profile.id,
            provider: "GOOGLE",
            accessToken: tokenResponse.access_token,
          },
          "Đăng nhập Google thành công",
        );
      } catch (error) {
        toast.error(error?.message || "Đăng nhập Google thất bại");
      } finally {
        setLoadingProvider(null);
      }
    },
    onError: () => {
      toast.error("Đăng nhập Google thất bại");
      setLoadingProvider(null);
    },
  });

  const handleGoogleLogin = useCallback(() => {
    if (loadingProvider) {
      return;
    }
    if (!googleClientId || googleClientId === "YOUR_GOOGLE_CLIENT_ID") {
      toast.error("Thiếu VITE_GOOGLE_CLIENT_ID — cấu hình Google OAuth");
      return;
    }
    setLoadingProvider("google");
    googleLogin();
  }, [googleLogin, loadingProvider]);

  return {
    handleGoogleLogin,
    loadingProvider,
  };
};
