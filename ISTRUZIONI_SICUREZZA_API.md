# Istruzioni per la Sicurezza delle Chiavi API

## ⚠️ Problema Risolto

Google ha rilevato che la tua chiave API di Google Maps era esposta pubblicamente su GitHub. Abbiamo implementato una soluzione per proteggere le tue chiavi API.

## 🔒 Cosa Abbiamo Fatto

1. **Creato un file di configurazione privato** (`google-maps-config.js`) che contiene la chiave API
2. **Aggiunto il file al `.gitignore`** per evitare che venga committato su GitHub
3. **Modificato** `anagrafica_clienti.html` per caricare la chiave dal file di configurazione
4. **Creato un template** (`google-maps-config.example.js`) per il repository pubblico

## 📝 Cosa Devi Fare Ora

### Opzione 1: Se stai lavorando in locale

Il file `google-maps-config.js` esiste già con la tua chiave API attuale. Non devi fare nulla!

### Opzione 2: Se vuoi rigenerare una nuova chiave API (CONSIGLIATO)

Google ti ha suggerito di rigenerare la chiave API compromessa. Ecco come fare:

1. **Vai su [Google Cloud Console](https://console.cloud.google.com/)**
2. **Seleziona il progetto**: "Vendemmia Meccanizzata Maps"
3. **Vai a**: APIs & Services → Credentials
4. **Trova la chiave**: `AIzaSyBmjpHJg5LtQj_4RtDmRuQQJmyH1bCRWU8`
5. **Clicca su "Rigenera chiave"** (icona a forma di freccia circolare)
6. **Copia la nuova chiave**
7. **Aggiorna il file** `google-maps-config.js` con la nuova chiave:

```javascript
window.GOOGLE_MAPS_API_KEY = 'NUOVA_CHIAVE_QUI';
```

### Opzione 3: Aggiungere limitazioni alla chiave API (CONSIGLIATO)

Per proteggere meglio la tua chiave API, aggiungi delle limitazioni:

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Seleziona il progetto
3. Vai a APIs & Services → Credentials
4. Clicca sulla chiave API
5. In "Restrizioni applicazioni":
   - Aggiungi limitazioni HTTP referrer (per limitare agli URL del tuo sito)
   - O aggiungi limitazioni API (per abilitare solo "Maps JavaScript API")
6. Salva

### Opzione 4: Se stai deployando su un server

Quando pubblichi il sito su GitHub Pages o un altro server:

1. **Copia** `google-maps-config.example.js` a `google-maps-config.js` sul server
2. **Sostituisci** `YOUR_API_KEY_HERE` con la tua chiave API reale
3. **Assicurati** che `google-maps-config.js` non venga committato su GitHub (già fatto tramite .gitignore)

## 🌐 Per Deploy su GitHub Pages

Se usi GitHub Pages, devi:

1. **Aggiungere manualmente** il file `google-maps-config.js` nella repository
2. **Oppure** usare GitHub Secrets per variabili d'ambiente (richiede configurazione aggiuntiva)

**Attenzione**: Non committare MAI il file `google-maps-config.js` con una chiave API reale su un repository pubblico!

## ✅ Verifica

1. Apri `anagrafica_clienti.html` nel browser
2. Controlla la console del browser: NON dovrebbero esserci errori sulla chiave API
3. Se vedi un errore, significa che `google-maps-config.js` non è caricato correttamente

## 🚨 Alert di Google

Se ricevi ancora alert da Google dopo aver rigenerato la chiave:

1. Assicurati che il commit problematico sia stato rimosso dalla storia di GitHub
2. Il commit con la chiave esposta potrebbe essere ancora nella cronologia
3. Considera di usare `git rebase` o contattare GitHub support per rimuovere il commit

## 📚 File di Riferimento

- `google-maps-config.js` - File di configurazione con la chiave API reale (NON committare!)
- `google-maps-config.example.js` - Template da usare nel repository pubblico
- `.gitignore` - Contiene `google-maps-config.js` per prevenire commit accidentali

## 🔐 Chiavi Firebase

Nota: Anche le chiavi Firebase API sono attualmente esposte nel codice. Per una maggiore sicurezza, considera di spostarle in un file di configurazione separato in futuro.

