// src/hooks/useScript.js
import { useState, useEffect } from 'react';

// Hook ini akan memuat script dari URL dan memberitahu kita jika sudah selesai
export const useScript = (url) => {
  const [status, setStatus] = useState(url ? 'loading' : 'idle');

  useEffect(() => {
    if (!url) {
      setStatus('idle');
      return;
    }

    let script = document.querySelector(`script[src="${url}"]`);

    if (!script) {
      script = document.createElement('script');
      script.src = url;
      script.async = true;
      document.body.appendChild(script);

      const setAttribute = (key, value) => {
        script.setAttribute(key, value);
      };
      setAttribute('data-status', 'loading');

      script.onload = () => setAttribute('data-status', 'ready');
      script.onerror = () => setAttribute('data-status', 'error');
    }

    const setState = () => {
      setStatus(script.getAttribute('data-status'));
    };

    script.addEventListener('load', setState);
    script.addEventListener('error', setState);

    return () => {
      if (script) {
        script.removeEventListener('load', setState);
        script.removeEventListener('error', setState);
      }
    };
  }, [url]);

  return status;
};