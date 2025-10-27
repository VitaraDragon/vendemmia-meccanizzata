# 🍇 Vendemmia Meccanizzata - Sistema Integrato

Sistema completo per la gestione della vendemmia meccanizzata con autenticazione Firebase e gestione integrata di clienti e calcoli.

## 🚀 Avvio Rapido

### 1. Setup Account Demo
1. Apri `setup-demo.html` nel browser
2. Clicca "Crea Account Demo" per creare l'account di test
3. Usa le credenziali:
   - **Email**: `demo@vendemmia.com`
   - **Password**: `demo123456`

### 2. Accesso all'Applicazione
1. Apri `login.html` nel browser
2. Effettua il login con le credenziali demo
3. Verrai reindirizzato alla dashboard principale

## 📁 Struttura del Progetto

```
nuovo_progetto/
├── login.html              # Pagina di login/registrazione
├── home.html               # Dashboard principale
├── index.html              # Calcolatore vendemmia
├── anagrafica_clienti.html # Gestione clienti
├── setup-demo.html         # Setup account demo
├── firebase-config.js      # Configurazione Firebase
├── test-firebase.html      # Test Firebase
└── README.md               # Questo file
```

## 🔐 Flusso di Autenticazione

1. **Login** (`login.html`) - Punto di ingresso principale
2. **Home** (`home.html`) - Dashboard con statistiche e navigazione
3. **Applicazioni** - Accesso alle funzionalità specifiche

## 🏠 Dashboard Home

La dashboard principale (`home.html`) fornisce:
- **Statistiche**: Clienti totali, terreni gestiti, calcoli effettuati
- **Moduli**: Accesso rapido alle applicazioni
- **Azioni rapide**: Pulsanti per operazioni comuni

## 🧮 Calcolatore Vendemmia

L'applicazione principale (`index.html`) include:
- **Gestione clienti**: Selezione automatica da database
- **Selezione terreni**: Integrazione con anagrafica clienti
- **Calcolo compensi**: Tariffe personalizzabili
- **Generazione PDF**: Report dettagliati
- **Storico calcoli**: Salvataggio su Firebase

## 👥 Anagrafica Clienti

Gestione completa clienti (`anagrafica_clienti.html`):
- **CRUD clienti**: Aggiungi, modifica, elimina
- **Ricerca avanzata**: Filtra per nome, indirizzo, telefono
- **Gestione terreni**: Visualizza terreni associati
- **Sincronizzazione**: Dati condivisi con calcolatore

## 🔧 Funzionalità Tecniche

### Firebase Integration
- **Autenticazione**: Login/registrazione sicura
- **Firestore**: Database NoSQL per dati persistenti
- **Real-time**: Sincronizzazione automatica

### Sicurezza
- **Autenticazione obbligatoria**: Accesso protetto a tutte le funzionalità
- **Controllo accessi**: Verifica stato autenticazione
- **Redirect automatico**: Reindirizzamento al login se non autenticati

### Responsive Design
- **Mobile-first**: Ottimizzato per dispositivi mobili
- **UI moderna**: Design pulito e intuitivo
- **Navigazione fluida**: Transizioni smooth tra sezioni

## 📊 Struttura Database Firebase

### Collection: `clients`
```json
{
  "nome": "Mario",
  "cognome": "Rossi",
  "indirizzo": "Via Roma 1, Bologna",
  "cellulare": "+39 123 456 7890",
  "email": "mario@email.com",
  "note": "Note cliente",
  "terreni": [
    {
      "nome": "Campo Nord",
      "ettari": 2.5,
      "tipoUva": "Sangiovese",
      "morfologia": "collina",
      "tipoPalo": "ferro"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Collection: `tariffe`
```json
{
  "tariffeVendemmia": {
    "montagna-ferro": 120,
    "montagna-legno": 110,
    "collina-ferro": 100
  },
  "tariffeTrasporto": {
    "sociale": 0.15,
    "intesa": 0.20
  },
  "updatedAt": "timestamp"
}
```

### Collection: `calcoli`
```json
{
  "cliente": "Mario Rossi",
  "dataVendemmia": "2024-01-15",
  "terreniSelezionati": [...],
  "totaleFinale": 250.50,
  "createdAt": "timestamp"
}
```

## 🚀 Deploy e Configurazione

### Firebase Setup
1. Crea progetto Firebase
2. Abilita Authentication (Email/Password)
3. Crea database Firestore
4. Aggiorna configurazione in tutti i file

### Configurazione Locale
1. Clona il repository
2. Apri `setup-demo.html` per creare account demo
3. Accedi con `login.html`
4. Inizia a utilizzare l'applicazione

## 🔄 Migrazione da Versione Precedente

Il sistema include funzioni di migrazione automatica:
- **Clienti**: Importa da localStorage se disponibile
- **Tariffe**: Migra configurazioni esistenti
- **Calcoli**: Mantiene storico precedente

## 📱 Compatibilità

- **Browser**: Chrome, Firefox, Safari, Edge (moderne)
- **Dispositivi**: Desktop, tablet, smartphone
- **Risoluzioni**: Responsive design per tutte le dimensioni

## 🆘 Supporto

Per problemi o domande:
1. Controlla la console del browser per errori
2. Verifica la connessione Firebase
3. Assicurati che l'autenticazione sia attiva

## 🔮 Sviluppi Futuri

- [ ] Gestione terreni avanzata con mappe
- [ ] Reportistica avanzata
- [ ] Esportazione dati
- [ ] Notifiche push
- [ ] App mobile nativa



