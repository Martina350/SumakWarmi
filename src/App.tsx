import React, { useState, useEffect } from 'react';
import { WorkspacePage } from './pages/workspace/ui/WorkspacePage.tsx';
import { StaffLoginPage } from './pages/auth/ui/StaffLoginPage.tsx';
import { useStaffSessionStore } from './entities/session/model/staffSessionStore.ts';
import { cartActions } from './entities/cart/index.ts';
import { operations } from './shared/domain/operations.ts';
import { storageWarnings } from './shared/lib/createStore.ts';
import { Header } from './widgets/header/ui/Header.tsx';
import { Footer } from './widgets/footer/ui/Footer.tsx';
import { CartDrawer } from './features/cart/ui/CartDrawer.tsx';
import { AdviceModal } from './widgets/advice-modal/ui/AdviceModal.tsx';
import { HomePage } from './pages/home/ui/HomePage.tsx';
import { StorePage } from './pages/store/ui/StorePage.tsx';
import { ProductDetailPage } from './pages/product-detail/ui/ProductDetailPage.tsx';
import { CheckoutPage } from './pages/checkout/ui/CheckoutPage.tsx';
import { AccountPage } from './pages/account/ui/AccountPage.tsx';
import { AboutPage } from './pages/about/ui/AboutPage.tsx';
import { GuidePage } from './pages/guide/ui/GuidePage.tsx';
import { HelpPage } from './pages/help/ui/HelpPage.tsx';
import { AuthPage } from './pages/auth/ui/AuthPage.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState(
    window.location.hash.slice(1) || '/',
  );
  const [isAdviceOpen, setIsAdviceOpen] = useState(false);
  const { currentUser: staffUser } = useStaffSessionStore();
  const isInternal =
    currentPath === '/equipo/login' ||
    /^\/(admin|panel|vendedor)(\/|$)/.test(currentPath);
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    const tick = () => {
      try {
        operations.expireReservations();
      } catch (e) {
        setStorageError(String(e));
      }
    };
    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isInternal) {
      cartActions.closeDrawer();
      setIsAdviceOpen(false);
    }
  }, [isInternal]);

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

  useEffect(() => {
    if (isInternal && staffUser && currentPath !== '/equipo/login') {
      const base = staffUser.role === 'ADMIN' ? '/admin' : '/vendedor';
      if (!(currentPath === base || currentPath.startsWith(`${base}/`)))
        navigate(`${base}/dashboard`);
    }
  }, [isInternal, currentPath, staffUser?.role]);

  const renderContent = () => {
    if (currentPath === '/' || currentPath === '') {
      return (
        <HomePage
          onNavigate={navigate}
          onOpenAdvice={() => setIsAdviceOpen(true)}
        />
      );
    }
    if (currentPath.startsWith('/tienda')) {
      const match = currentPath.match(/categoria=([^&]+)/);
      const cat = match ? match[1] : 'all';
      return <StorePage initialCategory={cat} onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/producto/')) {
      const slug = currentPath.replace('/producto/', '');
      return (
        <ProductDetailPage
          slug={slug}
          onNavigate={navigate}
          onOpenAdvice={() => setIsAdviceOpen(true)}
        />
      );
    }
    if (currentPath === '/checkout')
      return <CheckoutPage onNavigate={navigate} />;
    if (currentPath === '/mi-cuenta')
      return <AccountPage onNavigate={navigate} />;
    if (currentPath === '/nosotras') return <AboutPage onNavigate={navigate} />;
    if (currentPath === '/guia')
      return (
        <GuidePage
          onNavigate={navigate}
          onOpenAdvice={() => setIsAdviceOpen(true)}
        />
      );
    if (currentPath === '/ayuda')
      return (
        <HelpPage
          onNavigate={navigate}
          onOpenAdvice={() => setIsAdviceOpen(true)}
        />
      );
    if (currentPath === '/iniciar-sesion' || currentPath === '/registro')
      return <AuthPage onNavigate={navigate} />;

    return <StorePage onNavigate={navigate} />;
  };

  if (isInternal) {
    if (!staffUser || currentPath === '/equipo/login')
      return <StaffLoginPage onNavigate={navigate} />;
    return <WorkspacePage path={currentPath} onNavigate={navigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#241B24]">
      <Header currentPath={currentPath} onNavigate={navigate} />
      {storageError && (
        <p role="alert" className="p-4 bg-[#FDEBED] text-[#B42336] text-sm">
          {storageError}
        </p>
      )}
      {!!storageWarnings.length && (
        <p role="alert" className="p-4 bg-[#FFF1D9] text-[#9A6200] text-sm">
          {storageWarnings.join(' ')}
        </p>
      )}
      <main className="flex-1">{renderContent()}</main>
      <Footer onNavigate={navigate} />
      <CartDrawer
        onNavigateCheckout={() => navigate('/checkout')}
        onNavigateStore={() => navigate('/tienda')}
      />
      <AdviceModal
        isOpen={isAdviceOpen}
        onClose={() => setIsAdviceOpen(false)}
      />
    </div>
  );
}
