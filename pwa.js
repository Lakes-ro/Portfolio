// ─── Registro do Service Worker ───────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registrado:', reg.scope);
      })
      .catch((err) => {
        console.error('[PWA] Falha ao registrar SW:', err);
      });
  });
}

// ─── Botão de instalação (Install Banner) ─────────────────────────────────────
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const btnInstall = document.getElementById('btn-instalar');
  if (btnInstall) {
    btnInstall.style.display = 'block';

    btnInstall.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] Usuário aceitou instalar');
        }
        deferredPrompt = null;
        btnInstall.style.display = 'none';
      });
    });
  }
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] App instalado com sucesso!');
  deferredPrompt = null;
});

// ─── Notificações Push ────────────────────────────────────────────────────────
async function solicitarPermissaoNotificacao() {
  if (!('Notification' in window)) {
    console.warn('[PWA] Notificações não suportadas neste navegador.');
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    console.log('[PWA] Permissão de notificação concedida!');
    inscreverNasNotificacoes();
  } else {
    console.warn('[PWA] Permissão de notificação negada.');
  }
}

async function inscreverNasNotificacoes() {
  const registration = await navigator.serviceWorker.ready;

  // Substitua pela sua chave pública VAPID
  const VAPID_PUBLIC_KEY = 'SUA_CHAVE_VAPID_PUBLICA_AQUI';

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  console.log('[PWA] Inscrito em push:', JSON.stringify(subscription));

  // Envie 'subscription' para o seu backend aqui
  // await fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Chama automaticamente ao carregar (pode mover para um botão se preferir)
window.addEventListener('load', () => {
  solicitarPermissaoNotificacao();
});
