import { h, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Dropdown } from './@ui/Dropdown';
import fav from '../public/assets/favicon-32x32.png';

function App() {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Русский');
  const [isLoading, setIsLoading] = useState(true);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: 'white',
    padding: '12px',
    fontFamily: 'Inter, Roboto, sans-serif',
    boxSizing: 'border-box',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  };

  const iconStyle = {
    width: '20px',
    height: '20px'
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: 600,
    color: 'black',
    margin: 0
  };

  const loadingTextStyle = {
    margin: 0,
    color: '#eee',
    fontSize: '14px'
  };

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getModels' }, (response) => {
      if (response?.models?.length) setModels(response.models);
      setIsLoading(false);
    });

    chrome.storage.sync.get(['model', 'language'], (res) => {
      if (res.model) setSelectedModel(res.model);
      if (res.language) setSelectedLanguage(res.language);
    });
  }, []);

  const handleModelChange = (model) => {
    setSelectedModel(model);
    chrome.runtime.sendMessage({ action: 'setModel', model });
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    chrome.runtime.sendMessage({ action: 'setLanguage', language: lang });
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <img src={fav} alt="icon" style={iconStyle} />
        <h1 style={titleStyle}>Переводчик</h1>
      </div>

      {isLoading ? (
        <p style={loadingTextStyle}>Загрузка списка моделей...</p>
      ) : (
        <>
          <Dropdown
            label="Модель:"
            options={models}
            value={selectedModel}
            onChange={handleModelChange}
          />
          <Dropdown
            label="Язык перевода:"
            options={['Русский', 'Английский']}
            value={selectedLanguage}
            onChange={handleLanguageChange}
          />
        </>
      )}
    </div>
  );
}

render(<App />, document.getElementById('root'));