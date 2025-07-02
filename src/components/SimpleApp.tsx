
import React, { useState, useEffect } from 'react';
import { TrendingUp, Menu, X, User, LogOut, Settings, BarChart3, FileText, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import InvestmentChart from '@/components/InvestmentChart';
import InvestmentSummary from '@/components/InvestmentSummary';
import ReportTable from '@/components/ReportTable';
import PaymentReminders from '@/components/PaymentReminders';
import NotificationTester from '@/components/NotificationTester';
import Auth from '@/pages/Auth';

const SimpleApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  
  const {
    config,
    updateConfig,
    investmentData,
    dailyReturns,
    updateDailyReturn,
    removeDailyReturn,
    exportToCSV,
    currentConfigId,
    currentConfigName,
    savedConfigs,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    loadSavedConfiguration,
    deleteConfiguration,
    supabaseLoading,
    summary,
    dailyPACOverrides,
    updatePACForDay,
    removePACOverride,
    hasUnsavedChanges
  } = useInvestmentCalculator();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      // Will show auth component
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{
            width: '48px',
            height: '48px',
            border: '2px solid #e2e8f0',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto 1rem'
          }}></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleLogout = async () => {
    if (hasUnsavedChanges) {
      const confirmLogout = window.confirm(
        'Hai modifiche non salvate. Sei sicuro di voler uscire senza salvare?'
      );
      if (!confirmLogout) return;
    }
    await signOut();
  };

  const displayName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile?.email || 'Utente';

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'reports', label: 'Report', icon: FileText },
    { id: 'reminders', label: 'Promemoria', icon: Bell },
    { id: 'settings', label: 'Impostazioni', icon: Settings }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header fisso */}
      <header className="header">
        <div className="container">
          <div className="flex items-center justify-between" style={{ height: '64px' }}>
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUp style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  Finanza Creativa
                </h1>
              </div>
              {hasUnsavedChanges && (
                <span style={{
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  Modifiche non salvate
                </span>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon style={{ width: '16px', height: '16px' }} />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <User style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                <span className="text-sm font-medium text-gray-700">{displayName}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="hidden md:flex btn btn-secondary"
              >
                <LogOut style={{ width: '16px', height: '16px' }} />
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X style={{ width: '20px', height: '20px' }} />
                ) : (
                  <Menu style={{ width: '20px', height: '20px' }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <User style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
              <span className="font-medium text-gray-900">{displayName}</span>
            </div>
          </div>

          <nav className="mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition mb-2 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon style={{ width: '20px', height: '20px' }} />
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full btn btn-secondary"
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Investimenti</h2>
              <p className="text-gray-600">Panoramica della tua strategia di investimento</p>
            </div>

            {/* Stats Grid */}
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-value">€{summary.final.finalCapital.toLocaleString()}</div>
                <div className="stat-label">Valore Finale</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-success">+{summary.final.totalReturn.toFixed(1)}%</div>
                <div className="stat-label">Rendimento Totale</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">€{summary.final.totalInvested.toLocaleString()}</div>
                <div className="stat-label">Totale Investito</div>
              </div>
              <div className="stat-card">
                <div className="stat-value text-success">€{summary.final.totalInterest.toLocaleString()}</div>
                <div className="stat-label">Profitto</div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-1 md:grid-3" style={{ gap: '2rem' }}>
              {/* Configuration */}
              <div>
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Configurazione</h3>
                  <ConfigurationPanel
                    config={config}
                    onConfigChange={updateConfig}
                    customReturns={dailyReturns}
                    onUpdateDailyReturn={updateDailyReturn}
                    onRemoveDailyReturn={removeDailyReturn}
                    onExportCSV={exportToCSV}
                    savedConfigs={savedConfigs}
                    onLoadConfiguration={loadSavedConfiguration}
                    onDeleteConfiguration={deleteConfiguration}
                    onSaveConfiguration={saveCurrentConfiguration}
                    onUpdateConfiguration={updateCurrentConfiguration}
                    currentConfigId={currentConfigId}
                    currentConfigName={currentConfigName}
                    supabaseLoading={supabaseLoading}
                    isAdmin={userProfile?.role === 'admin'}
                    dailyPACOverrides={dailyPACOverrides}
                    onUpdatePACForDay={updatePACForDay}
                    onRemovePACOverride={removePACOverride}
                    hasUnsavedChanges={hasUnsavedChanges}
                  />
                </div>
              </div>

              {/* Charts and Summary */}
              <div style={{ gridColumn: 'span 2' }}>
                <div className="card mb-6">
                  <h3 className="text-lg font-semibold mb-4">Sommario</h3>
                  <InvestmentSummary summary={summary} currency={config.currency} />
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Grafico Investimenti</h3>
                  <InvestmentChart data={investmentData} currency={config.currency} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Report e Analisi</h2>
              <p className="text-gray-600">Analisi dettagliate dei tuoi investimenti</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tabella Dettagliata</h3>
                <button onClick={exportToCSV} className="btn btn-primary">
                  <FileText style={{ width: '16px', height: '16px' }} />
                  Esporta CSV
                </button>
              </div>
              <ReportTable 
                data={investmentData} 
                currency={config.currency}
                onExportCSV={exportToCSV}
                onUpdateDailyReturnInReport={updateDailyReturn}
                onUpdatePACInReport={updatePACForDay}
                onRemovePACOverride={removePACOverride}
                defaultPACAmount={config.pacConfig.amount}
                investmentStartDate={config.pacConfig.startDate}
              />
            </div>
          </div>
        )}

        {activeTab === 'reminders' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Promemoria Pagamenti</h2>
              <p className="text-gray-600">Gestisci i tuoi promemoria per i pagamenti periodici</p>
            </div>

            <div className="card">
              <PaymentReminders />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Impostazioni Sistema</h2>
              <p className="text-gray-600">Configura e testa le notifiche, gestisci le preferenze del sistema</p>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Test Notifiche WhatsApp</h3>
              <NotificationTester />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SimpleApp;
