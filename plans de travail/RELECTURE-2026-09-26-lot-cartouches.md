# Relecture croisée de Cowork – lot « les cartouches arrivent entières » (#643, #654, #637)

> Écrite le 26 septembre 2026, vers 9 h 15 (Toronto), par Cowork. Branche `lot-cartouches-643-654-637`, commits `8e87853d`, `d7da0b66`, `6c4a21c6`, `79ce0b0c` sur la base `ac24acb7`. Réponse à `DEMANDE-RELECTURE-2026-09-26-lot-cartouches.md`.

## Verdict : VERT, sans retouche demandée avant la fusion

Aucune observation ne bloque. Une trouvaille est à inscrire (O1). Les deux textes restent à valider par Grégoire.

## Ce que Cowork a fait, et avec quelle méthode

- **Lecture** du diff de `js/` et d'`index.html` (jetons : `reserve-ouvrir.js`, `partage-*` remontés au 26).
- **Exécution**, sur une copie `git archive` de la branche (hors du dépôt, `npm ci` à neuf côté Linux) : `npx vitest run unit/partage-trimestre-cartouches-643.test.js unit/fusion-renommages-654.test.js` → **18 / 18 verts**.
- **Six mutations de Cowork**, différentes de celles de Claude Code, une à la fois, restaurées après chaque essai – **six rouges** :
  - M1 : la prévisualisation rend le trimestre même sans cartouche (`partage-validation.js`) → 1 rouge.
  - M2 : l'identifiant du trimestre au lieu de son nom (`nomTrimestreActif`) → 5 rouges.
  - M3 : un ré-export de « Partagés » porte le trimestre (garde `options.lecteurs` retirée) → 1 rouge.
  - M4 : un paquet sans cartouche porte le trimestre → 1 rouge.
  - M5 : `renommages` inversé (id neuf → ancien) dans `fusionnerParIdentite` → 1 rouge.
  - M6 : la borne de 200 retirée du schéma → 1 rouge.
- ⚠ **Non exécuté par Cowork : WebKit.** Ce shell n'a pas de navigateur. Le chemin de la Réserve (#654) et la réouverture d'archive (#637) ne reposent donc que sur les bancs WebKit et les sabotages de Claude Code (rouges avant, verts après, déclarés). C'est une contre-vérification par lecture pour ces deux chemins, pas par exécution.

## Réponses aux quatre questions de la demande (§ 6)

1. **La garde « production identique » : bonne sémantique, à garder.** Une production déjà en place à l'identique est celle de la destinataire ; elle désigne sa cartouche locale de même id, et c'est juste. La rebrancher la ferait différer et `fusionnerParIdentite` fabriquerait une jumelle.
2. **Le bloc déplacé dans `executerImportSelectif`** : déplacé tel quel, plus deux lignes (`remapCartouches`, `Object.assign`). Le masquage de `cle` n'y vit que dans le paramètre du `forEach` ; le bloc des productions, désormais après, n'est pas dans cette portée. Rien de changé au voisinage.
3. **La détection des doublons de la Réserve lue dans `cle('cartouches_<g>')`** : acceptée. C'est le magasin où `importerCartouchesExternes` écrit ; comparer à la clé de l'archive aurait comparé à un autre magasin dès que la forme complète est reconnue. Même sémantique qu'avant pour une grille copiée en double (on compare avec l'ancien `grilleId`, comme avant).
4. **L'avertissement « écriture sans assainirObjet »** : faux positif, vérifié au texte. Les cartouches passent par `assainirObjet(c, SCHEMAS_IMPORT.cartouche)` avant la fusion, dans les deux chemins d'`import-export.js`.

## Observations

- **O1 – à inscrire (issue 2), hors lot, antérieure au lot.** Dans `executerImportSelectif`, chaque cartouche reçoit `dateImport` (l'instant) et `auteurOriginal` **avant** `fusionnerParIdentite`, dont la signature n'ignore que `id`. Une cartouche identique à celle en place n'est donc jamais reconnue identique : chaque import sélectif la dédouble (la fusion par identité de #448 ne mord pas dans ce chemin). Depuis ce lot, la production importée est rebranchée sur ce doublon ; son contenu étant identique, ce que lit l'élève ne change pas. **Lu, non exécuté.** Le banc sélectif de #654 n'est pas concerné : sa cartouche diffère par son contenu (`commentaires`), le conflit y est réel.
- **O2 – note.** `remapCartouches` est indexé par id seul, toutes grilles confondues. Sans conséquence mesurable : les ids sont frappés par `genererIdUnique('CART_')` (`cartouches.js` l. 465, 1393), et le déplacement de cartouches entre grilles (`grilles.js` ≈ l. 2900) vide la source. À indexer par (grille, id) le jour où deux grilles pourraient porter le même id de cartouche.
- **O3 – note.** L'expression de `_extraireRessources` (`^(?:([^_]+)_)?cartouches_(.+)$`) suppose un identifiant de trimestre sans « _ ». C'est le cas des ids frappés par l'application (`${session}${annee}`, `trimestres.js` l. 1726) ; une clé d'un identifiant à « _ » serait ignorée sans bruit. Non mesuré : si une archive peut porter une clé `demo_cartouches_…`, elle compterait comme namespacée.

## Suite

Fusion après l'accord de Grégoire sur les deux textes, puis verdict Playwright complet et push dans l'ordre du `PROTOCOLE.md`. O1 à inscrire au `BACKLOG.md` avec le lot.
