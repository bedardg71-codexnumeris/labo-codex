# Portes terrain – chantier des archives, lot A2 : vérifier l'archive de ton plus gros groupe

> Écrites le 30 septembre 2026, vers 17 h (Toronto), par Claude Code (ce markdown : la trace). **Cowork publie l'artefact jumeau** (cases, champs de saisie, bouton « Copier mes résultats »).
> Sur le **Mac**, dans **Chrome** (le navigateur de la porte du lot A1), données réelles, `https://app.codexnumeris.org`.
> **Le numéro à lire : 1.172.0** (release du 30 sept., 17 h 03, après la relecture de Cowork ; verdict au navigateur et mise en ligne consignés dans `RELAIS.md`). *(Écrit à 17 h : le lot était sur la branche `lot-a2-verifier-archive`, ni relu ni poussé.)*
> **Pourquoi si peu de rangées** : la vérification (chaque défaut dit, la mémoire, l'état retenu) est jugée par les bancs. Seul ton Chrome, avec ta vraie archive et tes vraies fiches, peut dire « 205 sur 205 » sur tes données.
> **Tes données** : rien n'est écrit dans tes trimestres ni dans l'archive. Seule ta liste d'archives note « Vérifiée le … ».
> Ce qui échoue devient un item du BACKLOG, pas une note.

## §0 · Préalable

| | Geste | Attendu |
|---|---|---|
| 0.1 | Dans Chrome, sur le Mac, ouvre l'application et **recharge de force** (⌘ + Maj + R). Lis le numéro en bas de page. | **1.172.0** (champ : le numéro lu). Si tu lis 1.171.1 ou moins : arrête-toi, le lot n'est pas en ligne (#1004 : un onglet ouvert garde l'ancienne version). |
| 0.2 | Les données de l'hiver 2026 sont dans ce Chrome (le trimestre s'ouvre, avec ses copies). | Elles y sont. Sinon : arrête-toi et dis-le. |

## §1 · Vérifier l'archive du groupe 00008 de l'hiver 2026 `Données réelles`

| | Geste | Attendu |
|---|---|---|
| 1.1 | Réglages › Données › carte « Archives ». Regarde la ligne du groupe **00008** de l'hiver 2026 (celle de 16 h 19). | La ligne porte « **Non vérifiée** » et un bouton « **Vérifier** ». (champ : ce que dit l'encadré « Dossier sur disque » au-dessus : « Aucun dossier lié », ou le nom d'un dossier) |
| 1.2 | Clique « Vérifier ». Si Chrome demande le dossier, choisis **la racine de tes archives** (le dossier qui contient `trimestres`), pas `trimestres` lui-même. | La barre « Vérification de l'archive… » avance avec « N copies sur 205 », puis la fenêtre « **Archive vérifiée** » : « Les 205 copies sont présentes et intactes, et les données concordent. » (champ : ce que Chrome a demandé ; durée approximative) |
| 1.3 | Ferme la fenêtre. Regarde la ligne. | « **Vérifiée le 30 septembre 2026** » (ou la date du jour). |
| 1.4 | Recharge la page (⌘ + R), reviens à Réglages › Données › Archives. | La ligne dit toujours « Vérifiée le … ». |
| Si 1.2 dit « Archive incomplète » ou « Archive à refaire » | Note **le titre et le texte de la fenêtre, mot pour mot**, et le nombre dit. Ne refais pas d'archive avant qu'on ait lu. | (champ : le texte) |
| Si Chrome refuse le dossier (« Dossier à choisir de nouveau ») | Reclique « Vérifier » et choisis le dossier parent. | La vérification part. (champ : le nom du dossier refusé) |

## §2 · Interface

Aucune rangée : l'apparence (la colonne « Vérification », le badge, le bouton) se signale à l'usage.

## §3 · Décisions

Aucune : les mots sont acceptés (16 h 26). Les mots hors § 3 (détail sous « Archive incomplète », « Ce n'est pas cette archive », « Dossier à choisir de nouveau ») sont dans la demande de relecture, § 5.

## §4 · Ce qui n'a pas pu être vérifié

- **Ton Chrome et ton disque** : le banc est un WebKit sans interface (mode fichier) et un faux dossier en mémoire (mode dossier). Que Chrome donne l'accès en lecture au dossier au clic est une inférence (il le donne en écriture pour « Archiver… »).
- **Le mode fichier sur ton Mac** (Safari, un .zip désigné) : jugé au banc à 607 Mo ; tu n'as pas d'archive .zip de 1.171.1 (celle de 15 h 04 est de 1.170.2 : elle dirait « Archive à refaire », et c'est juste).
- **L'iPad** : hors de cette porte.
- **Le mauvais niveau** : le refus est jugé au banc ; non rejoué dans un vrai Chrome.
