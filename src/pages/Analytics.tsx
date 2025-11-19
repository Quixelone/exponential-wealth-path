import { Helmet } from "react-helmet";
import { AnalyticsLayout } from "@/components/analytics/AnalyticsLayout";

const Analytics = () => {
  return (
    <>
      <Helmet>
        <title>Analytics | Investment Tracker</title>
        <meta name="description" content="Analisi dettagliata delle performance del tuo portafoglio" />
      </Helmet>
      <AnalyticsLayout />
    </>
  );
};

export default Analytics;
