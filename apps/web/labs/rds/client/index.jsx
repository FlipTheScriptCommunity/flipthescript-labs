import React from 'react';
import { createRoot } from 'react-dom/client';
import '@cloudscape-design/global-styles/index.css';
import './styles.css';
import App from './App';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
