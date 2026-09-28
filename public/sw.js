// Network-only for authenticated pages and APIs. No private data is cached.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate")
    event.respondWith(
      fetch(event.request).catch(
        () =>
          new Response(
            '<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width"><title>Conecta Santa Maria</title><body style="font:18px Arial;padding:32px;color:#17283f"><h1>Você está sem conexão</h1><p>Reconecte-se para buscar profissionais e acompanhar seus pedidos.</p><button onclick="location.reload()">Tentar novamente</button></body></html>',
            { headers: { "Content-Type": "text/html; charset=utf-8" } },
          ),
      ),
    );
});
