# 🔒 Istruzioni Firestore Security Rules

## 📋 Cosa Sono le Security Rules

Le Firestore Security Rules sono regole di sicurezza che proteggono il database Firestore a livello server. Anche se l'applicazione controlla l'autenticazione lato client, le regole sul server sono essenziali perché:

1. **Prevenzione accessi non autorizzati**: Impediscono accessi diretti al database bypassando l'applicazione
2. **Sicurezza reale**: Le regole sul server non possono essere bypassate dal client
3. **Conformità**: Richieste da molte normative sulla sicurezza dei dati

## 📁 File Creati

- **`firestore.rules`** - File contenente le regole di sicurezza
- **`firebase.json`** - Aggiornato per includere le regole Firestore

## 🔐 Regole Implementate

### Regole Attuali

Tutte le collections richiedono autenticazione per qualsiasi operazione:

1. **`clients`** - Solo utenti autenticati possono leggere/scrivere
2. **`tariffe`** - Solo utenti autenticati possono leggere/scrivere
3. **`calcoli`** - Solo utenti autenticati possono leggere/scrivere
4. **`spese`** - Solo utenti autenticati possono leggere/scrivere
5. **`preferenze`** - Solo utenti autenticati possono leggere/scrivere

### Cosa Significa

- ✅ **Utenti autenticati**: Possono leggere e modificare tutti i dati
- ❌ **Utenti non autenticati**: NON possono accedere a nessun dato
- ❌ **Collections non definite**: Sono negate per default

## 🚀 Come Deployare le Regole

### Opzione 1: Firebase CLI (Consigliato)

1. **Installa Firebase CLI** (se non già installato):
   ```bash
   npm install -g firebase-tools
   ```

2. **Accedi a Firebase**:
   ```bash
   firebase login
   ```

3. **Inizializza il progetto** (se non già fatto):
   ```bash
   firebase init firestore
   ```
   - Seleziona il progetto esistente: `vendemmia-meccanizzata`
   - Conferma che vuoi usare `firestore.rules` come file delle regole

4. **Deploy delle regole**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Opzione 2: Firebase Console (Interfaccia Web)

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il progetto **vendemmia-meccanizzata**
3. Vai a **Firestore Database** → **Regole**
4. Copia il contenuto di `firestore.rules`
5. Incolla nella console
6. Clicca **Pubblica**

## ✅ Verifica delle Regole

### Test Manuale

1. Apri l'applicazione in un browser
2. **Senza autenticazione**: Prova ad accedere a una pagina protetta
   - Dovresti essere reindirizzato al login
3. **Con autenticazione**: Effettua il login
   - Tutto dovrebbe funzionare normalmente

### Test con Firebase Console

1. Vai su Firebase Console → Firestore Database → Regole
2. Clicca su **Simulatore**
3. Testa diverse operazioni:
   - Lettura senza auth → dovrebbe fallire
   - Scrittura senza auth → dovrebbe fallire
   - Lettura con auth → dovrebbe riuscire

## 🔄 Aggiornare le Regole

Se in futuro vuoi modificare le regole:

1. Modifica il file `firestore.rules`
2. Deploya di nuovo:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 🛡️ Regole Avanzate (Opzionali per il Futuro)

Se in futuro vuoi implementare accessi più granulari (es. ogni utente vede solo i propri dati):

```javascript
// Esempio: ogni utente può vedere solo i propri calcoli
match /calcoli/{calcoloId} {
  allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
}
```

Per ora, tutte le regole permettono accesso completo a tutti gli utenti autenticati (semplice e sicuro per un'applicazione single-tenant).

## ⚠️ Importante

- Le regole sono attive SOLO dopo il deploy
- Le regole nel file locale NON proteggono il database finché non vengono deployate
- Testa sempre le regole dopo il deploy

## 📚 Riferimenti

- [Documentazione Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)

