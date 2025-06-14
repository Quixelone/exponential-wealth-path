
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, ShoppingCart, DollarSign, Activity } from 'lucide-react';

const AuthIllustration: React.FC = () => {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary/5 to-secondary/10 p-12 min-h-screen">
      <div className="max-w-lg w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6">
            <Activity className="h-16 w-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Gestisci i tuoi investimenti
          </h2>
          <p className="text-muted-foreground text-lg">
            Piattaforma avanzata per il controllo delle tue finanze
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">1.2k</div>
              <div className="text-sm text-muted-foreground">Utenti Attivi</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">+15%</div>
              <div className="text-sm text-muted-foreground">Crescita</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">856</div>
              <div className="text-sm text-muted-foreground">Transazioni</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">€2.5M</div>
              <div className="text-sm text-muted-foreground">Gestito</div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom illustration text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Unisciti a migliaia di investitori che si fidano di noi
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthIllustration;
