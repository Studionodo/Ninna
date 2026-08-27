# Handover tecnico — Ninna

Non è il changelog (quello resta in `CHANGELOG.md`, cronologico). Questo file
raccoglie le decisioni che non sono ovvie leggendo il codice, pensate per chi
riprende il progetto a freddo — un'altra sessione, un altro sviluppatore.

## Audio: perché passa da un `<audio>` nascosto

In `js/sounds.js`, `SoundEngine._setupOutput()` non collega il grafo Web Audio
direttamente a `ctx.destination` come si farebbe normalmente. Lo collega a un
`MediaStreamDestination`, che alimenta un elemento `<audio>` invisibile
(`this.anchor`), il quale è l'unico percorso reale verso gli altoparlanti.

**Il motivo non è stilistico.** Web Audio puro (oscillatori, buffer) non viene
riconosciuto da Android/iOS/desktop come "sto riproducendo audio": niente
controlli nella notifica, niente schermata di blocco, e le pagine vengono
congelate più aggressivamente in background. Un vero elemento `<audio>` in
riproduzione risolve entrambe le cose.

**Se tocchi questo file**: non aggiungere mai un secondo collegamento diretto
a `ctx.destination` insieme a quello verso l'ancora — l'audio uscirebbe
raddoppiato. Il fallback per i browser senza `createMediaStreamDestination`
c'è già (torna al collegamento diretto), non rimuoverlo.

**Limite noto**: il supporto iOS a questo meccanismo nelle PWA è meno
affidabile di Android. Non è stato possibile verificarlo su un browser reale
in questo ambiente di sviluppo (vedi sotto).

## Ambiente di test: niente browser reale disponibile

Playwright è installato ma **l'installazione del browser Chromium fallisce**
per restrizioni di rete di questo container (non riesce a raggiungere i
repository Debian). Non è quindi possibile un collaudo visivo o di
interazione reale in questa sede.

Per compensare, ogni funzionalità che tocca il DOM o la logica di stato è
stata verificata con **jsdom**, caricando i file veri dell'app (non
frammenti) dentro un DOM simulato. Due limiti emersi, da tenere a mente:

- jsdom **non implementa affatto** la Web Audio API: qualunque test su
  `sounds.js` richiede di costruire un `AudioContext`/`Audio` finti a mano
  (vedi i test in questo storico di sessione). Verifica solo il *cablaggio*
  (chi si collega a chi, chi viene chiamato), mai il suono reale.
- jsdom **non esegue gli attributi `onclick="..."` inline** a meno di
  costruire il `JSDOM` con `runScripts: 'dangerously'`. Un test che dispatcha
  un click e non vede l'effetto potrebbe essere un limite del test, non
  dell'app — controllare questa opzione prima di concludere che c'è un bug.

## Cache-first e numerazione di versione

Il service worker (`sw.js`) usa cache-first con `CACHE` agganciato a
`APP_VERSION` in `app.js`. **I due vanno sempre bumpati insieme**: se cambi
`APP_VERSION` senza cambiare `CACHE` (o viceversa), gli utenti restano bloccati
sulla versione vecchia perché la cache non si invalida. Conseguenza pratica:
dopo un deploy, la versione nuova appare alla *seconda* apertura dell'app, non
alla prima (la prima serve ancora dalla cache, scarica la nuova in
background).

## Cache: perché il service worker usa `cache: "reload"`

In `sw.js`, l'installazione non usa `cache.addAll(SHELL)` ma costruisce ogni
richiesta con `new Request(url, { cache: "reload" })`. **Non toccare questo
dettaglio.** Con `addAll` semplice, il prelievo passa dalla cache HTTP del
browser: all'installazione di una versione nuova si rischia di ricopiare nella
cache nuova dei file vecchi ancora considerati validi dal browser. E' successo
davvero in v1.9.0: e' arrivato JavaScript aggiornato con CSS vecchio, e la
schermata notte risultava a meta' fra due versioni.

A supporto, `vercel.json` marca `index.html`, `styles.css`,
`manifest.webmanifest` e tutto `/js/` come `Cache-Control: no-cache`: la cache
offline la gestisce il service worker, il browser deve sempre rivalidare.

## Riepilogo per il pediatra: perché vive dentro l'app

Le prime due versioni di questa funzione aprivano una scheda separata
(`window.open` + `document.write`, poi `window.open` + Blob URL). Entrambe si
sono rotte in produzione per motivi diversi legati ai popup su mobile. La
versione attuale genera il contenuto **dentro** l'overlay dell'app e chiama
`window.print()` sulla finestra principale — zero popup, zero Blob per
l'HTML. Se in futuro serve di nuovo un output "a parte", pensarci due volte:
questo è il terzo tentativo ed è quello che ha smesso di rompersi.

## Motore: codici, non testo

`engine.js` non produce mai stringhe in italiano o inglese — solo codici
(`{ kind: "nap", code: "nap_n", params: {...} }`). La traduzione vive
esclusivamente in `i18n.js` e nella UI. Se aggiungi una nuova ragione di
decisione nel motore, serve una chiave corrispondente in **entrambe** le
lingue di `i18n.js`, altrimenti compare la chiave grezza invece del testo.

## Icone: un set unico, coerente, senza emoji

Tutte le icone di contenuto (tipi di evento, salute) sono SVG a linea disegnati
a mano in `TYPE_ICONS`, non emoji di sistema (rese in modo incoerente tra
produttori). I controlli play/stop dei suoni usano invece forme piene
(triangolo/quadrato), deliberatamente in uno stile diverso: sono controlli
media universali, non categorie di contenuto — non uniformarli agli altri.

## Codice morto: successo raramente al primo colpo

Più di un audit in questo progetto ha trovato CSS o funzioni mai più
referenziate dopo un refactor (`.card-title.art`, `.footer`, `buildReportHTML`
dopo la riscrittura del report). Quando si sostituisce un meccanismo, vale la
pena un `grep` del nome della funzione/classe vecchia su tutto il repository
prima di considerare il lavoro finito.
