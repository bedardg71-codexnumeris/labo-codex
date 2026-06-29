# Consigne — Renommer les 20 élèves fictifs du pack démo

> Document de travail destiné à une session **Claude Code**. Préparé en Cowork
> après audit du dépôt (26 juin 2026). Tu peux le déplacer ou le supprimer après
> usage : il ne fait pas partie du code applicatif.

---

## 1. Objectif

Remplacer les 20 noms fictifs québécois des élèves du **pack de démonstration**
par 20 figures historiques/culturelles. Les **identifiants restent inchangés**
(`id`, `da` = `DEMO001`…`DEMO020`) : on ne touche qu'aux chaînes d'affichage.

## 2. Périmètre — un seul fichier de code

Source unique des données démo : **`js/pack-demo-20.js`** (objet
`PACK_DEMARRAGE`, exposé via `window.PACK_DEMARRAGE`, ~18 800 lignes, 1,1 Mo).

`demo-activation.js`, `demo-namespace.js`, etc. ne font que **lire** ce pack :
aucune modification de logique requise ailleurs.

### Audit préalable déjà fait (à ne pas refaire)

- **Tests** : aucun test n'asserte un nom du pack. Les occurrences de
  « Tremblay / Léa / Roy » dans `tests/` sont des **fixtures synthétiques**
  (`TEST001`, noms d'enseignant, tableaux inline) ; les tests démo référencent
  les **DA** (`DEMO004`, `DEMO010`), pas les noms. → **Aucun test à éditer.**
  On lance quand même la suite en fin de chantier (voir §8).
- **Docs** : plusieurs fichiers `docs/` citent les anciens noms (voir §7).

## 3. Décision actée — appariement **positionnel**

Ordre de déclaration dans `groupeEtudiants` (= ordre des `da`) ↔ ordre de la
liste fournie. Décision prise par Grégoire en connaissance des inversions de
genre (voir §6, point d'attention).

| DA | Ancien (prénom + nom) | Genre | → Nouveau prénom | → Nouveau nom | Genre | Bascule genre |
|----|----------------------|:-----:|------------------|---------------|:-----:|:-------------:|
| DEMO001 | Émile Tremblay | H | Chinua | Achebe | H | — |
| DEMO002 | Camille Gagnon | F | Simone | de Beauvoir | F | — |
| DEMO003 | Félix Bouchard | H | Hector | Berlioz | H | — |
| DEMO004 | Rosalie Côté | F | Aimé | Césaire | H | ⚠ |
| DEMO005 | Théo Pelletier | H | Nadia | Comăneci | F | ⚠ |
| DEMO006 | Léa Morin | F | Marie | Curie | F | — |
| DEMO007 | Raphaël Lavoie | H | Albert | Einstein | H | — |
| DEMO008 | Florence Fortin | F | Sigmund | Freud | H | ⚠ |
| DEMO009 | Noah Gauthier | H | Vincent | van Gogh | H | — |
| DEMO010 | Alice Ouellet | F | Jane | Goodall | F | — |
| DEMO011 | Mamadou Diallo | H | Frida | Kahlo | F | ⚠ |
| DEMO012 | Juliette Bergeron | F | Akira | Kurosawa | H | ⚠ |
| DEMO013 | William Lévesque | H | Yayoi | Kusama | F | ⚠ |
| DEMO014 | Yasmine Mansour | F | Ada | Lovelace | F | — |
| DEMO015 | Nathan Girard | H | Nelson | Mandela | H | — |
| DEMO016 | Zoé Roy | F | Lionel | Messi | H | ⚠ |
| DEMO017 | Samuel Poirier | H | Toni | Morrison | F | ⚠ |
| DEMO018 | Maëlle Nadeau | F | Rosa | Parks | F | — |
| DEMO019 | Santiago García | H | Oumou | Sangaré | F | ⚠ |
| DEMO020 | Laurence Thibault | F | Ravi | Shankar | H | ⚠ |

**Avant de commencer, RELIS les 20 lignes de `groupeEtudiants` (lignes ~73-292)
et confirme que l'ordre des `da` correspond exactement à la colonne « Ancien ».**
Si un écart apparaît, t'arrêter et le signaler — l'appariement positionnel
dépend de cet ordre.

Particules à respecter dans la séparation prénom / nom :
`de Beauvoir` et `van Gogh` vont **entiers dans `nom`** ; `prenom` = `Simone`,
`Vincent`. Caractères spéciaux à préserver tels quels (UTF-8) : `ă` (Comăneci),
`é` (Aimé, Césaire, Sangaré).

## 4. Les trois surfaces à modifier (toutes dans `pack-demo-20.js`)

Les noms sont **dénormalisés** à trois endroits — il faut les trois, sinon
incohérence d'affichage :

1. **Déclaration** dans `groupeEtudiants[]` : champs `prenom` et `nom`
   (20 × 2 chaînes). Source d'affichage principale.
2. **Champ `etudiantNom`** dans les évaluations : valeur « Prénom Nom »
   (**202 occurrences**). Apparié par `etudiantDA`.
3. **Texte libre des rétroactions** (`retroactionFinale`, et `retroaction` par
   critère) : le **prénom** est incrusté dans le corps, typiquement
   « Bonjour Émile !… » (**~198 salutations**, plus mentions éventuelles dans le
   corps).

## 5. Méthode recommandée — script Node, passe unique, dictionnaire

Vu le volume (~240 chaînes) et les trois surfaces, **ne pas éditer à la main**.
Recommandation : un petit script Node jetable qui fait une **substitution
textuelle scopée** sur le fichier (pas de `JSON.parse` + `stringify`, qui
reformaterait les 18 800 lignes et rendrait le diff illisible — contraire à la
culture de revue du projet).

Principe : **une seule passe**, un dictionnaire `ancien → nouveau`, regex
d'alternation listée **du plus long au plus court** (nom complet, puis nom de
famille, puis prénom) pour qu'à chaque position le bon remplacement gagne et
qu'aucun jeton ne soit retouché deux fois. Frontières de mot Unicode pour éviter
les collisions de sous-chaîne.

```js
// scripts/_renommage-demo.mjs (jetable — supprimer après usage)
import { readFileSync, writeFileSync } from 'node:fs';

const f = 'js/pack-demo-20.js';
let src = readFileSync(f, 'utf8');

// [ancien, nouveau] — nom complet AVANT nom de famille AVANT prénom
const paires = [
  ['Émile Tremblay', 'Chinua Achebe'], ['Tremblay', 'Achebe'], ['Émile', 'Chinua'],
  ['Camille Gagnon', 'Simone de Beauvoir'], ['Gagnon', 'de Beauvoir'], ['Camille', 'Simone'],
  ['Félix Bouchard', 'Hector Berlioz'], ['Bouchard', 'Berlioz'], ['Félix', 'Hector'],
  ['Rosalie Côté', 'Aimé Césaire'], ['Côté', 'Césaire'], ['Rosalie', 'Aimé'],
  ['Théo Pelletier', 'Nadia Comăneci'], ['Pelletier', 'Comăneci'], ['Théo', 'Nadia'],
  ['Léa Morin', 'Marie Curie'], ['Morin', 'Curie'], ['Léa', 'Marie'],
  ['Raphaël Lavoie', 'Albert Einstein'], ['Lavoie', 'Einstein'], ['Raphaël', 'Albert'],
  ['Florence Fortin', 'Sigmund Freud'], ['Fortin', 'Freud'], ['Florence', 'Sigmund'],
  ['Noah Gauthier', 'Vincent van Gogh'], ['Gauthier', 'van Gogh'], ['Noah', 'Vincent'],
  ['Alice Ouellet', 'Jane Goodall'], ['Ouellet', 'Goodall'], ['Alice', 'Jane'],
  ['Mamadou Diallo', 'Frida Kahlo'], ['Diallo', 'Kahlo'], ['Mamadou', 'Frida'],
  ['Juliette Bergeron', 'Akira Kurosawa'], ['Bergeron', 'Kurosawa'], ['Juliette', 'Akira'],
  ['William Lévesque', 'Yayoi Kusama'], ['Lévesque', 'Kusama'], ['William', 'Yayoi'],
  ['Yasmine Mansour', 'Ada Lovelace'], ['Mansour', 'Lovelace'], ['Yasmine', 'Ada'],
  ['Nathan Girard', 'Nelson Mandela'], ['Girard', 'Mandela'], ['Nathan', 'Nelson'],
  ['Zoé Roy', 'Lionel Messi'], ['Roy', 'Messi'], ['Zoé', 'Lionel'],
  ['Samuel Poirier', 'Toni Morrison'], ['Poirier', 'Morrison'], ['Samuel', 'Toni'],
  ['Maëlle Nadeau', 'Rosa Parks'], ['Nadeau', 'Parks'], ['Maëlle', 'Rosa'],
  ['Santiago García', 'Oumou Sangaré'], ['García', 'Sangaré'], ['Santiago', 'Oumou'],
  ['Laurence Thibault', 'Ravi Shankar'], ['Thibault', 'Shankar'], ['Laurence', 'Ravi'],
];

const dict = new Map(paires);
// alternation triée par longueur décroissante = nom complet d'abord
const cles = paires.map(p => p[0]).sort((a, b) => b.length - a.length);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// frontières : pas de lettre Unicode collée de part et d'autre
const re = new RegExp(`(?<![\\p{L}])(${cles.map(esc).join('|')})(?![\\p{L}])`, 'gu');

let n = 0;
src = src.replace(re, (m) => { n++; return dict.get(m) ?? m; });
writeFileSync(f, src, 'utf8');
console.warn(`Remplacements: ${n}`);
```

> ⚠ Le danger de l'attribut `Roy` : c'est le nom le plus court et le plus
> susceptible de collision. La garde `(?<![\p{L}])…(?![\p{L}])` empêche de
> toucher un mot où « Roy » serait collé à d'autres lettres, mais **vérifie
> après coup** (§9) qu'aucun « Roy » légitime hors-données (commentaire, sigle)
> n'a été modifié. Idem pour `Côté` (le mot « côté » existe en français —
> protégé ici par la **majuscule** : la regex est sensible à la casse).

Si tu préfères une approche structurée (parser l'objet, transformer, ré-écrire),
**ne le fais que si tu peux garantir un diff minimal** (même indentation 2
espaces, même ordre de clés, mêmes littéraux numériques). Sinon, l'approche
textuelle ci-dessus est préférable pour la revue.

## 6. Garde-fous (CLAUDE.md)

- **SSOT / namespacing** : ne change **jamais** `id`, `da`, `coursId`,
  `etudiantDA`, `groupe`. Ce sont les clés de jointure ; les noms n'en sont que
  l'affichage.
- **Zéro-dette** : pas d'alias, pas de table de correspondance laissée dans le
  code « au cas où ». Le script est jetable → le supprimer après usage.
- **Sécurité** : pas de `innerHTML`, pas de CSP, pas de module sensible touché
  → aucune nouvelle règle déclenchée. (On reste néanmoins sous `cd tests &&
  npm test`, §8.)
- **Diff lisible** : seules les lignes contenant un nom doivent changer. Si le
  diff dépasse ~240 lignes modifiées, c'est un signal d'alerte (reformatage
  parasite) → revenir en arrière.

### ⚠ Point d'attention éditorial — inversions de genre

L'appariement positionnel **inverse le genre sur 10 des 20 profils** (colonne
« Bascule genre »). Deux conséquences à vérifier, pas à présumer :

1. **Accord en genre dans les rétroactions.** Test préalable fait en Cowork :
   `« tu es motivé/ée »`, `« tu t'es montré/ée »` → **0 occurrence**. Les
   rétroactions semblent rédigées au neutre (le « tu » + adjectifs portant sur
   le *travail*, pas sur la personne). **Risque faible mais à confirmer** :
   après remplacement, `grep` sur les rétroactions des **10 profils basculés**
   (DEMO004, 005, 008, 011, 012, 013, 016, 017, 019, 020) pour repérer tout
   accord person-référent restant (`motivée`, `prête`, `engagée`, `allé(e)`,
   `content(e)`, participes passés avec « tu as / tu t'es »). Corriger au neutre
   si trouvé.
2. **Profils contrastés.** Les tests `sentinelle-wizard-exemple-recap-319` et
   `comparateur-banc-r4b-326` désignent **DEMO010 comme profil « fort »** et
   **DEMO004 comme « en difficulté »**. En positionnel, ça donne
   *Jane Goodall = forte* et *Aimé Césaire = en difficulté*. Rien ne casse
   techniquement (jointure par DA), mais c'est un choix d'image : si tu veux
   éviter qu'une figure précise hérite d'un profil faible/fort, signale-le à
   Grégoire avant de committer (échange possible de quelques lignes de la table).

## 7. Documentation à synchroniser (hors `docs/archive/`)

Zéro-dette = la doc courante reste exacte. Après le code, `grep` les anciens
noms dans `docs/` **en excluant `docs/archive/`** (les rapports/plans datés sont
des archives historiques : **ne pas les toucher**). Candidats repérés à vérifier
et, le cas échéant, mettre à jour s'ils présentent les noms comme le roster
**actuel** :

- `docs/utilisateur/README_DONNEES_DEMO.md`
- `docs/utilisateur/PACK_DEMARRAGE_README.md`
- `docs/modules/etudiants-groupes.md`
- `docs/PHASE5-PARCOURS-TESTS.md`
- `docs/securite/MODELE-MENACES.md`, `PROTECTION-DONNEES-ANONYMISATION.md`,
  `PROTECTION-DONNEES-CHIFFREMENT-REPOS.md`, `AUDIT-ETAT-REFLEXION-2026-05-11.md`
  (vérifier : exemples illustratifs vs roster réel).

Housekeeping optionnel dans `pack-demo-20.js` lui-même : l'en-tête (lignes 1-8)
et `_metadata` disent « 20 étudiants **anonymisés** ». Avec des figures
publiques connues, tu peux préciser « pseudonymes — figures historiques » et
bumper `_metadata.version` (actuel `"20.8"`). À ton jugement.

## 8. Tests

Aucun test à éditer (cf. §2). Mais **lancer la suite** pour confirmer qu'aucune
dépendance cachée ne casse :

```
cd tests && npm test
```

## 9. Vérification (esprit break-test — `SKILL_verification_adverse`)

Avant de déclarer fini, l'attestation ne suffit pas — produire les preuves :

1. **Aucun ancien jeton ne subsiste** :
   `grep -nE 'Tremblay|Gagnon|Bouchard|Côté|Pelletier|Morin|Lavoie|Fortin|Gauthier|Ouellet|Diallo|Bergeron|Lévesque|Mansour|Girard|Poirier|Nadeau|García|Thibault' js/pack-demo-20.js`
   → doit retourner **0** ligne. Idem pour les anciens prénoms.
2. **Décompte cohérent** : 20 élèves, `etudiantNom` toujours = `prenom + ' ' +
   nom` du même `etudiantDA`. Vérifier par script qu'aucun `etudiantNom` ne
   référence un couple absent de `groupeEtudiants`.
3. **Diff** : `git diff --stat` → un seul fichier de code modifié, nombre de
   lignes cohérent avec ~240 chaînes. Lire le `git diff` en entier.
4. **Accords genrés** : grep ciblé sur les 10 profils basculés (§6.1).
5. **Démo manuelle** : activer le mode démo, ouvrir un profil élève + une
   évaluation, vérifier l'affichage du nom et de la rétroaction. **Sur Mac
   (M3) ET iPad Air (M1)** — les deux cas d'usage principaux.
6. Supprimer le script jetable `scripts/_renommage-demo.mjs`.

## 10. Versionnage et commit (CLAUDE.md « Avant chaque commit »)

- **Rituel** : lancer `/fin-de-session` (dont le §4 break-test) avant commit.
- **Intention de version** : contenu démo cosmétique, **aucun changement de
  format de données** (id/da intacts) → **`patch`**. Pas de `major`, donc pas
  besoin de confirmation préalable de Grégoire sur le numéro.
  ```
  node scripts/release.mjs patch
  ```
  Vérifier les 4 points de vérité cohérents (`git diff`), puis `cd tests &&
  npm test`.
- **Message de commit suggéré** :
  `Démo : renomme les 20 élèves fictifs (figures historiques, appariement positionnel)`
- **Changelog** (`js/changelog-data.js`) : tweak interne au pack démo, pas une
  fonctionnalité utilisateur → **ne pas** ajouter d'entrée (cf. règles
  changelog : on retire les détails d'implémentation).

## 11. Avant de coder — rappel rituel

Exécuter d'abord le **rituel de début de session**
(`Skills pour Claude Code/SKILL_Debut_de_session.md`) : audit git + tests +
version + lecture `SESSION.md` / `BACKLOG.md`, lecture seule. Puis lire
`docs/00-START-HERE.md` et la présente consigne en entier avant d'écrire.

---

### Résumé exécutable

1. Rituel début de session → lire `pack-demo-20.js` lignes 73-292, **confirmer
   l'ordre des `da`** vs table §3.
2. Script Node passe unique (§5) → 3 surfaces remplacées en une fois.
3. Vérifs §9 (zéro ancien jeton, diff lisible, accords genrés des 10 basculés,
   démo Mac + iPad).
4. Docs hors-archive (§7), housekeeping métadonnées optionnel.
5. `npm test` → `release.mjs patch` → commit + push.
6. Supprimer le script jetable.
