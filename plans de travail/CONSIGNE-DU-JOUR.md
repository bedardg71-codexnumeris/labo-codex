# Consigne du jour — la porte de l'orthopédagogie sur l'accueil, et le champ qui se contredit

> **Écrite le samedi 12 septembre 2026 à 10 h 25 (Toronto) par Cowork**, au retour de la porte de la section Cours (**6/7**, rangée 1
> échouée, trois décisions « tel quel »).
> État mesuré : **`1.137.0`**, build `0912-0935`, `main` = `origin/main` = `305bb4c8`, `rev-list` = **0**.
> ⚠ **Révisée le 12 septembre à 10 h 35 : un LOT C s'ajoute** (§ 2 bis) — la carte « Critères ciblés / Objectif visé » ne
> s'affiche pas chez l'orthopédagogue. Demandé par Grégoire, mesuré par Cowork, tranché par lui.
> Elle remplace la consigne de la section Cours, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-12-section-cours.md`.
>
> **Porte relevée** : `PORTES-TERRAIN-2026-09-12-section-cours.md` — **inscris-y le relevé** (6/7, rangée 1 échouée → #846 ; décisions
> 3.1, 3.2 et 3.3 données « tel quel ») dans ton commit documentaire. **Le lot 5 du cadrage 11 reste EN PAUSE.**
>
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** Trois des quatre lots d'aujourd'hui ont corrigé une prémisse de Cowork.
> ⛔ **`js/config.js` reste fermé.** **Zone visuelle** : la maquette de l'accueil est validée par Grégoire — ne la redessine pas, applique-la.
> **Skills** : `labo-codex`, `design-interface` (lot B), `verification-adverse`, `portes-terrain`, `release-et-changelog`.

---

## 0 · L'INTENTION

Trois choses, toutes déjà tranchées par Grégoire — les deux premières sont des mots, la troisième est un bloc qu'on masque. C'est le **dernier lot avant lundi**, jour où
l'orthopédagogue ouvre l'application, et avant mardi, jour où vingt personnes de la communauté de pratique la découvrent.

Dans ses mots (12 sept., 7 h 35) : **« Je veux que l'orthopédagogue sente qu'elle entre par la porte principale. »** L'accueil est le
premier écran ; aujourd'hui, rien n'y dit que l'application sert deux métiers.

⮕ **Aucun comportement, aucune donnée, aucune règle ne change.**

---

## 1 · LOT A — le champ 2 du groupe-cours ne bascule plus (#846)

**Le symptôme, relevé par Grégoire** : sur un service, le champ 2 du formulaire de groupe-cours s'intitule « Service d'orthopédagogie »
et son menu liste pourtant **tous les cours** — 601-101-MQ, 601-101 (Démo) — à côté des services.

**La cause est une supposition de Cowork, pas une erreur d'exécution** : la consigne du 12 sept. (8 h 55) a fait suivre ce champ au
contexte actif. Or ce champ ne parle pas du contexte : il parle de **ce qu'on est en train de choisir**, et on peut y choisir n'importe
quel cours.

- Le mot ne bascule plus : il couvre les deux — **« 2. Cours ou service »**.
- ⚠ **Mesure d'abord s'il y a d'autres champs dans ce cas** : un libellé qui suit le contexte actif alors qu'il nomme un **choix
  possible**, pas le contexte. Le champ 5 (la personne) n'en est pas : les profils sont les mêmes quelle que soit la nature. Liste tes
  trouvailles dans le rapport.
- Sentinelle : sur un service comme sur un cours, le champ 2 dit le même mot, et son menu contient les deux natures. Break-test rouge.

---

## 2 · LOT B — la porte de l'orthopédagogie sur l'accueil

### B1 · Une carte, au-dessus des tâches
**Forme arrêtée par Grégoire sur maquette** : une carte **blanche**, conforme aux autres cartes de l'accueil — même rayon, même ombre,
même trait fin. **Ni couleur propre, ni bord gauche épais.** Elle se place **pleine largeur, sous le bandeau d'accueil, au-dessus du
label « Tâches »**. Elle ne remplace aucune carte : les huit tâches restent.

Les mots, arrêtés (le second a été corrigé deux fois par lui — livre-les tels quels) :

| | Texte |
|---|---|
| Titre | **Tu es orthopédagogue ?** |
| Phrase | **Décris ton service : son nom, la liste de tes étudiant·es et les dates de ton trimestre.** |
| Lien | **Commencer →** |

Le lien mène à **`Suivi › Rencontres`**, l'écran des trois questions. Un geste, pas un écran neuf.

⚠ **Ce qui a été écarté, et pourquoi — ne le réintroduis pas** : une couleur sarcelle (elle est la signature du mode démonstration en
mode sombre, `styles.css` l. 353-362) ; « ni code de cours, ni discipline, ni compétence » (cette carte est lue par tous, on n'y nomme
pas les irritants d'une personne) ; « les dates de tes rencontres » (faux : les trois questions demandent les dates du **trimestre**).

### B2 · « Par où commencer ? » ne parle qu'aux enseignants
C'est le **premier texte** du bandeau d'accueil. Il envoie aujourd'hui configurer un trimestre, un cours et un groupe dans le Cadre —
le chemin dont les trois questions devaient la dispenser. Deux branches étiquetées, le « je » de l'étiquette et le « tu » de la consigne :

> **Par où commencer ?**
> **Je suis enseignant·e** — Configure ton trimestre, ton cours et ton groupe dans l'onglet Cadre : tu saisis tout une fois, l'app s'en
> sert partout. Ensuite, crée tes productions et tes évaluations — tu peux les élaborer et les partager avec tes collègues.
> **Je suis orthopédagogue** — Décris ton service dans Suivi › Rencontres : tes rencontres se tiennent là.

### B3 · Deux paragraphes du même bandeau, raccourcis (décision de Grégoire, 12 sept.)
Il voulait les retirer ; Cowork a plaidé pour les raccourcir, il a accepté. **Livre ces deux textes tels quels :**

> **Certains concepts sont nouveaux ?** Trois guides expliquent la taxonomie SOLO, les micro-données et le modèle RàI, accessibles en
> tout temps par les boutons « Guide ».
>
> **Ton courriel, une fois par mois.** Tu donnes ton courriel, tu reçois un code, et tu n'y repenses plus. Rien ne se ferme, et tes
> données restent sur ton appareil.

Ils remplacent les deux paragraphes actuels (« Certains concepts sont nouveaux pour toi ?… » et « L'identification est requise… »).

### B4 · Sentinelles, avec break-test rouge
1. La carte est présente sur l'accueil, au-dessus du label « Tâches », et **les huit cartes de tâches sont toujours là** (c'est le verrou :
   rien n'est remplacé).
2. Son lien mène à la sous-section des rencontres — le même chemin que la sous-navigation, pas un second.
3. Les mots de la carte et des quatre paragraphes viennent du rendu, pas d'une copie : un seul endroit les écrit.

**Harnais AVANT/APRÈS sur le pack démo** : seules des chaînes affichées peuvent différer. Aucune valeur.

---

## 2 bis · LOT C — chez l'orthopédagogue, la carte « Critères ciblés / Objectif visé » ne s'affiche pas

**Ce que Grégoire a signalé** (12 sept., captures à l'appui) : dans `Suivi › Interventions`, ses cinq critères — Structure, Rigueur,
Plausibilité, Nuance, Français écrit — lui semblent écrits en dur, et il demande de les retirer aussi des rencontres de l'orthopédagogue.

**Ce que la mesure a corrigé de cette prémisse** (Cowork, 12 sept., lecture seule) :
- Les cinq critères **ne sont pas en dur**. `interventions.js` (≈ l. 827-850) construit les cases depuis `obtenirGrilleReferenceDepistage()`
  (`profil-etudiant-helpers.js`). Grégoire voit **sa** grille de référence ; un autre enseignant verrait la sienne.
- **Sa seconde intuition est juste, elle** : `Suivi › Rencontres` sur un service appelle `afficherListeInterventions()`
  (`rencontres.js`, ≈ l. 80-82) — **même module, même carte**. Ce qui est rendu chez lui est rendu chez elle.
- Chez l'orthopédagogue, aucune grille de dépistage n'est désignée : elle ne verra donc pas des critères, mais le message d'invite
  « Configure une grille de référence dans Conception › Grilles de critères pour activer le ciblage par critère » — qui, en plus,
  **ne nomme pas le bon chemin** (le réglage vit dans `Labo → Outils d'observation`, cf. la constante `OU` de
  `profil-etudiant-helpers.js`). Ce message est le vrai irritant, pas les critères.

**Décision de Grégoire (12 sept.)** : sur un service, **la carte entière** — « Critères ciblés » **et** « Objectif visé » **et** le bouton
« Suggérer » — ne s'affiche pas. ⚠ **On MASQUE, on ne supprime pas** : un besoin semblable peut émerger dans les prochaines semaines.
Motif du tout-ou-rien : « Suggérer » ne sait travailler qu'à partir d'un critère coché — garder l'objectif seul laisserait un bouton
qui ne répond pas, découvert lundi par quelqu'un qui n'a personne à qui demander.

**Le point d'accroche existe déjà** : `contexteActifEstService()` — celui qui cache déjà « Séance concernée » et la case des
non-participants motivés (voir l'en-tête « VOCABULAIRE ET CONTENEUR » de `interventions.js`). Pas de mécanisme neuf.

### Deux conséquences, mesurées, à traiter DANS ce lot
1. **L'enregistrement ne doit rien effacer.** `enregistrerIntervention` (≈ l. 1437) lit
   `#criteresCiblesContainer .critere-cible-cb:checked` et écrit le résultat dans `criteresCibles`. **Conteneur absent = liste vide =
   `criteresCibles: []` écrit en base.** Aujourd'hui il n'y a pas de stock sur un service, mais la règle vaut quand même : si le
   conteneur n'est pas rendu, **ne touche pas au champ** — laisse en base ce qui y est.
2. **Le sous-titre du bilan promet ce qui n'existera plus.** `VOCABULAIRES.rencontres.aideBilan` dit « Comparaison des critères ciblés
   avant et après la rencontre. » Or le tableau comparatif est déjà gardé par `criteresCibles.length > 0` (≈ l. 1015) : sur un service,
   il ne s'affichera jamais. **Texte ARRÊTÉ par Grégoire le 12 sept. à 10 h 40 — livre-le tel quel : « Ce que tu retiens de la rencontre. »**
   Le reste du bilan (« Objectif atteint ? », le texte libre) ne bouge pas.

### Sentinelle, avec break-test rouge
1. Sur un service : **ni** « Critères ciblés », **ni** « Objectif visé », **ni** le bouton « Suggérer » dans le formulaire rendu.
2. Hors service : la carte est là, ses cases viennent toujours de la grille de référence, « Suggérer » répond. **Les mots et le
   comportement de `1.137.0` sont figés.**
3. Une rencontre dont `criteresCibles` vaut `['Structure']` en base, ouverte **et enregistrée** sur un service, vaut toujours
   `['Structure']` après (le verrou de la conséquence 1).

---

## 3 · CE QUI REMONTE À GRÉGOIRE
- **Rien des mots** : ils sont tous arrêtés, et deux d'entre eux l'ont été deux fois. Si tu crois devoir en changer un, **inscris et
  demande**, ne livre pas ta version.
- Si le lot A révèle qu'un libellé est lié à un **comportement** : arrête ce point, inscris, remonte.

## 4 · CE QUI NE SE FAIT PAS
- ⛔ Aucune couleur nouvelle sur l'accueil, aucune carte retirée, aucun aiguillage à deux voies (formes B et C de la maquette, écartées).
- ⛔ **Ne retire pas la carte pour tout le monde** : hors service, rien ne change — ni un mot, ni un comportement.
- ⛔ #839 à #845 ne sont pas ce lot. #843 reste inscrit (décision 3.2 : « tel quel »).

## 5 · LIVRER — `minor` (`1.138.0`)
Une carte neuve sur l'écran d'entrée de tous les utilisateurs. Une seule livraison, après la relecture croisée de Cowork. Changelog :
trois lignes — l'accueil nomme désormais les deux usages, une orthopédagogue y trouve sa porte, et ses rencontres ne lui
demandent plus de cibler des critères d'évaluation.

## 6 · LA PORTE TERRAIN
Courte, cinq rangées (`PORTES-TERRAIN-2026-09-12-accueil.md`), markdown par toi, artefact par Cowork :
1. L'accueil, hors démo : la carte est là, au-dessus des tâches, blanche comme les autres ; **les huit tâches sont toutes là**.
2. Clique « Commencer → » : tu arrives sur les trois questions (ou sur la liste des rencontres si un service est actif).
3. Déplie le bandeau « Bienvenue » : les quatre paragraphes sont ceux du § 2, dans cet ordre.
4. Le reste de l'accueil et `Cadre › Groupe-cours` sur un service : le champ 2 dit **« Cours ou service »** ; tout le reste identique à `1.137.0`.
5. `Suivi › Rencontres` sur un service, une rencontre ouverte : **pas de bloc « Critères ciblés » ni « Objectif visé »**. Puis
   `Suivi › Interventions` sur ton 601-101-MQ : le bloc est là, tes cinq critères aussi, « Suggérer » répond.

## 7 · RAPPORT
Les autres libellés du même cas que #846, s'il y en a ; où vivent les mots de l'accueil ; ce que tu as laissé exprès. Fin de course :
`OU-EN-EST-ON.md` et `CONSIGNE-DEMARRAGE-COWORK.md` remesurés.
