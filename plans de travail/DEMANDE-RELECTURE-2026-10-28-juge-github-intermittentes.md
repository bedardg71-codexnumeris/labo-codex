# Demande de relecture – Le juge de GitHub : les intermittentes de Linux (#1114) (28 octobre 2026)

> Claude Code, mercredi 28 octobre 2026, vers 22 h 30 (Toronto), sur `main` après `a7671a52` (commit de docs de la consigne). Consigne : `plans de travail/CONSIGNE-LOT-2026-10-28-juge-github-intermittentes.md`. Décision : `plans de travail/VERDICT-RELECTURE-2026-10-28-rouge-github-1223.md`. Seuls `scripts/` et `tests/` ont été touchés, ainsi que la fiche #1114 du BACKLOG. Ni release, ni verdict, ni push.

## En bref

Le juge reconnaît maintenant une seconde liste, `echecsIntermittents`. Une rouge n'est « nouvelle », et ne fait échouer, que si elle n'est dans aucune des deux listes. Une connue n'est « redevenue verte » que si elle a été **jouée et verte** ; absente du rapport, elle est dite « non jouée ». La baseline Linux reclassée sur les trois runs complets compte **22 connues et 28 intermittentes** (avant : 33 connues) ; 4 entrées en sortent. Rejoué sur le rapport du 28, le juge rend « aucune rougeur nouvelle », code 0 ; avec une rouge ajoutée hors des listes, il rend 1.

## Le juge (`scripts/rapport-playwright.mjs`)

- `vertsDuRapport(rapport)` est neuve, écrite à côté d'`echecsDuRapport` avec la même `identite`. Est verte une spec dont `ok` n'est pas faux et qui a au moins un essai `expected` ou `flaky`. Une spec sautée n'est pas jouée.
- `comparerALaBaseline({ echecs, verts }, baseline)` reçoit la baseline **entière**, et non plus la seule liste. Elle rend :
  - `nouveaux` : les rouges hors des deux listes ;
  - `reparees` : les connues jouées et vertes ;
  - `nonJouees` : les connues ni rouges ni vertes ;
  - `intermittentesRouges` : les intermittentes rouges ce soir.
- Sans `echecsIntermittents`, la liste vaut `[]`, et le juge rend le même verdict qu'avant (essai E.f).
- **Supposition nommée** : une connue **verte au second essai** compte comme jouée et verte, donc « à retirer ». C'est le sens du `ok` de Playwright (essai E.e). Si Cowork préfère qu'une rattrapée ne compte pas, la condition est d'une ligne.

## Les appelants audités

| Appelant | Ce qui change | Ce qu'il bloque |
|---|---|---|
| `juger-rapport-playwright.mjs` (GitHub) | Passe la baseline entière. Ajoute au résumé le compte des intermittentes rouges (« 22 intermittente(s) rouge(s) sur 28 ») et une section « NON JOUÉE(S) » | Une rouge hors des deux listes, comme avant pour les connues |
| `verifier-playwright.mjs` (Mac, suite entière) | Passe la baseline entière ; dit les « non jouées » ; avec `--ecrire`, garde une liste `echecsIntermittents` déjà tenue et n'y met pas les rouges qu'elle contient | Inchangé : la baseline du Mac n'a pas d'intermittentes. Seul (a) change ce qu'il dit, jamais ce qu'il bloque |
| `verdict-en-morceaux.mjs` (Mac, en morceaux) | `jugerRapportFusionne(rapport, baseline, prévus)` reçoit l'objet ; l'effet `baseline()` rend le fichier entier ; le rejeu du report passe `{ echecsConnus: [] }` (même sens que `[]` avant) ; dit les « non jouées » | Inchangé. Une spec prévue absente reste NON JUGÉE avant toute comparaison |

Aucun appelant n'a dû changer ce qu'il bloque. **Non éprouvé** : le chemin `--ecrire` de `verifier-playwright.mjs` (il lance toute la suite). Je l'ai vérifié à la lecture seulement. Pour la baseline du Mac, il produit le même fichier qu'avant, puisqu'elle n'a pas de clé `echecsIntermittents`.

## La baseline Linux reclassée

Les trois runs sont encore téléchargeables, avec leurs **16 rapports sur 16** (`gh run download -p 'blob-*'`). Je les ai fusionnés avec `playwright merge-reports`. Aucun ne porte d'erreur hors essai ; le 28 compte 45 rouges, le chiffre de `RELAIS.md`.

L'univers de départ, ce sont les 33 entrées d'avant plus toute rouge d'au moins un des trois runs, soit 54 essais. La règle de la consigne a été appliquée sans exception :

| Liste | Nombre | Origine |
|---|---|---|
| `echecsConnus` | 22 | 19 de la baseline, 3 neuves rouges aux trois (`critere-algorithmique-calculs-4b` « Retirer », `nettoyage-sans-perte-892` « aucune copie exportée », `statut-incomplet-travail-en-cours`) |
| `echecsIntermittents` | 28 | 10 de la baseline, 18 neuves |
| Retirées | 4 | `lot-i-bis` (1) et (3), `materiel-dissection-11`, `materiel-dissection-2a` C1 : vertes jouées aux trois |
| Jamais jouées | 0 | — |

Je n'ai trouvé **aucun cas hors règle** (par exemple une rouge un soir et non jouée les deux autres). **Contrôle fait** : aucune des 13 specs d'intermittentes n'a été modifiée entre `f8ee0217`, `6cc9ed30` et `d1d581b7` (`git diff --name-only -- tests/integration`). Un changement de côté ne s'explique donc jamais par une spec retouchée entre deux soirs. Le code de l'application, lui, a changé ; le Mac était vert aux trois.

### Spec par spec

| Spec › essai | 27 midi (1.221.0) | 27 soir (1.222.0) | 28 soir (1.223.0) | Avant | Liste |
|---|---|---|---|---|---|
| 1007-codex-a-part-avant-suppression.spec.js › X1, fenêtre de choix (Chrome) : « Annuler » à chaque étape ne supprime rien ; le fichier à part, puis la suppression comme avant ; le fichier tenu n'est pas touché | rouge | rouge | rouge | baseline | echecsConnus |
| 1007-propose-codex-avant-suppression.spec.js › P8 (évaluation) : sans codex, à jour, pas à jour (trois boutons), échec et abandon de l'écriture | rouge | rouge | rouge | baseline | echecsConnus |
| 1007-propose-codex-avant-suppression.spec.js › P8 : une écriture de la même clé PENDANT que la fenêtre attend survit à la suppression (relecture après l'attente) | rouge | verte | verte | baseline | echecsIntermittents |
| 1007-propose-codex-avant-suppression.spec.js › Une porte par famille : élève (P2), pratique (P29), paramètre « enseignants » et clé hors liste, corbeille (G1) | rouge | verte | verte | baseline | echecsIntermittents |
| bareme-1.spec.js › barème 1 · un refus n’écrit rien ; une tranche neuve écrite aussitôt survit au rechargement ; retirer confirme ; 44 px, texte sous nom et points | verte | rouge | rouge | baseline | echecsIntermittents |
| bareme-1.spec.js › barème 1 · une grille de la dissection : son barème lu, une tranche modifiée → `bareme` écrit pour ce critère seulement, gardé au rechargement | verte | rouge | rouge | baseline | echecsIntermittents |
| bareme-1.spec.js › barème 1 · à 1440 px, nom, points et texte sur une ligne, la corbeille au bout ; aucun débord | verte | rouge | rouge | baseline | echecsIntermittents |
| bibliotheque-liste-1159.spec.js › les groupes-cours : « Mettre de côté » envoie la rangée dans le groupe replié, « Remettre dans le menu » la ramène | rouge | verte | rouge | neuve | echecsIntermittents |
| bibliotheque-liste-1159.spec.js › les trois fenêtres tiennent dans la largeur ; cibles de 44 px ; Échap ferme | rouge | rouge | rouge | baseline | echecsConnus |
| codex-1011-ouvert-sans-espace.spec.js › (5) les mots du refus du pré-vol — espace accordé mais presque tout pris | rouge | rouge | rouge | baseline | echecsConnus |
| codex-1011-ouvert-sans-espace.spec.js › (5) les mots du refus du pré-vol — peu d'espace accordé (navigation privée probable) | rouge | rouge | rouge | baseline | echecsConnus |
| codex-1012-fichier-d-origine.spec.js › (1) annulation ou refus d'avant toute écriture : l'application garde le fichier d'avant | rouge | rouge | rouge | baseline | echecsConnus |
| codex-991-selection-aller-retour.spec.js › les copies sont rangées, et le fichier s'ouvre exactement comme celui d'avant | rouge | verte | rouge | baseline | echecsIntermittents |
| comptes-erreurs-stock-1142.spec.js › #1142 stock · la réparation n'écrit que `donneesAlgorithmiques` des copies proposées, par le calcul de l'application | verte | verte | rouge | neuve | echecsIntermittents |
| critere-algorithmique-calculs-4b.spec.js › 1180 px · le composeur ouvert et une carte de calcul composé : aucun défilement de côté, des cibles d’au moins 44 px | verte | rouge | rouge | neuve | echecsIntermittents |
| critere-algorithmique-calculs-4b.spec.js › 1440 px · le composeur ouvert et une carte de calcul composé : aucun défilement de côté, des cibles d’au moins 44 px | verte | rouge | rouge | neuve | echecsIntermittents |
| critere-algorithmique-calculs-4b.spec.js › composer de zéro « Pondération du critère − Compte pondéré des X × 3 », le garder ; « Modifier ce calcul », « Garder les changements » | verte | rouge | rouge | neuve | echecsIntermittents |
| critere-algorithmique-calculs-4b.spec.js › les refus : sans nom, incomplet, parenthèse, division par 0 — rien ne s’écrit | verte | rouge | rouge | neuve | echecsIntermittents |
| critere-algorithmique-calculs-4b.spec.js › « Retirer » : refusé pour le calcul de la note ; confirmé pour un autre, « Annuler » n’écrit rien | rouge | rouge | rouge | neuve | echecsConnus |
| critere-algorithmique-calculs-4c.spec.js › 1180 px · « Ce calcul sert », la liste et la table « Selon » un calcul : aucun défilement de côté, des cibles d’au moins 44 px | rouge | verte | rouge | neuve | echecsIntermittents |
| critere-algorithmique-calculs-4c.spec.js › 1440 px · « Ce calcul sert », la liste et la table « Selon » un calcul : aucun défilement de côté, des cibles d’au moins 44 px | rouge | verte | rouge | neuve | echecsIntermittents |
| critere-algorithmique-calculs-4c.spec.js › 820 px · « Ce calcul sert », la liste et la table « Selon » un calcul : aucun défilement de côté, des cibles d’au moins 44 px | rouge | verte | rouge | neuve | echecsIntermittents |
| critere-algorithmique-calculs-4c.spec.js › composer pour les phrases « Compte pondéré des X ÷ Compte des Y × 100 », le garder : la liste, la palette, la chaîne ; la note ne bouge pas | rouge | verte | rouge | neuve | echecsIntermittents |
| critere-algorithmique-calculs-4c.spec.js › le nom d’un calcul est un texte de l’enseignant·e : dans la liste, la palette, le menu « Selon » et la phrase, jamais du balisage | rouge | verte | rouge | neuve | echecsIntermittents |
| critere-algorithmique-calculs-4c.spec.js › le poser dans la phrase du décompte, la simulation ; une table « Selon » ce calcul ; « Retirer » refusé tant qu’un texte le lit | rouge | verte | rouge | neuve | echecsIntermittents |
| critere-algorithmique-calculs-4c.spec.js › « Ce calcul sert » change la zone sans perdre le brouillon ; le calcul de la note ne passe pas aux phrases | rouge | verte | rouge | neuve | echecsIntermittents |
| evaluer-868-avec-ou-sans-copie.spec.js › Porte #868 · avec copie : « Évaluer » ouvre la copie de l'élève, en mode Évaluer | verte | rouge | verte | neuve | echecsIntermittents |
| exporter-des-travaux-une-carte-895.spec.js › #895 · un filtre sans fichier ne télécharge rien et le dit dans la carte, sans dialogue | rouge | rouge | rouge | baseline | echecsConnus |
| exporter-des-travaux-une-carte-895.spec.js › #895 · « Par étudiant·e », sans compression, un·e élève : l'autre forme, l'archive plus lourde | rouge | rouge | rouge | baseline | echecsConnus |
| exporter-des-travaux-une-carte-895.spec.js › #895 · « Toutes / Tous » + « Télécharger » : l'archive de tout le groupe, par élève et par production | rouge | rouge | rouge | baseline | echecsConnus |
| lot-a-anonymisation-enregistre.spec.js › (c)(d) intervention en anonymisation : description, observations et notes masquées ; l'enregistrement les garde | rouge | verte | rouge | baseline | echecsIntermittents |
| lot-e3-creer-ou-modifier.spec.js › (I-a) intervention complétée modifiée : écrite sans bouton, aucune présence écrite | verte | verte | rouge | neuve | echecsIntermittents |
| lot-e3-creer-ou-modifier.spec.js › (I-b) passage à « Complétée » : la question et sa case DÉCOCHÉE ; « Annuler » n'écrit rien ; sans la case, aucune présence ; cochée, le report | verte | verte | rouge | neuve | echecsIntermittents |
| lot-i-bis-la-case-ouvre-un-codex.spec.js › (1) un codex choisi dans la case s'ouvre par le chemin du menu Codex, sans alerte | verte | verte | verte | baseline | retirée |
| lot-i-bis-la-case-ouvre-un-codex.spec.js › (3) le filet : un codex précédé d'octets étrangers s'ouvre lui aussi | verte | verte | verte | baseline | retirée |
| lot-j0-bis-partage-apres-preparation.spec.js › réel : vrais clics, vraie activation de WebKit, vrai partage | rouge | rouge | rouge | baseline | echecsConnus |
| materiel-aide-accompagnement.spec.js › aide d’« Apporter mon matériel » · l’aide « i » aux deux écrans, les bulles, y compris celles de la palette | rouge | rouge | rouge | baseline | echecsConnus |
| materiel-dissection-11.spec.js › dissection 11 · chaque geste s’enregistre ; recharger rouvre la dissection telle quelle ; « Coller une autre grille » repart de l’accueil | verte | verte | verte | baseline | retirée |
| materiel-dissection-2a.spec.js › dissection 2a · C1 : les réponses de (b) gardent leur ordre jusque dans Grilles de critères | verte | verte | verte | baseline | retirée |
| materiel-dissection-2a.spec.js › dissection 2a · C3 : l’exemple recréé est refusé (nom pris), renommé dans le champ, créé ; les deux grilles rangées | rouge | rouge | rouge | baseline | echecsConnus |
| materiel-dissection-2a.spec.js › dissection 2a · l’exemple étiqueté, refusé sans nom, un échec réessayé, créé, retrouvé dans Grilles de critères | rouge | verte | verte | baseline | echecsIntermittents |
| materiel-dissection-2b.spec.js › dissection 2b · l’exemple, « des niveaux » choisi, le tableau rempli, créé ; l’échelle et la grille retrouvées | verte | rouge | rouge | baseline | echecsIntermittents |
| materiel-dissection-2b.spec.js › dissection 2b · une grille seulement en niveaux : le tableau d’emblée, aucun choix ; « Retirer les étiquettes » emporte la saisie | verte | verte | rouge | baseline | echecsIntermittents |
| materiel-dissection-5.spec.js › dissection 5 · « Couper » : (d) refusée en nommant, coupée au pointeur, annulée, créée en points, retrouvée | rouge | rouge | rouge | baseline | echecsConnus |
| materiel-dissection-7.spec.js › dissection 7 · « Rattacher » : deux touchers au pointeur, marque et flèche, groupe de trois, nom entier créé et retrouvé | rouge | rouge | rouge | baseline | echecsConnus |
| nettoyage-sans-perte-892.spec.js › #892 · aucune copie exportée : l'écran n'offre aucun retrait et mène à l'exportation | rouge | rouge | rouge | neuve | echecsConnus |
| nettoyage-sans-perte-892.spec.js › #892 · la liste est vue ; annuler ne retire rien ; seules les copies exportées partent | rouge | rouge | rouge | baseline | echecsConnus |
| planif-menu-vue.spec.js › chaque raccourci affiché a son essai, et chaque essai son raccourci affiché | rouge | rouge | rouge | baseline | echecsConnus |
| planif-menu-vue.spec.js › le bouton « Annuler » annonce ⌘Z sur un Mac, plus « Ctrl+Z » | rouge | rouge | rouge | baseline | echecsConnus |
| planif-modele-ia-963.spec.js › Actions ▸ Télécharger un modèle : le fichier porte les choix, et rien n'est écrit | rouge | rouge | rouge | baseline | echecsConnus |
| planif-zone-non-planifie-929.spec.js › tout planifié → zone vide visible ; une leçon glissée dessus quitte sa semaine | rouge | rouge | rouge | baseline | echecsConnus |
| statut-incomplet-travail-en-cours.spec.js › statut incomplet · remplacer la copie garde le statut ; décocher la rend ordinaire, et elle entre dans la note une fois évaluée et verrouillée | rouge | rouge | rouge | neuve | echecsConnus |
| temoin-enregistrement-lot-b.spec.js › lot B · placement 360 px, clair : aucun bouton des présences ni de la barre d'Annoter sous le témoin | rouge | rouge | verte | neuve | echecsIntermittents |
| temoin-enregistrement-lot-b.spec.js › lot B · placement 360 px, sombre : aucun bouton des présences ni de la barre d'Annoter sous le témoin | rouge | rouge | verte | neuve | echecsIntermittents |

## Les tests

- `tests/unit/sentinelle-ci-verdict-morceaux.test.js`, section E neuve (8 essais) :
  - une rouge hors des listes est nouvelle ;
  - une intermittente ne l'est pas, rouge (elle se compte) comme verte ;
  - une connue jouée verte est réparée ;
  - une connue absente du rapport, ou sautée, est « non jouée » ;
  - une rattrapée au second essai compte jouée verte ;
  - une baseline sans `echecsIntermittents` juge comme avant ;
  - le juge de la CI, par son vrai script, rend 0 avec une intermittente rouge et 1 avec une rouge hors des listes ;
  - la baseline Linux a deux listes disjointes, bien formées, aux totaux justes.
- A.c a été réécrit à la nouvelle signature.
- C.f lisait l'ancien sens de `reparees` (une entrée absente du rapport) : l'entrée y est maintenant jouée verte.
- `sentinelle-verdict-en-morceaux.test.js` : la baseline passe en objet (9 sites).
- **Break-tests**, arbre restauré et vérifié par sha256 (`06d66c59…`) :
  - l'ancienne règle de `reparees` fait rougir E.c, E.d, E.e et E.g ;
  - `echecsIntermittents` ignorée fait rougir E.b et E.g.
- Vitest complet, lancé depuis `tests/` : **845 fichiers, 10 215 essais verts** (10 207 + 8).

## La sortie du juge sur le 28

`node scripts/juger-rapport-playwright.mjs <rapport fusionné de 40784135640> scripts/playwright-baseline-linux.json` → **code 0** :

```
## ✓ Playwright : aucune rougeur nouvelle

1114 essais joués : 1064 verts, 5 verts au second essai, 45 rouges, 19 sautés. 23 échec(s) connu(s) de la baseline (playwright-baseline-linux.json) ; 22 intermittente(s) rouge(s) sur 28 (ne bloque ni rouge ni verte).

⚠ 5 spec(s) VERTE(S) AU SECOND ESSAI — passées, mais instables (ne bloque pas, #534) :
- 1007-propose-codex-avant-suppression.spec.js › Une porte par famille : élève (P2), pratique (P29), paramètre « enseignants » et clé hors liste, corbeille (G1)
- comptes-erreurs-stock-1142.spec.js › #1142 stock · la mesure rend exactement les décalées avec leur valeur, les ambiguës sans proposition, et n'écrit rien
- materiel-dissection-12.spec.js › dissection 12 · les touchers de la capture, dans son ordre : le nom entier sous la tête ; détacher par deux touchers
- materiel-dissection-2a.spec.js › dissection 2a · l’exemple étiqueté, refusé sans nom, un échec réessayé, créé, retrouvé dans Grilles de critères
- texte-troue-reperes-enonces.spec.js › texte troué · « Aucune annotation » en création : la saisir écrit sur le critère, sans écriture en base
```

Le même rapport, avec un essai rouge ajouté (`zz-rouge-ajoutee.spec.js › une rouge hors des listes`), donne **code 1**, et cet essai est nommé seul sous « Absentes de la baseline ». Aucune connue n'est « redevenue verte » ni « non jouée » le 28 : les 22 étaient rouges.

## À relire en priorité

1. **« 23 échec(s) connu(s) » pour une liste de 22.** C'est une trouvaille, *inscrite et on continue* (#1114). `identite` ne garde pas le titre du `describe`, si bien que 11 paires d'essais portent la même identité : `bibliotheque-liste-1159` ×7, `planif-menu-vue` ×2, `bareme-grille-neuve-1120` ×2.
   - Le 28, les deux essais « les trois fenêtres… » de 1159 étaient rouges. Le 27 au soir, l'un était rouge et l'autre vert.
   - Le classement se fait par identité. Il est donc juste au sens du juge, mais une rouge dans l'une des paires est couverte par l'autre.
   - Ce défaut est antérieur au lot, et le corriger réécrit les deux baselines : il n'est pas corrigé ici.
2. **28 intermittentes** : c'est plus que la « quinzaine à vingtaine » du verdict, parce que la règle prend toute rouge d'un des trois soirs. La famille `critere-algorithmique-calculs-4b/4c` y met 11 de ses 12 essais rouges ; le seul rouge aux trois soirs, 4b « Retirer », va dans les connues.
3. La supposition sur la rattrapée au second essai (plus haut).

## Compteur de #1114

**0 push conforme sur 3.** Le prochain run complet de GitHub sera le premier jugé par la règle neuve.
