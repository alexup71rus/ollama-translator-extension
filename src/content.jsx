import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';

function Popup({ title, content, type = 'success', onClose }) {
  const baseStyle = {
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    maxWidth: '320px',
    fontFamily: 'Segoe UI, Arial, sans-serif',
    animation: 'fadeIn 0.25s ease-out',
    display: 'flex',
    flexDirection: 'column'
  };

  const styles = {
    success: {
      background: '#ffffff',
      border: '1px solid #1f9ced',
      headerColor: '#1f9ced',
      buttonBg: '#e8ebf5'
    },
    error: {
      background: '#ffebee',
      border: '1px solid #f44336',
      headerColor: '#d32f2f',
      buttonBg: '#ffcdd2'
    },
    loading: {
      background: '#ffffff',
      border: '1px solid #1f9ced',
      headerColor: '#1f9ced',
      buttonBg: '#e8ebf5'
    }
  };

  const style = styles[type] || styles.success;

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('#ollama-translator-popup')) onClose();
    };
    setTimeout(() => document.addEventListener('click', handler, { once: true }), 100);

    if (type === 'error') {
      setTimeout(onClose, 8000);
    }
    return () => {
      document.removeEventListener('click', handler);
    };
  }, []);

  // Отрисовка контента в зависимости от типа
  let bodyContent;
  if (type === 'loading') {
    bodyContent = (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div
          style={{
            margin: '0 auto 10px',
            border: '6px solid #f3f3f3',
            borderTop: '6px solid #1f9ced',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            animation: 'spin 1s linear infinite'
          }}
        />
        <p style={{ margin: 0 }}>Загрузка...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  } else {
    bodyContent = (
      <div style={{
        marginBottom: '12px',
        lineHeight: 1.4,
        wordWrap: 'break-word',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {content}
      </div>
    );
  }

  return (
    <div
      id="ollama-translator-popup"
      style={{
        ...baseStyle,
        background: style.background,
        border: style.border
      }}
    >
      <div style={{
        color: style.headerColor,
        fontWeight: 600,
        marginBottom: '8px',
        fontSize: '15px'
      }}>
        {title}
      </div>

      {bodyContent}

      {type !== 'loading' && (
        <button
          onClick={onClose}
          style={{
            alignSelf: 'flex-end',
            background: style.buttonBg,
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Закрыть
        </button>
      )}
    </div>
  );
}

function showPopup({ title, content, type }) {
  const old = document.getElementById('ollama-translator-root');
  if (old) old.remove();

  const container = document.createElement('div');
  container.id = 'ollama-translator-root';

  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    container.style.position = 'fixed';
    container.style.bottom = `10px`;
    container.style.left = `10px`;
    container.style.zIndex = `999999`;
  }

  document.body.appendChild(container);

  const close = () => container.remove();

  render(
    <Popup title={title} content={content} type={type} onClose={close} />,
    container
  );
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'showLoading') {
    showPopup({ title: 'Загрузка...', content: '', type: 'loading' });
  } else if (message.action === 'showTranslation') {
    showPopup({ title: 'Перевод', content: message.translation, type: 'success' });
  } else if (message.action === 'showError') {
    showPopup({ title: 'Ошибка', content: message.message, type: 'error' });
  }
});
