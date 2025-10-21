import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/brand/Logo';

const LandingNavbar = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => scrollToSection('come-funziona')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Come Funziona
            </button>
            <button 
              onClick={() => scrollToSection('formazione')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Formazione
            </button>
            <button 
              onClick={() => scrollToSection('prezzi')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Prezzi
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              FAQ
            </button>
          </div>

          <Link to="/auth">
            <Button>
              Accedi
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
