# Changelog — Ninna

Versionamento semantico (MAJOR.MINOR.PATCH). Ogni release da qui in avanti
viene registrata qui, in ordine cronologico, più recente in cima.

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
