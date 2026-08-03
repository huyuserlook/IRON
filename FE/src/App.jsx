import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import store from "./store";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
  );
}

export default App;
