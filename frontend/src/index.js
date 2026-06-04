import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/design-tokens.css';
import './styles/global.css';
import '@fontsource/cairo/300.css';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/500.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
