import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const LandingNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/education');
    } else {
      navigate('/auth');
    }
  };

  const navLinks = [
    { label: 'Come Funziona', href: '#how-it-works' },
    { label: 'Caratteristiche', href: '#features' },
    { label: 'Prezzi', href: '#pricing' },
    { label: 'Testimonianze', href: '#testimonials' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Bitcoin Academy
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!user && (
              <Button variant="ghost" onClick={handleLogin} className="text-slate-300 hover:text-white hover:bg-slate-800">
                Accedi
              </Button>
            )}
            <Button onClick={handleGetStarted} className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white">
              {user ? 'Vai ai Corsi' : 'Inizia Gratis'}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-t border-slate-800"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-slate-400 hover:text-white transition-colors py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-800">
                {!user && (
                  <Button variant="outline" onClick={handleLogin} className="w-full border-slate-700 text-slate-300">
                    Accedi
                  </Button>
                )}
                <Button onClick={handleGetStarted} className="w-full bg-gradient-to-r from-purple-500 to-violet-600">
                  {user ? 'Vai ai Corsi' : 'Inizia Gratis'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
