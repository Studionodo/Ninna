# Ninna

Prevede pisolini e nanna, e spiega perché.

[Read this in English](README.en.md)

## Cos'è

Ninna è una web app (PWA) per genitori di neonati e bambini piccoli che vogliono capire i ritmi del sonno del proprio figlio invece di indovinarli. Calcola quando arriverà il prossimo pisolino o l'ora della nanna, e mostra sempre il perché: nessuna previsione a scatola chiusa. Funziona interamente offline dopo il primo caricamento, non ha server propri, non ha account: tutti i dati restano sul telefono di chi la usa.

## Cosa fa

- **Prevede il prossimo sonno** in base alla finestra di veglia tipica dell'età del bambino, corretta giorno dopo giorno con i ritmi reali osservati.
- **Distingue da sola pisolino e nanna**: decide quale dei due proporre in base ai pisolini già fatti, all'orario e alla vicinanza alla routine serale: il genitore non deve scegliere a occhio.
- **Spiega ogni previsione**: un tasto dedicato mostra il calcolo per esteso, non solo il risultato.
- **Registra le attività**: pisolini, nanna notturna, allattamento, biberon, pappa, pannolino, tiralatte, risvegli notturni.
- **Mostra le statistiche**: sonno totale degli ultimi 7 giorni, bilancio rispetto ai valori attesi per l'età, poppate, pannolini, risvegli.
- **Segnala le transizioni**: quando il bambino sembra abbandonare un pisolino, lo indica come informazione, mai come istruzione.
- **Suoni per la nanna**: sette suoni generati in tempo reale (bianco, rosa, marrone, onde, pioggia, battito cardiaco, shhh), con timer di spegnimento automatico.
- **Una guida in 12 articoli** su finestre di veglia, segnali di sonnolenza, sonno sicuro, regressioni e altro, scritta in tono informativo, mai prescrittivo.
- **Notifiche**: avvisa quando si avvicina il prossimo sonno o la routine serale.
- **Backup ed esportazione**: i dati si esportano in JSON (per un backup completo o per passarli a un altro genitore) o in CSV (per un'analisi personale o da mostrare al pediatra).
- **Bilingue**: italiano e inglese, con cambio lingua immediato dal footer o dalle impostazioni.

## Come tratta i dati

Nessun dato del bambino lascia mai il dispositivo: niente registrazione, niente cloud, niente sincronizzazione. Tutto resta in memoria locale, esportabile quando vuoi in JSON o CSV.

Nessuna terza parte riceve richieste dall'app: caratteri tipografici, icone e codice sono serviti dall'app stessa, non da reti di distribuzione esterne. Le uniche connessioni possibili sono quelle verso l'hosting da cui l'app viene scaricata e aggiornata, come per qualunque sito, e il collegamento a Ko-fi, che si apre solo se scegli tu di toccarlo.

Il prezzo di questa scelta è che oggi non esiste ancora una condivisione automatica dei dati tra due genitori: l'unico modo è esportare un file e passarlo manualmente.

## Ninna non è un dispositivo medico

È uno strumento di organizzazione. Per qualunque dubbio sulla salute o sul sonno del bambino, il riferimento resta il pediatra.

---

Un progetto **Studionodo**.
