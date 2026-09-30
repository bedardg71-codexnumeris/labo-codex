# Demande de relecture – lot J0 bis : le partage du codex refusé après une préparation longue (#988)

> Écrite le 30 septembre 2026, vers 8 h 25 (Toronto), par Claude Code, pour Cowork. Branche `lot-j0-bis-partage-apres-preparation`, partie de `main` à `3193c288` (1.170.1). Exécute `plans de travail/CONSIGNE-DU-JOUR.md` (7 h 44). **Ni release ni push** : le lot attend ta relecture.

## Pour Grégoire, en trois lignes

- **À l'écran** : quand la préparation du codex a duré plus longtemps que le toucher ne tient (environ 5 secondes), une fenêtre « Ton codex est prêt » demande de toucher « Enregistrer » ; la feuille de partage s'ouvre alors. Un petit codex ne voit rien changer.
- **La preuve** : le refus de l'iPad se reproduit dans WebKit sur le Mac, avec le même message mot pour mot ; le banc est rouge sur `main`, vert sur la branche, 15 mutations sur 16 rouges (la seizième ne change rien au comportement).
- **Le fichier de l'iPad** : sain. `unzip -tq` sans erreur, 503 entrées, 1 314 934 513 octets.

## 1 · Ta lecture, remesurée : elle tient

Sonde jetable sous WebKit 26.4 de Playwright (le vrai `index.html`, de vrais clics, le vrai `navigator.share`, tout lu dans la page par des minuteries) :

| Mesure | Résultat |
|---|---|
| Toucher, puis partage 0,5 s et 4,5 s plus tard | activation active, partage résolu |
| Toucher, puis partage 5,5 s et 8 s plus tard | activation éteinte, partage rejeté : `NotAllowedError – The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.` |
| `navigator.userActivation.isActive` juste avant le partage | prédit l'issue dans les quatre cas |
| Deux partages sur un seul toucher | le premier résolu, le second rejeté : le partage consomme l'activation |

Le message est celui du rapport de bug de 7 h 30, mot pour mot. L'iPad a refusé à 8 s : cohérent. **Non mesuré** : la durée exacte sur Safari 27 de l'iPad (je suppose les mêmes 5 s).

⚠ **Un piège de banc, mesuré** : `page.evaluate` accorde lui-même une activation d'environ 5 s. Une sonde qui lit l'activation par `evaluate` la trouve toujours active ; c'est ce qu'a rendu ma première passe.

## 2 · Ce qui a changé

`js/codex.js` (42 lignes ajoutées, 3 retirées), `js/rapport-bug.js` (3 ajoutées, 1 retirée), `index.html` (deux jetons anti-cache).

- **`_motifToucherFrais()`** : ton critère, tel quel. `navigator.userActivation` présent et `isActive` vrai → rien ; inactif → « toucher expiré » ; API absente → « activation illisible ».
- **`sauvegarderVersDestination`**, stratégie du partage seulement : si l'appelant passe `options.toucherFrais` et qu'il y a un motif, il l'appelle avant `navigator.share`. Refus → `{ methode: 'annule', toucherRefuse: true }`. Sans l'option (l'export sélectif), rien ne change.
- **`_mettreAJourLeCodex`** passe `toucherFrais` : la fenêtre, par `uiDialogues.confirmerAction`. Titre « Ton codex est prêt » ; texte « Le fichier (environ 1,2 Go) est préparé. Touche « Enregistrer » pour choisir où le ranger. » ; boutons « Annuler », « Enregistrer » (principal, il a le focus).
- **La trace** : un champ `toucherFrais` dans la tentative, une ligne « Toucher frais: » dans le rapport de bug (« non demandé », « demandé (toucher expiré) », puis « , accordé » ou « , refusé »). « Annuler » finit la tentative par « fenêtre « Ton codex est prêt » refusée par l'usager ».
- Un échec du partage après le toucher frais garde le parcours du lot G, inchangé.

## 3 · La preuve

**Banc neuf**, `tests/integration/lot-j0-bis-partage-apres-preparation.spec.js`, deux essais sur le vrai code, pack démo :

1. **« simulé »** : une fausse activation et un faux partage qui rejette `NotAllowedError` quand elle est inactive. Six cas : (a) toucher expiré → la fenêtre, ses mots, aucun partage tenté ; (b) « Enregistrer » → un partage, le même fichier, « à jour » ; (c) « Annuler » puis Échap → ni partage, ni fenêtre d'échec, ni témoin, ni message, « pas à jour » ; (d) toucher encore actif → partage direct, aucune fenêtre ; (e) API absente → la fenêtre ; (f) échec après le toucher frais → « Codex non mis à jour », puis « Réessayer » sans seconde fenêtre.
2. **« réel »** : menu « Codex » › « Mettre à jour le codex » › « Télécharger » en vrais clics, la vraie activation, le vrai partage, la préparation allongée pour de bon de 6,5 s (à la compression). Aucun `evaluate` entre le clic et le partage. La fenêtre s'ouvre ; « Enregistrer » d'un vrai clic, puis d'Entrée au clavier : le partage se résout. Préparation courte : partage direct, aucune fenêtre.

| Épreuve | Résultat |
|---|---|
| Le banc sur la branche | 2 sur 2 verts |
| Le banc sur `main` (les deux fichiers de `3193c288`) | 2 sur 2 rouges. Le « réel » reçoit un partage tenté, activation éteinte, rejeté `NotAllowedError` avec le message de l'iPad |
| 16 mutations, une à la fois, restauration par copie et empreinte | 15 rouges, 1 survit |
| Vitest complet | 664 fichiers, 7 791 sur 7 791 |
| Playwright ciblé, 9 fichiers qui traversent le codex, sans reprise | 26 sur 26 verts |

**La mutation qui survit** : retirer `toucherFrais: null` de `_debuterTentative`. Équivalente : l'objet de la tentative est refait à neuf à chaque geste, le champ absent se lit « non demandé » comme le champ nul. Le cas (d) jugerait un vrai report d'une tentative à la suivante.

**Les 15 rouges** : ne jamais demander ; critère inversé ; API absente ignorée ; « Annuler » ignoré ; refus confondu avec la fenêtre de choix ; option non passée ; titre, texte et chacun des deux boutons changés ; trois mutations de la trace ; la ligne du rapport retirée ; « Réessayer » repassant par la fenêtre.

**Non rejoué** : la suite Playwright complète (due sur le commit de release) ; l'iPad.

## 4 · Le fichier écrit par l'iPad (lecture seule)

`Téléchargements` d'iCloud, `codex-601-101-A26-A25H26-2026-09-30-07h34.zip` :

- `unzip -tq` : « No errors detected ».
- **503 entrées** : 500 copies, 2 JSON, 1 dossier. 501 rangées telles quelles, 2 compressées : la forme du lot J0. Types relevés par extension seulement, aucun nom lu.
- **1 314 934 513 octets**, soit **377 de plus** que les 1 314 934 136 attendus.

**L'écart s'explique, et corrige un détail de la consigne.** Le nom du fichier porte l'heure de fin de préparation (`_genererNomFichier`). Un « Réessayer » de la tentative de 7 h 28 aurait écrit un fichier nommé `…-07h28.zip`, de 1 314 934 136 octets. Celui-ci a donc été préparé à 7 h 34 : une seconde mise à jour, pas la reprise du même fichier. Inférence : elle a elle aussi buté sur le refus, puis « Réessayer » a réussi ; le rapport de bug d'après 7 h 34 le dirait (« Essais d'écriture: 2 », « Début: » vers 7 h 34). Ta lecture n'en est pas affaiblie.

⚠ **Effet de ma lecture** : le fichier était listé sur le Mac sans y être descendu (substitut iCloud, 0 bloc). `unzip` l'a fait descendre : 1,3 Go de plus sur le disque du Mac (475 Gio libres). Ni déplacé, ni modifié, ni ouvert dans l'application.

## 5 · Tranché seul (technique), et ce que j'ai supposé

1. **« Réessayer » ne repasse pas par la fenêtre**, même API absente : son clic est un toucher frais et le partage le suit aussitôt. Verrouillé par le cas (f).
2. **La taille dite** est celle du message d'échec voisin : « environ 1,2 Go » pour le codex de Grégoire, là où iPadOS dira 1,31 Go (#993).
3. **« Mettre à jour dans un autre fichier… »** prend le même chemin et reçoit donc la même fenêtre.
4. **Quatre bancs existants épinglent l'activation « active »** (`codex-temoin-dit-vrai-lot-f`, `lot-g-codex-ipad-echec-se-dit`, `lot-f-stock-codex-pas-a-jour`, `lot-i-rappel-mene-au-codex`). Ils lancent la mise à jour par `evaluate` et ne tenaient que par les 5 s qu'il accorde (mesuré : 0,7 s jusqu'au partage au pack démo). Sous charge, la fenêtre s'y serait ouverte. Les quatre rejoués : 10 sur 10 ; l'épingle inversée dans le banc du lot G : rouge.
5. **Jetons anti-cache posés à la main** sur `codex.js` et `rapport-bug.js`, comme au lot J0.
6. **`RELAIS.md` retenu jusqu'à la release**, comme au lot J0. `OU-EN-EST-ON.md` et la fiche #988 de `SUIVI-BUGS.md` sont à jour sur la branche (la porte de 7 h 28, le correctif « prêt, ni relu, ni livré »).

**Supposé** : sur l'iPad, le toucher « Enregistrer » autorise le partage comme le fait « Réessayer » (même mécanique : une fenêtre de `uiDialogues`, puis le partage). Prouvé au banc, vécu pour « Réessayer », pas encore vécu pour la fenêtre neuve.

## 6 · Trouvailles, et ce que chacune devient

| Trouvaille | Issue | Disposition |
|---|---|---|
| La taille affichée diffère de celle d'iPadOS (Gio contre Go) | 2 | **inscrite, #993** (consigne § 5) |
| Le message d'échec nomme l'espace quelle que soit l'erreur | 2 | **inscrite, #994** (consigne § 5) |
| « Exporter une sélection » : après une préparation longue, le même refus du partage, mais replié en silence vers un téléchargement (pas de `sansRepli`). Lu au code, non mesuré | 2 | **à disposer par toi** : voisine de #991, aucun symptôme vécu |
| Sous Chrome, la fenêtre de choix de fichier exige elle aussi un toucher actif : une première mise à jour longue, sans fichier tenu, irait à « Codex non mis à jour ». Inférence, **non mesurée** (ma sonde Chromium n'a pas tourné) | 2 | **à disposer par toi** ; hors de la consigne (« stratégie du partage seulement ») |
| `page.evaluate` accorde une activation d'environ 5 s | 3 | commentée dans le banc neuf et dans les quatre bancs épinglés |

## 7 · Ce qui est dû après la relecture

1. Release (correctif proposé, 1.170.2), verdict Playwright complet sur le commit de release, Cowork fermé, push, « en ligne » lu chez Netlify, `RELAIS.md`.
2. Une porte sur l'iPad : une mise à jour du vrai codex qui passe par « Ton codex est prêt », puis « Enregistrer ». C'est le seul endroit où la fenêtre neuve se prouve.
3. #988 reste ouverte ; aucune ligne aux Nouvelles.
