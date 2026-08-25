# Ninna — diario del sonno neonatale (StudioNodo)

PWA pura: zero build step, zero framework, zero backend. Statica al 100%.

## Struttura
- `index.html` + `styles.css` — shell e stile
- `js/engine.js` — modelli di calcolo (finestre di veglia, sweet spot, nanna serale, statistiche, transizioni, piano notifiche)
- `js/sounds.js` — 7 suoni sintetizzati via Web Audio, fade e timer di spegnimento
- `js/content-store.js` — 12 articoli della Guida + persistenza localStorage con backup JSON e export CSV
- `js/app.js` — UI vanilla che cuce tutto
- `sw.js` — cache offline dell'app shell + click sulle notifiche
- `manifest.webmanifest`, `icons/` — installabilità Android/desktop

## Deploy su Vercel
1. `vercel` dalla cartella (o repo GitHub → import su Vercel)
2. Framework preset: **Other** (nessun build, output = root)
3. Fine. HTTPS incluso, requisito per SW e notifiche.

## Notifiche — limite noto (stesso approccio di Bariletto)
Le notifiche sono programmate lato client (`setTimeout` + `registration.showNotification`):
funzionano quando l'app è aperta o in background recente. Senza un server push,
Android può ritardarle/perderle se il processo viene ucciso. Il piano notifiche è
già una funzione pura in `engine.js` (`notificationPlan`): quando servirà il push
vero basterà aggiungere web-push + un cron (gratuito su Vercel) senza toccare i modelli.

## Nota
Ninna è uno strumento di organizzazione, non un dispositivo medico.
