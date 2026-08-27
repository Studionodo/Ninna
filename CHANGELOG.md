# Changelog: Ninna

Versionamento semantico (MAJOR.MINOR.PATCH). Ogni release da qui in avanti
viene registrata qui, in ordine cronologico, più recente in cima.

## v1.9.2 · 27/08/2026
Intervento sul contrasto del tema chiaro, misurato invece che stimato.
- **Il tema chiaro non era leggibile all'aperto.** Contrasti verificati
  col criterio WCAG AA (4.5:1): il menta, colore di tutte le etichette dei
  pulsanti e dei link, stava a 3.15:1; il testo bianco sul pulsante indaco a
  4.11:1; il testo sulla pillola della scheda attiva a 3.23:1. Tutti e tre
  sotto soglia. Colori corretti mantenendo la stessa tinta: ora il valore
  peggiore dell'intera interfaccia chiara e' 4.64:1, tutto conforme.
- **La schermata Impostazioni restava scura in tema chiaro.** Causa: fondo
  della finestra scritto a mano invece che legato al tema. Trovati e
  corretti tutti i 15 punti con colori fissi (finestre, velo di sfondo,
  barra delle schede, sfumature dei pulsanti, riquadri): ora ogni tinta
  deriva dal colore del tema attivo.
- Riquadro introduttivo "Iniziamo" ora sparisce dopo la prima registrazione,
  non solo dopo il primo sonno: da li' in poi timeline e diario dicono gia'
  cosa sta succedendo.
- Pulsante "Notte" in alto a destra reso piu' riconoscibile: menta tenue al
  posto del grigio, senza diventare predominante (l'indaco resta riservato
  al pulsante principale).
- La legenda della timeline in v1.9.1 mostrava le chiavi grezze
  (`tl_legend_nap`): era ancora il residuo del difetto di cache corretto
  nella stessa versione, con `app.js` nuovo e `i18n.js` vecchio. Questa e' la
  prima versione che si installa con il prelievo forzato dalla rete.

## v1.9.1 · 27/08/2026
- **Correzione della causa per cui la v1.9.0 e' arrivata a meta'.** Il service
  worker popolava la propria cache con `cache.addAll`, che passa dalla cache
  HTTP del browser: all'installazione di una versione nuova poteva quindi
  ricopiare file vecchi ancora validi per il browser. Risultato concreto sul
  telefono: JavaScript aggiornato (icona X, etichette) con CSS vecchio
  (nessuna pillola sull'uscita, pulsanti non impilati). Ora ogni file della
  shell viene prelevato forzatamente dalla rete, e `vercel.json` marca i file
  dell'app come sempre da rivalidare.
- Pulsanti secondari della modalita' notte ristrutturati: il cerchio e'
  ora un contenitore esplicito invece di uno stile applicato direttamente
  all'SVG, e l'etichetta ha un elemento proprio. Piu' prevedibile fra
  browser diversi, e non piu' soggetto alla sovrapposizione vista in v1.9.0.
- Aggiunta una legenda compatta sotto la timeline (pisolino, nanna, poppata)
  con i campioni di colore corrispondenti: spiega la barra a chi la vede per
  la prima volta senza occupare una riga di prosa.

## v1.9.0 · 27/08/2026
- Fix reale: il toast di conferma (es. "Allattamento registrato") si
  disegnava dietro la modalita' notte per un z-index piu' basso della sua
  sovrapposizione: toccando allattamento o biberon nello schermo notte non
  si vedeva alcuna conferma, anche se l'azione veniva registrata
  correttamente. Corretto portando il toast sopra ogni altro livello.
  Aggiunto anche un feedback di pressione immediato sui due pulsanti,
  indipendente dal toast.
- Modalita' notte: pulsante di uscita reso piu' visibile (icona + sfondo,
  non piu' solo testo appena percettibile), pulsante grande con un filo di
  definizione in piu' (bordo e alone piu' netti, restando comunque scuro),
  etichette di testo sotto i due pulsanti secondari perche' un cuore da
  solo non comunica "allattamento".
- Riepilogo per il pediatra riscritto da zero: non apre piu' una scheda
  separata (che si era gia' rotta due volte per motivi diversi legati ai
  popup su mobile). Ora vive dentro l'app come una schermata a schermo
  intero, e "Stampa o salva in PDF" chiama `window.print()` sulla finestra
  principale invece che su un popup. Una regola di stampa dedicata isola
  solo il contenuto del report sulla pagina stampata, forzando colori
  chiari a prescindere dal tema attivo.
- Aggiunto `HANDOVER.md`: note tecniche non ovvie per chi riprende il
  progetto (perche' l'audio passa da un elemento nascosto, i limiti
  dell'ambiente di test disponibile, la disciplina versione/cache).

Verificato con test funzionali reali su jsdom, incluso un caso che ha
rivelato un limite dell'ambiente di test stesso (gli attributi onclick
inline non si eseguono senza un'opzione esplicita) prima di essere
scambiato per un bug dell'app.

## v1.8.0 · 26/08/2026
- Fix visivo: il badge dell'eta ("3 giorni") poteva spezzarsi su due righe
  con il bordo arrotondato duplicato, per un `white-space` mancante.
- La timeline compare solo se oggi c'e' almeno un evento registrato: niente
  piu' barra vuota a costo pieno nei primi giorni.
- La sezione Salute non e' piu' sempre aperta: un link "+ Salute" la rivela
  solo quando serve, stesso trattamento gia' usato per "Aggiungi sonno
  passato". Le vitamine non hanno bisogno della stessa prominenza permanente
  di un pannolino.
- Controlli di sistema per i suoni: play/pausa/stop ora compaiono nella
  notifica Android, nella schermata di blocco e nel pannello multimediale
  del sistema, con nome del suono e icona di Ninna. Tecnicamente, l'audio
  passa ora attraverso un elemento `<audio>` nascosto invece che
  direttamente sugli altoparlanti: e' l'unico modo per cui il sistema
  operativo riconosca una sessione multimediale attiva, ed e' anche il modo
  in cui il browser tratta con piu' clemenza le pagine web quando lo
  schermo si spegne. Ricade sul comportamento precedente su browser che non
  supportano questa API.

Verificato con un ambiente Web Audio simulato (jsdom non implementa questa
API, nessun browser reale era installabile in questo contesto): confermato
che l'audio esce da un solo percorso (mai duplicato sugli altoparlanti E
sull'ancora insieme), che i tre gestori di sistema sono registrati, che il
tasto "pausa" del sistema ferma davvero l'audio e non solo l'icona, e che
il ripiego su browser senza questa API continua a funzionare come prima.

## v1.7.0 · 26/08/2026
Modalita' notte: schermo nero con un solo tasto grande, pensato per
allattare o gestire un risveglio senza accendere la luce.
- Attivazione manuale sempre disponibile: un pulsante "Notte" (icona +
  etichetta, non un'icona muta) nell'header di Oggi.
- Attivazione contestuale, una sola volta: la prima volta che si preme
  "Inizia nanna", un breve prompt spiega cos'e' la modalita' e offre di
  attivarla subito. Non si ripresenta piu' dopo la prima risposta, qualunque
  essa sia.
- Il tasto grande si adatta alla situazione: "Sveglio" se un sonno e' in
  corso (con timer live), altrimenti il prossimo sonno consigliato, con la
  stessa logica gia' usata in Oggi. Due tasti piu' piccoli sotto per
  allattamento e biberon, il bisogno notturno piu' comune, senza dover
  uscire dallo schermo scuro.
- Nero vero indipendentemente dal tema chiaro/scuro/automatico scelto
  altrove: qui l'obiettivo e' zero luce emessa, non coerenza estetica.
- Una didascalia permanente e discreta spiega sempre cos'e' lo schermo,
  per chiunque ci arrivi in qualunque modo.

Trovato durante il collaudo: due funzioni chiamavano l'oggetto NINNA come
riferimento globale bare invece di usare `this`, un pattern mai usato prima
nel file. Funziona nel browser reale ma il test automatico l'ha segnalato
comunque: corretto per essere robusto in ogni contesto, non solo in quello
in cui capitava di funzionare.

## v1.6.0 · 26/08/2026
Timeline visiva della giornata, in cima a Oggi: una barra 00-24 con i
blocchi di sonno (menta per i pisolini, indaco-violetto per la nanna,
riusando lo stesso colore dell'anello quando il bambino dorme) e un
puntino per ogni poppata. Riusa lo stesso ritaglio a mezzanotte gia'
presente nel motore, quindi una nanna a cavallo di due giorni appare
divisa correttamente su entrambi. Un sonno ancora in corso si allunga
in tempo reale verso l'ora attuale, segnata da una sottile linea verticale.
Resta visibile anche in modalita' solo diario: mostra cosa e' successo,
non lo confronta con nessun valore atteso.

Corretto durante lo sviluppo: un primo tentativo aveva lasciato scritta
solo la chiamata alla funzione, non la funzione stessa, per un errore di
script che si era fermato a meta' senza salvare. Il test funzionale
automatico l'ha rilevato subito, prima di qualunque consegna.

## v1.5.0 · 26/08/2026
Tema Chiaro/Scuro/Automatico, in Impostazioni accanto alla lingua.
- Automatico segue l'impostazione del sistema (prefers-color-scheme) e si
  aggiorna da solo se cambia mentre l'app e' aperta. Chiaro e Scuro
  restano fissi indipendentemente dal sistema.
- Meccanismo interamente locale: nessuna chiamata di rete, nessun permesso,
  coerente con la CSP e con quanto dichiarato su privacy e dati.
- Limite architetturale onesto: lo splash screen di Android all'avvio
  dell'app installata resta fisso al colore dichiarato nel manifest
  (statico, letto una sola volta all'installazione). Solo l'interfaccia
  dell'app cambia aspetto dal vivo.
- Audit del codice: diversi colori erano scritti a mano invece di usare le
  variabili del tema (anello del sonno, riquadro "perche' quest'orario",
  banner delle transizioni, testo della Guida e di "Cos'e Ninna", tasto
  elimina). Corretti tutti. Trovato anche un bug reale che il tema chiaro
  avrebbe reso visibile: il toast usava testo quasi nero su uno sfondo che
  in chiaro sarebbe diventato scuro, rendendolo illeggibile. Ora usa
  l'abbinamento menta/testo-su-menta gia' corretto per costruzione.
  Rimossa anche una regola CSS (.footer) mai piu' usata dalla v1.1.

## v1.4.1 · 26/08/2026
Audit completo delle icone: l'app usava emoji di sistema (rese diversamente
da ogni produttore) mescolate a icone disegnate a mano per player e caffe,
due linguaggi visivi diversi nella stessa interfaccia.
- Dieci icone nuove, disegnate come linea sottile coerente (stesso spessore,
  stessi angoli arrotondati del resto dell'app): nuvola, luna, cuore,
  biberon, ciotola, spilla, occhio, boccetta, goccia, capsula. Sostituiscono
  ogni emoji nei tile, nelle righe del diario, nei pulsanti e nella card
  della nanna serale. Ogni icona verificata singolarmente e in insieme prima
  dell'implementazione.
- Le due opzioni del menu a tendina nell'inserimento manuale restano solo
  testo: e' un limite dei controlli nativi del browser, non si puo' mettere
  un'icona dentro un <option>.
- Aggiunta una matita discreta accanto all'orario di ogni voce del diario,
  segnale visivo che la riga si puo' toccare per correggerla.
- Verificato con un test funzionale reale (jsdom): l'app vera caricata,
  renderizzata con dati reali, controllato che le icone appaiano nel DOM e
  che il tocco su una voce apra davvero la modifica.

## v1.4.0 · 26/08/2026
Tre funzioni insieme, su moduli separati. Lo schema multi-bambino e' rinviato
di proposito a una release dedicata.
- Modifica degli orari: toccando una voce del diario si apre la correzione
  dell'orario (inizio e fine per i sonni, orario singolo per le altre voci).
  La data resta ancorata al giorno originale e le notti a cavallo di
  mezzanotte mantengono la regola dell'inserimento manuale. La X di
  eliminazione resta indipendente dal tocco di modifica.
- Suoni riscritti da zero: ogni suono e' ora un campione sintetizzato con una
  firma propria invece di rumore filtrato. Il battito e' un vero doppio
  impulso a 64 bpm, le onde si gonfiano e si ritirano con due respiri
  sfasati, la pioggia ha goccioline discrete sopra il letto sonoro, lo shhh
  segue un ritmo di respiro. Verificati con test su ampiezze, impulsi e
  distinzione spettrale.
- Sezione Salute: due nuove voci a un tocco, Vitamine e Farmaco, in una riga
  dedicata sotto le attivita. Compaiono nel diario, si correggono e si
  eliminano come le altre, e il riepilogo per il pediatra riporta i totali
  del periodo.

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
