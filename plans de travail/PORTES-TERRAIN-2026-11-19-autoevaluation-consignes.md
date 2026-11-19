# Porte terrain iPad : « La grille d'autoévaluation dans le PDF des consignes »

Lot `lot/autoevaluation-consignes`, 19 nov. 2026 (fiche #1287). Rapport :
`plans de travail/RAPPORT-2026-11-19-autoevaluation-consignes.md`.

**État : CLOSE PAR COWORK LE 20 NOV. 2026, non publiée.** Grégoire a approuvé la page d'autoévaluation sur la capture
le 19 nov. à 9 h 11. Le §0.2 lui demandait de créer des données fictives sur l'aperçu, ce qu'il ne fait pas (règle
du 6 sept.) : la vérification réelle se fera **sur sa propre grille, une fois les deux lots en ligne**. Le reste du
document est gardé comme trace de ce qu'il faudra regarder ce jour-là (§2.1 à §2.3) ; les deux décisions du §3 sont
tranchées : les mots d'enseignant partent tels quels (3.1), et l'aperçu dit désormais où poser les repères (3.2,
retouche 2 du 20 nov.).
*Avant le 20 nov. :* À FAIRE, sur l'aperçu de la PR (le lot n'est pas fusionné ; `https://app.codexnumeris.org` ne le
montre pas). Claude Code écrit ce markdown ; Cowork publie l'artefact jumeau, avec son bouton « Copier mes résultats ».

Pourquoi une porte : le PDF s'ouvre sur l'iPad dans un lecteur qu'aucune machine d'ici n'a. Les bancs (Chromium)
prouvent que la page est dans le fichier, au bon rang, avec ses textes, ses cases tracées et sa pagination ; ils ne
disent pas ce que l'œil voit sur l'iPad. Trois portes, pas plus. Ce qui échoue devient un item de backlog avec son
numéro de porte.

---

## §0 · Préalable

- [ ] **0.1** Sur l'iPad, dans Safari, ouvre `https://deploy-preview-33--codexnumeris-051225.netlify.app`
  (l'aperçu de la PR n° 33), recharge, et lis le numéro en bas de page.
  ⮕ Attendu : un numéro en `1.249.0` (le lot ne change pas la version). Si la page est vide ou ancienne, attends une
  minute que Netlify finisse de publier, puis recharge.
  `iPad`

- [ ] **0.2** Prépare le matériel, sur l'aperçu seulement (ses données sont à part : rien n'y touche tes trimestres).
  Si l'application demande un trimestre, crée-en un fictif. Puis :
  1. Conception › Échelles de performance › « Échelle de départ (IDME) » : « Suffisant à partir de » **D**,
     « Maîtrisé à partir de » **M**.
  2. Conception › Grilles de critères › « + Nouvelle grille » : un nom, deux critères ; sur chacun, écris un texte
     sous « Développement » et un sous « Maîtrise » ; sur le premier, une question sous « Pour vérifier » ;
     « Créer la grille ».
  3. Conception › Productions › une production neuve (titre, activité d'apprentissage, un objectif) ; « Créer » ;
     puis « Préparer le PDF » : choisis ta grille et l'échelle de départ, puis « Voir l'aperçu ».
  ⮕ Attendu : l'aperçu montre trois feuilles ; la deuxième s'intitule « [ton activité] : grille d'autoévaluation »,
  et la bande Production porte une case « Grille d'autoévaluation », cochée.
  `iPad`

---

## §1 · Données

Rien. Le lot ajoute un champ facultatif et n'écrit rien sans geste ; ces portes se jouent sur l'aperçu.

---

## §2 · Interface — ce que seul l'iPad peut trancher

### 2.1 La page du PDF, ouverte sur l'iPad

┌ POURQUOI ── C'est la feuille que l'élève aura sous les yeux avant de remettre son travail. Les bancs la lisent
dans le fichier ; personne ne l'a encore regardée dans le lecteur de l'iPad. ──┐

- [ ] **2.1 a** Dans l'aperçu, touche « Exporter en PDF », puis ouvre le fichier sur l'iPad.
  ⮕ Attendu : trois pages ; la page 2 porte le titre « [ton activité] : grille d'autoévaluation », puis la phrase
  « Avant de remettre ton travail, coche ce que tu trouves dans ta copie. […] », puis tes deux critères dans l'ordre
  de ta grille.
  `iPad`

### 2.2 Les cases à cocher, lisibles

┌ POURQUOI ── Le caractère « ☐ » s'imprime « & » avec les polices du PDF : les cases sont donc dessinées. Il faut
qu'un élève les voie, et puisse cocher dedans au crayon. ──┐

- [ ] **2.2 a** Sur la page 2, regarde le début de chaque ligne « Réussite : » et « Maîtrise : ».
  ⮕ Attendu : un petit carré vide, net, aligné sur la première ligne du texte ; aucun « & » ni signe étrange. Une
  ligne longue revient sous le texte, pas sous le carré.
  `iPad`

### 2.3 L'italique de « Pour vérifier »

┌ POURQUOI ── La question doit se distinguer des deux repères sans un mot de plus. ──┐

- [ ] **2.3 a** Sous le premier critère, regarde la ligne « Pour vérifier : … ».
  ⮕ Attendu : toute la ligne en italique, sans case devant ; le second critère, qui n'a pas de question, n'en a pas.
  `iPad`

---

## §3 · Décisions — ce ne sont pas des vérifications

Des choix posés faute de pouvoir les trancher à ta place. Écris ton verdict à côté.

- **3.1** Les mots d'enseignant proposés partent-ils tels quels ? Dans la case vide de l'éditeur : « Facultatif : une
  question que l’élève se pose devant sa copie » ; la case de l'aperçu : « Grille d'autoévaluation ».
  Verdict : `__________`
- **3.2** Quand l'échelle choisie n'a pas ses deux repères, la page n'existe pas et la case de l'aperçu est absente,
  sans un mot. Faut-il le dire dans l'aperçu ? (L'échelle de départ n'a pas de repères d'origine.)
  Verdict : `__________`

---

## §4 · Ce que je n'ai pas pu vérifier

- **Safari et le lecteur de PDF de l'iPad** : WebKit n'existe pas dans le conteneur ; tout est éprouvé dans Chromium.
- **L'impression papier** : la taille des cases (2,8 mm) et le gris du trait sont jugés à l'écran seulement.
- **Le premier lancement sur l'aperçu** (une adresse neuve, sans données) : le chemin exact de l'application pour
  créer un trimestre n'a pas été rejoué ; §0.2 le décrit en termes généraux.
- **La suite Playwright complète en WebKit** que demande une modification de `js/import-export.js` : non lancée ici.
