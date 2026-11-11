import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { App } from './App';
import { EmbedApp } from './features/embed/EmbedApp';
import './index.css';
import { getElk } from './engine/layout/layout';
import { useAppStore } from './store/useAppStore';
import { parseLocation } from './hooks/useRouter';

// the landing page lives at “/”; decide before the first render so the hero doesn’t flash in late
const isEmbed = window.location.pathname.startsWith('/embed/');
if (!isEmbed && parseLocation().home) useAppStore.getState().setHome(true);

// warm up the layout worker in parallel with React's first render
getElk();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isEmbed ? <EmbedApp /> : <App />}
    <Analytics />
  </React.StrictMode>
);
