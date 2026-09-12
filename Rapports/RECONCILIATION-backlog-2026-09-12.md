# RÉCONCILIATION — ce que BACKLOG.md dit « ouvert » et ce qui est mesuré

**Date** : 12 septembre 2026, en fin de journée. **Base** : `main` local, 1.139.0, build `0912-1259`.
**Déclencheur** : Grégoire — « Les 408 évaluations d'Hiver 2026 ont été corrigées hier. Je ne suis pas certain que ton état des lieux ne soit pas périmé. » Il avait raison.
**Mode** : lecture seule. Aucun fichier du dépôt n'a été modifié par cette passe, sauf ce rapport.

## Méthode

248 des 255 lignes `- [ ]` de `BACKLOG.md` portent un numéro de fiche identifiable (7 n'en portent pas). Chacune a été confrontée à trois sources : le journal git (`git log --all`), `OU-EN-EST-ON.md` et `Retours des testeurs/SUIVI-BUGS.md`. 81 portaient une trace de travail postérieure ; ces 81 ont été tranchées une par une, sur preuve citable, par quatre sessions parallèles. Les 167 autres n'ont aucune trace et sont tenues pour ouvertes sans autre vérification — c'est une inférence, pas une mesure.

## Résultat

| Verdict | Nombre |
|---|---|
| **FERMÉ** (la case aurait dû être cochée) | **14** |
| **PARTIEL** (livré en partie, le reste nommé) | 32 |
| **OUVERT** | 37 |
| Indéterminé | 0 |

### Les 14 à cocher

`#631` et `#632` (les 408 évaluations d'Hiver 2026 — réparées le 11 septembre par Grégoire sur l'instance en ligne, tracées sous `#831` dans SUIVI-BUGS et dans OU-EN-EST-ON, jamais redescendues au backlog) · `#366` (`9217a9cf`) · `#403` (`49107d74`, `5fae54de`) · `#427` (`REFERMAGE-2026-09-01-cloudflare-access.md` §7) · `#495` (`69802c41`) · `#530` (`5a737a94`) · `#539` (`7092ce42`) · `#577` (`1c35ff48`) · `#581` (`b5cf3afa`, `0c653853`, `1b06b1ba`) · `#599` (`5ccef560`) · `#661` (`24eeaa89`) · `#674` (release 1.111.0 `6e3945ac`, clôture explicite de Grégoire) · `#789` (`cf9f2591`).

### Deux annotations FAUSSES, mesurées

- **`#599`** porte, daté du 1er septembre : « aucun commit ne nomme #599 … les 20 sites en course n'ont pas été traités ». Faux : `5ccef560` (30 août, sur `main`) les traite, la sérialisation est dans `js/pratiques-bibliotheque.js:368`, et `tests/unit/sentinelle-599-bibliotheques-partagees-serialisees.test.js` existe.
- **`#674`** porte encore « ⏳ RIEN N'EST CODÉ » à `BACKLOG.md:1526`. Périmé depuis le 2 septembre (release 1.111.0).

### La cause structurelle

`Retours des testeurs/SUIVI-BUGS.md` a sa PROPRE numérotation, qui entre en collision avec celle du backlog. `cf73a83d fix(carte) … (#539)` est le bug iPad 539 de SUIVI-BUGS, pas la fiche #539 du backlog ; `372c529e fix(#543)` est le bug « bibliothèque non rafraîchie » du 8 septembre, pas la fiche #543. **Toute recherche par numéro dans le journal git ment tant que les deux registres partagent le même espace de noms.** C'est aussi ce qui a fait perdre #631 : sa réparation portait le numéro #831 d'un registre, lu comme le numéro #831 de l'autre.

### Les 32 partiels

Ils ne se cochent pas, mais leur énoncé décrit encore le travail ENTIER, dont une part est faite. Tant qu'il n'est pas récrit sur ce qui reste, chaque relecture repaie la lecture de ce qui est fini. Le détail de ce qui reste, fiche par fiche, est dans la trace de session.

## Angle mort déclaré

Les 167 fiches sans trace n'ont PAS été ouvertes. Une fiche peut avoir été traitée sans que son numéro apparaisse nulle part — c'est exactement ce qui est arrivé à #631. Ce rapport donne donc un PLANCHER de 14 fermetures manquées, pas un compte.

## Dispositions (Claude Code, 12 septembre 2026, soir — après contre-vérification)

Chaque constat porte une disposition, comme CLAUDE.md l'exige d'un audit. Contre-vérifié fiche par
fiche au code et au journal git avant d'écrire (les commits cités sont tous sur `main`).

- **14 fermetures manquées** — *appliqué* : les 14 cases cochées dans `BACKLOG.md`, chacune avec sa
  preuve et sa phrase « contre-vérifié » en fin de ligne (255 → 241 cases ouvertes). « 241 » compte
  les cases vides de PREMIER niveau ; `BACKLOG.md` en porte 243 au total, dont 2 en sous-item.
  Deux précisions que la contre-vérification ajoute :
  - **Huit fiches sur quatorze seulement sont fermées par un commit qui les nomme** (#403, #495, #530,
    #577, #581, #599, #661, #674). Trois le sont par un commit qui nomme D'AUTRES numéros : #366 par
    `9217a9cf`, qui nomme #436 (le retrait du bandeau y est un item parmi cinq) ; #789 par `cf9f2591`,
    qui nomme #540 et #773 — « 789 » n'apparaît nulle part dans le message complet (trois essais #540
    et un essai #773 font bien les quatre specs rouges de la fiche) ; #539 par `7092ce42`, qui nomme
    #754, #752 et #833. Trois n'ont AUCUN commit qui les nomme : #631 et #632 (réparés en ligne,
    tracés sous le bug 831) et #427 (fermé par `REFERMAGE-2026-09-01-cloudflare-access.md` §7).
    Et dans l'autre sens, le troisième commit cité pour #581, `1b06b1ba`, porte « #581 » dans son
    sujet sous la forme « sans #581 » : un grep le compte, à tort. Méthode : `#N` extraits du message
    complet de chaque commit cité (`git log -1 --format=%B`) ; `git log --all --grep` pour #427, #631,
    #632 (zéro). Cowork comptait dix fiches nominatives sur quatorze : l'écart tient aux trois fiches
    sans commit, qu'il ne rangeait pas parmi les non nominatives. Cette proportion EST la démonstration
    de la thèse du rapport : six fermetures sur quatorze étaient invisibles à une recherche par numéro.
  - #632 est fermé PARCE QUE les grilles ont été recréées sous leurs identifiants d'origine — le champ
    `pratique.configuration.grilleId` résout donc sans que l'outil 831 l'ait touché.
- **#599, annotation fausse** — *appliqué* : paragraphe « NE PAS COCHER » remplacé par une annotation
  « ↻ retirée », l'ancienne phrase citée, la preuve à côté.
- **#674, « RIEN N'EST CODÉ »** — *appliqué* : ligne remplacée par « ↻ périmé depuis 1.111.0 ».
- **Collision de numérotation** — *proposé, non appliqué* :
  `Rapports/PROPOSITION-numerotation-bugs-testeurs-2026-09-12.md` (mesures, trois options, coût,
  casse, recommandation). Décision de Grégoire.
- **32 partiels à récrire** — *bloqué* : le rapport renvoie « la liste et ce qui reste » à la trace de
  session de Cowork, qui n'est pas dans le dépôt (grep « PARTIEL » sur tous les fichiers datés du
  12 septembre : rien). Sans la liste, récrire 32 énoncés reviendrait à refaire l'audit des 81 fiches.
  À reprendre dès que la liste est déposée ici.
- **167 fiches sans trace** — *inscrit nulle part, à dessein* : c'est l'angle mort déclaré du rapport ;
  il n'entre au BACKLOG que si un symptôme est vécu (règle du 24 août).
