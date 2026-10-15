import React, { useState, useEffect } from 'react';
import { DemoRoleSwitcher } from './features/demo-bar/ui/DemoRoleSwitcher.tsx';
import { Header } from './widgets/header/ui/Header.tsx';
import { Footer } from './widgets/footer/ui/Footer.tsx';
import { CartDrawer } from './features/cart/ui/CartDrawer.tsx';
import { AdviceModal } from './widgets/advice-modal/ui/AdviceModal.tsx';
import { HomePage } from './pages/home/ui/HomePage.tsx';
import { StorePage } from './pages/store/ui/StorePage.tsx';
import { ProductDetailPage } from './pages/product-detail/ui/ProductDetailPage.tsx';
import { CheckoutPage } from './pages/checkout/ui/CheckoutPage.tsx';
import { AccountPage } from './pages/account/ui/AccountPage.tsx';
import { SellerPanelPage } from './pages/seller/ui/SellerPanelPage.tsx';
import { AdminDashboardPage } from './pages/admin/ui/AdminDashboardPage.tsx';
import { AboutPage } from './pages/about/ui/AboutPage.tsx';
import { GuidePage } from './pages/guide/ui/GuidePage.tsx';
import { HelpPage } from './pages/help/ui/HelpPage.tsx';
import { AuthPage } from './pages/auth/ui/AuthPage.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');
  const [isAdviceOpen, setIsAdviceOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const renderContent = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage onNavigate={navigate} onOpenAdvice={() => setIsAdviceOpen(true)} />;
    }
    if (currentPath.startsWith('/tienda')) {
      const match = currentPath.match(/categoria=([^&]+)/);
      const cat = match ? match[1] : 'all';
      return <StorePage initialCategory={cat} onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/producto/')) {
      const slug = currentPath.replace('/producto/', '');
      return <ProductDetailPage slug={slug} onNavigate={navigate} onOpenAdvice={() => setIsAdviceOpen(true)} />;
    }
    if (currentPath === '/checkout') return <CheckoutPage onNavigate={navigate} />;
    if (currentPath === '/mi-cuenta') return <AccountPage onNavigate={navigate} />;
    if (currentPath === '/panel') return <SellerPanelPage />;
    if (currentPath === '/admin') return <AdminDashboardPage />;
    if (currentPath === '/nosotras') return <AboutPage onNavigate={navigate} />;
    if (currentPath === '/guia') return <GuidePage onNavigate={navigate} onOpenAdvice={() => setIsAdviceOpen(true)} />;
    if (currentPath === '/ayuda') return <HelpPage onNavigate={navigate} onOpenAdvice={() => setIsAdviceOpen(true)} />;
    if (currentPath === '/iniciar-sesion' || currentPath === '/registro') return <AuthPage onNavigate={navigate} />;

    return <StorePage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDFB] text-[#272329]">
      <DemoRoleSwitcher />
      <Header currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1">{renderContent()}</main>
      <Footer onNavigate={navigate} />
      <CartDrawer
        onNavigateCheckout={() => navigate('/checkout')}
        onNavigateStore={() => navigate('/tienda')}
      />
      <AdviceModal isOpen={isAdviceOpen} onClose={() => setIsAdviceOpen(false)} />
    </div>
  );
}
