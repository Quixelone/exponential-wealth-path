import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/brand/Logo';

interface InvestorNavbarProps {
  variant: 'business-angel' | 'venture-capital';
}

export const InvestorNavbar = ({ variant }: InvestorNavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = variant === 'business-angel' 
    ? [
        { label: 'Story', href: '#story' },
        { label: 'Problem', href: '#problem' },
        { label: 'Team', href: '#team' },
        { label: 'Vision', href: '#vision' },
        { label: 'The Ask', href: '#ask' }
      ]
    : [
        { label: 'Market', href: '#market' },
        { label: 'Traction', href: '#traction' },
        { label: 'Economics', href: '#economics' },
        { label: 'Scalability', href: '#scalability' },
        { label: 'Exit', href: '#exit' }
      ];
  
  const ctaText = variant === 'business-angel'
    ? 'Download One-Pager'
    : 'Download Data Room';
  
  const pdfUrl = variant === 'business-angel'
    ? '/docs/investor/business-angel-onepager.pdf'
    : '/docs/investor/venture-capital-executive-summary.pdf';

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href={pdfUrl} download>
                <Download className="h-4 w-4 mr-2" />
                {ctaText}
              </a>
            </Button>
            <Button variant="default" size="sm" asChild>
              <a href="#contact">Contact Us</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <a href={pdfUrl} download>
                <Download className="h-4 w-4 mr-2" />
                {ctaText}
              </a>
            </Button>
            <Button className="w-full" asChild>
              <a href="#contact">Contact Us</a>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
