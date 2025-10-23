import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SubdomainRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Rileva se siamo su web.finanzacreativa.live
    const hostname = window.location.hostname;
    const isWebSubdomain = hostname === 'web.finanzacreativa.live';
    const isOnRoot = location.pathname === '/';

    // Se siamo sul sottodominio web e sulla root, redirige a /web preservando query params
    if (isWebSubdomain && isOnRoot) {
      const searchParams = location.search; // Preserva parametri UTM
      navigate(`/web${searchParams}`, { replace: true });
    }
  }, [location, navigate]);

  return null; // Non renderizza nulla, solo logica
};

export default SubdomainRedirect;
