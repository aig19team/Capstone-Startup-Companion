import React from 'react';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Signup from './components/Signup';
import Login from './components/Login';
import ChatInterface from './components/ChatInterface';
import { auth } from './lib/auth';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const user = await auth.getCurrentUser();
      setIsAuthenticated(!!user);
      setIsCheckingAuth(false);
    };

    checkAuth();

    // Listen to auth state changes
    const { data: authListener } = auth.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Protect chat route - redirect to login if not authenticated
  useEffect(() => {
    if (!isCheckingAuth && currentPage === 'chat' && !isAuthenticated) {
      setCurrentPage('login');
    }
  }, [currentPage, isAuthenticated, isCheckingAuth]);

  const renderPage = () => {
    // Show loading while checking auth
    if (isCheckingAuth) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      );
    }

    switch (currentPage) {
      case 'chat':
        // Protected route - only accessible when authenticated
        if (!isAuthenticated) {
          return (
            <>
              <Header onNavigate={setCurrentPage} />
              <Login onNavigate={setCurrentPage} />
              <Footer onNavigate={setCurrentPage} />
            </>
          );
        }
        return <ChatInterface onNavigate={setCurrentPage} />;
      case 'signup':
        return (
          <>
            <Header onNavigate={setCurrentPage} />
            <Signup onNavigate={setCurrentPage} />
            <Footer onNavigate={setCurrentPage} />
          </>
          );
      case 'login':
        return (
          <>
            <Header onNavigate={setCurrentPage} />
            <Login onNavigate={setCurrentPage} />
            <Footer onNavigate={setCurrentPage} />
          </>
        );
       default:
        return (
          <>
            <Header onNavigate={setCurrentPage} />
            <Hero onNavigate={setCurrentPage} />
            <Benefits />
            <HowItWorks />
            <Pricing onNavigate={setCurrentPage} />
            <Testimonials />
            <FAQ />
            <Footer onNavigate={setCurrentPage} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {renderPage()}
    </div>
  );
}

export default App;