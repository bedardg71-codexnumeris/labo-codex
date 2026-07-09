# PRÉ-VALIDATION VISUELLE — 3 juillet 2026 (Chromium, Lot V)

> **Cadre** : app servie en local sur le commit **prod** `5d981d29` (1.27.3,
> identique au deploy Netlify vérifié), **mode démo activé** (20 élèves #351),
> pilotée par le Chromium du conteneur. Moteur **Blink** — PAS Safari : ces
> constats dégrossissent la passe terrain d'août, ils ne la remplacent pas.
> Plan : `plans de travail/PLAN-prevalidation-visuelle-chromium-2026-07.md`.
> Captures transmises à Grégoire en session (15 fichiers, 2 modes,
> viewports 1470/1180/820).

## Constats

| Porte | Verdict Chromium | Preuve |
|---|---|---|
| #344 légende calendrier | **OK** | carte `.calendrier-legende-fusion` présente, EN TÊTE (avant la grille des mois), 2 colonnes ; mois en 2 colonnes à 1470 px |
| #283-T1 empilement mois | **OK** | 1 colonne à 820 px (scrollW 810/820, zéro débordement) ; 2 colonnes conservées à 1180 px et 1470 px |
| #118 overflow Trimestre | **OK (non-régression)** | formulaire événement OUVERT : scrollW 1460/1470 à 1470 px, 810/820 à 820 px. ⚠ le bug d'origine était **Safari-seulement** → confirmation Safari reste due |
| #306 libellés création | **OK** | `nouveauCoursV2`/`nouveauHoraireV2`/`nouveauProfilEnseignantV2`/`nouveauGroupeCoursV2` → 4/4 « Créer » |
| #306 save explicite | **OK** | modifier `v2-debutTrimestre` + `change` SANS clic → `cadreCalendrier` inchangé (« rien persisté sans clic ») |
| #351 noms démo | **OK** | figures rendues dans Suivi → Liste : Curie, Césaire, Goodall, Mandela, Kahlo |
| #310 note A/C/P Suivi groupe | **capture à l'appui** | captures 2 modes transmises — lecture humaine requise (contenu pédagogique) |
| #313 info UI import | **non pré-validable sans données** | les 2 textes (« S'applique à tout le lot… » / « Ce fichier seulement… ») vivent dans le HTML GÉNÉRÉ du pipeline (travaux-ui.js:1691) — il faut des fichiers importés. Candidat Lot W (spec CI avec fichier synthétique) |
| #240 tampons jetons / #347 bandeau recalcul | **non pré-validable** | exigent des travaux annotés/rétroactions — la démo n'en fournit pas dans ce parcours |
| #311 libellé « PAN-Standards » | **non observé dans ce parcours** | à regarder dans le profil individuel (passe d'août ou sonde dédiée) |

## Anomalies détectées

**Aucune** dans le périmètre pré-validable. (Le seul KO de la première passe
était un bug de la sonde — mauvais nom de fonction `nouvelHoraireV2` au lieu
de `nouveauHoraireV2` ; corrigé et re-testé 4/4.)

Note mineure consignée (pas un bug) : le dropdown Enseignant·e du mode démo
n'offrait aucun profil à sélectionner dans ce parcours → la bascule
« Enregistrer » en édition n'a pas été observée ici (elle est verrouillée par
la sentinelle comportementale `sentinelle-libelles-assemblage-306`).

## Liste RESSERRÉE pour la passe Safari/iPad d'août

1. **#118** — Calendrier → Trimestre, formulaire d'édition ouvert, 1470×956
   **Safari** : plus de scroll horizontal ni de boutons clippés (le bug était
   Safari-only ; Chromium ne peut pas le fermer).
2. **#313** — parcours d'import RÉEL (Mac/iPad) : les 2 info-textes + le
   non-écrasement en conditions réelles.
3. **#240 / #347** — travaux annotés réels (tampons jetons, bandeau
   « Vue recalculée » pas trop bavard sur A25/H26).
4. **#311** — libellé « PAN-Standards » dans le profil individuel.
5. **Rendus subjectifs** (lisibilité, contrastes réels) sur les captures OK
   ci-dessus : #344, #283-T1, #306, #310, #351 — l'essentiel structurel est
   déjà vérifié, il reste le coup d'œil.
6. Portes antérieures inchangées : #361 (parcours de suppression sur
   trimestre de test), #355/#305/#121 (vague 2).
