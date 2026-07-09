# PLAN — Pré-validation visuelle sous Chromium + travail autonome restant (juillet 2026)

> **Rédigé le 3 juillet 2026 (session vague 3, avec Grégoire présent).**
> Demande : « peux-tu faire des vérifications visuelles et des validations
> terrain Mac en allant sur app.codexnumeris.org ? »
>
> **Cadre d'honnêteté** :
> 1. Le proxy du conteneur cloud **bloque** `app.codexnumeris.org` (403).
>    Sans incidence : la prod sert le commit `5d981d29` (vérifié au deploy
>    Netlify), identique au `main` local → on pilote le MÊME code servi en
>    local.
> 2. Le conteneur n'a **pas de Safari/WebKit** (Chromium seulement, et
>    l'installation de WebKit est interdite par l'environnement). Les passes
>    ci-dessous sont donc des **PRÉ-validations** (moteur Blink) : elles
>    attrapent les casses franches, vérifient les structures et les deux
>    modes, mais NE FERMENT PAS les portes « terrain Mac/iPad » qui
>    spécifient Safari (ex. #118 était un bug Safari-seulement). La passe
>    d'août de Grégoire reste la validation de référence ; ce plan vise à
>    la **raccourcir** (liste resserrée de ce qui reste à regarder).

---

## Lot V — Pré-validation visuelle Chromium (EN COURS, cette session)

**Méthode** : app servie en local (commit prod), **mode démo activé**
(`activerModeDemo()` — 20 élèves fictifs #351, données réalistes), captures
dans les DEUX modes (sombre/clair) × viewports **Mac 1470×956**, **iPad
paysage 1180×820**, **iPad portrait 820×1180**. Checks programmatiques
(overflow, libellés, présence des structures) + captures d'écran.

**Cibles (portes terrain vagues 1-3 + 29 juin)** :

| Porte | Quoi vérifier | Pré-validable Chromium ? |
|---|---|---|
| #344 | Carte Légende fusionnée EN TÊTE du Calendrier scolaire, 2 colonnes, empilement <768px | OUI (structure + rendu) |
| #283-T1 | Mois empilés <1024px, pas de scroll horizontal | OUI (mesures) — Safari pour confirmation |
| #118 | Trimestre : pas d'overflow avec formulaire ouvert | PARTIEL (bug était Safari-only ; on vérifie la non-régression Chromium) |
| #306 | 4 sections : « Créer » en création / « Enregistrer » en édition ; save explicite | OUI (libellés + comportement) |
| #313 | Info UI sous les 2 sélecteurs Production (import) | PARTIEL (rendu sans fichiers réels) |
| #351 | 20 élèves démo = figures historiques (rendu des noms) | OUI (mode démo) |
| #310 | Note A/C/P injectée dans Suivi du groupe | OUI (mode démo) |
| #311 | Libellé pratique active « PAN-Standards » | OUI si visible en démo |
| #240 | Tampons visuels jetons sur travaux annotés | SEULEMENT si la démo porte des travaux annotés — sinon consigner |
| #347 | Bandeau « Vue recalculée » | idem #240 (dépend des données) |

**Livrables** : captures envoyées à Grégoire + rapport
`Rapports/PREVALIDATION-VISUELLE-2026-07-03.md` avec tableau
OK / KO / non-pré-validable, et **liste resserrée pour la passe Safari
d'août**.

## Lot W — Filets CI WebKit (proposé, sur accord Grégoire)

La CI GitHub exécute Playwright **WebKit** (le moteur de Safari) à chaque
push main — c'est le seul WebKit accessible au projet depuis le cloud.
Transformer 2-3 portes en specs d'intégration :
- `#344` : structure de la carte Légende (rendu réel, WebKit) ;
- `#306` : bascule Créer/Enregistrer + « rien ne persiste sans clic » ;
- `#118/#283-T1` : mesure `scrollWidth` à 1470/900px (le check qui aurait
  attrapé le bug Safari à sa naissance).
Méthode : écrire les specs, smoke-test local en Chromium (executablePath),
merge → la CI WebKit devient le juge. Chaque porte convertie devient un
filet PERMANENT au lieu d'une vérification ponctuelle.

## Lot X — Enquêtes autonomes (lecture seule, sur accord)

1. **#300** : bug `getSync("trimestres")` désync — enquête de code.
2. **#301** : résolution de pratique en consultation — vérifier le reliquat
   RÉEL post-#328 L2-b1 (le helper D2 a absorbé « côté résolution ») ;
   clore ou re-périmétrer l'item.
3. **#332 constat 1** : enquête de code (le protocole de repro reste avec
   Grégoire).

## Hors autonome (rappel — inchangé)

#353 options 2/3/4 (chiffres du codex réel), #362/#354 (données live),
#365 (décision), #364 T3/T4 (formulations finales — des brouillons sont
possibles mais la voix est celle de Grégoire), triage worktrees (Mac),
et la passe Safari/iPad réelle.
