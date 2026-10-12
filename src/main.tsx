import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import {ArticleStore} from './data/house';
import './style.css';
createRoot(document.getElementById('root')!).render(<App store={new ArticleStore()}/>);
