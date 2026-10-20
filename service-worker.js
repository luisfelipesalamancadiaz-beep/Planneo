self.addEventListener("notificationclick", event => {
  event.notification.close();

  const url =
    event.notification.data?.url ||
    "https://luisfelipesalamancadiaz-beep.github.io/Planneo/";

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(async clients => {
      for (const client of clients) {
        if ("focus" in client) {
          await client.focus();

          if ("navigate" in client) {
            await client.navigate(url);
          }

          return;
        }
      }

      await self.clients.openWindow(url);
    })
  );
});
