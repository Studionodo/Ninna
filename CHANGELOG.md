# Changelog — Ninna

Versionamento semantico (MAJOR.MINOR.PATCH). Ogni release da qui in avanti
viene registrata qui, in ordine cronologico, più recente in cima.

## v1.1.2 — 25/08/2026
- La luna nella schermata iniziale non è più un carattere unicode generico
  (☾): è il logo vero, luna e stella isolate dal file sorgente su sfondo
  trasparente. Prima dell'onboarding e le icone dell'app mostravano due
  simboli diversi; ora sono lo stesso identico glifo.

## v1.1.1 — 25/08/2026
Interventi emersi da un audit completo del codice:
- Il riepilogo per il pediatra non compare più in modalità solo diario: era
  incoerente offrire una tabella di numeri proprio dove li stiamo nascondendo.
- Rimosse tre chiavi di traduzione rimaste inutilizzate (`loading`,
  `stat_typical`, `stat_typicalfmt`).
- La lingua del documento viene ora impostata dalle preferenze salvate prima
  del primo render, non dopo: i lettori di schermo non leggono più in italiano
  una pagina che sarà mostrata in inglese.
- Aggiunto un messaggio bilingue per chi ha JavaScript disattivato, al posto
  di una pagina vuota.

## v1.1.0 — 25/08/2026
- **Modalità solo diario**: interruttore nelle impostazioni che nasconde
  previsioni, confronti, statistiche e il tab Statistiche, lasciando solo il
  registro di quello che è successo. Pensata per chi si accorge che guardare
  i numeri sta diventando fonte di preoccupazione più che di aiuto. La
  preferenza è persistente e viaggia col backup.
- **Riepilogo per il pediatra**: genera una tabella dei 14 giorni con dati
  registrati e medie, pronta da stampare o salvare in PDF con la funzione di
  sistema (nessuna libreria PDF aggiunta). Include la nota sulla variabilità
  individuale e la precisazione che i dati sono auto-registrati dai genitori.

## v1.0.3 — 25/08/2026
- Scorciatoie rapide: tenendo premuta l'icona di Ninna in schermata Home
  compaiono "Inizia pisolino" e "Inizia nanna", che registrano il sonno
  all'apertura senza altri tocchi. Protetto contro doppie registrazioni
  (URL ripulito subito, nessuna azione se un sonno è già in corso).
- Statistiche senza giudizio: rimosse le etichette "sotto / sopra / nel
  range ✓" e la riga "Bilancio sonno". I valori sono ora affiancati
  all'intervallo tipico per l'età, con una nota esplicita sulla variabilità
  individuale. I dati restano gli stessi, sparisce il tono da pagella.

## v1.0.2 — 25/08/2026
- Tab bar flottante resa più trasparente (opacità 0.38, blur 34px): il
  contenuto che scorre sotto è ora visibile attraverso il vetro.

## v1.0.1 — 25/08/2026
- Fix: la tab bar e i toast potevano sembrare "muoversi" durante lo scroll su
  mobile, per via del ricalcolo di `100vh` allo sparire/apparire della barra
  indirizzi del browser. Corretto con `100dvh`, `overscroll-behavior` e
  promozione degli elementi fissi a un proprio layer di compositing.
- Aggiunta numerazione di versione (visibile in Impostazioni), cache del
  service worker allineata alla versione.

## v1.0.0 — 25/08/2026
Prima versione stabile pubblicata (Studionodo/Ninna su Vercel). Comprende:
- Motore di previsione (finestre di veglia adattive, sweet spot, nanna serale,
  decisione automatica pisolino/nanna, rilevamento transizioni).
- Tracking completo delle attività, statistiche a 7 giorni, export CSV/JSON.
- 7 suoni sintetizzati via Web Audio con timer di spegnimento.
- Guida in 12 articoli.
- i18n completo italiano/inglese.
- Logo e icone definitive (icon-192, icon-512, maskable-512).
- Footer contestuale: completo in coda alla Guida, ridotto in onboarding,
  assente su Oggi/Statistiche/Suoni.
