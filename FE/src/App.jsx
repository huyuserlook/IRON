import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import store from "./store";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/error/ErrorBoundary";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function App() {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
            <Toaster position="top-right" />
          </ErrorBoundary>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
  );
}

export default App;
