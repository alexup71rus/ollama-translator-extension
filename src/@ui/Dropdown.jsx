import { h } from 'preact';

export function Dropdown({ label, options = [], value, onChange }) {
  const containerStyle = {
  };

  const selectStyle = {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px 10px',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box',
    backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'%23666\' height=\'16\' viewBox=\'0 0 24 24\' width=\'16\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    backgroundSize: '16px 16px',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
        <option value="" disabled>{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
