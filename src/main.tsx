import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './app/router'; 
// Importe ton fichier CSS principal ici (ajuste le nom si ce n'est pas global.css)
import './styles/global.css'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);