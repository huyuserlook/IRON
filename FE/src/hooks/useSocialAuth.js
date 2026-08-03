import { useCallback, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { useAuth } from "./useAuth";

let facebookSdkPromise = null;
let facebookSdkInitializedFor = null;

const loadFacebookSdk = (appId) => {
  if (!appId) {
    return Promise.reject(new Error("Thiếu VITE_FACEBOOK_APP_ID"));
  }

  if (window.FB && facebookSdkInitializedFor === appId) {
    return Promise.resolve(window.FB);
  }

  if (!facebookSdkPromise) {
    facebookSdkPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById("facebook-jssdk");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.FB), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Không tải được Facebook SDK")),
          { once: true },
        );
        return;
      }

      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.onload = () => resolve(window.FB);
      script.onerror = () => reject(new Error("Không tải được Facebook SDK"));
      document.body.appendChild(script);
    });
  }

  return facebookSdkPromise
    .then((FB) => {
      if (!FB) {
        throw new Error("Facebook SDK không khả dụng");
      }

      if (facebookSdkInitializedFor !== appId) {
        FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: "v20.0",
        });
        facebookSdkInitializedFor = appId;
      }

      return FB;
    })
    .catch((error) => {
      facebookSdkPromise = null;
      throw error;
    });
};

const fetchGoogleProfile = async (accessToken) => {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không lấy được thông tin Google");
  }

  return response.json();
};

export const useSocialAuth = (redirectTo = "/") => {
  const { handleSocialLogin } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState(null);
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID || "";

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
    setLoadingProvider("google");
    googleLogin();
  }, [googleLogin, loadingProvider]);

  const handleFacebookLogin = useCallback(async () => {
    if (loadingProvider) {
      return;
    }

    if (!facebookAppId) {
      toast.error("Thiếu VITE_FACEBOOK_APP_ID");
      return;
    }

    setLoadingProvider("facebook");

    try {
      const FB = await loadFacebookSdk(facebookAppId);

      const authResponse = await new Promise((resolve, reject) => {
        FB.login(
          (response) => {
            if (!response?.authResponse) {
              reject(new Error("Bạn đã hủy đăng nhập Facebook"));
              return;
            }
            resolve(response.authResponse);
          },
          {
            scope: "email,public_profile",
            return_scopes: true,
          },
        );
      });

      const profile = await new Promise((resolve, reject) => {
        FB.api(
          "/me",
          { fields: "id,name,email,picture.width(320).height(320)" },
          (user) => {
            if (!user || user.error) {
              reject(
                new Error(
                  user?.error?.message || "Không lấy được thông tin Facebook",
                ),
              );
              return;
            }
            resolve(user);
          },
        );
      });

      if (!profile.email) {
        throw new Error("Tài khoản Facebook chưa cấp email");
      }

      await finishSocialLogin(
        {
          email: profile.email,
          fullName: profile.name,
          avatarUrl: profile.picture?.data?.url,
          providerId: authResponse.userID || profile.id,
          provider: "FACEBOOK",
        },
        "Đăng nhập Facebook thành công",
      );
    } catch (error) {
      toast.error(error?.message || "Đăng nhập Facebook thất bại");
    } finally {
      setLoadingProvider(null);
    }
  }, [facebookAppId, finishSocialLogin, loadingProvider]);

  return {
    handleGoogleLogin,
    handleFacebookLogin,
    loadingProvider,
  };
};
