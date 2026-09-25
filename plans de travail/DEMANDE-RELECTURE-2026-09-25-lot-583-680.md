# Demande de relecture croisée, AVANT fusion – #583 + #680 (partage d'une échelle)

> Écrite le 25 septembre 2026, vers 16 h (Toronto), par Claude Code. Branche `lot-583-680-partage-reperes` (worktree `.claude/worktrees/lot-583-680`), base `ad06d508`. **Rien n'est fusionné ni poussé.** Verdict attendu dans `plans de travail/RELECTURE-2026-09-25-lot-583-680.md`. Deux phrases attendent l'accord de Grégoire (§ 5).

## 1 · La mesure, avant et après (WebKit)

Banc `tests/integration/partage-echelle-reperes-583.spec.js`, cas 1. Une émettrice fictive fabrique le `.lcz` signé de son échelle à repères, avec la vraie chaîne d'export. Le fichier passe dans un **autre contexte de navigateur**, dont le stockage est vierge. La destinataire l'importe par la prévisualisation, le copie dans « Mes documents » et évalue une copie avec cette échelle (même semis que le banc #940). Le banc lit alors le bilan.

- **Avant**, sur `ad06d508` : l'échelle reçue n'a ni `seuilSuffisance`, ni `seuilMaitrise`, ni `description`, ni `discipline`, et ses niveaux n'ont ni `description` ni `niveauSOLO`. Dans le bilan, pas de titre « Présentement » et aucune ligne (`presentement: []`, `aLeTitre: false`).
- **Après** : tous ces champs arrivent. Le bilan donne les deux lignes du banc #940, « Rigueur (Insuffisant)… » et « Structure (En développement)… ».

## 2 · Ce que le lot fait

- **`js/partage-schemas.js`.** Le schéma `SCHEMA_ENTITE.echelle` déclare maintenant `seuilSuffisance`, `seuilMaitrise`, `description` et `discipline`, ainsi que `niveaux[].description` et `niveaux[].niveauSOLO`. Les types et les bornes sont ceux de `SCHEMAS_IMPORT.echelle`, donc des codes de niveau de 20 caractères au plus. Le format reste `labo-codex-partage-v1`. Il y a aussi un nouveau registre, `CHAMPS_ECHELLE_NON_PARTAGES`, qui liste les huit champs locaux avec leur raison : `auteur`, `auteurOriginal`, `idOriginal`, `dateImport`, `dateAjoutBiblio`, `estDemo`, `isDemo` et `verrouille`.
- **Pour chacun des champs de #680, qui le lit chez la destinataire ?**
  - Les deux `description` : l'éditeur d'échelle.
  - `discipline` : l'affichage et le filtre en bibliothèque, et le nom du fichier exporté.
  - `niveauSOLO` : le `<select>` de l'éditeur et l'export recherche.

  Les quatre voyagent donc.
- **`js/partage-validation.js`, réception.** La nouvelle fonction `retirerReperesOrphelins` traite les repères qui ne désignent aucun code des niveaux transportés. **Ma règle : le repère est retiré, le reste de l'échelle est importé, et la prévisualisation le dit** (`verdict.avertissements` et `preview.avertissements`). Refuser tout le paquet pour un repère m'a paru disproportionné. Un repère vide est retiré sans un mot. La fonction travaille sur le clone nettoyé, et le paquet brut, celui que vérifie la signature, n'est pas touché.
- **`js/partage-validation.js`, champs inconnus.** Un champ inconnu est maintenant marqué (`champInconnu: true`), à tous les niveaux : la racine du paquet, le manifeste, le type d'entité, l'entité et ses sous-objets.
- **`js/partage-import.js`.** `formaterErreursValidation` place la phrase « version plus récente » avant le détail technique quand au moins une erreur porte cette marque. La prévisualisation affiche les avertissements en `alerte alerte-attention`, une classe qui existe déjà.

## 3 · Registre : deux, et pas un (ma décision, à contester)

La consigne demandait « idéalement une seule source pour les deux canaux ». J'ai gardé **deux registres, un par canal**, parce que leurs contrats diffèrent. L'import-export restaure les documents de la même personne : son auteur, ses dates et son verrou la suivent. Le partage remet les documents à quelqu'un d'autre. Un registre commun devrait porter une disposition par canal et être lu par deux modules chargés indépendamment.

La source unique est ailleurs : c'est le **relevé des champs connus d'une échelle**, fait une seule fois dans `sentinelle-transport-echelles.test.js` et partagé par les deux canaux. Ce relevé réunit les champs écrits par `dupliquerEchelle` et `sauvegarderEchelleComplete` et ceux que connaît le canal d'import-export. La section AE exige que chacun de ces champs soit partagé ou exclu avec sa raison. Elle fait la même vérification pour les clés de niveau et de `config`.

## 4 · Preuves

- **Vitest**
  - `tests/unit/partage-echelle-reperes-583.test.js`, 14 essais :
    - l'émission ;
    - la réception, y compris l'orphelin, les deux orphelins, le repère vide et le paquet brut intact ;
    - **le vecteur signé du lot F (10 juin, échelle sans repères) se valide et se vérifie encore**, et un repère ajouté après la signature la casse toujours ;
    - le message, avec un champ inconnu à quatre endroits du paquet, et un refus d'une autre nature qui ne parle pas de version.
  - La section AE de `sentinelle-transport-echelles.test.js`, 5 essais.
  - Le cliquet `sentinelle-555-d` : +2 emplois de `seuilMaitrise` (schéma de partage, libellé de l'orphelin), qui désignent tous deux le code de niveau.
  - **Suite complète : 7 422 / 7 422.**
- **WebKit** : les 2 cas du nouveau banc, plus les 6 de `partage-import-rendu.spec.js`, tous verts. Le cas 2 vérifie à l'écran l'avertissement d'orphelin dans la prévisualisation et la première puce du refus.
- **8 mutations, 8 rouges** :
  1. les repères retirés du schéma ;
  2. `discipline` retirée ;
  3. `niveauSOLO` retiré ;
  4. `verrouille` retiré du registre ;
  5. l'orphelin gardé ;
  6. la phrase jamais ajoutée ;
  7. le champ inconnu non marqué ;
  8. l'orphelin retiré en silence.

## 5 · Deux phrases que Grégoire doit accepter avant le push

- **Le refus** (texte de Cowork, repris tel quel) : « Ce fichier vient d'une version plus récente de Labo Codex. Recharge la page (Cmd+Maj+R), puis importe-le de nouveau. » ⚠ Sur iPad, il n'y a pas de Cmd+Maj+R.
- **L'avertissement d'un repère orphelin** (texte à moi) : « Échelle « ‹nom› » : le repère de maîtrise « X » ne désigne aucun de ses niveaux ; il n'est pas importé. Tu pourras le poser dans l'éditeur d'échelle. »
- **Les Nouvelles**, proposition de Cowork, pas encore écrites dans `changelog-data.js`.

## 6 · Ce qui reste, et les trouvailles

- **Stock assumé.** Les échelles déjà reçues n'ont pas leurs repères, et aucune donnée n'est réécrite. C'est écrit dans la fiche #583.
- **Porte terrain : je propose de ne pas en ouvrir.** Le banc WebKit fait circuler le vrai fichier `.lcz` signé entre deux stockages vierges, ce qui couvre le trajet d'un fichier réellement échangé. La seule chose qu'il ne voit pas, c'est Safari sur iPad, et rien dans ce lot n'en dépend : aucun CSS neuf, aucun geste tactile.
- **Trouvaille, issue 2, non inscrite au BACKLOG.** `partage-export.js:268` emploie la classe `texte-avertissement`, que `styles.css` ne définit pas. L'avertissement s'affiche sans style. Je ne l'ai pas inscrite parce que Grégoire ne l'a pas vécue.
- **Trouvaille, issue 3.** Des repères inversés (suffisance au-dessus de maîtrise) ne sont pas refusés à la réception. Seul un paquet fabriqué à la main peut en porter : l'éditeur refuse déjà l'inversion (`modifierRepereEchelle`).
