# Consigne suivante – l'export anonymisé pour la recherche rend les vrais indices (lot 33 : #902)

> Écrite le 17 septembre 2026, 11 h 58 (Toronto), par Cowork, pendant le lot 32 (l'élève exclu, `1.142.28`).
> **À n'exécuter qu'après le push du lot 32** : au démarrage, `git log origin/main` (pas `git log`) doit montrer `1.142.28` ; sinon, arrête-toi et signale-le. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-eleve-exclu.md` et renomme `plans de travail/CONSIGNE-SUIVANTE-export-recherche.md` en `CONSIGNE-DU-JOUR.md`.

Mandat : #902. **Aucune question n'attend Grégoire**, sauf la phrase de « Nouvelles ». Aucun mot à l'écran ne change.

## 1 · Ce que Cowork a mesuré `[lecture]`, qui corrige la fiche

- **Volet 1, VIVANT** : Réglages › carte « Captures et recherche » › bouton « Générer l'export anonymisé » (`index.html:~9585`, `data-action="exporterFormatRecherche"`) → `exporterFormatRecherche` (`trimestres.js:1988`). Le bloc `indices_finaux` (`~2298`) lit `indicesCP[da].actuel.PAN || .SOM`, format retiré en Beta 95.5 : **`A_final`, `C_final`, `P_final` valent 0 pour chaque élève.** La carte promet pourtant « Indices A-C-P anonymisés ». ⚠ **A n'est pas dans `indicesCP`** : il vit dans `indicesAssiduite` (`sommatif[da]`, objet `{ indice }` ou ancien nombre – voir la lecture de `calculerTousLesIndices`, `indices.js:~484`). Remesure.
- **Volet 2, MORT** : `trierLignes` (`liste-evaluations.js:2190`) n'a **aucun appelant**, et `#tri-evaluations` n'existe pas dans `index.html` (0 occurrence) ; `obtenirIndicesEtudiant` (`~2142`) n'est appelé que par `trierLignes`. « Les tris de la liste par C, P et N ne trient rien » n'a donc **aucun écran**. Au passage, la fiche le sous-estimait : `pratique` y vaut un booléen (`=== 'standards'`), et A lit `indicesAssiduite[da].actuel.indice`, un autre format absent – A valait 0 aussi.

## 2 · À faire

- **Volet 1** : `indices_finaux` lit le format PLAT (`indicesCP[da].actuel.C`, `.P`, `.noteConstructible`) et A à sa source. **Un P non constructible ne s'exporte pas comme 0** (règle #394) : tu tranches la forme (`null`, ou un champ additif) en pensant à qui relit ce fichier – un export « voyage » – et tu le dis. Réemploie un lecteur existant plutôt que d'en écrire un troisième (`obtenirIndicesCP`, `calculerTousLesIndices`) si ses unités conviennent : mesure-les (0-100 ou 0-1) et dis ce que le fichier porte.
- **Volet 2** : retire le code mort (`trierLignes`, `obtenirIndicesEtudiant`), et les lectures de `#tri-evaluations` (`~458`, `~482`, `~506`, `~529`) si elles ne servent à rien d'autre – mesure avant, un `?.value || 'nom-asc'` peut nourrir un état vivant. Zéro-dette : rien d'autre.
- **Cherche les autres lecteurs de l'ancien format** (`grep -rn` sur `actuel.PAN`, `actuel.SOM`, `actuel?.PAN`, `actuel?.[`) : trois issues nommées pour chacun.
- **Stock** : source seulement. Un export déjà produit ne se réécrit pas ; dis-le.

## Preuve

- Sentinelle : un trimestre de banc à trois élèves (un P constructible, un non constructible, un A en ancien format nombre) → `indices_finaux` porte les valeurs stockées, dans les unités annoncées, et jamais 0 pour un P non constructible ; aucun champ nominatif. L'ancien format `actuel.PAN` n'est plus lu nulle part.
- Break-test : relire `actuel.PAN` ; A pris dans `indicesCP` ; P non constructible rendu 0. Essais de COMPORTEMENT (une mutation qui garde le texte exigé et change la valeur doit rougir).
- Vitest depuis `tests/`, puis le verdict Playwright, Cowork fermé. **Porte terrain : aucune** (rien ne change à l'écran ; le téléchargement lui-même n'est pas touché).

## Livraison

Patch `1.142.29` par `scripts/release.mjs`. **Phrase de « Nouvelles »** : propose-la à Grégoire avant de la figer. Puis `OU-EN-EST-ON.md`, `RELAIS.md`, le backlog (#902), le markdown du tri. **Commite aussi les fichiers de Cowork** : la consigne renommée et son archive, et tout ajout de Cowork dans `RELAIS.md` non encore commité. Push par `scripts/pousser.sh`, puis signale à Cowork que c'est poussé.
