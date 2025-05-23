import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import { store } from './store.js';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
