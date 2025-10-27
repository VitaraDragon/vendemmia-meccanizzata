@echo off
echo ========================================
echo   PUBBLICAZIONE APP VENDEMMIA MECCANIZZATA
echo ========================================
echo.

REM Controlla se Firebase CLI è installato
firebase --version >nul 2>&1
if errorlevel 1 (
    echo [ERRORE] Firebase CLI non installato!
    echo.
    echo Installa Firebase CLI con:
    echo   npm install -g firebase-tools
    echo.
    pause
    exit /b 1
)

echo Firebase CLI trovato!
echo.

REM Controlla se l'utente è loggato
firebase projects:list >nul 2>&1
if errorlevel 1 (
    echo [ATTENZIONE] Non sei loggato su Firebase.
    echo.
    echo Eseguendo login...
    firebase login
    echo.
)

echo.
echo ========================================
echo   SCEGLI UNA OPZIONE:
echo ========================================
echo.
echo 1. Deploy completo (consigliato)
echo 2. Preview Channel
echo 3. Cancella
echo.

set /p scelta="Inserisci la tua scelta (1-3): "

if "%scelta%"=="1" (
    echo.
    echo Avvio del deploy...
    firebase deploy --only hosting
    echo.
    echo ========================================
    echo Deploy completato!
    echo La tua app è disponibile su:
    echo https://vendemmia-meccanizzata.web.app
    echo https://vendemmia-meccanizzata.firebaseapp.com
    echo ========================================
) else if "%scelta%"=="2" (
    echo.
    set /p canale="Nome del canale preview: "
    firebase hosting:channel:deploy %canale%
) else (
    echo Operazione annullata.
    exit /b 0
)

echo.
pause

