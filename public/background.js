console.log("✅ QuickPost background script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "fetch") {
    console.log("📩 Fetch request received:", message);

    const method = message.method || "GET";
    const headers = message.headers || {};
    const body =
      ["GET", "HEAD"].includes(method.toUpperCase()) || !message.body
        ? undefined
        : message.body;

    fetch(message.url, {
      method,
      headers,
      body,
      redirect: "follow",
    })
      .then(async (res) => {
        const text = await res.text();
        sendResponse({
          ok: res.ok,
          status: res.status,
          body: text,
        });
      })
      .catch((err) => {
        console.error("❌ Fetch failed in background:", err);
        sendResponse({
          ok: false,
          status: 0,
          body: err.message,
        });
      });

    return true;
  }
});
