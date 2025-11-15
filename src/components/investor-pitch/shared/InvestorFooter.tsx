import { Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import { Linkedin, Twitter, Mail } from 'lucide-react';

export const InvestorFooter = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Il primo fondo pensione Bitcoin in Italia. Investimenti sicuri con la Wheel Strategy.
            </p>
          </div>

          {/* For Investors */}
          <div>
            <h4 className="font-semibold mb-4">For Investors</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/pitch/business-angel" className="hover:text-foreground transition-colors">
                  Business Angels
                </Link>
              </li>
              <li>
                <Link to="/pitch/venture-capital" className="hover:text-foreground transition-colors">
                  Venture Capital
                </Link>
              </li>
              <li>
                <a href="#contact" className="hover:text-foreground transition-colors">
                  Contact Investor Relations
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-foreground transition-colors">
                  Investment Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com/company/finanzacreativa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/finanzacreativa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:investors@finanzacreativa.live"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              investors@finanzacreativa.live
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">
            <strong>IMPORTANT DISCLAIMER:</strong> This presentation is for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any securities. Any such offer or solicitation will be made only by means of a confidential private placement memorandum and in accordance with applicable securities laws. Past performance is not indicative of future results. Investing in early-stage companies involves significant risks, including loss of principal. By proceeding, you represent that you are an accredited investor.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Finanzacreativa S.r.l. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
