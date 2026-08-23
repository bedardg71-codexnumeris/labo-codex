# Plan #291 + #476 — Gestion des doublons : identifier, distinguer, résoudre

> **Date du cadrage** : 23 août 2026 (session Claude Code, branche
> `claude/code-terminal-c0-instances-2rbbr0`, fusionnée dans `main` à 1.91.8).
> **Statut** : 📋 PRÊT À EXÉCUTER — **par une session neuve**, sur demande explicite
> de Grégoire. Aucun code de ce chantier n'a été écrit.
> **Verdicts de Grégoire déjà rendus** (23 août) : (1) **bloquer** · (2) une
> recommandation est demandée sur les chemins de duplication → **§3** · (3) le
> workflow de résolution **#291 se fait maintenant** · (4) **plan à exécuter en
> session neuve**.
> **Backlog** : ferme **#291** (workflow de résolution) et le volet bibliothèques
> de **#476** (I5, gardes de doublon — recoupe CT-15 et CO-24).

---

## 0. Ce que la session neuve doit faire AVANT d'ouvrir un fichier

1. Rituel de début de session (subagent `audit-debut-session`).
2. Lire ce plan en entier. Il est autoportant : **aucune connaissance de la session
   du 23 août n'est requise**, tous les constats ci-dessous sont des **mesures**,
   reproductibles par les commandes données.
3. Rappels qui ont déjà coûté des heures dans ce projet :
   - **Vitest se lance DEPUIS `tests/`**, jamais de la racine.
   - **`js/config.js` est une ZONE PROTÉGÉE.** `echapperHtml()` y vit. On ne la
     modifie pas ; on utilise `echapperAttribut()` (`js/securite-echappement.js`,
     livré le 21 août) pour les contextes d'attribut.
   - Ne jamais lire `SESSION.md` (~7 600 lignes) ni `BACKLOG.md` (~1 300) sans
     `offset`/`limit`.
   - Zéro-dette : **on retire ce qu'on remplace.** Les cinq détecteurs actuels ne
     sont pas à envelopper, ils sont à supprimer (§4, Lot 2).
4. Ne **pas** allouer de nouveaux identifiants de backlog : ce chantier travaille
   sous **#291** et **#476**, tous deux déjà ouverts. (Dernier ID consommé au
   23 août : **#485**. Vérifier l'en-tête de `BACKLOG.md` avant toute allocation —
   incident du 8 août, deux sessions ayant pris les mêmes identifiants.)

---

## 1. Le constat, mesuré

### 1.1 La plainte de Grégoire (23 août, capture de la bibliothèque de cartouches)

> « J'ai une information m'indiquant que j'ai des doublons, mais ils ne sont pas
> identifiés explicitement et les rechercher manuellement par leur ID est laborieux :
> **ils ne sont pas affichés !** […] Un utilisateur ne peut pas savoir quoi faire pour
> résoudre les conflits de doublons. **Lesquels sont lesquels ?** »

À l'écran : un bandeau « ⚠️ 4 doublon(s) potentiel(s) détecté(s) » avec des IDs
tronqués (`#b209ef`, `#6fdd43`, `#865949`…) et une consigne demandant de survoler les
IDs ; **les cartes de la liste en dessous n'affichent aucun ID**. Le bandeau décrit
des objets que rien à l'écran ne permet de retrouver.

### 1.2 Le détecteur est structurellement incapable de faire ce que le bandeau annonce

Les **cinq** détecteurs (`detecterDoublonsGrilles` `js/grilles.js:76`,
`…Cartouches` `js/cartouches.js:88`, `…Echelles` `js/echelles.js:168`,
`…Productions` `js/productions.js:120`, `…Pratiques` `js/pratiques-gestion.js:51`)
sont **cinq copies du même code**. Toutes commencent par dédupliquer **par `id`**,
puis regroupent **par nom**.

Conséquence, **reproduite par exécution** (Node, logique recopiée telle quelle) :

| Cas | Données | Sortie du détecteur |
|---|---|---|
| **A — vraie collision d'identifiant** | même `id` deux fois dans la liste | **`[]` — INVISIBLE** |
| **B — copie** (« ajouter à ma sélection ») | `id` neuf + `idOriginal` = source, même nom | signalé, `ids: [X1, X2]` |
| **C — homonymes légitimes** (#450) | deux entités distinctes, même nom | signalé, `ids: [A, B]` |

Reproduction :

```bash
node -e "
function detecter(locales, biblio) {
  const parId = new Map();
  [...locales, ...biblio].forEach(c => { if (c && c.id && !parId.has(c.id)) parId.set(c.id, c); });
  const parNom = {};
  parId.forEach(c => { const n=(c.nom||'').trim().toLowerCase(); if(!n) return;
    if(!parNom[n]) parNom[n]={nom:c.nom,count:0,ids:[]}; parNom[n].count++; parNom[n].ids.push(c.id); });
  return Object.values(parNom).filter(d=>d.count>1);
}
console.log('A', JSON.stringify(detecter([{id:'X1',nom:'G'},{id:'X1',nom:'G'}], [])));
console.log('B', JSON.stringify(detecter([{id:'X1',nom:'G'},{id:'X2',idOriginal:'X1',nom:'G'}], [])));
console.log('C', JSON.stringify(detecter([{id:'A',nom:'IDME et niv 0'},{id:'B',nom:'IDME et niv 0'}], [])));
"
```

Le bandeau (`js/bibliotheque-ui.js:779`) dit pourtant :

> « Survole un ID pour voir sa valeur complète — **IDs identiques = vraies copies,
> IDs différents = homonymes légitimes**. »

**Les deux moitiés sont fausses :**

- « IDs identiques » **ne peut jamais se produire** : la déduplication par `id` en
  amont l'a éliminé. C'est une branche morte de la consigne.
- « IDs différents = homonymes légitimes » est servi **aussi bien au cas B qu'au cas
  C**. L'application affirme donc que ses propres copies sont des homonymes
  légitimes, et **cache** les vraies collisions d'identifiant — exactement l'inverse
  de ce que l'entrée #291 du backlog demande de distinguer.

C'est la réponse technique à « Lesquels sont lesquels ? » : **aujourd'hui, personne
ne peut le savoir, parce que l'information a été détruite avant l'affichage.**

### 1.3 Les cartes ne portent pas d'identifiant

`BibliothequeUI.renderCarteDisponible` (`js/bibliotheque-ui.js:704`) rend nom, badge
de source, métadonnées, description. `opts.id` ne sert **que** de `contextId` pour le
menu ⋮ et dans `dataAttrs`. L'ID est donc **dans le DOM mais jamais montré** — d'où
« ils ne sont pas affichés ! ».

### 1.4 Deux défauts de sécurité dans le bandeau (règle #1, non négociable)

`BibliothequeUI.renderAvertissementDoublons` (`js/bibliotheque-ui.js:754-785`)
construit du HTML avec des données utilisateur **non échappées** :

```js
var nom = d[nomChamp] || 'Sans titre';                       // brut, venu du stockage
…
' (IDs: ' + … '<span title="ID complet : ' + id + '" …>'     // attribut non échappé
…
'<li><strong>' + nom + '</strong> : ' + …                    // innerHTML non échappé
```

Une grille nommée `<img src=x onerror=…>` s'injecte. **À corriger dans le Lot 3**,
`echapperHtml()` pour le texte, `echapperAttribut()` pour le `title=`.

### 1.5 La garde d'écriture existante ne couvre presque rien

`verifierEtGererDoublon` (`js/modal-doublon.js:260`) :

- compare `item.nom === nomNouveau` — **exact, sensible à la casse, sans `trim()`** ;
- n'est appelée que **4 fois**, toutes des sauvegardes de formulaire, toutes
  conditionnées à `(isCreation || isNameChange)` :
  `js/cartouches.js:741` · `js/grilles.js:659` · `js/echelles.js:3685` ·
  `js/productions.js:1096` ;
- **les pratiques n'ont aucune garde** ;
- **aucune des 33 fonctions `dupliquer*` ne la consulte** (§3).

### 1.6 L'identité existe déjà dans les données, mais sous quatre formes

| Champ | Posé par | Exemples |
|---|---|---|
| `idOriginal` (plat) | « ajouter à ma sélection » depuis la bibliothèque | `grilles.js:2594`, `echelles.js:2396`, `cartouches.js:3480`, `productions-bibliotheque-ui.js:290` |
| `inspireDe.idOriginal` | import d'un paquet collègue (D7) | `partage-import.js:187` |
| `inspireDe.sourceId` | duplication de pratique | `pratiques.js:1075` |
| `inspireDeTrimestre` | import inter-trimestre de pratique | `pratiques-gestion.js:662` |

Il n'existe **aucun accesseur unique**. Chaque lecteur réimplémente
`x.id === y.id || x.idOriginal === y.id` à la main (déjà 8 sites relevés). C'est la
brique manquante, et c'est le Lot 1.

---

## 2. Les trois verdicts de Grégoire, traduits

### 2.1 « Bloquer » — mais bloquer QUOI

Le mot ne peut pas s'appliquer à tout : **dupliquer est une action voulue**. La
distinction à porter dans le code :

| Geste | Intention | Décision |
|---|---|---|
| « Ajouter à ma sélection », import | l'utilisateur veut **une** copie | **BLOQUER** si l'identité est déjà présente, avec un message qui nomme l'exemplaire existant |
| « Dupliquer » (bouton explicite) | l'utilisateur veut **une copie de plus** | **NE JAMAIS BLOQUER** — mais produire une copie *distinguable* (nom incrémenté, `idOriginal` posé) |
| Sauvegarde d'un formulaire au nom déjà pris | ambigu | **AVERTIR** (modale actuelle : renommer / écraser / ignorer), jamais bloquer — les homonymes légitimes existent (#450) |

> **Le nom n'est pas une identité.** Grégoire possède lui-même, en a2025, deux
> échelles « IDME et niv 0 » **toutes deux réellement utilisées** (#450). Bloquer sur
> le nom casserait ses données. On bloque sur **l'identité**, on avertit sur le nom.

### 2.2 « Il faut le faire maintenant » — #291

Le workflow de résolution est le Lot 3. Il est piloté par la phrase exacte de
Grégoire, pas par la description générique du backlog : **le bandeau doit désigner
les objets, pas les décrire**.

### 2.3 La recommandation demandée → §3

---

## 3. RECOMMANDATION — les chemins de duplication

**Mesure d'abord.** `grep -rnoE "function dupliquer[A-Za-z]+" js/ --include="*.js" | grep -v _archives`
rend **33 définitions nommées** :

- **24 dans les cinq familles de bibliothèque** : cartouches 4, échelles 6,
  grilles 6, productions 4, pratiques 4 ;
- **9 ailleurs** : objectifs 1, partage 1, carte de planification 4, gabarits
  d'export 1, annotation 1, cours 1.

Liste complète en **Annexe A**.

### Ce que je recommande

**Ne pas garder 24 portes. En faire une seule — et pas au clic, à l'écriture.**

Trois raisons, dans l'ordre de poids :

1. **24 fonctions pour 5 familles est déjà le défaut.** Elles existent parce que
   chaque point d'entrée (barre latérale, modale, item actif, « dupliquer et
   éditer ») a reçu sa propre fonction au lieu d'un paramètre. Poser une garde sur
   chacune, c'est figer le défaut et créer 24 endroits à garder synchronisés. Le
   principe zéro-dette du projet dit l'inverse : un chantier retire ce qu'il
   remplace.
2. **La garde n'a pas sa place au clic, elle a sa place à l'écriture.** Les 24
   fonctions finissent toutes par pousser dans une liste puis appeler
   `db.set(cle, liste)`. Un helper unique `ajouterAvecGardeIdentite(liste, item)`
   au **point d'écriture** couvre les 24 chemins **et** les chemins d'import, **et**
   les chemins futurs — sans toucher aux 24 fonctions.
3. **Le vrai reproche de CO-24 n'est pas l'absence de garde, c'est
   « X (copie) (copie) (copie) ».** Ça ne se règle pas par un blocage mais par un
   helper de nommage (Lot 5). Bloquer une duplication délibérée serait une
   régression fonctionnelle.

### Ce que je recommande de NE PAS faire dans ce chantier

- **Ne pas** fusionner les 24 `dupliquer*` en une fonction générique **maintenant**.
  C'est un refactor à grande surface, sans changement de comportement, qui mérite
  son propre lot — et qui sera **beaucoup plus sûr une fois les sentinelles des
  Lots 1-4 en place** pour l'encadrer. À inscrire au backlog sous #476 comme
  « volet 2 », à faire après.
- **Ne pas** toucher aux 9 fonctions hors bibliothèques dans ce chantier (carte de
  planification, annotation…) : elles ne partagent ni le modèle d'identité ni l'UI
  de bibliothèque. Le volet CT-15 (groupes-cours, courriels d'enseignant,
  `creerCours`) est le Lot 6, et il est optionnel.

### Ordre de valeur, si le temps manque

Le Lot 0 puis le Lot 3 répondent à la plainte de Grégoire. Les Lots 1-2 sont ce qui
rend le Lot 3 honnête. **Le minimum utile est 0 + 1 + 2 + 3.** Les Lots 4-6 sont la
prévention ; ils peuvent tomber dans une session suivante sans laisser de dette,
à condition que le Lot 1 existe.

---

## 4. Le chantier, lot par lot

Chaque lot : **une sentinelle au minimum, et son break-test** (la faire ROUGIR avant
de lui faire confiance — §4 du rituel `/fin-de-session`).

### Lot 0 — Instrumentation, lecture seule (30 min)

**But** : que Grégoire sache **aujourd'hui**, sur ses vraies données, lesquels sont
lesquels — sans attendre le code.

Écrire `scripts/diagnostic-doublons-bibliotheques.js`, sur le patron de
`scripts/diagnostic-productions-doublons-et-visibilite.js` (existant, éprouvé) :

- **lecture seule stricte** — le vérifier par comparaison des données avant/après ;
- détecte le build périmé (`window.VERSION_MAJEURE` + présence d'un symbole récent)
  et le **dit** en tête de sortie ;
- pour chaque famille × chaque trimestre, liste les groupes de même nom avec, par
  exemplaire : **l'ID complet**, `idOriginal` / `inspireDe.*` s'ils existent, la date
  de modification, `dansBibliotheque` ;
- classe chaque groupe en **collision d'identifiant** / **copie** / **homonymes** ;
- signale à part les collisions d'identifiant **intra-liste** (le cas A, aujourd'hui
  invisible) ;
- termine par un relevé copiable.

**Livrable à Grégoire** : le script + la consigne « colle ceci dans la console ».

### Lot 1 — `js/identite-item.js`, la brique manquante

Module nouveau, fonctions **pures**, exposées sur `window` (patron
`js/horaire-fusion.js`) :

```
identitesDe(item)            → Set des jetons d'identité
                               {id, idOriginal, inspireDe.idOriginal, inspireDe.sourceId}
memeIdentite(a, b)           → booléen (intersection non vide)
classerGroupe(exemplaires)   → 'collision-id' | 'copie' | 'homonymes'
analyserDoublons(liste, champNom)
                             → [{nom, categorie, exemplaires: [{id, idCourt, …}]}]
```

`champNom` vaut `'nom'` pour grilles/cartouches/échelles/pratiques et `'titre'` pour
les productions — c'est la seule différence entre les cinq détecteurs actuels.

**`analyserDoublons` ne déduplique PAS par `id` en amont.** C'est tout l'objet du
lot : le cas A doit survivre jusqu'à l'affichage.

**Sentinelle** `tests/unit/identite-item.test.js` — au minimum les cas A, B, C du
§1.2 avec les sorties attendues *nouvelles* (A → `collision-id`, B → `copie`,
C → `homonymes`), plus : identité transitive (X ← Y ← Z), `inspireDe` imbriqué,
entrées nulles / non-tableaux, casse et espaces du nom, pureté (entrées non mutées).

**Break-test** : rétablir la déduplication par `id` en tête de `analyserDoublons` →
le cas A doit repasser au vert d'échec (`collision-id` disparu). Si les tests restent
verts, la sentinelle ne verrouille pas ce qu'on croit.

### Lot 2 — Retirer les cinq copies (zéro-dette)

Supprimer `detecterDoublonsGrilles`, `…Cartouches`, `…Echelles`, `…Productions`,
`…Pratiques` et brancher les cinq appelants sur `analyserDoublons` :
`grilles.js:2228` · `cartouches.js:3305` · `echelles.js:2181` ·
`productions-bibliotheque-ui.js:51` · `pratiques-gestion.js:365`.
Retirer aussi l'export `window.detecterDoublonsProductions`
(`js/productions.js:2169`).

**Sentinelle de non-retour** (patron de celle de CT-04 sur `joursDejaVus`) : un test
qui `grep` `js/` et exige **zéro** occurrence du motif `detecterDoublons` hors
`js/travaux-import.js` (`detecterDoublonsStockage`, autre sujet, hors périmètre) et
hors `_archives`. Message d'échec : « passer par `analyserDoublons`
(`js/identite-item.js`) ».

**Break-test** : réintroduire une des cinq fonctions → la sentinelle rougit.

### Lot 3 — #291, le workflow de résolution

C'est le lot que Grégoire attend. Quatre changements dans
`js/bibliotheque-ui.js`.

**3.1 — La carte porte son identifiant.** Dans `renderCarteDisponible`, ajouter
l'ID court (`BibliothequeUI.genererIdCourt` = 6 derniers caractères) à la ligne de
métadonnées, avec l'ID complet en `title`. Échapper l'attribut avec
`echapperAttribut()`. Ferme littéralement « ils ne sont pas affichés ! ».

**3.2 — Le bandeau désigne au lieu de décrire.** Réécrire
`renderAvertissementDoublons` à partir de `analyserDoublons` :

- un bloc par groupe, **titré par sa catégorie** :
  - 🔴 **Collision d'identifiant** — « anomalie de données : deux entrées portent le
    même identifiant `…`. À signaler. »
  - 🟠 **Copies** — « N exemplaires issus du même original. Tu peux n'en garder
    qu'un. »
  - 🔵 **Homonymes** — « N entités **distinctes** portant le même nom. **Ce n'est pas
    un défaut.** Renomme-les si tu veux les distinguer. »
- sous le titre, **un exemplaire par ligne** : nom · ID court (visible) · date de
  modification · badge de source · `Déjà dans la barre latérale` le cas échéant ;
- **la consigne fausse du §1.2 est SUPPRIMÉE**, pas reformulée.

**3.3 — « Voir » pointe l'objet.** Chaque ligne d'exemplaire porte un bouton
`data-action` qui fait défiler jusqu'à la carte correspondante dans la liste et la
met en surbrillance ~2 s. C'est la réponse directe à « les rechercher manuellement
par leur ID est laborieux ».

**3.4 — Résoudre sur place.** Sur chaque ligne, les actions **déjà existantes**
« Retirer » (`dansBibliotheque: false`, données conservées) et « Supprimer »
(définitif, avec confirmation) — au lieu d'envoyer l'utilisateur chercher un menu ⋮.
Ne rien inventer : réutiliser les actions du menu ⋮ actuel.

**Contraintes non négociables du lot 3** :

- `echapperHtml()` sur tout nom, titre, texte libre ; `echapperAttribut()` sur tout
  `title=` / `data-*` portant une donnée utilisateur. **Corrige au passage les deux
  défauts du §1.4.**
- **Zéro handler inline.** `data-action` + dispatcher `main.js`.
- **Aucune case à cocher ne porte un verdict** (règle des portes terrain) : la
  catégorie est calculée et affichée, jamais laissée à un interrupteur.
- Cible tactile **≥ 44 px** sur tout bouton neuf (iPad), **mesurée au navigateur**,
  pas déduite du CSS.

**Sentinelles** :
- Vitest sur le rendu du bandeau (fonction pure de chaîne) : les trois catégories
  produisent trois libellés distincts ; un nom hostile (`<img onerror=…>`) ressort
  échappé ; l'ID court apparaît dans le HTML de la carte.
- Playwright (`tests/integration/`) : ouvrir une bibliothèque avec un jeu de données
  contenant un cas B et un cas C, vérifier que **deux catégories différentes**
  s'affichent, que « Voir » met bien la bonne carte en surbrillance, et **mesurer**
  la taille rendue des boutons.

**Break-tests** : (a) retirer l'échappement du nom → le test hostile rougit ;
(b) forcer `classerGroupe` à toujours rendre `'homonymes'` → le test des deux
catégories rougit.

### Lot 4 — Bloquer sur l'identité à l'ajout (verdict « bloquer », #476 volet 1)

Un helper unique, appelé au **point d'écriture** des cinq familles :

```
ajouterAvecGardeIdentite(liste, item) → {ajoute: bool, conflit: item|null}
```

Refus si `memeIdentite(item, x)` pour un `x` déjà dans la liste. L'appelant affiche
alors un message **qui nomme l'exemplaire existant** (« *Artefact 7* est déjà dans ta
sélection ») plutôt qu'un échec muet.

⚠ **Piège connu, à ne pas rejouer.** `db.set` / `db.setSync` (`js/db.js:449` et
`:1458`) font `return;` **nu** quand la garde #340 refuse l'écriture : l'appelant ne
peut pas distinguer un succès d'un refus, et l'application annonce « ajouté » alors
que rien n'a été écrit. C'est exactement le bug vécu par Grégoire le 22 août. Le
correctif appliqué alors dans `ajouterProductionIndividuelle`
(`js/productions-bibliotheque-ui.js`) est une **relecture-vérification après
écriture** — reprendre ce patron ici, pour les cinq familles.

> **Dette adjacente, à inscrire au backlog sans la traiter ici** : *tous* les
> écrivains gardés partagent cet angle mort. La correction de fond est de faire
> rendre un booléen à `db.set`/`db.setSync`. Hors périmètre de ce chantier —
> surface d'appel trop large pour être auditée en même temps.

**Sentinelle** : ajouter deux fois la même identité → un seul exemplaire, et le
second appel rend `{ajoute: false, conflit}`. **Break-test** : retirer la garde → le
test rougit.

### Lot 5 — Les noms de copie cessent de s'empiler (CO-24)

`nommerCopie(nomSource, nomsExistants)` : `X` → `X (copie)` → `X (copie 2)` →
`X (copie 3)`, jamais `X (copie) (copie) (copie)`. Détecte et normalise un suffixe
déjà présent. Branché au point d'écriture, pas dans les 24 fonctions.

**Sentinelle** : la chaîne des trois premiers appels ; un nom contenant déjà
« (copie) » ; un nom vide. **Break-test** : rétablir la concaténation naïve → rouge.

### Lot 6 — Hors bibliothèques (CT-15, #476 volet 2) — ✅ LIVRÉ le 23 août 2026

Les trois sites sont gardés. Ce que le lot a livré, et ce qu'il a trouvé en route :

- **Un module de plus, pas trois gardes copiées** — `js/identite-naturelle.js`,
  fonctions pures. ⚠ À ne pas confondre avec `identite-item.js` : celui-là dit
  la LIGNÉE (« cet item descend-il de celui-là ? »), celui-ci l'identité
  NATURELLE (« ces deux fiches désignent-elles la même chose ? »).
- **Trois normalisations concurrentes, trouvées en chemin.** Le plan attendait
  « `creerCours` sans contrôle ». La mesure a donné pire : le formulaire
  comparait `trim().toUpperCase()`, l'import comparait `===` BRUT, l'entité ne
  comparait rien. Un « 601-101-mq » importé à côté d'un « 601-101-MQ » existant
  n'était donc pas vu comme un doublon — **refusé à la main, accepté par
  fichier**. Une clé unique referme ça.
- **L'édition était le quatrième trou**, non listé par l'audit : renommer le
  code d'une fiche pour lui donner celui d'une autre fabriquait exactement le
  doublon que la création refusait.
- **La décision #455 est appliquée, pas contournée** : l'identité du cours
  reste son code seul, et la garde ne bloque pas — elle avertit. Même règle
  pour les trois : le geste reste possible, jamais silencieux. C'est ce qui
  permet le co-enseignement (deux GC de même triplet, enseignants différents)
  et le double rattachement institutionnel (un courriel, deux profils).

Sites traités :

- `js/trimestre-v2-groupes-cours.js:654-677` — pousse un groupe-cours sans vérifier
  le triplet (trimestre, cours, groupe) ;
- `js/trimestre-v2-enseignants.js:263-273` — aucune vérification de courriel à la
  création manuelle ;
- `js/entites/cours-entite.js:44-71` — `creerCours` sans contrôle d'unicité. ⚠ Le
  magasin `cours` est **GLOBAL** depuis la décision #455 (identité = le code seul) :
  toute garde ici doit respecter cette décision, pas la contourner.

**Vérification** : `sentinelle-ct15-identite-naturelle.test.js` (16 cas) +
porte navigateur `doublons-cadre-ct15.spec.js`. **Sept break-tests rouges**
avant de faire confiance aux sentinelles — dont celui qui compte le plus :
inclure horaire+enseignant dans le triplet du GC (le désarmement qui aurait
rendu la garde muette au moment exact où elle doit parler).

**Porte terrain** : `plans de travail/PORTES-TERRAIN-2026-08-23-doublons-cadre.md`.

---

## 5. Hors périmètre, explicitement

- La **modale de comparaison côte-à-côte** décrite dans #291 (« nom, date de
  modification, contenu, nombre de critères… ») et le « Tout fusionner ». Le Lot 3
  rend les doublons **identifiables et résolubles** ; la comparaison enrichie est un
  confort, pas un déblocage. À laisser dans #291, qui reste ouvert avec ce reliquat.
- La **fusion des 24 `dupliquer*`** (§3) — lot suivant.
- `detecterDoublonsStockage` (`js/travaux-import.js:1455`) — doublons de **fichiers**
  de travaux, modèle et UI distincts.
- Le correctif de fond `db.set` → booléen (§4, Lot 4).

---

## 6. Porte terrain

Rien de ce chantier ne se clôt sans passage sur les appareils de Grégoire : les
bibliothèques sont un écran qu'il utilise en Mac **et** en iPad, et le Lot 3 est
entièrement visuel.

Produire les **deux livrables jumeaux** du modèle :

- l'artefact interactif (opération) — avec son bouton **« Copier mes résultats »** ;
- le markdown versionné dans `plans de travail/` (trace).

Portes minimales à prévoir :

1. Le bandeau distingue visiblement copies et homonymes sur **ses vraies données**.
2. Chaque carte affiche un ID court lisible (Mac **et** iPad).
3. « Voir » amène bien à la bonne carte, y compris quand la liste défile.
4. « Retirer » conserve les données ; « Supprimer » demande confirmation.
5. Un deuxième clic sur « ajouter à ma sélection » **refuse et le dit** (Lot 4).
6. Les boutons neufs sont **atteignables au doigt** — mesure, pas estimation.
7. Ses deux échelles « IDME et niv 0 » (#450) sont classées **homonymes**, pas
   copies — c'est le cas-témoin qui prouve qu'on n'a pas bloqué sur le nom.

Rappel du modèle : **aucune case à cocher ne porte un chiffre ni un verdict.**

---

## 7. Risques

| Risque | Portée | Parade |
|---|---|---|
| Bloquer sur le nom casserait les données réelles de Grégoire (#450) | 🔴 élevée | On bloque sur l'identité. Porte terrain 7 en fait le cas-témoin. |
| Le Lot 2 retire cinq fonctions : un appelant oublié casse une bibliothèque | 🟠 | La sentinelle de non-retour du Lot 2 + les cinq appelants sont énumérés au §4. |
| L'échec silencieux de `db.set` fait annoncer un succès qui n'a pas eu lieu | 🟠 | Relecture-vérification après écriture (Lot 4), patron déjà éprouvé le 22 août. |
| Le Lot 3 touche `bibliotheque-ui.js`, partagé par les 5 familles | 🟠 | Un lot, une famille vérifiée à la fois au navigateur avant de passer à la suivante (procédure §5 du guide projet). |
| Build périmé côté Grégoire → « ça ne marche pas » alors que c'est livré | 🟡 | Le Lot 0 détecte et **dit** le build périmé. Déjà vécu le 21 août. |
| `js/config.js` (zone protégée) contient `echapperHtml` | 🟡 | Ne pas y toucher ; `echapperAttribut()` est dans `js/securite-echappement.js`. |

---

## Annexe A — Les 33 fonctions `dupliquer*`

Relevé du 23 août 2026 (`grep -rnoE "function dupliquer[A-Za-z]+" js/ --include="*.js" | grep -v _archives`).

**Familles de bibliothèque — 24**

| Fichier | Fonctions |
|---|---|
| `js/cartouches.js` | `dupliquerCartouche` (1367) · `dupliquerCartoucheActive` (2311) · `dupliquerEtEditerCartouche` (3591) · `dupliquerCartoucheBibliotheque` (3614) |
| `js/echelles.js` | `dupliquerEchelle` (383) · `dupliquerEchelleActuelle` (835) · `dupliquerEchelleBibliotheque` (2537) · `dupliquerEtEditerEchelle` (3112) · `dupliquerEchelleDepuisSidebar` (3488) · `dupliquerEchelleActive` (3647) |
| `js/grilles.js` | `dupliquerGrille` (986) · `dupliquerGrilleActuelle` (1064) · `dupliquerGrilleBibliotheque` (2749) · `dupliquerEtEditerGrille` (3192) · `dupliquerGrilleDepuisSidebar` (3754) · `dupliquerGrilleActive` (3816) |
| `js/productions-liste.js` / `js/productions-bibliotheque-ui.js` | `dupliquerEtEditerProduction` (33) · `dupliquerProduction` (302) · `dupliquerProductionActive` (349) · `dupliquerProductionBibliotheque` (675) |
| `js/pratiques.js` / `js/pratiques-gestion.js` | `dupliquerPratique` (948) · `dupliquerPratiqueBibliotheque` (966) · `dupliquerEtEditerPratique` (1074) · `dupliquerPratiqueMateriel` (2065) |

**Hors bibliothèques — 9** (hors périmètre)

`js/objectifs.js:662` `dupliquerEnsembleObjectifs` · `js/partage-section.js:173`
`dupliquerGrillePartagee` · `js/planification-carte.js` `dupliquerConteneurEnProfondeur`
(3412), `dupliquerNoeud` (3536), `dupliquerSelection` (3711), `dupliquerCarteActive`
(7756) · `js/planification-export.js:1516` `dupliquerGabarit` ·
`js/travaux-annotation.js:2217` `dupliquerSelection` ·
`js/trimestre-v2-cours.js:646` `dupliquerCoursSelectionneV2`

---

## Annexe B — Points d'ancrage vérifiés au 23 août 2026 (1.91.8)

| Quoi | Où |
|---|---|
| Bandeau doublons | `js/bibliotheque-ui.js:754-785` (consigne fausse : 779) |
| Carte d'item | `js/bibliotheque-ui.js:704` (`renderCarteDisponible`) |
| ID court | `js/bibliotheque-ui.js:22` (`genererIdCourt` = 6 derniers caractères) |
| Détecteurs (à retirer) | `grilles.js:76` · `cartouches.js:88` · `echelles.js:168` · `productions.js:120` · `pratiques-gestion.js:51` |
| Appelants des détecteurs | `grilles.js:2228` · `cartouches.js:3305` · `echelles.js:2181` · `productions-bibliotheque-ui.js:51` · `pratiques-gestion.js:365` |
| Injection du bandeau | `grilles.js:2389` · `cartouches.js:3430` · `echelles.js:2358` · `productions-bibliotheque-ui.js:247` · `pratiques-gestion.js:551` |
| Garde de nom existante | `js/modal-doublon.js:260` (`verifierEtGererDoublon`) |
| Ses 4 appelants | `cartouches.js:741` · `grilles.js:659` · `echelles.js:3685` · `productions.js:1096` |
| `idOriginal` posé | `grilles.js:2594` · `echelles.js:2396` · `cartouches.js:3480` · `productions-bibliotheque-ui.js:290` |
| `inspireDe.idOriginal` posé | `partage-import.js:187` |
| Retour nu sur refus d'écriture | `js/db.js:449` et `js/db.js:1458` |
| Échappement d'attribut | `js/securite-echappement.js` (`echapperAttribut`, livré 1.91.x) |
| Fusion par identité à l'import (#448) | `js/import-export.js:134` (`fusionnerParIdentite`) |
