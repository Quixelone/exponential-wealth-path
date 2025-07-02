
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, TrendingUp, Settings, FileText, Bell, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AppHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Configurazioni', href: '/configurations', icon: Settings },
    { name: 'Report', href: '/reports', icon: FileText },
    { name: 'Promemoria', href: '/reminders', icon: Bell },
    { name: 'Utenti', href: '/user-management', icon: Users },
    { name: 'Impostazioni', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-primary font-bold text-xl hover:opacity-80 transition-opacity"
            >
              <TrendingUp className="h-8 w-8" />
              <span className="hidden sm:block">Investment Tracker</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`nav-button ${
                  isActive(item.href) ? 'nav-button-active' : 'nav-button-inactive'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="hidden sm:flex"
            >
              Esci
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full nav-button justify-start ${
                    isActive(item.href) ? 'nav-button-active' : 'nav-button-inactive'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {user?.email}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="w-full justify-start"
                >
                  Esci
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
