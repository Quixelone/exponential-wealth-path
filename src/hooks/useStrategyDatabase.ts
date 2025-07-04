const loadStrategies = useCallback(async (): Promise<void> => {
    if (loading) return;
    
    console.log('🔄 Caricamento strategie...');
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('❌ Utente non autenticato');
        setLoading(false);
        return;
      }

      const { data: configs, error } = await supabase
        .from('configs')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching configs:', error);
        setLoading(false);
        return;
      }

      const strategiesData: Strategy[] = [];

      console.log(`📊 Trovate ${configs?.length || 0} configurazioni`);

      for (const config of configs || []) {
        try {
          // Carica daily returns
          const { data: dailyReturns } = await supabase
            .from('daily_returns')
            .select('*')
            .eq('config_id', config.id);

          // Carica daily PAC overrides
          const { data: dailyPACOverrides } = await supabase
            .from('daily_pac_overrides')
            .select('*')
            .eq('config_id', config.id);

          const dailyReturnsMap: { [day: number]: number } = {};
          (dailyReturns || []).forEach(dr => {
            dailyReturnsMap[dr.day] = dr.return_rate;
          });

          const dailyPACOverridesMap: { [day: number]: number } = {};
          (dailyPACOverrides || []).forEach(po => {
            dailyPACOverridesMap[po.day] = po.pac_amount;
          });

          strategiesData.push({
            id: config.id,
            name: config.name,
            config: {
              initialCapital: config.initial_capital,
              timeHorizon: config.time_horizon,
              dailyReturnRate: config.daily_return_rate,
              currency: config.currency as 'EUR' | 'USD' | 'USDT',
              pacConfig: {
                amount: config.pac_amount,
                frequency: (config.pac_frequency || 'monthly') as 'daily' | 'weekly' | 'monthly' | 'custom',
                customDays: config.pac_custom_days,
                startDate: new Date(config.pac_start_date || new Date())
              }
            },
            dailyReturns: dailyReturnsMap,
            dailyPACOverrides: dailyPACOverridesMap,
            created_at: config.created_at,
            updated_at: config.updated_at
          });
        } catch (configError) {
          console.error(`Error processing config ${config.id}:`, configError);
        }
      }

      console.log(`✅ Caricate ${strategiesData.length} strategie`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, supabase]);