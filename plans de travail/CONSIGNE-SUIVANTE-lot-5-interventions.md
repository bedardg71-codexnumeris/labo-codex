# Consigne suivante — Interventions : « Planifier » n'écrit plus un brouillon fantôme, le bilan lit les mêmes seuils que le reste, « Notes (n) » compte ce qu'il montre (lot 5 du cadrage 11)

> **Écrite le 11 septembre 2026 à 17 h 45 (Toronto, `TZ=America/Toronto date`) par Cowork, À FROID, en file derrière les lots 3 et 4.**
> Elle devient la consigne du jour quand le lot 4 est livré et VU (Cowork la renomme, date et version remesurées). Application au moment de
> l'écriture : **`1.132.0`**, build `0911-1547`. ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** L'audit date du 6 (`1.123.5`) ;
> `interventions.js` n'a pas bougé depuis le 6 hors `#769`/`#772` (CM-3, CM-6, livrés) — remesure quand même les lignes.
>
> **Préalables** : le cadrage 11 (§ 7) ; `Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md` **§ 5 seulement** (l. 284-329 : I-1 à I-7, le
> tableau des gestes, le code mort) ; `BACKLOG.md`, `#742`, `#746`, `#747`, `#748`, `#736` (grep ciblé — **cités, pas rejugés** : ce sont
> des règles, après le 14, sauf ce que ce lot en fait, nommé ci-dessous). Skills : `labo-codex`, `depistage-rai` (les interventions et
> le RàI), `verification-adverse` § 4, `portes-terrain`.

---

## 0 · CE QUE CE LOT CHANGE POUR GRÉGOIRE ET SES COLLÈGUES

1. **« Planifier une intervention » n'écrit plus rien tant qu'on n'a pas enregistré.** Aujourd'hui (I-1) le clic crée l'intervention **en
   base** (`jamaisSauvegardee: true`, `:619`) avant toute saisie ; changer d'onglet la purge en silence (`:302`). Un formulaire à moitié
   rempli disparaît sans un mot, et un export pris entre-temps contient un fantôme.
2. **Le bilan avant / après d'une intervention lit les mêmes seuils que le reste de l'application.** Aujourd'hui (I-5) les lettres sont
   calculées avec 0,85 / 0,75 / 0,65 **écrits en dur** (`:919-920`) alors que la suggestion d'objectif du même formulaire lit
   `obtenirSeuil('idme.insuffisant')` = 0,64 (`:1125-1126`) : un élève à 64,5 % est « D » partout et « I » dans le bilan, sur le même écran.
3. **« Notes individuelles (n) » compte ce qu'il montre** (I-7, `#748`) — voir § C, une question à Grégoire.
4. Du code mort retiré, deux commentaires.

**Rien n'écrit dans les données de personne** ; le lot en écrit même moins (le brouillon).

---

## 1 · LE LOT — `js/interventions.js`

### A. Créer en mémoire, écrire à l'enregistrement (I-1)
`afficherFormulaireIntervention` (`:602-625`) : l'objet naît **en mémoire** (variable de module, pas dans `interventions` sauvegardées) ;
`sauvegarderPresencesIntervention` (`:1221`, le seul chemin) le pousse en base à « Enregistrer » ; `annulerNouvelleIntervention` (`:630`)
le jette sans écriture ni confirmation (rien n'a été écrit, rien à confirmer) ; la purge de `:302-305` et le champ `jamaisSauvegardee`
(`:134`, `:973`, `:1096`, `:1335`) **disparaissent** — plus aucun fantôme à purger. ⚠ **Stock** : des interventions `jamaisSauvegardee:
true` peuvent dormir en base chez qui a quitté un formulaire avant une purge — à la lecture, **les ignorer et les dire** (compte dans
`console.warn`, pas de suppression : écrire chez les gens remonte à Grégoire). Sentinelle : clic « Planifier » → 0 écriture ; « Enregistrer »
→ 1 intervention, 1 écriture ; quitter sans enregistrer → 0 en base ; une `jamaisSauvegardee` résiduelle en base n'est ni rendue ni
comptée. Rouges montrés.

### B. Une seule source pour les lettres du bilan (I-5, produit de `#742`)
`:919-920` : remplacer les trois nombres par `obtenirSeuil('idme.etendu' / 'idme.maitrise' / 'idme.developpement')` (**mesure les noms
exacts des clés** dans `interpretation-config.js` / `preferences-v2.js` — ceux que `:1125-1126` lisent déjà), avec le **même arrondi** que
la lettre (le « 65 % » affiché à côté d'un « I » venait d'un arrondi indépendant). ⛔ **Les valeurs des seuils ne bougent pas** (`#821`,
`#822`) : le lot change la SOURCE, pas les bornes. **Ce qui reste une règle, cité pas rejugé** (`#742`) : qu'un bilan traduise une
moyenne en lettre — c'est de la didactique, à Grégoire, après le 14. Sentinelle : avec les seuils par défaut, 0,645 → « D » dans le
bilan **et** dans la suggestion ; change le seuil → les deux bougent ensemble.

### C. « Notes individuelles (n) » compte ce qu'il montre (I-7, `#748`) — TRANCHÉ par Grégoire à 17 h 47
`genererAffichageNotesIndividuelles` (`:529-559`) compte toutes les entrées (`:533`) et ne rend que celles dont l'élève est retrouvé dans
le groupe actif (`:544`) : « Notes (2) », une seule ligne. **Décision de Grégoire, dans ses mots : « la note reste visible, grisée, avec la
mention « (n'est plus dans le groupe) » »** — l'extension à cet écran de sa décision du lot 2 (les abandons visibles, grisés), qu'il a
faite sienne. ⮕ Une entrée dont le DA n'est plus dans le groupe actif se rend **grisée** (même patron que la Liste : `etud-texte-gris-clair`
ou la classe d'état retenue au lot 2 — mesure) avec le nom si la fiche existe encore dans le trimestre (`groupeEtudiants` du trimestre,
tous groupes) ou le DA sinon, suivi de **« (n'est plus dans le groupe) »** ; le compteur compte toutes les entrées, et il dit vrai.
Sentinelle : deux notes, un DA parti → deux lignes, une grisée avec la mention, compteur « (2) ». `#748` clos par ce lot ; `#746` cité.

### D. Le code mort (leçon du 10 : un mort se mesure par chaque lecteur)
`completerIntervention` (`:254`, exportée `:1548`, **0 appelant** hors l'export — `grep -rn "completerIntervention" js/ index.html tests/`)
et `afficherNotesIndividuelles` (`:1171`, cible `#notesIndividuellesContainer` qui n'existe nulle part, trois interpolations brutes) :
**retirer**, après mesure sous forme de chaîne aussi. Les tests qui les nommeraient : mesure avant.

### E. Commenter et oublier (I-6)
`dateCreation` ISO / `dateModification` timestamp (`:116`, `:136` vs `:162`, `:264`, `:1326`) : un commentaire daté, pas d'harmonisation
(le stock porte les deux formes). Le doc d'en-tête `:22-43` (`statut: 'en-cours'`, `id: 'intervention-timestamp'`) : le corriger, c'est
trois lignes de doc.

### F. Cité, pas rejugé
`#736` (les portes hors du mode anonymisation : `sauvegarderInterventions` écrit `db.setSync` direct), `#746`, `#747` (`heures` écrit par
le transfert de rattrapage). Les 2 cibles tactiles : lot 7. La double écriture complète à l'enregistrement (`:175` puis `:1327`) : **si**
elle se réduit à une en passant par A, tant mieux ; sinon commente.

---

## 2 · CE QUI NE SE FAIT PAS ICI
Aucun filtre ni tri réglable sur la liste des interventions (l'audit le note, personne ne l'a demandé) ; `consolidation.js` (Labo ›
Études, hors sous-onglet) ; le transfert des présences à la clôture (`#747`).

---

## 3 · CE QUI REMONTE À GRÉGOIRE
| Où | Question | Sa réponse |
|---|---|---|
| C — la note d'un élève parti du groupe | visible, grisée, avec la mention « (n'est plus dans le groupe) » | ✅ tranché à 17 h 47, dans ses mots |

Rien d'autre : aucun mot neuf ailleurs.

## 4 · LIVRER — `minor` : le comportement de « Planifier » change chez les collègues
Changelog, une phrase : « Dans Suivi › Interventions, planifier n'enregistre plus rien tant que tu n'as pas cliqué Enregistrer ; le bilan
avant / après lit les mêmes seuils que le reste de l'application. »

---

## 5 · LA PORTE TERRAIN — ses données réelles ; une intervention de banc se crée puis s'annule sans rien écrire
| # | Geste | Attendu |
|---|---|---|
| 1 | `Suivi › Interventions`, « Planifier une intervention », tape un titre, **change d'onglet sans enregistrer**, reviens | **aucune** intervention dans la liste — et rien n'a été écrit (Labo › Données : le compte d'interventions n'a pas bougé) |
| 2 | « Planifier », remplis, « Enregistrer » ; recharge la page | l'intervention est là, une fois |
| 3 | Ouvre-la, section bilan avant / après (si des évaluations existent) | la lettre et le pourcentage s'accordent avec le reste de l'app (un 64,5 % est « D » ici comme dans le profil) |
| 4 | Supprime-la (bouton, confirmation) | disparue ; le compte dans Labo › Données revenu à l'initial |
| 5 | **Cas réel seulement** : une intervention qui porte une note pour un élève parti du groupe | la note est là, grisée, « (n'est plus dans le groupe) » ; le compteur compte juste |

⚠ Les rangées 2 et 4 écrivent puis effacent **une intervention de sa main** : dis-le dans la porte, § 1 (« tes données »).

---

## 6 · TROUVAILLES ET RAPPORT
Trois issues nommées. Rapport : `OU-EN-EST-ON.md`, le rapport du 6 (§ 5 : lot 5 livré), `#748` clos, `#742` annoté (source unique,
règle restante), `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, entrée 10 des cadrages (lot 6 suivant : l'Animation), la consigne commise
avec le lot.
