# Consigne du jour — Profils individuels : un seul rendu à l'ouverture, des graphiques qui lisent l'échelle de chaque évaluation, et le tri du profil (lot 4 du cadrage 11)

> **Écrite le 11 septembre 2026 à 17 h 14 (Toronto) par Cowork, à froid ; PROMUE consigne du jour à 18 h 43**, le lot 3 étant livré
> (`1.133.0`, `c816d0cc`, poussé) **et VU** (porte relevée 7/7 à 18 h 42 sur ses deux groupes réels). Application au moment de la
> promotion : **`1.133.0`**, build `0911-1730`, `main` = `origin/main` = `c816d0cc`. Elle remplace la consigne du lot 3, archivée à côté
> sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-11-lot-3-saisie-des-presences.md`.
> **Décisions de Grégoire du 11, dans ses mots, toutes au cadrage 11 (§ 7 et sa queue)** : `#754` et `#752` entrent (17 h 15) ; la case
> « Services adaptés » suit la liste des étudiant·es et le « Portrait de lecteur » est retiré (17 h 20-24) ; le bouton « Nouvelle
> intervention » à sa place (17 h 28, « dans un lot comme les autres », 17 h 35).
>
> **AVANT TOUT — un commit documentaire séparé** : la porte du lot 3 (relevée 7/7), l'entrée 10 de `00-CADRAGES-OUVERTS.md`, le cadrage 11
> (décisions du soir), les consignes en file 5, 6, 7, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, `CONSIGNE-DEMARRAGE-COWORK.md`,
> l'archivage de la consigne du lot 3, **`git rm "plans de travail/CONSIGNE-SUIVANTE-lot-4-profils-individuels.md"`** (vidé, promu ici) et la présente. `git add` ciblé ; le `D` du PNG et les `Formation/*.html` restent hors de tes commits.
>
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** L'audit date du 6 (`1.123.5`) ; les numéros de ligne sont remesurés le 11 à
> 17 h sur `1.132.0`. Un constat périmé se dit périmé, pas corrigé.
>
> **Préalables** : le cadrage 11 (§ 7) ; `Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md` **§ 4 seulement** (l. 229-283 : P-1 à P-6, le
> tableau des gestes, les gestes jamais câblés) ; `BACKLOG.md`, `#752`, `#754`, `#751` (grep ciblé). Skills : `labo-codex`,
> `depistage-rai` (la conversion des niveaux), `verification-adverse` § 4, `portes-terrain`. ⛔ **`js/navigation.js` est une zone
> protégée** (`CLAUDE.md`) : ce lot ne la touche pas, voir § A.

---

## 0 · CE QUE CE LOT CHANGE POUR GRÉGOIRE ET SES COLLÈGUES

1. **Le profil ne se dessine plus quatre fois à l'ouverture.** Aujourd'hui (`#754`, mesuré : vide à 7 ms → rempli à 108 → vide à 212 →
   rempli à 317), chaque rendu recrée la section affichée : **un texte tapé dans la zone de texte du rapport est effacé**, une note DEN
   et sa justification non enregistrées aussi, et trois clés d'indices sont réécrites à chaque passage.
2. **Les graphiques de progression lisent l'échelle de CHAQUE évaluation**, comme le dépistage le fait déjà (`convertirNiveauEnScore`
   + `tableConversionPourEvaluation`, `profil-etudiant-calculs.js:581`, `:867`, `:1017`…). Aujourd'hui ils convertissent I/D/M/E en
   40 / 65 / 75 / 100 **écrits en dur** deux fois (`graphiques-progression.js:2132-2135`, `:3436-3439`), lisent tout nombre ≤ 4 comme
   une note sur 4 (`:2141`, `:3444` — un critère en points « 3 » devient 75 %, « 21 » sur 30 devient 21 %), et une échelle A/B/C
   donne une courbe **trouée sans un mot**. Les zones colorées du fond viennent de « la première échelle du trimestre » (`:314`,
   `:366`), pas de celle des évaluations. **Justes chez Grégoire par coïncidence** (son échelle vaut 40/65/75/100), faux chez un
   collègue.
3. Le tri : les cases du rapport partagées entre élèves et trimestres, les gestes exportés sans bouton, le cité-pas-rejugé.

**Rien n'écrit dans les données de personne**, hors une clé d'état d'écran qui passe par trimestre (§ C), sans semis.

---

## 1 · LE LOT

### A. Un seul rendu à l'ouverture (`#754`, P-1) — SANS toucher `navigation.js`
Quatre sources mesurées le 5-6 : l'appel direct ; le crochet de `navigation.js:590-616` (`afficherSousSection('suivi-profil')` programme
`afficherProfilComplet(profilActuelDA)` à T+100 ms, garde `_profilAutoChargement` sur la réentrance seulement) ; le `MutationObserver`
de `profil-etudiant-sections-affichage.js:4400-4420` (recharge 100 ms après que la sous-section devient active) ; et le **rebouclage**
`afficherProfilComplet:2345` → `afficherSousSection('suivi-profil')` → crochet → `afficherProfilComplet`.
⮕ **Décision de Cowork, à vérifier par la mesure** : les deux relanceurs qui vivent DANS le module profil suffisent à casser la boucle —
(1) `afficherProfilComplet` n'appelle `afficherSousSection` **que si la sous-section n'est pas déjà active** ; (2) le `MutationObserver`
est retiré (son rôle — recharger quand on arrive par la navigation — est déjà celui du crochet de `navigation.js`). Mesure avec la sonde
de `#754` (compte des insertions dans `#contenuProfilEtudiant`, WebKit local) : **attendu 1, par les trois chemins** (sélecteur, clic
depuis la Liste, clic depuis le Suivi du groupe). Si un chemin reste à 2 à cause du crochet de `navigation.js`, **n'y touche pas** :
inscris la mesure et remonte-la à Grégoire (zone protégée, son autorisation). Sentinelle : une spec Playwright locale (pas CI) qui
compte les rendus, ou le banc Vitest du 6 si `afficherProfilComplet` s'y exécute — **et** : un texte tapé dans `textarea-rapport-<da>`
survit 500 ms après l'ouverture (c'est ce que Grégoire perd aujourd'hui).

### B. Les graphiques lisent l'échelle de l'évaluation (`#752`, P-5) — rien d'inventé
1. **Une seule source de conversion** : `convertirNiveauEnScore(niveau, tableConversionPourEvaluation(evaluation, cache))` — celle du
   dépistage. Les deux tables en dur (`:2132-2135`, `:3436-3439`) et les deux « ≤ 4 → /4 » (`:2141`, `:3444`) **disparaissent**.
2. **Un critère en points** (l'échelle de l'évaluation le dit — lot 2 du 4 septembre, `#612`) se convertit par sa fraction
   (`21/30 → 70 %`), par la même fonction que le dépistage (`_fractionEnPoints` / `_pointsEnFraction`, `preferences-v2.js`, ou celle que
   `profil-etudiant-calculs.js` utilise : **mesure, une seule**).
3. **Une valeur non convertible** (échelle sans valeur numérique pour ce niveau, table `null` — `#529`) : **le point est absent, et le
   graphique le dit** (« n évaluations sans valeur convertible » sous la légende, patron `afficherMessageAttente` qui n'existe
   aujourd'hui que pour les graphiques de groupe). **Jamais une valeur devinée** — décision de Grégoire du 11 (17 h 15), dans les mots
   de Cowork qu'il a acceptés.
4. **Les zones colorées du fond** : celles de l'échelle des évaluations tracées ; si plusieurs échelles coexistent, celle de la
   majorité, et le graphique le dit — **décide et dis-le**, ne demande pas.
5. Sentinelle, break-testée : (a) une échelle A/B/C à valeurs 0,5 / 0,7 / 0,9 trace 50 / 70 / 90 — pas de trou ; (b) une évaluation
   « 3 » sur une échelle en points sur 30 trace 10 %, pas 75 ; (c) un niveau sans valeur → point absent + message ; (d) l'échelle de
   Grégoire (40/65/75/100) trace **les mêmes courbes qu'avant** (non-régression : capture les valeurs d'avant sur le pack démo AVANT
   de toucher, compare après). Rouges montrés pour (a) et (d).

### C. Les cases du rapport par trimestre (P-2)
`db.setSync('preferencesRapport', …)` (`profil-etudiant-rapport.js:362`, `:371`) : nue, partagée entre trimestres et élèves, écrite 3-4
fois à l'ouverture. Passe sous `cle()` (par trimestre ; **par élève, non** : ce sont six cases de forme, pas un contenu — position de
l'audit, gardée), écrite **au geste** (une case cochée), pas au rendu. Pas de semis ; la nue devient orpheline (diagnostic-353). Le texte
du rapport reste un recalcul (position : le rapport est une vue) — le § A garantit seulement qu'il n'est plus effacé sous les doigts.

### D. Les gestes exportés sans bouton (tableau 4.1), et le volet confidentiel — deux décisions de Grégoire (17 h 20)
`attribuerJetonPersonnaliseAvecPrompt`, `retirerJetonPersonnaliseAvecConfirmation`, `supprimerEvaluationDepuisProfil`
(`profil-etudiant-actions.js:678`, `:705`, `:154`, exportées `:797-800`) ; `toggleDetailIndice` (`sections-affichage.js:3276`, **appelée
par `portfolio.js:443`** — l'audit la disait morte : **remesure**, un appelant existe). ⚠ Leçon du 10 : un mort se mesure par chaque
lecteur, y compris sous forme de chaîne (`grep -rn "nomDeLaFonction" js/ index.html tests/`). Ce qui n'a aucun appelant ni bouton :
**retirer** (pas « câbler »).

**D.1 — « Services adaptés » du volet confidentiel : une seule source, la liste des étudiant·es.** Dans ses mots : *« La case des
services adaptés devrait être cochée si, lorsque la liste des étudiants est créée, un étudiant a cette option cochée. Donc, ça devrait
correspondre à la liste originale des étudiants. »* Mesuré : la liste porte déjà ce fait — `e.sa === 'Oui'` (import `groupe.js:212`,
formulaire `trimestre-v2-etudiants.js:329-350`, `:443`, affiché `sections-affichage.js:2431`) — et le volet stocke **un second
booléen** `servicesAdaptes` dans `confidentielEtudiants` (`confidentiel.js:98`, `:230`), jamais synchronisé, sans handler sur la case
(`index.html:15070`). ⮕ **La case du volet reflète `etudiant.sa`** (cochée, **non modifiable** — ça se change dans Cadre › Trimestre,
et le volet le dit en un mot : « (d'après la liste des étudiant·es) ») ; les champs Catégorie / Sous-catégorie ne s'affichent que si
`sa === 'Oui'` (`toggleServicesAdaptes`, `:269`, enfin appelée — au rendu, pas au clic). **Stock** : le booléen `servicesAdaptes` déjà
écrit chez les gens n'est plus lu ni écrit (`:230` retiré) ; `trimestres.js:2218` (`services_adaptes: e.servicesAdaptes`) : mesure ce
qu'il alimente et fais-le lire `sa` — une seule source (`docs/DATA-OWNERSHIP.md`). Sentinelle : un élève `sa: 'Oui'` → case cochée et
diagnostic visible ; `sa: 'Non'` → décochée, diagnostic masqué ; Enregistrer n'écrit plus `servicesAdaptes`.

**D.2 — Le « Portrait de lecteur » (Conception · Rigueur · Plausibilité · Nuance · Français) est retiré du volet.** Dans ses mots :
*« nous allons retirer les dropdown IDME qui sont là uniquement pour ma pratique personnelle. Dans d'autres pratiques ou disciplines,
il n'y a pas de « Portrait de lecteur » comme ça. »* Mesuré : cinq `<select>` (`index.html:14977-…`), lus et écrits par
`confidentiel.js:112-117` et `:239-244`, testés à `:311-312` (« a des infos ») — **aucun autre lecteur dans `js/`** (`grep -rn
"portraitStructure\|portraitRigueur" js/` hors confidentiel.js = 0 ; remesure). ⮕ Retirer les cinq champs, leurs lignes de lecture et
d'écriture, et le test de `:311`. **Stock — précisé par Grégoire à 17 h 24, dans ses mots** : *« Les données du portrait de lecteur dans
la section confidentielle de l'élève peuvent disparaître complètement. Je n'ai jamais utilisé cette fonction. »* ⮕ Aucun script de
purge (écrire dans les données des testeurs n'est pas demandé, et rien ne l'exige) : `sauvegarderConfidentiel` réécrit l'objet entier
de l'élève depuis le formulaire (`donnees[da] = infos`, `:250`) — **les champs `portrait*` disparaissent d'eux-mêmes au prochain
Enregistrer** de ce volet, et personne ne les lit d'ici là. Une ligne dans le code le dit. C'est le même motif que « SRPNF » : sa
pratique codée en dur dans un écran que d'autres disciplines liront.

### F. Le bouton « + Nouvelle intervention » retrouve sa place (retour de Grégoire du 11 au soir, capture — **inséré dans ce lot comme les autres, à sa demande** : « je voudrais que tu l'insères dans un lot comme les autres », 17 h 35)
Profil › Accompagnement : le bouton est « mal situé » (sous le titre HISTORIQUE, à gauche, collé à
la carte vide). Mesuré : le code voulait une rangée titre-à-gauche / bouton-à-droite (`profil-etudiant-sections-affichage.js:1423-1427`,
`<div class="u-flex-between-mb10">`), mais **`u-flex-between-mb10` n'est définie nulle part** (`grep -rn "u-flex-between-mb10"
styles.css css/` = 0) — c'est le cas de `CLAUDE.md`, « une classe CSS jamais définie » : un lot jamais fini. ⮕ Remplacer par
`.u-flex-between` (`styles.css:741`) plus la marge utilitaire existante (mesure : `u-mb-10` ?), **sans créer de classe** ; le bouton se
retrouve **à droite du titre, sur la même ligne**, patron « titre + action » du design-system (§ 7). Vérifier sous WebKit à 1024 et 1366
que la rangée tient et que la carte de l'historique suit dessous. Porte : rangée 8.


### E. Cité, pas rejugé
P-4 (`#751`, le volet confidentiel en mode anonymisation : après le 14, règle des modes) ; P-3 (le volet en clair : position, skill
`securite-donnees` — inscrire seulement s'il demande le chiffrement) ; P-6 fonctionne ; `profilOngletDeveloppementActif` nue : lot 7
avec les clés nues. 14 cibles tactiles : lot 7.

---

## 2 · CE QUI REMONTE À GRÉGOIRE
| Où | Question | Sa réponse |
|---|---|---|
| D.1 — la case « Services adaptés » | tranché par lui à 17 h 20 : reflète la liste des étudiant·es | ✅ |
| D.2 — le « Portrait de lecteur » | tranché par lui à 17 h 20 : retiré | ✅ |
| D.1 — le mot sous la case | « (d'après la liste des étudiant·es) » | _______ (silence = tel quel) |
| B.3 — le mot sous le graphique | « n évaluations sans valeur convertible dans cette échelle » | _______ (silence = tel quel) |
| A — si un chemin reste à deux rendus à cause de `navigation.js` | son autorisation pour y toucher, ou le laisser | _______ |

## 3 · LIVRER — `minor` (`1.134.0` si le lot 3 a pris `1.133.0`) : les graphiques changent chez les collègues
Changelog, une phrase : « Le profil d'un élève s'ouvre en un seul rendu — ce que tu tapes dans le rapport n'est plus effacé ; les
graphiques de progression lisent l'échelle de chaque évaluation, et disent quand une valeur ne se convertit pas. »

---

## 4 · LA PORTE TERRAIN — ses données réelles, en lecture
Markdown par Claude Code (`PORTES-TERRAIN-<date>-profils-individuels.md`) ; artefact par Cowork. Rangées :

| # | Geste | Attendu |
|---|---|---|
| 1 | Profil d'un élève, section Rapport : tape trois mots dans la zone de texte, attends deux secondes | **les trois mots sont encore là** (avant : effacés à 100 ms) |
| 2 | Ferme le profil, rouvre-le depuis la Liste (clic sur la ligne) | il s'affiche **une fois**, sans clignotement |
| 3 | Section Performance, graphiques par critère, sur SON échelle | **les mêmes courbes qu'avant** (non-régression : il connaît ses élèves) |
| 4 | Mode démonstration, un élève, graphiques | pas de trou ; s'il y en a un, le message « sans valeur convertible » est là |
| 5 | Section Rapport : coche une case, change de trimestre, reviens | la case est **celle du trimestre**, pas partagée |
| 6 | Volet confidentiel d'un élève marqué SA « Oui » dans Cadre › Trimestre, puis d'un élève « Non » | la case « Services adaptés » suit la liste (cochée / décochée, non modifiable) ; Catégorie et Sous-catégorie visibles seulement pour le premier |
| 7 | Volet confidentiel : le bloc « Portrait de lecteur » | **absent** ; Parcours, Défis, Diagnostic, Notes intacts |
| 8 | Section Accompagnement, sous-titre « HISTORIQUE » | le bouton « + Nouvelle intervention » est **à droite du titre, sur la même ligne** ; la carte de l'historique dessous |

⚠ La rangée 3 est la vraie porte de B : aucun banc ne connaît ses courbes comme lui.

---

## 5 · TROUVAILLES ET RAPPORT
Trois issues de `CLAUDE.md`, nommées. Rapport : tête d'`OU-EN-EST-ON.md`, rapport du 6 (§ 4 : lot 4 livré), `#752` et `#754` clos ou
remesurés, `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, entrée 10 des cadrages (lot 5 suivant : les Interventions), la consigne commise
avec le lot.
