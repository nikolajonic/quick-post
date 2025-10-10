chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "fetch") {
    try {
      const res = await fetch(message.url, message.options);
      const text = await res.text();
      sendResponse({
        ok: true,
        body: text,
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
      });
    } catch (err) {
      sendResponse({ ok: false, error: err.message });
    }
  }
  return true;
});
