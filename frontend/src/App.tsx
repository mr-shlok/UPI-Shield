import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import TestimonialsSection from './components/TestimonialsSection';
import PricingSection from './components/PricingSection';
import SecuritySection from './components/SecuritySection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
// import ProfessionalDashboard from './pages/ProfessionalDashboard';
import ProfessionalDashboardFixed from './pages/ProfessionalDashboardFixed';
import UserDashboard from './pages/UserDashboard';
import TestPage from './pages/TestPage';
import ProtectedRoute from './components/ProtectedRoute.tsx';

// Function to create animated dots
const createAnimatedDots = () => {
  // Create container
  const container = document.createElement('div');
  container.className = 'animated-bg';
  document.body.appendChild(container);
  
  // Create 200 small dots
  for (let i = 0; i < 200; i++) {
    const dot = document.createElement('div');
    dot.className = 'animated-dot';
    
    // Random properties
    const size = Math.random() * 3 + 1; // 1px to 4px
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 200;
    const duration = Math.random() * 200 + 200; // 200s to 400s
    
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${left}%`;
    dot.style.top = `${top}%`;
    dot.style.animationDelay = `-${delay}s`;
    dot.style.animationDuration = `${duration}s`;
    
    container.appendChild(dot);
  }
  
  return container;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [dotContainer, setDotContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    console.log('App component mounted');
    
    // Set a timeout to ensure the splash screen doesn't hang indefinitely
    const timeout = setTimeout(() => {
      console.log('App: Splash screen timeout reached');
      setIsLoading(false);
      
      // Create animated dots after splash screen
      if (window.location.pathname === '/') {
        console.log('Creating animated dots');
        const container = createAnimatedDots();
        setDotContainer(container);
      }
    }, 5000); // 5 second timeout

    return () => {
      clearTimeout(timeout);
      // Clean up dots
      if (dotContainer && dotContainer.parentNode) {
        dotContainer.parentNode.removeChild(dotContainer);
      }
    };
  }, []);

  const handleSplashComplete = () => {
    console.log('App: Splash screen complete callback');
    setIsLoading(false);
    
    // Create animated dots after splash screen
    if (window.location.pathname === '/') {
      console.log('Creating animated dots after splash complete');
      const container = createAnimatedDots();
      setDotContainer(container);
    }
  };

  if (isLoading) {
    console.log('Showing splash screen');
    return <SplashScreen onLoadingComplete={handleSplashComplete} />;
  }

  console.log('Rendering main app with routes');

  return (
    <div className="min-h-screen bg-gray-900">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test" element={<TestPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Home Route */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <main>
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <TestimonialsSection />
                <PricingSection />
                <SecuritySection />
                <AboutSection />
                <ContactSection />
              </main>
              <Footer />
            </>
          }
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;