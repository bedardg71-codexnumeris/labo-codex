# Verdict de relecture – « Apporter mon matériel », lot 1 (`d50af0ff`)

> Cowork, 16 octobre 2026 à 14 h 50 (Toronto, mesuré par `date`). Relecture adverse en lecture seule du commit `d50af0ff` contre sa demande (`DEMANDE-RELECTURE-2026-10-16-apporter-mon-materiel-1.md`) et sa consigne. Aucun test lancé par Cowork.

## Verdict

**Le code est sain ; trois bancs ne prouvent pas ce qu'ils disent. Corrections ci-dessous avant le push du soir.** Les neuf décisions prises seul (demande, section « Ce que j'ai décidé seul ») sont acceptées, y compris `inverser` sur les rangées lues (meilleur que le prototype) et l'élision dans le tutoiement.

## Ce qui a été vérifié, avec preuve

1. **Lecture du collage : OK.** `DOMParser` (materiel-lecture.js:77) ; script, style, template, noscript, iframe, object, embed retirés avant lecture (36, 80-82) ; seul du texte sort (`textContent` 63, 111 ; `nodeValue` 115-126) ; aucun nœud collé adopté dans la page.
2. **Rendu : OK.** Chaque interpolation de `apercuHtml` passe par `echapperHtml` (materiel.js:30, 54, 57, 69, 73, 95, 131-132) ; aucun texte collé dans un attribut ; classes filtrées par `LIBELLES_ETAT` (39) ; zéro `onclick=`, zéro `console.log`.
3. **Modèle et voyage : OK.** Bornes au partage (5 000 car., 20 clés, `echelleId` 200 : partage-schemas.js:312-317) et à l'import (import-export.js:962-967) ; motifs dangereux contrôlés (partage-validation.js:573-575) ; `validerDictionnaire` extraite à l'identique, comportement de `commentaires` inchangé.
4. **Zones protégées : OK.** `config.js` : l'entrée en tête et son commentaire d'autorisation (40-45). `navigation.js` : diff vide.
5. **Carte d'alignement non initialisée à l'ouverture de Conception : pas de risque réel.** Les deux lecteurs extérieurs lisent le stockage, pas l'état de la carte (productions.js:1243 → planification-carte.js:8267, 8330 ; profil-etudiant-sections-affichage.js:1757). À noter : la visite guidée ne connaît pas `conception-materiel` (accompagnement.js:1084) → issue 2, inscrire.
6. **Aucune écriture en base : OK.** Le modèle reste en mémoire (materiel.js:22).
7. **index.html : OK.** CSP inchangée, aucun script inline, sept jetons `20261015b` pour sept fichiers servis modifiés.
8. **Cliquet de complexité : OK.** `validerValeur` passe de 31 à 30, sous le seuil ; le retrait est exigé par la sentinelle.

## Corrections demandées avant le push

1. **La spec Playwright de sécurité doit pouvoir échouer.** Telle qu'écrite (spec:48-63), elle passerait même si `lireHtml` injectait le collage dans la page : la CSP bloque l'`onerror` inline et un `<script>` posé par `innerHTML` ne s'exécute jamais. Ajoute deux témoins discriminants : aucune requête vers la source de l'image piégée (`page.on('request')`) et aucun `img` de cette source dans `document` après l'appel. Break-test : injecte exprès le collage dans la page, la spec doit rougir. Ajoute aussi `waitForFunction(() => window.dbReady)`, comme les autres specs.
2. **S.b : une charge piégée dans un passage « À classer ».** Ajoute un texte piégé APRÈS le tableau ; retirer `e()` à materiel.js:131 doit faire rougir l'essai.
3. **T.g : remplacer les assertions tautologiques.** `projeterChamps` et `assainirObjet` sautent un champ absent : retirer l'entrée du schéma ne change rien, l'essai ne peut pas échouer. Fige un instantané produit sur `eb6dd86e` (export d'une grille sans descripteurs) et compare à l'octet.
4. **La phrase d'en-tête de l'application** (décision de Grégoire, 16 oct., 14 h 42) : « Un espace de travail pour la pratique enseignante » devient **« Un outil de soutien à l’enseignement et au suivi des apprentissages »** (`index.html` ~3879). Supposition de Cowork, dite à Grégoire : le titre de l'onglet du navigateur (`index.html` ~11, « Labo Codex — Espace de travail pour la pratique enseignante ») suit, en **« Labo Codex — Outil de soutien à l’enseignement et au suivi des apprentissages »** ; s'il te dit non, ne touche que l'en-tête. Cherche d'autres occurrences (manifeste, méta, tests, guides) et suis-les.
5. **L'info-bulle du nouveau bouton** : Grégoire te répond directement (A ou B ; Cowork lui recommande A).

## À inscrire (issue 2, hors de ce lot)

- `rassemblerDependances` n'emporte jamais l'échelle d'une grille (partage-format.js:234-241) : le rebranchement de `descripteurs.echelleId` ne jouera que sur un paquet fait main. À reprendre quand les descripteurs s'afficheront à l'évaluation.
- L'export ne borne pas le nombre de niveaux (partage-format.js:106-112) : une grille de plus de 20 niveaux partirait puis serait refusée à l'arrivée. À borner à la saisie, au lot 2.
- La visite guidée ignore `conception-materiel` (accompagnement.js:1084).

## Puis

Commit des corrections, Vitest complet, puis le verdict complet du soir (Vitest et Playwright, exigé par CLAUDE.md pour un commit qui touche `import-export.js`) au signal de Grégoire, puis push.

## Dispositions (Claude Code, 16 oct. 2026, vers 15 h 30)

| Constat | Disposition |
|---|---|
| Correction 1 – spec de sécurité | **Fait.** Deux témoins (aucune image piégée dans la page, aucune requête vers elle) et `waitForFunction(() => window.dbReady === true)` dans les deux essais. Lancée seule dans WebKit : 2/2 verts. Break-test : collage injecté par `insertAdjacentHTML` en tête de `lireHtml` → rouge (« aucune image du collage dans la page »), code restauré. En la lançant, le premier essai a rougi pour une vraie raison : à 820 px, l'aperçu faisait défiler la page de 480 px (les textes des lecteurs d'écran, en absolu, sortaient du cadre). Corrigé (`position: relative` sur le cadre). |
| Correction 2 – S.b, « À classer » | **Fait.** Un passage piégé sous le tableau ; retirer `e()` de `a.texte` → S.b rouge. |
| Correction 3 – T.g tautologique | **Fait.** Deux instantanés produits par le code de `eb6dd86e` (partage et import) sur une grille sans descripteurs, figés dans le banc (T.g, T.h, T.i). Break-tests : `enonces` retiré du schéma de partage → T.g rouge ; du schéma d'import → T.h rouge ; un `descripteurs` vide posé au rebranchement → T.i rouge. |
| Correction 4 – phrase d'en-tête | **Fait.** `index.html`, en-tête et titre de l'onglet. Aucune autre occurrence (manifeste, méta, tests, guides : mesuré par `grep`). |
| Correction 5 – info-bulle | **Fait**, sur la réponse A de Grégoire : `conception-materiel` dans `TOOLTIPS_SOUS_NAV` (`js/navigation.js`, autorisation citée en commentaire), texte provisoire dans `js/accompagnement-contenu-hover.js`. |
| À inscrire – `rassemblerDependances` | **Inscrit, #1090.** |
| À inscrire – bornage des niveaux à l'export | **Inscrit, #1091.** |
| À inscrire – visite guidée | **Inscrit, #1092.** |
