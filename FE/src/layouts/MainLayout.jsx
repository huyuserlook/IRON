import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const MainLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isHome && <Header />}

      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
