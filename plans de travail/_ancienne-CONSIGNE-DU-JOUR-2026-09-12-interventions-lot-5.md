# Consigne du jour — Interventions : « Planifier » n'écrit plus un brouillon fantôme, le bilan lit les mêmes seuils que le reste, « Notes (n) » compte ce qu'il montre (lot 5 du cadrage 11)

> **PROMUE consigne du jour le samedi 12 septembre 2026 à 12 h 05 (Toronto) par Cowork.** Écrite à froid le 11 sept. à 17 h 45,
> en file derrière les lots 3 et 4 ; **son corps est inchangé, seuls l'en-tête et les ancrages de ligne ont été remesurés** ce midi.
> Elle remplace la consigne de l'accueil, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-12-accueil-et-porte-ortho.md`.
>
> ▣ **LE CHANTIER DE L'ORTHOPÉDAGOGIE EST CLOS POUR LUNDI.** `1.138.0` est **en ligne** (build `0912-1116`, poussée à 11 h 52),
> ses cinq lots vus à l'écran de Grégoire : **porte terrain 7/7, zéro échec** (`PORTES-TERRAIN-2026-09-12-accueil.md`, relevé de 12 h 02).
> Ses deux décisions sont tranchées et inscrites : **#848 en option A**, et l'option vide du champ 2 reste **telle quelle**.
> ⮕ **Rien de ce chantier n'attend plus.** La relecture du lot E par Cowork a été faite à 11 h 24 sur `e239787f` — elle passe ;
> l'artefact de la porte a été publié à 11 h 30. Ces deux points, notés comme dus dans le relais de 11 h 52, **sont sans objet**.
>
> **État mesuré, 12 sept. à 12 h 05** : `1.138.0`, build `0912-1116`, `origin/main` = `61b5c883` ; un commit de relais local
> non poussé (`1b36c338`). Application **en ligne** : `1.138.0`.
>
> ⚠⚠ **CE QUI A CHANGÉ DEPUIS L'ÉCRITURE DE CETTE CONSIGNE, ET QUI LA CONCERNE DIRECTEMENT** : `js/interventions.js` a été modifié
> **trois fois ce matin** (lots C, D et E de `1.138.0`). Les trois défauts visés ci-dessous sont **toujours là** — remesuré à 12 h 05 —
> mais **tous les numéros de ligne de la version du 11 étaient périmés** ; ils sont corrigés dans le texte. Remesure quand même.
>
> ⚠⚠ **LA RÉSERVE DE COWORK, NOMMÉE UNE FOIS** : ce lot touche le module que l'orthopédagogue ouvrira **lundi**, et les vingt
> personnes de la communauté de pratique **mardi**. Le volet A change un **comportement** (quand l'intervention est écrite en base),
> pas un mot. ⮕ La porte terrain de ce lot doit être passée par Grégoire **avant lundi**, ou la livraison attend mardi soir.
> Ce n'est pas une objection au lot : c'est la condition pour le livrer cette semaine.
>
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** Le 12 au matin, trois lots sur quatre ont corrigé une prémisse de Cowork.
>
> ⚠ **CE QUI N'A PAS ÉTÉ REMESURÉ, ET QUE COWORK NOMME PLUTÔT QUE DE TAIRE** : les ancrages du § A, du § B, du § C et des deux
> fonctions mortes du § 2 ont été revérifiés ce midi. **Ceux du dernier paragraphe ne l'ont pas été** — les lignes de
> `dateCreation` / `dateModification` (`:116`, `:136`, `:162`, `:264`, `:1326`) et la double écriture à l'enregistrement
> (`:175` puis `:1327`) datent du 11 septembre, avant les trois lots de ce matin. **Traite-les comme des indices, pas comme des
> adresses**, et remesure avant d'y toucher.
>
> **Préalables** : le cadrage 11 (§ 7) ; `Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md` **§ 5 seulement** (l. 284-329 : I-1 à I-7, le
> tableau des gestes, le code mort) ; `BACKLOG.md`, `#742`, `#746`, `#747`, `#748`, `#736` (grep ciblé — **cités, pas rejugés** : ce sont
> des règles, après le 14, sauf ce que ce lot en fait, nommé ci-dessous). Skills : `labo-codex`, `depistage-rai` (les interventions et
> le RàI), `verification-adverse` § 4, `portes-terrain`.

---

## 0 · CE QUE CE LOT CHANGE POUR GRÉGOIRE ET SES COLLÈGUES

1. **« Planifier une intervention » n'écrit plus rien tant qu'on n'a pas enregistré.** Aujourd'hui (I-1) le clic crée l'intervention **en
   base** (`jamaisSauvegardee: true`, `:779`) avant toute saisie ; changer d'onglet la purge en silence (`:370`). Un formulaire à moitié
   rempli disparaît sans un mot, et un export pris entre-temps contient un fantôme.
2. **Le bilan avant / après d'une intervention lit les mêmes seuils que le reste de l'application.** Aujourd'hui (I-5) les lettres sont
   calculées avec 0,85 / 0,75 / 0,65 **écrits en dur** (`:1085-1086`) alors que la suggestion d'objectif du même formulaire lit
   `obtenirSeuil('idme.insuffisant')` = 0,64 (`:1291-1292`) : un élève à 64,5 % est « D » partout et « I » dans le bilan, sur le même écran.
3. **« Notes individuelles (n) » compte ce qu'il montre** (I-7, `#748`) — voir § C, une question à Grégoire.
4. Du code mort retiré, deux commentaires.

**Rien n'écrit dans les données de personne** ; le lot en écrit même moins (le brouillon).

---

## 1 · LE LOT — `js/interventions.js`

### A. Créer en mémoire, écrire à l'enregistrement (I-1)
`afficherFormulaireIntervention` (`:761`, l'objet fantôme écrit à `:779`) : l'objet naît **en mémoire** (variable de module, pas dans `interventions` sauvegardées) ;
`sauvegarderPresencesIntervention` (`:1387`, le seul chemin ; il remet le drapeau à `:1506`) le pousse en base à « Enregistrer » ; `annulerNouvelleIntervention` (`:790`)
le jette sans écriture ni confirmation (rien n'a été écrit, rien à confirmer) ; la purge de `:370` et le champ `jamaisSauvegardee`
(`:198`, `:779`, `:1139`, `:1262`, `:1506`) **disparaissent** — plus aucun fantôme à purger. ⚠ **Stock** : des interventions `jamaisSauvegardee:
true` peuvent dormir en base chez qui a quitté un formulaire avant une purge — à la lecture, **les ignorer et les dire** (compte dans
`console.warn`, pas de suppression : écrire chez les gens remonte à Grégoire). Sentinelle : clic « Planifier » → 0 écriture ; « Enregistrer »
→ 1 intervention, 1 écriture ; quitter sans enregistrer → 0 en base ; une `jamaisSauvegardee` résiduelle en base n'est ni rendue ni
comptée. Rouges montrés.

### B. Une seule source pour les lettres du bilan (I-5, produit de `#742`)
`:1085-1086` : remplacer les trois nombres par `obtenirSeuil('idme.etendu' / 'idme.maitrise' / 'idme.developpement')` (**mesure les noms
exacts des clés** dans `interpretation-config.js` / `preferences-v2.js` — ceux que `:1291-1292` lisent déjà), avec le **même arrondi** que
la lettre (le « 65 % » affiché à côté d'un « I » venait d'un arrondi indépendant). ⛔ **Les valeurs des seuils ne bougent pas** (`#821`,
`#822`) : le lot change la SOURCE, pas les bornes. **Ce qui reste une règle, cité pas rejugé** (`#742`) : qu'un bilan traduise une
moyenne en lettre — c'est de la didactique, à Grégoire, après le 14. Sentinelle : avec les seuils par défaut, 0,645 → « D » dans le
bilan **et** dans la suggestion ; change le seuil → les deux bougent ensemble.

### C. « Notes individuelles (n) » compte ce qu'il montre (I-7, `#748`) — TRANCHÉ par Grégoire à 17 h 47
`genererAffichageNotesIndividuelles` (`:680`) compte toutes les entrées et ne rend que celles dont l'élève est retrouvé dans
le groupe actif : « Notes (2) », une seule ligne. **Décision de Grégoire, dans ses mots : « la note reste visible, grisée, avec la
mention « (n'est plus dans le groupe) » »** — l'extension à cet écran de sa décision du lot 2 (les abandons visibles, grisés), qu'il a
faite sienne. ⮕ Une entrée dont le DA n'est plus dans le groupe actif se rend **grisée** (même patron que la Liste : `etud-texte-gris-clair`
ou la classe d'état retenue au lot 2 — mesure) avec le nom si la fiche existe encore dans le trimestre (`groupeEtudiants` du trimestre,
tous groupes) ou le DA sinon, suivi de **« (n'est plus dans le groupe) »** ; le compteur compte toutes les entrées, et il dit vrai.
Sentinelle : deux notes, un DA parti → deux lignes, une grisée avec la mention, compteur « (2) ». `#748` clos par ce lot ; `#746` cité.

### D. Le code mort (leçon du 10 : un mort se mesure par chaque lecteur)
`completerIntervention` (`:322`, exportée `:1728`, **0 appelant** — revérifié le 12 sept. à 12 h 08 hors l'export — `grep -rn "completerIntervention" js/ index.html tests/`)
et `afficherNotesIndividuelles` (`:1337`, cible `#notesIndividuellesContainer` — `:1340` — qui n'existe nulle part, trois interpolations brutes) :
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
