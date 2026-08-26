# Changelog: Ninna

Versionamento semantico (MAJOR.MINOR.PATCH). Ogni release da qui in avanti
viene registrata qui, in ordine cronologico, più recente in cima.

## v1.3.0 · 26/08/2026
Correzione di un difetto di privacy emerso da un audit esterno. L'app
dichiarava di non connettersi ad alcun server, ma caricava i caratteri
tipografici dai server di Google a ogni avvio, trasmettendo indirizzo IP,
User-Agent e URL di provenienza. La dichiarazione era quindi inesatta.
- Fraunces e Albert Sans ora sono inclusi nell'app, ridotti ai soli pesi e
  caratteri effettivamente usati: 71 KB in tutto, contro una dipendenza
  esterna a ogni caricamento. Licenze SIL OFL incluse in fonts/.
- Rimossi tutti e tre i punti di innesco: i preconnect e il foglio di stile
  remoto in index.html, l'@import in styles.css, il ramo dedicato ai domini
  Google nel service worker.
- Aggiunta una Content-Security-Policy restrittiva in vercel.json: da ora il
  browser blocca qualunque richiesta esterna non prevista, cosi lo stesso
  errore non puo ripetersi in silenzio. Aggiunti anche Referrer-Policy
  no-referrer e Permissions-Policy restrittiva.
- Service worker passato da network-first a cache-first, con cache agganciata
  al numero di versione: ogni apertura non genera piu una richiesta di rete.
- README e schermata "Cos'e Ninna" riscritti con una formulazione verificabile,
  che distingue i due piani: nessun dato del bambino lascia il dispositivo, e
  nessuna terza parte riceve richieste dall'app.

## v1.2.0 · 26/08/2026
- Aggiunta la schermata "Cos'e Ninna", ispirata a quella gia presente in
  Posa: un link discreto in alto a sinistra nella schermata Oggi apre una
  pagina dedicata con il nome dell'app, la sua frase guida, un selettore di
  lingua e una spiegazione discorsiva di cosa fa l'app, come tratta i dati e
  per chi e pensata. Il testo riprende, in forma narrativa, i contenuti gia
  scritti per i README italiano e inglese del repository.

## v1.1.7 · 26/08/2026
- Suoni: volume e spegnimento automatico erano resi come campi di modulo,
  impilati sotto la lista senza stacco, come se appartenessero a un form di
  inserimento. Ora sono un pannello di controllo distinto, separato da una
  linea, con il valore del volume mostrato in percentuale e aggiornato dal
  vivo mentre si trascina, e il menu dello spegnimento su una riga propria
  con area di tocco adeguata.
- Impostazioni: "Riepilogo per il pediatra" ora dichiara il formato (PDF),
  come gia facevano gli altri due export.
- Rimosse tutte le lineette lunghe da ogni file del progetto, sostituite con
  punteggiatura italiana (due punti, virgole) negli incisi e con il punto
  mediano nei separatori, coerente con l'uso gia diffuso nell'app.

## v1.1.6 · 26/08/2026
- Fix: con la tab bar resa più trasparente (v1.0.2), il contenuto che
  scorreva sotto restava visibile a bordi netti attraverso il vetro:
  un effetto di sovrapposizione poco elegante. Aggiunto un velo di
  dissolvenza fisso appena sopra la tab bar (puro CSS, nessuna logica):
  il contenuto ora sfuma verso il colore di fondo prima di raggiungerla,
  invece di intravedersi. Nessun impatto su scroll o interazioni.

## v1.1.5 · 26/08/2026
- Audit della Guida: il badge "X min" non veniva mai allineato a destra del
  titolo perché il markup non applicava mai la classe CSS che lo prevedeva:
  regola morta dalla prima versione, ora rimossa (era duplicata anche nel
  file di anteprima).
- Titolo e corpo degli articoli avevano solo una differenza di luminosità
  (bianco vs grigio chiarissimo), non un vero contrasto cromatico. Il
  titolo di ogni articolo è ora in menta, leggermente più grande (18,5px),
  con una linea sottile di distacco prima del corpo del testo quando si apre
 : gerarchia più chiara, resa solo negli articoli della Guida, senza
  toccare le intestazioni condivise dal resto dell'app.

## v1.1.4 · 26/08/2026
- Audit della schermata Suoni: l'indicatore play/stop era testo puro
  (▶/◼) a dimensione ereditata, senza distinzione visiva tra i due stati.
  Sostituito con un vero bottone circolare da 44px (soglia minima di
  accessibilità per il tocco), icone vettoriali al posto dei caratteri
  unicode, e colori di stato opposti: menta per play, rosa pieno per stop:
  ora lo stato dell'audio si riconosce a colpo d'occhio, non solo leggendo
  il simbolo.

## v1.1.3 · 26/08/2026
- Fix: "Riepilogo per il pediatra" apriva una scheda vuota ("about:blank") su
  alcuni browser mobile, in particolare da app installata. Causa: si
  scriveva il contenuto in una finestra vuota dopo averla aperta, un metodo
  che molti browser bloccano silenziosamente. Ora la pagina viene generata
  come file autonomo e aperta direttamente; se il browser blocca comunque la
  nuova scheda, il file viene scaricato come ripiego invece di fallire senza
  spiegazione.

## v1.1.2 · 25/08/2026
- La luna nella schermata iniziale non è più un carattere unicode generico
  (☾): è il logo vero, luna e stella isolate dal file sorgente su sfondo
  trasparente. Prima dell'onboarding e le icone dell'app mostravano due
  simboli diversi; ora sono lo stesso identico glifo.

## v1.1.1 · 25/08/2026
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

## v1.1.0 · 25/08/2026
- **Modalità solo diario**: interruttore nelle impostazioni che nasconde
  previsioni, confronti, statistiche e il tab Statistiche, lasciando solo il
  registro di quello che è successo. Pensata per chi si accorge che guardare
  i numeri sta diventando fonte di preoccupazione più che di aiuto. La
  preferenza è persistente e viaggia col backup.
- **Riepilogo per il pediatra**: genera una tabella dei 14 giorni con dati
  registrati e medie, pronta da stampare o salvare in PDF con la funzione di
  sistema (nessuna libreria PDF aggiunta). Include la nota sulla variabilità
  individuale e la precisazione che i dati sono auto-registrati dai genitori.

## v1.0.3 · 25/08/2026
- Scorciatoie rapide: tenendo premuta l'icona di Ninna in schermata Home
  compaiono "Inizia pisolino" e "Inizia nanna", che registrano il sonno
  all'apertura senza altri tocchi. Protetto contro doppie registrazioni
  (URL ripulito subito, nessuna azione se un sonno è già in corso).
- Statistiche senza giudizio: rimosse le etichette "sotto / sopra / nel
  range ✓" e la riga "Bilancio sonno". I valori sono ora affiancati
  all'intervallo tipico per l'età, con una nota esplicita sulla variabilità
  individuale. I dati restano gli stessi, sparisce il tono da pagella.

## v1.0.2 · 25/08/2026
- Tab bar flottante resa più trasparente (opacità 0.38, blur 34px): il
  contenuto che scorre sotto è ora visibile attraverso il vetro.

## v1.0.1 · 25/08/2026
- Fix: la tab bar e i toast potevano sembrare "muoversi" durante lo scroll su
  mobile, per via del ricalcolo di `100vh` allo sparire/apparire della barra
  indirizzi del browser. Corretto con `100dvh`, `overscroll-behavior` e
  promozione degli elementi fissi a un proprio layer di compositing.
- Aggiunta numerazione di versione (visibile in Impostazioni), cache del
  service worker allineata alla versione.

## v1.0.0 · 25/08/2026
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
