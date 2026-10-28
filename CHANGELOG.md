# Changelog: Ninna

Versionamento semantico (MAJOR.MINOR.PATCH). Ogni release da qui in avanti
viene registrata qui, in ordine cronologico, più recente in cima.

## v2.19.0 · 21/09/2026
**Timer**, come quinta scheda in basso: zona del pollice, usabile con una mano.
- Due tocchi per partire: la scheda, poi una durata (5, 10, 15, 20, 30 minuti,
  oppure "Altro"). Nessun tasto "Avvia" in mezzo. Il grande anello al centro
  riparte con l'ultima durata usata.
- Avviso a scelta, memorizzato una volta sola: suono, vibrazione o entrambi.
  La vibrazione compare solo dove il browser la supporta davvero (su iPhone
  no): altrimenti resta il solo suono, dichiarato. Il suono e' un rintocco
  morbido sintetizzato, non una sveglia: suona accanto a un neonato.
- Anello che si svuota con un leggero "respiro", stesso linguaggio visivo
  dell'anello della pressione; allo scadere diventa rosa e pulsa piano.
- Mentre corre, una pillola col tempo resta visibile nelle altre schede e in
  modalita' notte (smorzata); in notte il tocco a tempo scaduto spegne
  l'avviso senza far uscire dal buio.
- Tutto calcolato dall'orario di fine: se il telefono sospende la pagina, al
  ritorno il tempo e' giusto e, se e' scaduto, l'avviso parte subito. Lo
  schermo resta acceso solo mentre il timer corre. Limite dichiarato: dopo una
  chiusura completa dell'app il suono non puo' ripartire da solo (i browser
  bloccano l'audio finche' non si tocca lo schermo), il timer appare comunque
  come scaduto.

Barra delle schede rifatta per ospitarne cinque: imbottitura laterale ridotta
e larghezza proporzionale all'etichetta. Verificata a 320, 360 e 412 px, in
italiano e inglese: nessuna etichetta tagliata, barra dentro lo schermo.

**Testi**: "centro tra 1h 06m" diventa "ideale verso le 17:40"; "sveglio da
0 min" diventa "appena sveglio".

**Sotto le 8 settimane**: niente piu' avviso "sonno diurno scarso, meglio
anticipare la nanna" (regola valida per bambini piu' grandi, a un mese solo
ansiogena); la nanna serale e' presentata come indicativa; il consiglio della
routine diventa flessibile ("se ha fame, prima la poppata: bastano 5-10
minuti"). Sopra le 8 settimane nulla cambia, verificato su due profili.

Trovati e corretti in collaudo, prima della consegna: la barra a cinque
schede usciva dallo schermo a 360 px (la prima misura controllava le singole
etichette, non la barra intera); in modalita' notte la pillola del timer
restava visibile dopo averlo fermato, perche' il disegno della notte usciva
prima di aggiornarla.

## v2.18.2 · 28/08/2026
Audit totale dopo la pulizia del codice duplicato. Tre residui del mio errore
precedente, piu' un difetto vero trovato per strada.

- **Voce duplicata in Impostazioni**: erano rimaste due voci per i documenti,
  quella originale e la mia. Rimossa la mia.
- **Ventuno chiavi di traduzione orfane**, definite dal mio codice rimosso e
  mai piu' usate: eliminate (con quattro di esse ripristinate subito, perche'
  servivano invece all'implementazione originale — errore individuato e
  corretto nello stesso passaggio).
- **`import_err` mancante**: il messaggio d'errore mostrato quando una
  scansione non riesce a essere letta non era mai stato definito. In caso di
  errore l'utente avrebbe visto la scritta grezza "import_err" invece di una
  frase comprensibile. Aggiunto in entrambe le lingue.

Verificato senza problemi: motore di previsione su dieci casi limite, livello
dati su file malformati e protezione CSV, quindici passaggi d'uso end-to-end,
undici casi ostili (iniezione HTML, doppio tocco, date future, nomi
lunghissimi, eliminazioni di massa), contrasti in entrambi i temi, assenza di
scorrimento orizzontale.

Sezione documenti sotto stress: PIN di 2 cifre e con lettere correttamente
respinti, immagine 4000x3000 ridimensionata entro i limiti, file di testo
respinto senza crash, cancellazione singola che non tocca l'altra scansione,
e localStorage che resta a 130 byte anche con due documenti salvati (le
scansioni vivono in IndexedDB, fuori dal backup del diario). Compressione
misurata su un documento realistico: 914 KB ridotti a 109 KB, 8,3 volte.

## v2.18.1 · 28/08/2026
Nessuna funzione nuova: correzione di un errore mio.

Mi era stata chiesta una sezione per le scansioni dei documenti del bambino
e ho iniziato a costruirla senza prima cercare nel codice se esistesse gia'.
Esisteva: completa di PIN, IndexedDB, compressione, visore, cancellazione e
conteggio dello spazio occupato, scritta in una sessione precedente. Il
risultato e' stato un duplicato parziale che confliggeva con l'originale e
impediva all'app di caricarsi.

Rimosso tutto il codice duplicato (115 righe fra stato, azioni e schermate) e
verificato che l'implementazione originale funzioni: creazione e verifica del
codice, rifiuto del codice sbagliato, compressione (29 KB ridotti a 9 KB in
prova), salvataggio in IndexedDB, persistenza dopo il riavvio dell'app, e
localStorage che resta leggero come deve.

Lezione, per il futuro: prima di aggiungere una funzione, cercarla nel codice
con il suo nome. L'audit iniziale aveva controllato l'architettura di storage
ma non aveva mai cercato la parola "documenti".

## v2.18.0 · 28/08/2026
La schermata di modifica di farmaci e vitamine guadagna un quarto campo:
"Ripeti fra", precompilato con l'intervallo attuale. Prima si poteva
correggere solo data, orario e nome della dose gia' registrata; per
cambiare l'intervallo di ripetizione (da "ogni 6 ore" a "ogni 8", per
esempio, dopo un'indicazione del pediatra) non c'era altra strada che
ricreare la voce da capo in "+ Salute". Ora basta aprire la voce esistente
dal diario e cambiare quel numero, oppure impostarlo su "Non ripetere" per
interrompere il promemoria senza registrare una nuova dose.

Il campo compare solo per farmaci e vitamine, non per gli altri tipi di
registrazione, dove non ha senso. Verificato che il promemoria in Oggi si
ricalcoli davvero sul nuovo intervallo, e che interromperlo da qui lo faccia
sparire senza lasciare residui.

## v2.17.2 · 28/08/2026
Audit completo dell'app: motore di previsione, livello dati, percorso d'uso
end-to-end, casi limite ostili, contrasti e aree tattili. Due problemi reali
trovati e corretti; il resto e' risultato solido.

**Si poteva registrare nel futuro.** Nella schermata di modifica, spostando
una voce a una data futura, il salvataggio la accettava: l'attributo `max`
sul campo data e' solo un suggerimento e i browser non lo impongono. Un
biberon datato "fra sette giorni" avrebbe falsato statistiche e previsioni.
Ora il controllo e' rifatto al salvataggio, sia sulla data sia sull'orario.

**Tre aree tattili troppo piccole per un'app che si usa di notte.** Il tasto
"Notte" era alto 31 pixel, le impostazioni 38, i link "+ Salute" e "+ Aggiungi
sonno passato" 23. Portati tutti a 44, senza cambiarne l'aspetto: cresce solo
l'imbottitura invisibile. Non ho toccato la matita del diario (26px) perche'
vive dentro una riga cliccabile molto piu' grande, ne' le schede in basso
(88x36), gia' ampie in larghezza.

Verificato e risultato senza problemi: robustezza del motore su dieci casi
limite (neonato di 0 giorni, bambino di 3 anni, date impossibili, mille
eventi, sonni a cavallo di mezzanotte), filtraggio degli import malformati,
protezione del CSV da punti e virgola e virgolette, iniezione HTML nei campi
liberi (nome del bambino e note), doppio tocco rapido, eliminazione di tutte
le voci, nomi lunghissimi, eventi di un anno fa, contrasti in entrambi i temi
(tutti sopra il minimo AA), assenza di scorrimento orizzontale.

## v2.17.1 · 28/08/2026
Corretto un difetto reale nel diario: toccare la matita per modificare una
voce poteva eliminarla invece. Causa: il pulsante elimina ha una zona di
tocco allargata a 44 pixel per comodita', ma centrata su una "X" larga
pochi pixel - la sua area invisibile arrivava a toccare quella della
matita accanto, che non aveva alcuno spazio proprio (era solo un'icona
decorativa, l'intera riga gestiva il tocco).

Corretto in tre punti, negli stessi identici termini in entrambi i file:
- La zona invisibile della X ora ha un margine positivo a sinistra, invece
  di espandersi simmetricamente verso la matita.
- La matita ha ora un proprio spazio minimo, distinto da quello della X.
- La sua opacita' a riposo sale da 0,5 a 0,68, per essere piu' facile da
  individuare anche prima di toccarla.

Verificato misurando le due zone sul motore reale: 16 pixel di distanza fra
i bordi, zero sovrapposizione, e un tocco simulato esattamente al centro
della matita apre la modifica senza sfiorare l'eliminazione.

## v2.17.0 · 28/08/2026
Due limiti della schermata di modifica, corretti insieme perche' nascevano
dalla stessa richiesta.

- **La data**: prima si poteva correggere solo l'orario di una registrazione,
  mai il giorno. Ora un campo data si aggiunge a fianco, per tutti i tipi di
  evento — utile per chi registra a mezzanotte passata pensando sia ancora
  "ieri", o si accorge il giorno dopo di una dose dimenticata.
- **La nota**: prima esisteva solo per farmaci e vitamine. Ora e' disponibile
  ovunque — biberon, pappa, pannolino e gli altri — con un suggerimento
  diverso per ciascuno (ml e tipo di latte, cosa ha mangiato, marca del
  pannolino). Resta facoltativa: chi vuole solo registrare tocca un tasto e
  basta, la nota si aggiunge dopo, aprendo la voce dal diario.

Le note extra compaiono ora anche nel riepilogo per il pediatra, in una
sezione a parte elencata per data — a differenza di farmaci e vitamine, il
cui nome si ripete e viene raggruppato, qui il testo cambia quasi sempre da
una registrazione all'altra. Il CSV le includeva gia' per ogni tipo: nessuna
modifica necessaria li'.

Durante la verifica e' emerso un difetto reale nella prima stesura: il campo
nota compariva anche per pisolini e nanna, che non lo prevedono — mancava un
controllo presente correttamente nel file di anteprima .jsx ma non nella
PWA. Trovato con un test mirato sul pisolino, non da una lettura del codice,
e corretto prima della consegna.

## v2.16.0 · 28/08/2026
La notifica della routine serale dice "45 minuti alla nanna: luci basse,
stessa sequenza di sempre", ma toccandola si arrivava a una schermata dove
quel consiglio non era scritto da nessuna parte: restava solo l'orario. Il
messaggio utile spariva insieme alla notifica.

Ora, dentro la finestra dei 45 minuti, la card principale mostra anche il
consiglio: "È il momento: luci basse e la stessa sequenza di sempre",
in menta sotto l'orario della routine.

Nota sul percorso: il primo tentativo aveva messo il consiglio nella riga
"Da tenere d'occhio", che pero' in quella finestra temporale non esiste —
quando la nanna si avvicina, la card principale passa a "Ora della nanna" e
quella riga sparisce per non ripetere lo stesso orario due volte. Era codice
irraggiungibile: il test con l'orologio simulato lo ha rivelato prima della
consegna, e il consiglio e' stato spostato nella card principale, l'unica
visibile in quel momento. Verificato a quattro orari diversi della giornata.

## v2.15.1 · 28/08/2026
Nuova icona per "Farmacia di turno". La precedente era un quadrato
arrotondato con dentro un "+": rompeva lo stile in due modi, perche' era
l'unica delle nove icone della griglia ad avere una cornice attorno, e
perche' un "+" generico si legge come "aggiungi" piu' che come "farmacia".

Ora e' una piccola facciata con la croce sopra, disegnata dentro le stesse
convenzioni delle altre (tratto 1.6, estremi arrotondati, nessun
riempimento, nessun contenitore). Proporzioni ritoccate dopo un confronto
visivo diretto accanto a Vitamine e Farmaco: croce piu' aperta e tetto piu'
alto, per reggere lo stesso peso visivo delle sorelle.

La memoria del comune cercato, verificata di nuovo in questa occasione,
funziona gia' come previsto dalla v2.14.0: resta salvata e ricompare nel
campo alla riapertura, pronta da usare o da modificare.

## v2.15.0 · 28/08/2026
Non abbiamo reso fisse le tre card di "+ Salute" (Vitamine, Farmaco,
Farmacia di turno) come discusso: avrebbe ripetuto lo stesso errore gia'
corretto nella ristrutturazione di qualche versione fa, dando a un'azione
rarissima (la farmacia di turno) lo stesso peso di una frequentissima
(Allattamento). Misurato anche il costo concreto: 86 pixel in piu' su ogni
apertura di Oggi, la schermata piu' visitata.

Il vero problema, chiarito dopo, era un altro: "+ Salute" si richiudeva da
sola **a ogni ricarica dell'app** e persino **dopo ogni singola
registrazione** nella stessa sessione — durante un ciclo di dosi
ravvicinate, un attrito reale, non immaginario.

Corretto entrambi:
- La scelta di tenerla aperta o chiusa ora si ricorda, sopravvive alla
  chiusura e riapertura dell'app.
- Non si richiude piu' da sola dopo aver registrato qualcosa.

Resta chiusa di default per chi non l'ha mai aperta. Chi la apre una volta,
la ritrova aperta la prossima volta — un compromesso pensato apposta per non
imporre a tutti quello che serve solo a chi ne ha davvero bisogno in quel
momento.

## v2.14.2 · 28/08/2026
Due difetti nei promemoria di dose, entrambi confermati con uno screenshot.
- **L'orario della prossima dose non era in grassetto quanto quello della
  nanna serale**, nella stessa card. La riga della nanna avvolge l'orario in
  un tag apposta, in aggiunta al peso 600 gia' sulla riga intera; quella
  della dose usava l'orario come testo semplice, con solo il peso di base.
  Corretto in entrambi i punti in cui la dose viene mostrata: la riga in
  Oggi e la schermata dedicata che si apre al tocco.
- **L'icona era sempre quella del farmaco, anche per un integratore.** La
  Vitamina D del tuo screenshot mostrava la capsula invece della goccia
  usata ovunque altrove per le vitamine. Causa: l'icona era scritta a mano
  invece di leggere il tipo vero della registrazione. Corretto in tre punti:
  la riga in Oggi, la schermata dedicata, e la stessa svista trovata anche
  nel file di anteprima .jsx.

## v2.14.1 · 28/08/2026
Corretta l'asimmetria nella sezione "+ Salute" introdotta dalla farmacia di
turno. La griglia era stata forzata a due colonne quando conteneva solo
Vitamine e Farmaco; con la terza piastrella, quella stessa regola lasciava
"Farmacia di turno" da sola su una riga nuova, con spazio vuoto a fianco.
Rimossa la forzatura: la griglia standard a tre colonne, la stessa gia' in
uso per le sei piastrelle sopra, allinea le tre voci in un'unica riga.

## v2.14.0 · 28/08/2026
Aggiunta la funzione "Farmacia di turno" discussa qualche versione fa, che
era rimasta solo decisa e mai scritta. Terza piastrella in "+ Salute",
accanto a Vitamine e Farmaco.

Nessun sito fisso e nessun aggregatore: un tocco chiede il comune, e apre
una ricerca mirata ("farmacia di turno oggi {comune}") in una scheda nuova,
lasciando che sia il motore di ricerca a scegliere la fonte piu' aggiornata
per quella zona in quel momento — la stessa conclusione a cui eravamo
arrivati confrontando PharmAround, Google Maps e gli altri aggregatori: nessuno
e' affidabile ovunque, quindi non ne scegliamo uno fisso per conto dell'utente.

Il comune resta ricordato per la volta successiva. Nessuna connessione
verso l'esterno finche' non si preme "Cerca": verificato registrando ogni
richiesta di rete durante l'intera interazione, non solo leggendo il codice.

## v2.13.2 · 28/08/2026
Il testo dentro "Da tenere d'occhio" (nanna serale, promemoria di dose)
usava lo stesso grigio secondario dell'anello della pressione del sonno —
corretto la' dove sta sotto un numero enorme, spento qui dove invece e' lui
il contenuto principale della card. Portato al colore di testo pieno e a
peso 600, dopo un confronto diretto su schermo reale.

## v2.13.1 · 28/08/2026
Corretta una sovrapposizione visibile solo nella primissima "Inizia nanna" in
assoluto: quel tocco fa partire sia il toast di conferma sia la finestra che
suggerisce la modalita' notte, e i due comparivano nello stesso istante — il
toast, con la sua posizione fissa in basso, finiva sopra il testo della
finestra, tagliandolo a meta'.

Corretto evitando che il toast compaia in quel caso specifico: la finestra
stessa conferma gia' che la nanna e' iniziata, il toast sarebbe stato
ridondante oltre che sovrapposto. In ogni altro caso — nanne successive,
pisolini — il toast normale resta invariato. Verificato tutti e tre i casi
su Chrome reale.

## v2.13.0 · 28/08/2026
Prima ristrutturazione del layout di Oggi da quando l'app e' nata. Non una
funzione nuova: un riordino, dopo che dodici blocchi impilati avevano
raggiunto quasi una schermata e mezza di scorrimento.

**Zone esplicite.** La schermata e' ora divisa in tre aree con un'etichetta
discreta ciascuna (lo stesso stile maiuscoletto gia' usato nella Guida per
le categorie): "Da tenere d'occhio", "Registra", "Oggi". Prima tutto aveva
lo stesso peso visivo e la stessa forma - la previsione principale e un
promemoria di farmaco erano entrambi un rettangolo arrotondato, distinguibili
solo dal colore.

**Un solo blocco per gli avvisi.** La previsione della nanna serale e i
promemoria di dose non generano piu' una card ciascuno: confluiscono in
un'unica card che cresce in righe, non in numero di elementi. Con tre
farmaci in ripetizione si arrivava a quattro card identiche impilate prima
ancora dei tasti di registrazione; ora restano quattro righe dentro un solo
blocco. Se non c'e' nulla da segnalare, la zona sparisce insieme alla sua
etichetta.

Rimosso anche il titolo "Oggi" dentro la card del diario, che duplicava
l'etichetta di zona appena sopra, e le regole CSS della vecchia card di dose,
diventate codice morto.

Nota onesta sul risultato: con un solo avviso attivo la schermata e' circa 80
pixel piu' alta di prima, perche' le etichette costano spazio. Il guadagno si
vede quando gli avvisi si accumulano - ed e' li' che il problema esisteva.

## v2.12.0 · 28/08/2026
Il promemoria di dose diventa a tre stati, tutti con lo stesso rosa gia'
usato in Ninna per gli avvisi (".amber" era gia' --rose: nessun colore
nuovo introdotto).
- **Normale**: testo neutro, come prima.
- **In avvicinamento** (ultimi 30 minuti, lo stesso anticipo gia' usato dalle
  notifiche del sonno): il testo passa al rosa.
- **Pronta**: sfondo e bordo rosa che pulsano lentamente (la stessa curva
  gia' usata per l'anello della pressione del sonno), finche' non la tocchi.

**Toccare la card ferma il lampeggio e apre una schermata dedicata**, prima
inesistente: mostra l'ultima somministrazione e offre due azioni - registrare
subito una nuova dose mantenendo la stessa ripetizione, oppure registrarla
interrompendo il promemoria. Il lampeggio si ripristina da solo alla dose
successiva, senza bisogno di ripulire alcuno stato: e' agganciato all'orario
dovuto, non al nome, quindi un nuovo orario riparte gia' spento.

Durante la verifica e' emerso un difetto di logica reale: "interrompi la
ripetizione" non funzionava, perche' il calcolo considerava solo le
registrazioni che avevano gia' un intervallo impostato, lasciando riemergere
una versione piu' vecchia del promemoria invece di cancellarlo. Corretto:
ora conta sempre la registrazione piu' recente per quel nome, con o senza
ripetizione.

## v2.11.0 · 28/08/2026
Promemoria per farmaci e integratori, nella versione onesta discussa: non un
allarme garantito (richiederebbe un server, fuori dall'architettura di
Ninna), ma un calcolo mostrato ogni volta che apri l'app, con una notifica
in piu' se capita di averla aperta all'ora giusta — riusando il sistema di
notifiche gia' esistente per le previsioni del sonno.

- **Ripetizione opzionale** al momento di registrare un farmaco o un
  integratore: "Ripeti fra" con le opzioni piu' comuni (4/6/8/12/24 ore) o
  "Non ripetere". Il promemoria e' agganciato al **nome**, non alla singola
  registrazione: se domani dai di nuovo lo stesso farmaco, e' quella voce
  piu' recente a valere.
- **Una riga in Oggi**, nello stesso stile della "Nanna serale prevista" gia'
  esistente: mostra l'orario della prossima dose, o "Puoi ripetere" quando
  e' gia' arrivato.
- **Notifica riusata dal sistema gia' in uso** per gli avvisi di sonno: se
  l'app e' aperta all'ora giusta, arriva un avviso; se e' chiusa, nulla
  arriva — lo stesso limite gia' vero per tutte le notifiche di Ninna,
  dichiarato non nascosto.

Durante la verifica e' emerso un difetto reale, pre-esistente e non legato a
questa funzione: le scorciatoie con i nomi recenti nel modulo Salute
(introdotte tempo fa) avevano un attributo HTML mal formato per una
collisione di virgolette fra il nome e l'attributo che lo conteneva.
Cliccarle non faceva letteralmente nulla, in silenzio, da quando sono state
introdotte — nessun test le aveva mai davvero cliccate. Corretto.

## v2.10.0 · 28/08/2026
Aggiunto un contatore "in riproduzione da..." per il suono attivo, sia in
Suoni sia in modalita' notte.

Durante la verifica, un mio sospetto di bug si e' rivelato un falso allarme:
a 28 secondi dall'avvio, mostrare "0 min" e' l'arrotondamento corretto
(0,47 arrotonda per difetto), non un difetto. Ma proprio da li' e' emerso un
problema di presentazione reale: "0 min" nei primi secondi di ogni
riproduzione suona come un dato rotto. Sotto i 45 secondi il contatore ora
mostra "Appena avviato" invece di un numero.

Un secondo problema, questa volta vero: nella prima versione il contatore
viveva solo dentro il selettore a schermo intero della modalita' notte — che
pero' si chiude nell'istante in cui tocchi una riga, anche solo per mettere
in pausa o riprendere. Nella pratica non si vedeva quasi mai. Spostato sulla
pillola persistente in alto a destra, quella visibile per tutta la notte:
ora sopravvive a pausa e ripresa fatte direttamente da li', senza dover
aprire il selettore.

## v2.9.1 · 28/08/2026
Due difetti segnalati, entrambi riprodotti e corretti.

**Volume che "a volte non funziona".** Riprodotto: muovendo lo slider e
toccando un altro suono entro 400 millisecondi, lo slider tornava al valore
precedente mentre l'audio suonava a quello nuovo. La causa: il valore veniva
scritto in memoria solo alla fine del ritardo, ma ogni ridisegno ricostruiva
lo slider leggendo il valore vecchio. Ora la memoria si aggiorna subito e
solo la scrittura su disco resta ritardata. Rimossi anche due identificatori
HTML duplicati fra la scheda Suoni e il selettore notturno.

**Tema automatico che resta scuro su alcuni Android.** La logica del tema e'
corretta (verificata in tutte e sei le combinazioni fra sistema e scelta
dell'utente), ma mancava la dichiarazione `color-scheme`. Senza, Chrome su
Android puo' applicare da solo uno scurimento automatico ai contenuti web
ignorando il CSS della pagina, e i controlli nativi (menu del timer,
selettore di data, barre di scorrimento) restano scuri anche in tema chiaro.
Ora e' dichiarata nei tre casi: scuro, chiaro e automatico. Verificato che il
menu del timer, in tema chiaro su un sistema scuro, ora segua l'app.

Nota: se il tema automatico continua a restare scuro con il telefono in
chiaro, la causa e' l'impostazione tema di Chrome stesso, che su Android
determina `prefers-color-scheme` indipendentemente dal sistema. In quel caso
la scelta esplicita "Chiaro" resta la strada giusta.

## v2.9.0 · 28/08/2026
- **Rimosso il pannello volume/timer in fondo alla scheda Suoni.** Da quando
  i controlli si agganciano al suono attivo era diventato ridondante: ora
  esistono solo li', dove servono. A riposo la lista e' pulita.
- **Volume e spegnimento anche nella modalita' notte**: nel selettore dei
  suoni, sotto il suono attivo, compare la stessa riga compatta di Suoni,
  smorzata come tutto il resto di quella schermata. Non serve piu' uscire
  dalla notte per regolare il volume o impostare il timer.
- **Il nome del bambino in Oggi e' ora toccabile** e apre la modifica del
  profilo (nome e data di nascita), con una piccola matita come indizio. La
  modifica introdotta nella v2.7.1 esisteva solo dietro Impostazioni ed era
  difficile da scoprire: ora e' raggiungibile dal punto piu' visibile
  dell'app. Salvando, si torna da dove si era arrivati: a Oggi se aperta dal
  nome, a Impostazioni se aperta da li'.

## v2.8.0 · 28/08/2026
Pagina Statistiche ricalibrata, quattro interventi decisi insieme dopo un
audit con dati realistici.
- **Il giorno in corso non finge piu' di essere un giorno completo.** Prima
  la sua barra, inevitabilmente piu' corta, compariva piena accanto ai
  giorni finiti: ogni mattina il grafico mostrava un crollo che non esisteva.
  Ora e' tratteggiata, etichettata "oggi", con il valore smorzato, ed e'
  esclusa dal calcolo della scala del grafico, cosi' le sue ore parziali non
  comprimono la variazione dei giorni veri.
- **La fascia dell'intervallo tipico per l'eta' sta dietro le barre.** Il
  grafico non parte piu' da zero: con valori tipici fra 12 e 15 ore, da zero
  le barre risultavano tutte uguali. Ora si legge la posizione rispetto alla
  fascia: dentro, sopra, sotto. Una legenda spiega fascia e tratteggio.
- **Via la riga duplicata.** L'intervallo tipico compariva due volte, sotto
  il grafico e nella tabella. Resta nel grafico (come fascia) e nella
  tabella (come "tipico"); la frase sotto il grafico e' stata rimossa. Resta
  invece nel riepilogo per il pediatra, dove un grafico non c'e'.
- **"Oggi in numeri" separa confronti e conteggi.** Sopra il sonno (diurno,
  notturno, e la nuova riga dei pisolini con l'intervallo tipico), un filo di
  separazione, sotto i conteggi nudi (poppate, pannolini, risvegli). In cima,
  una nota chiarisce che la giornata e' in corso e i numeri crescono fino a
  sera.

## v2.7.1 · 27/08/2026
**Nome e data di nascita ora si possono correggere.** Fino a questa versione
non esisteva alcun modo di farlo: la riga del profilo nelle impostazioni era
solo informativa, e l'unica strada per rimediare a un refuso nel nome era
"Cancella tutto e ricomincia", perdendo l'intero diario.

Ora quella riga e' toccabile e apre una schermata di modifica: si corregge
dove la si legge, senza doverla cercare altrove. Inclusa anche la data di
nascita, perche' sbagliarla e' piu' grave di un refuso: falsa previsioni,
statistiche e riepilogo per il pediatra.

Controlli: rifiuta un nome vuoto e una data nel futuro; una nota avvisa che
cambiare la data ricalcola previsioni e statistiche ma non tocca i dati gia'
registrati. Verificato su Chrome reale che dopo la correzione diario, misure
di crescita ed eta' ricalcolata restino tutti coerenti.

## v2.7.0 · 27/08/2026
Controlli del suono ridisegnati su una riga sola. Prima erano quattro righe
impilate: etichetta "Volume" con la percentuale, lo slider a tutta larghezza,
poi "Spegnimento automatico" con il suo menu. Ora sono un'unica riga con
icona altoparlante, slider accorciato, percentuale, un filetto di
separazione, icona orologio e il menu dello spegnimento. Le due etichette
testuali sono state sostituite dalle icone: da sole occupavano circa meta'
dello spazio disponibile.

La card del suono attivo passa cosi' da quattro righe a due, ed e' molto
piu' leggibile a colpo d'occhio.

Nel verificare il risultato e' emerso un difetto che l'aspetto precedente
nascondeva: le aree tattili di slider e menu erano scese a 30 e 33 pixel,
sotto il minimo raccomandato di 44. Su un'app pensata anche per le tre di
notte, con una mano sola, contava. Allargate a 44 e 42 pixel senza cambiare
l'aspetto visivo, perche' il binario dello slider resta disegnato sottile.

## v2.6.1 · 27/08/2026
Il collegamento visivo fra la riga del suono attivo e il pannello
volume/timer, introdotto in v2.6.0, lasciava piccoli artefatti agli angoli
in alcuni contesti di rendering: il trucco usato (`:has()` piu' un margine
negativo per far combaciare due elementi separati) simulava un unico blocco
senza esserlo davvero.

Corretto costruendo l'unione per davvero: quando un suono e' attivo, la riga
e il pannello vivono ora dentro un unico contenitore reale, che possiede
lui solo bordo e sfondo; i due elementi al suo interno restano trasparenti.
Zero trucchi di posizionamento, zero possibilita' di disallineamento.
Verificato su Chrome reale con uno screenshot ravvicinato del blocco:
nessun artefatto residuo.

## v2.6.0 · 27/08/2026
Volume e spegnimento automatico non stanno piu' sempre in fondo alla lista
dei suoni. Prima erano un pannello fisso dopo l'ultima riga (Shhh), scollegato
da qualunque cosa stesse suonando: se era attivo il terzo suono su sette, i
controlli restavano quattro righe piu' in basso, senza alcun legame visivo
con cio' che governavano.

Ora il pannello si aggancia subito sotto la riga del suono attivo, ovunque
essa sia nella lista, con il bordo che si fonde in un unico blocco invece di
restare due elementi separati. Cambiando suono, il pannello si sposta con
lui. Quando nessun suono e' attivo, resta nella posizione di prima, in fondo,
come area per impostare volume e timer prima ancora di scegliere.

Verificato su Chrome reale in tre stati: nessun suono attivo (nessuna
regressione), un suono a meta' lista, e l'ultimo della lista — il pannello
segue correttamente in tutti e tre.

## v2.5.2 · 27/08/2026
- **Corretto un difetto reale di impaginazione**, non solo nella schermata
  Crescita segnalata: ogni riga a due colonne (peso/altezza, inizio/fine di
  un sonno) poteva far traboccare il secondo campo fuori dallo schermo. Causa
  misurata: gli input non avevano mai una larghezza dichiarata, usavano
  quella predefinita del browser (spesso piu' larga della colonna che li
  ospitava) invece di riempirla. Corretto ovunque nell'app, verificato sia
  sulla Crescita sia sulla modifica di un sonno.
- **Testo di apertura corretto e reso meno ridondante.** "Gratuita, senza
  account, dati solo tuoi" aveva un accordo di genere sbagliato (femminile
  dopo un soggetto maschile) e ripeteva "senza account" gia' presente tre
  righe sotto, nello stesso schermo. Ora: "Gratis, per restare solo tuo" —
  stessa informazione, nessuna ripetizione, genere coerente.

## v2.5.1 · 27/08/2026
Aggiunto il riferimento a GitHub, stesso trattamento di Posa: dentro la riga
del copyright, non un pulsante a parte. Trovati due punti dove quella riga
compare (in fondo alla Guida e in "Cos'e Ninna") ed e' stato aggiunto in
entrambi, in entrambe le lingue. Il link si fonde nel testo — stesso colore
della riga, solo sottolineato — invece di saltare all'occhio come farebbe un
link blu di default.

## v2.5.0 · 27/08/2026
- **Onde e pioggia rifatti.** Le onde cambiavano solo di volume, come una
  manopola su un rumore fisso: ora sono due strati distinti, una massa grave
  costante e una schiuma acuta filtrata che sale solo sulla cresta, cosi'
  l'onda cambia colore mentre si rompe. La variazione di timbro misurata
  passa dal 31% al 54%. Le gocce di pioggia erano impulsi di rumore bianco,
  cioe' un "tic": ora sono risonanze smorgate a frequenze diverse, che danno
  il "ploc", e l'intensita' respira invece di restare piatta (variazione dal
  16% al 33%).
- **Trovato e corretto un clic nel loop della pioggia**: le gocce che
  partivano troppo vicino alla fine restavano tagliate a meta', producendo
  uno scatto a ogni ripetizione, ogni 16 secondi. Verificato ora su tutti e
  sette i suoni: nessuna giuntura percepibile.
- **Il messaggio di conferma in modalita' notte** era una pillola menta
  accesa su schermo nero. Ora usa la stessa sobrieta' del resto di quella
  schermata, che esiste proprio per non fare luce.
- **Il link "Offrimi un caffe" era di fatto invisibile**: esisteva solo in
  fondo alla scheda Guida. Aggiunto anche in "Cos'e Ninna", subito dopo i
  paragrafi che spiegano che l'app e' gratuita e senza tracciamento e prima
  del copyright: e' il punto in cui la richiesta ha senso, senza diventare
  un banner.

Nota di metodo: i suoni non sono scaricati dal web, sono generati nel
telefono. Il limite resta che chi scrive il codice non puo' ascoltarli: i
miglioramenti qui sopra sono misurati (variazione di timbro, respiro
dell'intensita', continuita' del loop), non giudicati a orecchio. Il
giudizio finale sulla piacevolezza resta all'ascolto reale.

## v2.4.1 · 27/08/2026
Allineamento della documentazione al lavoro delle ultime dieci versioni.
- **README italiano e inglese riscritti** nella sezione delle funzioni, ora
  raggruppata in quattro aree (prevedere, registrare, accompagnare,
  condividere) invece di un elenco piatto. Aggiunte le nove funzioni
  introdotte e mai documentate: timeline, modalita' notte, crescita, nomi di
  farmaci e integratori, correzione degli orari, riepilogo per il pediatra,
  modalita' solo diario, temi, scorciatoie rapide.
- **Corretta un'affermazione inesatta**: i README promettevano ancora "il
  bilancio rispetto ai valori attesi per l'eta", una funzione rimossa di
  proposito nella v1.0.3 insieme alle etichette di merito. La descrizione
  pubblica prometteva qualcosa che avevamo deciso di non fare.
- **"Cos'e Ninna" ritoccata al minimo**: solo il primo paragrafo, per
  includere salute e crescita fra le cose che l'app registra. Resta una
  presentazione discorsiva e non diventa un elenco di funzioni: quello e' il
  mestiere del README, non suo.
- **Tredicesimo articolo nella Guida**, "Le funzioni meno ovvie": spiega
  timeline, anello della pressione, correzione degli orari, modalita' notte,
  crescita, riepilogo per il pediatra e modalita' solo diario. Sono le
  funzioni che finora si scoprivano per caso, ora descritte nel posto dove
  si cercano le risposte.

## v2.4.0 · 27/08/2026
Tre difetti della modalita' notte, tutti segnalati con screenshot reali.
- **Il selettore dei suoni si sovrapponeva al tasto centrale.** La correzione
  della v2.3.2 (limitare l'altezza della lista) non bastava: con la barra
  indirizzi di Chrome aperta lo schermo utile scende a ~805px e la
  sovrapposizione tornava. Ora il selettore **sostituisce** la schermata
  invece di galleggiarci sopra: a schermo pieno, con i sette suoni in elenco.
  Per costruzione non puo' piu' sovrapporsi a nulla, a nessuna altezza.
  Scegliere un suono chiude il selettore e riporta subito alla schermata.
- **Pausa e play veri, non solo stop.** L'icona sul controllo in alto e' ora
  una pausa (due barre) mentre suona e un play (triangolo) quando e' in
  pausa: la pausa conserva il suono scelto, il tasto "Ferma suono" dentro il
  selettore lo azzera del tutto. Distinzione prima assente.
- **Il tasto centrale non si sposta piu'.** Avviando un pisolino compariva il
  cronometro, che spingeva il cerchio 44px piu' in basso mentre il dito era
  ancora li'. La testata ha ora un'altezza fissa: spostamento misurato 0px.
- Se nessun suono e' mai partito, in alto compare comunque una scorciatoia
  per aprire il selettore, invece di nulla.

Verificato su Chrome reale a tre altezze di schermo (805, 740, 640px):
quindici controlli superati, zero errori. Nota di metodo aggiunta
all'handover: i test vanno eseguiti a un'altezza che tenga conto della barra
del browser, altrimenti danno falsi positivi come e' successo in v2.3.2.

## v2.3.2 · 27/08/2026
Due difetti nello switcher dei suoni della modalita' notte, entrambi
segnalati con uno screenshot reale.
- **La lista dei sei suoni alternativi non aveva un'altezza massima**: con
  tutti e sei visibili, si estendeva abbastanza da sovrapporsi al testo
  "sveglio da X min" al centro dello schermo. Ora l'altezza e' limitata con
  scorrimento interno, e si apre con una piccola animazione invece di
  comparire di scatto.
- **Fermare un suono lo faceva sparire del tutto**: per riaverlo bisognava
  riaprire l'elenco e ripescarlo. Ora il controllo ricorda l'ultimo suono
  scelto anche dopo lo stop: l'icona diventa un tasto "riprendi" (triangolo
  verde) che riavvia lo stesso suono con un tocco, senza dover scegliere di
  nuovo dalla lista. Il controllo sparisce solo uscendo dalla modalita'
  notte.

Verificato su Chrome reale: nessuna sovrapposizione fra lista e testo di
stato, il controllo resta visibile dopo lo stop, la ripresa funziona con un
tocco. Zero errori JavaScript.

## v2.3.1 · 27/08/2026
Prima sessione di collaudo su Chrome reale, con l'app servita su HTTP e
pilotata come la userebbe una persona. Trenta passaggi d'uso completi piu'
sette casi limite: zero errori JavaScript, ma tre difetti reali emersi, che
ne' il controllo di sintassi ne' i test simulati avevano visto.
- **"Cancella tutto e ricomincia" non azzerava le misure di crescita.** Chi
  cancellava tutto si sarebbe ritrovato i dati del bambino precedente: un
  problema di riservatezza, non solo di pulizia. Corretto.
- **Le barre dei grafici potevano apparire tutte della stessa altezza.**
  Mancava `flex-shrink: 0`: quando la barra piu' le etichette superavano il
  contenitore, il browser le comprimeva, e valori diversi finivano identici a
  schermo. Riguardava sia il grafico del sonno a 7 giorni sia quello della
  crescita. Corretto, con le altezze riscalate perche' le differenze restino
  sempre leggibili.
- **Durate negative a schermo** ("sveglio da -7 min") se l'orologio del
  dispositivo si sposta o un evento risulta datato di poco nel futuro. Ora il
  minimo mostrato e' zero.
- Rifiniture nella schermata Crescita emerse guardandola davvero: date in
  formato locale invece che ISO grezzo, "cranio" al posto di "Circonferenza
  cranica" nel riepilogo compatto, larghezza massima delle barre quando le
  misure sono poche.

## v2.3.0 · 27/08/2026
Due funzioni distinte, sviluppate e verificate separatamente.

**Sezione Crescita**, come discusso: peso, altezza, circonferenza cranica nel
tempo, sesso del bambino come dato fisso del profilo. Nessuna curva, nessun
percentile, nessun confronto con popolazioni di riferimento. Terza card in
Statistiche (dopo "Oggi in numeri"), che mostra l'ultima misura a colpo
d'occhio senza dover aprire nulla. Da lì si apre la schermata completa:
storico, aggiunta di una nuova misura (anche un solo valore, non serve
compilarli tutti), andamento del peso quando ci sono almeno due misure,
eliminazione. Presente nel riepilogo per il pediatra con il sesso, se
impostato. Non compare mai nel diario di Oggi: sono misure episodiche, non
quotidiane.

**Switcher dei suoni nella modalità notte**: il controllo in alto a destra
non è più un solo pulsante che ferma l'audio. Nome e stop sono ora separati;
toccando il nome si apre un piccolo elenco degli altri sei suoni, e sceglierne
uno cambia l'audio senza uscire dalla modalità notte.

Durante la preparazione, un errore mio ha cancellato per sbaglio l'intestazione
della funzione del riepilogo per il pediatra, lasciandone il corpo orfano:
`node --check` non l'ha rilevato, il test funzionale che carica il file per
davvero sì. Corretto prima di consegnare. Entrambe le funzionalità verificate
con test reali (12 controlli), inclusi i due controlli statici ormai di
routine sul file di anteprima .jsx (variabili non dichiarate, classi CSS
orfane): zero problemi residui.

## v2.2.0 · 27/08/2026
L'anello della pressione del sonno poteva mostrare "150%" completamente
pieno: il disegno si ferma per forza al 100% (un cerchio non puo' disegnare
piu' di un giro), ma il numero dentro continuava a salire, raccontando due
cose diverse nello stesso punto.
- Il numero non supera mai 100%, come il disegno: stesso limite per
  entrambi, nessun valore che sembra un errore.
- Oltre quella soglia, l'anello pulsa lentamente invece di restare fermo:
  e' il segnale di "stiamo andando oltre", senza aggiungere un testo che
  potesse suonare come un avviso.
- L'anello e la scritta "pressione del sonno" sono ora tappabili: un tocco
  apre una spiegazione breve di cosa significhi il numero, dove serve
  leggerla invece che solo nella Guida.

Nella stessa occasione, un residuo trovato nel file .jsx: il cerchio di
sfondo dell'anello aveva ancora un colore fisso invece di seguire il tema,
sfuggito all'audit sui contrasti di qualche versione fa perche' quella
volta era stata corretta solo la PWA. Corretto anche li'.

## v2.1.1 · 27/08/2026
Il player diventa dinamico, come discusso.
- Sparisce del tutto sulla scheda Suoni: la riga del suono attivo ha gia' il
  suo controllo, un secondo indicatore lì sarebbe ridondante.
- Uscendo da Suoni con un audio attivo, si apre a piena dimensione: e' il
  momento in cui conferma che il suono e' ancora acceso.
- Se lo riduci a pallino su un'altra scheda, la scelta resta rispettata
  passando ad altre schede (Oggi, Statistiche, Guida non si scambiano fra
  loro il reset). Torna a comparire pieno solo rientrando su Suoni e
  uscendone di nuovo.
- Apertura e riduzione animate con la stessa curva a molla gia' usata nel
  resto dell'app, non un comparire a scatto.
- Il render periodico dei 30 secondi non ridisegna piu' il player quando il
  suo contenuto non e' cambiato: evita che l'animazione ripartisse da sola
  ogni mezzo minuto mentre un suono resta attivo.

Durante la preparazione, il controllo delle variabili non dichiarate (nuovo
dalla v2.1.0) ha confermato zero problemi, ma un controllo diverso — mai
fatto prima, aggiunto oggi — ha trovato che il CSS del mini player introdotto
in v2.1.0 non era mai stato scritto nel file `.jsx`: la logica c'era, le
classi pure nel markup, ma nessuna regola le vestiva. Scritto ora per intero.

## v2.1.0 · 27/08/2026
Il lettore musicale che si affrontava a parole nella chiacchierata precedente:
- Un player persistente ancorato in basso a destra, sopra la tab bar, visibile
  da qualunque scheda finche' un suono e' attivo: nome del suono, un tasto
  per ridurlo a un piccolo pallino colorato, un tasto per fermarlo. Un tocco
  sul nome apre la scheda Suoni. Deliberatamente ancorato, non trascinabile:
  alle sue dimensioni la liberta' di movimento avrebbe aggiunto complessita'
  senza risolvere un problema reale.
- Nella modalita' notte compare una versione smorzata e integrata nello
  stesso stile di quella schermata (bianco tenue su nero), non l'aspetto
  acceso del resto dell'app.

Durante la preparazione di questa versione, un controllo nuovo (analisi
statica delle variabili non dichiarate sul file .jsx, mai fatta prima
d'ora) ha trovato che **nightMode, nightPromptSeen e nightPrompt non erano
mai stati dichiarati** in quel file, nonostante fossero usati in tutta la
modalita' notte fin dalla sua introduzione. E' la causa esatta dell'errore
"nightMode is not defined" segnalato in precedenza. Corretto. Il controllo
resta in uso per ogni consegna futura del file di anteprima.

## v2.0.2 · 27/08/2026
- **Suoni: abbandonata l'integrazione con i controlli di sistema, l'audio
  torna a funzionare.** Dalla v1.8.0 il suono passava da un elemento audio
  nascosto per far comparire play/pausa nella notifica Android. Su
  dispositivo reale quella strada risultava muta, e in modo subdolo:
  l'elemento dichiarava di essere in riproduzione, quindi nemmeno il ripiego
  aggiunto in v2.0.1 poteva accorgersene. Rimosso del tutto: l'audio torna
  all'uscita diretta, la stessa che funzionava fino alla v1.7.0. Meglio un
  suono che si sente senza controlli di sistema, che controlli senza suono.
- Logotipo: terminali affilati al posto di quelli arrotondati (asse SOFT del
  carattere portato a 0) e lettere leggermente distanziate. Stacca molto di
  piu' dal resto dell'interfaccia. Sempre 1,3 KB.

## v2.0.1 · 27/08/2026
- **Possibile silenzio totale dei suoni, corretto.** Dalla v1.8.0 l'audio
  passa da un elemento nascosto per ottenere i controlli di sistema, ma
  l'eventuale errore di avvio veniva inghiottito da un `catch` vuoto: se il
  browser rifiutava quella riproduzione, non usciva alcun suono e nulla lo
  segnalava. Ora esiste un ripiego esplicito verso l'uscita diretta, con tre
  inneschi: errore, attesa oltre 600 ms senza risposta, oppure API non
  disponibile. Verificato su quattro scenari simulati: in nessuno l'app
  resta muta.
- Logotipo rifatto: il peso 600 a 19px sembrava solo testo un po' piu'
  grande. Ora e' peso 900 a 23px, in menta con il punto in rosa, cosi' usa
  entrambi i colori della palette e si legge come un marchio invece che come
  un'intestazione. Sempre 1,3 KB.

## v2.0.0 · 27/08/2026
- **Farmaci e integratori ora hanno un nome.** Registrare "Farmaco" e basta
  non dice nulla se il bambino ne prende piu' di uno: toccando Vitamine o
  Farmaco l'app chiede quale, e i nomi gia' usati compaiono come scorciatoie,
  cosi' il caso ricorrente (la vitamina D di ogni giorno) resta a due tocchi.
  Registrare senza nome resta possibile. Il nome compare nel diario, si
  corregge dalla modifica, finisce nel CSV in una colonna dedicata e nel
  riepilogo per il pediatra come elenco per nome invece che come conteggio.
- **Logotipo dedicato.** "Ninna." usa ora un taglio proprio di Fraunces con
  terminali piu' morbidi (asse SOFT del carattere variabile), visibilmente
  diverso dal Fraunces del resto dell'interfaccia, con il punto in menta.
  Il file contiene solo i glifi di "Ninna.": 1,3 KB.
- L'esportazione CSV protegge i valori che contengono il separatore, cosi'
  un nome come "Vitamina D; gocce" non spezza piu' le colonne.

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
