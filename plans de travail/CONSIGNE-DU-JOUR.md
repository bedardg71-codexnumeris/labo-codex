# Consigne du jour – chantier des archives, lot A1 : une archive fabriquée comme le codex de ce matin

> Écrite le 30 septembre 2026 à 12 h 39 (Toronto) par Cowork. Premier lot de `PLAN-2026-09-30-chantier-archives.md` (ordre approuvé par Grégoire). Lis d'abord ce plan, puis le § 10 de `CADRAGE-2026-09-30-codex-et-archives-coherence.md`. Ta mesure de ce midi (`MESURE-2026-09-30-archives.md`, § 2 et § 3.3) est le point de départ.
> **Condition de départ** : `main` à `e92f2001` ou plus récent. Branche neuve `lot-a1-archive-sans-copier`. **Ni release ni push avant la relecture de Cowork** : une archive est ce sur quoi reposera le retrait des copies.

## 1 · Ce que le lot doit produire, en gestes

« Archiver… » sur un groupe lourd (205 copies, 607 Mo) : le fichier sort sans que la page prenne des gigaoctets de mémoire ; il porte de quoi vérifier chaque copie plus tard ; et l'application ne dit « archivé » que si l'usager confirme que le fichier est là.

**Tes données, Grégoire** : rien n'est écrit ni effacé dans tes trimestres. Seul le registre local des archives reçoit une ligne, après ta confirmation.

## 2 · Ce que tu fais

1. **La fabrication, mode fichier (Safari)** : les copies ne passent plus par JSZip. Réemploi de la pièce du lot J0 (`_assemblerCodexZip`) : à toi de choisir comment la partager entre `codex.js` et `reserve.js` (la sortir dans un module commun, ou autrement) ; dis ce que tu as retenu et pourquoi. La spécification d'avril voulait `reserve.js` sans dépendance à `codex.js` : respecte-la si ça ne coûte pas un doublon.
2. **Le format ne bouge pas** : mêmes chemins (`trimestres/<dossier>/donnees.json`, `travaux/`, `meta.json`, `manifeste-archives-patch.json`, `manifeste-archives.json`), `meta.json` toujours écrit en dernier dans le dossier. Une archive d'avant s'ouvre dans le lot ; une archive du lot s'ouvre dans 1.171.0.
3. **Une empreinte par copie** (SHA-256), rangée dans `meta.json` ou dans un fichier voisin, à ton choix, dans les **deux** modes (fichier et dossier). Contrainte : la mémoire prise ne dépend pas du poids total du groupe (une copie à la fois est acceptable ; la plus grosse copie réelle pèse 23,6 Mo). Un lecteur d'avant le lot ignore ce champ sans broncher.
4. **La Défense K et l'aperçu** reçoivent la liste complète des entrées, comme au lot J0.
5. **L'écriture** : l'adresse du fichier n'est plus libérée aussitôt (reprends le délai du lot G). **La réussite n'est plus annoncée d'office** : reprends le parcours du codex téléchargé, où c'est l'usager qui confirme que le fichier est là ; l'archive n'entre au registre qu'après cette confirmation. Si de nouveaux mots sont nécessaires, **propose-les dans la demande de relecture** : ils sont à Grégoire, ne les livre pas sans son accord.
6. **Le mode dossier (Chrome, Edge)** : seulement l'empreinte par copie. Rien d'autre.

## 3 · Une question à trancher par le code, pour le plan

**Une copie peut-elle changer après son import ?** (annotations écrites dans le fichier plutôt que dans les données, remplacement, rotation…). Si oui, dis par quels gestes : une archive vérifiée hier ne vaudrait plus pour une copie modifiée depuis, et le lot A4 doit le savoir.

## 4 · La preuve attendue

- **La mesure, avant et après**, au banc de ce midi (205 copies aux tailles réelles) : mémoire de la page, disque posé avant écriture, durée.
- **Le fichier** : mêmes entrées et mêmes octets restitués qu'une archive d'avant le lot (rédacteur de référence figé dans le banc) ; relu par JSZip avec CRC et par `unzip -tq` à taille réelle ; chaque empreinte recalculée égale celle que l'archive porte.
- **L'ouverture croisée** dans WebKit : archive du lot dans 1.171.0, archive de 1.171.0 dans le lot.
- **La confirmation** : sans elle, rien au registre, et l'écran ne dit pas « archivé ».
- Mutations, chacune rouge. Vitest complet. Playwright ciblé ; le verdict complet est dû sur le commit de release.

## 5 · Inscriptions au BACKLOG (dispositions de Cowork, cadrage § 10)

- Au banc, le partage charge le fichier entier en mémoire (2,6 Go pour 1,3 Go) : **priorité haute, à mesurer sur l'iPad**.
- Une copie d'H2026 marquée « manquante » alors que son fichier est là : à réparer au lot A3 ou A4.
- Les cinq lots du chantier, chacun avec sa ligne, renvoyant au plan.

## 6 · Ce que tu ne fais pas

Aucune vérification d'archive, aucun retour de copies, aucun retrait, aucun changement du mot « archivé » : ce sont les lots A2 à A5. « Ouvrir une archive… » n'est pas touché. « Exporter une sélection » (#991) non plus.

## 7 · Ce que tu rends

- `DEMANDE-RELECTURE-2026-09-30-lot-A1-archive.md`.
- `PORTES-TERRAIN-2026-09-30-lot-A1-archive.md` : une porte courte, **sur le Mac** (Safari), données réelles : archiver le plus gros groupe de l'hiver 2026, confirmer, retrouver le fichier, noter sa taille. Cowork publie l'artefact.
- À Grégoire, trois lignes : ce qui change à l'écran, la mesure avant et après, ce qui lui revient.
