# Handover tecnico — Ninna

Non è il changelog (quello resta in `CHANGELOG.md`, cronologico). Questo file
raccoglie le decisioni che non sono ovvie leggendo il codice, pensate per chi
riprende il progetto a freddo — un'altra sessione, un altro sviluppatore.

Nota: la questione delle notifiche (cosa possono fare, cosa no, e perché
farle "vere" richiederebbe un server) ha un documento a sé, `NOTIFICHE.md`,
perché è una domanda che torna spesso e merita una risposta completa invece
di un paragrafo qui in mezzo ad altro.

## Architettura dell'interfaccia (dalla v2.20)

Riscritta da zero nella v2.20. Mappa dei file:

| File | Cosa contiene |
|---|---|
| `js/app.js` | regia: navigazione a livelli, azioni (`window.NINNA`), ridisegno, notifiche, avvio |
| `js/state.js` | l'unico oggetto di stato `S`, traduzioni `t()`, formattazioni, regole di dominio (dosi) |
| `js/ui.js` | mattoni ripetuti: intestazione pagina, foglio, gruppi di righe, interruttore, segmenti |
| `js/icons.js` | tutte le icone SVG, nessun SVG sparso altrove |
| `js/timer.js` | logica del timer, senza disegno |
| `js/views-tabs.js` | le cinque schede e il primo avvio |
| `js/views-pages.js` | pagine a tutto schermo (impostazioni, profilo, crescita, documenti, riepilogo, guida, info); contiene `APP_VERSION` |
| `js/views-sheets.js` | fogli dal basso |
| `js/views-night.js` | modalita' notte |
| `engine.js`, `sounds.js`, `content-store.js`, `docs-store.js` | invariati dalla v2.19 |

**Navigazione a livelli.** Sopra le schede si impilano pagine, fogli e
modalita' notte (`S.layers`). Ogni apertura aggiunge una voce alla cronologia
(`history.pushState({d})`), cosi' il tasto indietro di Android chiude il
livello in cima. Le chiusure dall'app tolgono subito il livello e poi
riallineano la cronologia; il `popstate` che ne deriva e' atteso e ignorato.
Un'apertura chiesta mentre il riallineamento e' in corso aspetta in coda.
**Non aprire o chiudere livelli toccando `S.layers` a mano**: passare sempre
da `push`, `replaceTop`, `goBack`.

**Barra in basso misurata.** `#bottom` (riquadro "in corso" + schede) e' un
solo contenitore fisso; `measureBottom()` ne scrive l'altezza reale in
`--bottom-h`, che ogni schermata riserva in fondo. Mai piu' margini indovinati.

**Ridisegni.** Il timer aggiorna ogni secondo solo i numeri (per id), mai la
schermata. L'aggiornamento periodico e il rientro nell'app non ridisegnano un
foglio aperto, che perderebbe il testo digitato.

**Ogni modulo nuovo va aggiunto a `SHELL` in `sw.js`**, altrimenti l'app non
parte offline (e' successo con `docs-store.js` dalla v2.18 alla v2.19).

## Audio: uscita diretta, e perché non si torna indietro

`SoundEngine._setupOutput()` collega il grafo Web Audio direttamente a
`ctx.destination`. È la strada semplice, ed è quella giusta.

Fra la v1.8.0 e la v2.0.1 l'audio passava invece da un elemento `<audio>`
alimentato da un `MediaStreamDestination`, per ottenere i controlli play/pausa
nella notifica di sistema (MediaSession). **Su Android quella strada è
risultata muta.** Il fallimento è stato subdolo: l'elemento `<audio>`
dichiarava di essere in riproduzione, quindi nessun controllo di errore e
nessuna rete di sicurezza basata su `paused` poteva accorgersene, ma dagli
altoparlanti non usciva niente. Due tentativi di irrobustimento non l'hanno
risolto.

**Non reintrodurre quel percorso** senza avere prima un modo per verificarlo
su un dispositivo Android reale. Il problema di ergonomia che voleva
risolvere (fermare il suono senza tornare nella scheda Suoni) va affrontato
dentro l'app, con un lettore compatto persistente, non delegandolo al
sistema operativo.

## Ambiente di test: Chrome reale, disponibile

Un binario Chromium funzionante si trova in `/opt/google/chrome/chrome`.
Playwright non riesce a scaricare il proprio browser (rete bloccata), ma si
collega a questo:

```js
chromium.launch({ executablePath: '/opt/google/chrome/chrome', args: ['--no-sandbox'] })
```

Con un `python3 -m http.server` sulla cartella del progetto si ottiene un
banco di prova completo: l'app vera, servita su HTTP, pilotata come farebbe
un utente, con cattura di errori di console, eccezioni e richieste fallite,
piu' screenshot. **Usarlo prima di ogni consegna**: ha trovato bug che ne'
`node --check` ne' jsdom vedevano (barre di grafico compresse dal flex,
durate negative a schermo, dati non azzerati dal wipe).

**Usare sempre un'altezza di viewport realistica.** Un telefono con la barra
indirizzi di Chrome aperta ha circa 805px utili, non 915. Un test a 915px ha
dato esito positivo su una sovrapposizione che sul telefono vero c'era
eccome: il difetto compariva solo con lo schermo piu' corto. Provare almeno
805, 740 e 640px.

Script pronti in `/home/claude/testenv/`: `e2e.mjs` (30 passaggi d'uso),
`bughunt.mjs` (casi limite), `shots.mjs` (screenshot delle schermate chiave).
Dalla v2.20: `e2e220.mjs`, `overlap.mjs`, `extra.mjs` (offline e testo conservato), `shots2.mjs`.

## Nota storica: prima non c'era

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
`APP_VERSION` in `js/views-pages.js`. **I due vanno sempre bumpati insieme**: se cambi
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

## Non fondere due elementi con CSS: farne uno solo

In v2.6.0, il pannello volume/timer si "agganciava" alla riga del suono attivo
con `:has()` e un margine negativo per far combaciare i bordi. In alcuni
contesti di rendering (verificato nell'anteprima .jsx) lasciava piccoli
artefatti agli angoli — il trucco simulava un unico blocco senza esserlo
davvero.

Corretto in v2.6.1: riga e pannello vivono in un vero `<div class="soundgroup
active">` quando il suono e' attivo, che possiede lui il bordo e lo sfondo;
i due figli restano trasparenti e senza bordo proprio. **Se in futuro serve
di nuovo "unire visivamente" due elementi adiacenti, usare questo pattern
(un contenitore vero) invece di selettori come `:has()` combinati con margini
negativi**: sembra funzionare nel test principale ma il supporto e il
comportamento con margini negativi non sono garantiti in ogni contesto.

## Codice morto: successo raramente al primo colpo

Più di un audit in questo progetto ha trovato CSS o funzioni mai più
referenziate dopo un refactor (`.card-title.art`, `.footer`, `buildReportHTML`
dopo la riscrittura del report). Quando si sostituisce un meccanismo, vale la
pena un `grep` del nome della funzione/classe vecchia su tutto il repository
prima di considerare il lavoro finito.


## Lezioni recenti (v2.18-2.19)
- Prima di costruire una funzione, cercarla nel codice col suo nome: la
  sezione documenti esisteva gia' ed e' stata duplicata (v2.18.1).
- Misurare il contenitore intero, non solo i singoli elementi: cinque
  etichette "che entrano" non garantiscono che la barra entri nello schermo.
- (v2.19) `render()` usciva presto in modalita' notte; superato dalla
  struttura a livelli della v2.20.

## Lezioni della riscrittura (v2.20)
- Nomi di classe generici collidono: `.night` della modalita' notte colpiva
  anche `.tl-sleep.night` della barra della giornata. Per i contenitori a
  tutto schermo usare nomi univoci (`.nightmode`).
- `input type="number"` rifiuta la virgola su molte tastiere italiane: per
  numeri decimali usare `type="text" inputmode="decimal"` e convertire.
- Il collaudo e2e (`/home/claude/testenv/e2e220.mjs`, 143 controlli) e la
  misura delle sovrapposizioni (`overlap.mjs`) vanno rilanciati a ogni
  consegna.
