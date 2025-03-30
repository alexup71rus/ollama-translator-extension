let availableModels = [];

async function fetchOllamaModels() {
  const supported = ['llama', 'phi', 'mistral', 'gemma'];

  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.status === 403) throw new Error('Доступ к Ollama запрещен. Проверьте настройки сервера.');
    if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

    const data = await response.json();
    return (data.models || [])
      .map(model => model.name)
      .filter(name => supported.some(prefix => name.includes(prefix)));
  } catch {
    return [];
  }
}

async function translateText(text, model, language) {
  if (!model) throw new Error('Модель не выбрана');

  // Выбираем язык перевода
  const langPrompt = language === 'Английский' ? 'английский' : 'русский';

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: `Переведи на ${langPrompt}: ${text}`
          }
        ],
        stream: false,
        format: {
          type: 'object',
          properties: {
            translation: { type: 'string' }
          },
          required: ['translation']
        }
      })
    });

    if (response.status === 403) {
      throw new Error('Доступ к Ollama запрещен или модель не предназначена для структурированных ответов');
    }
    if (!response.ok) {
      throw new Error(`Ошибка перевода: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.message?.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error('Невозможно распарсить ответ модели');
    }

    if (!parsed?.translation) {
      throw new Error('Некорректный ответ от модели');
    }

    return parsed.translation;
  } catch (error) {
    throw new Error(error.message || 'Ошибка при переводе');
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  availableModels = await fetchOllamaModels();

  chrome.contextMenus.create({
    id: "translate-text",
    title: "Translate with Ollama",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "translate-text" && info.selectionText) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "showLoading" });
      }
    });

    const { model, language } = await chrome.storage.sync.get(['model', 'language']);
    try {
      if (!model) throw new Error('Модель не выбрана');
      const translation = await translateText(info.selectionText, model, language);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "showTranslation",
            original: info.selectionText,
            translation
          });
        }
      });
    } catch (error) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "showError",
            message: error.message
          });
        }
      });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getModels') {
    fetchOllamaModels().then(models => {
      sendResponse({ models });
    });
    return true;
  }

  if (request.action === 'setModel') {
    chrome.storage.sync.set({ model: request.model });
    sendResponse({ success: true });
  }
  if (request.action === 'setLanguage') {
    chrome.storage.sync.set({ language: request.language });
    sendResponse({ success: true });
  }
  return true;
});

setInterval(async () => {
  availableModels = await fetchOllamaModels();
}, 300000);
