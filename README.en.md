# Ninna

Predicts naps and bedtime, and explains why.

[Leggi questo in italiano](README.md)

## What it is

Ninna is a web app (PWA) for parents of newborns and young children who want to understand their child's sleep rhythms instead of guessing them. It predicts when the next nap or bedtime will come, and always shows the reasoning behind it: no black-box predictions. It works entirely offline after the first load, has no servers of its own, and no account: all data stays on the phone of whoever uses it.

## What it does

- **Predicts the next sleep** based on the typical wake window for the child's age, refined day by day with the real rhythms observed.
- **Tells naps and bedtime apart on its own**: it decides which one to suggest based on the naps already taken, the time of day, and how close it is to the evening routine: the parent doesn't have to guess.
- **Explains every prediction**: a dedicated button shows the full calculation, not just the result.
- **Logs activities**: naps, night sleep, nursing, bottle, solids, diapers, pumping, night wakings.
- **Shows statistics**: total sleep over the last 7 days, balance against the values expected for the child's age, feeds, diapers, wakings.
- **Flags transitions**: when a child seems to be dropping a nap, it reports it as information, never as an instruction.
- **Sounds for sleep**: seven sounds generated in real time (white, pink, brown, waves, rain, heartbeat, shhh), with an automatic shut-off timer.
- **A 12-article guide** on wake windows, sleepy cues, safe sleep, regressions and more, written in an informative tone, never a prescriptive one.
- **Notifications**: alerts when the next sleep or the evening routine is approaching.
- **Backup and export**: data can be exported as JSON (for a full backup or to hand off to another parent) or as CSV (for personal analysis or to show a paediatrician).
- **Bilingual**: Italian and English, with instant language switching from the footer or settings.

## How it handles data

No data about your child ever leaves the device: no sign-up, no cloud, no sync. Everything stays in local storage, exportable whenever you want as JSON or CSV.

No third party receives requests from the app: typefaces, icons and code are all served by the app itself, not by external delivery networks. The only possible connections are to the hosting the app is downloaded and updated from, as with any website, and the Ko-fi link, which opens only if you choose to tap it.

The price of that choice is that there's no automatic data sharing between two parents yet: the only way today is exporting a file and passing it along manually.

## Ninna is not a medical device

It's an organisation tool. For any concern about a child's health or sleep, a paediatrician remains the reference.

---

A **Studionodo** project.
