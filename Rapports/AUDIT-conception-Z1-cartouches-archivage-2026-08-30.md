# Audit ciblé Z1 — cartouches, frontière de portée et archivage (Labo Codex)

Date : 2026-08-30 (soirée). Dépôt : `~/Documents/GitHub/Monitorage_v6`, branche `main` au commit `3b5ffd96`.
Session : `kuekatsheu-c5`, S1 du `plans de travail/PLAN-modele-objets-conception-2026-08-30.md`, item **#619**.
Constats parents : `Rapports/AUDIT-modele-objets-conception-2026-08-30.md` §2.2-B1, §2.2-B2, §2.4-M1 ; périmètre et quatre questions : §3-Z1.

**Lecture seule. Aucun fichier du dépôt n'a été modifié hormis ce rapport. Aucun trimestre n'a été archivé, ni de test, ni jetable — le moratoire D1 a été respecté : T1.3 est instruit par lecture de code (voir §5).**

**Écart de commit depuis l'audit parent** : l'audit du 30 août portait sur `810c3ee8`. Un seul commit a depuis touché le périmètre : `1e2fc4d0` (fix #612), qui modifie `js/liste-evaluations.js` (+78 l.) et `index.html`. Il ne touche aucun des sites cités ici sauf le décalage de numérotation de `liste-evaluations.js` — la lecture de cartouches signalée « l.913 » par l'audit parent est **vérifiée à la ligne 913 dans l'arbre courant**. Tous les autres numéros de ligne de ce rapport ont été relus dans l'arbre au commit `3b5ffd96`. Arbre de travail propre sur `js/`, `index.html` et `tests/`.

Convention de certitude : **VÉRIFIÉ** = lu dans le code, extrait cité ; **INFÉRÉ** = conséquence déduite du code sans exécution ; **SUPPOSÉ** = demande un test réel.
Nature : **CONFLIT** (deux vérités concurrentes pour la même donnée) · **INCOHÉRENCE** (le code ne dit pas la même chose partout) · **RÉSIDU** (mort ou sans objet — à retirer).

Statut de mon avis : ceci est une lecture de code sans exécution dans un navigateur. Ce n'est pas l'avis d'un pair. Les chiffres qui manquent sont nommés en §7.

---

## 1. Synthèse

Les trois constats parents sont **confirmés**, et deux d'entre eux sont **plus graves que ce que l'audit parent en dit**. S'y ajoutent trois constats neufs, dont un BLOQUANT qui change le périmètre du moratoire D1.

1. **B1 confirmé, aggravé sur deux points.** L'archivage détruit bien des modèles vivants — mais contrairement à ce qu'écrivent l'audit parent (§2.2-B1) et le plan (T0.1, option B), **il n'existe aucune copie de secours** : le snapshot dit « de backup » (`trimestres.js:782`) enregistre le sous-ensemble DÉJÀ filtré, et ne contient aucune cartouche (il n'en garde qu'un compte). Et le croisement de namespaces sur les pratiques n'« ajoute » pas des pratiques d'un autre trimestre : il **remplace** la collection du trimestre archivé par celle de l'actif, restreinte aux ids utilisés — les notes de l'archivé se recalculent alors avec le modèle d'un autre trimestre.
2. **Constat neuf, BLOQUANT.** `exporterTrimestreArchive` — l'export automatique présenté comme le filet de l'archivage ET le filet de la suppression définitive d'un trimestre — **écrase deux de ses propres champs corrects par des lectures du trimestre ACTIF** (l.1139, l.1142). Pour tout trimestre non actif, l'export perd les présences et emporte les captures d'un autre trimestre. Le moratoire D1, tel qu'écrit, ne couvre pas ce chemin.
3. **B2 confirmé, et la surface de sa correction est plus large que le plan ne le suppose.** Le régime global des cartouches est réel et intégral : les vingt-quatre accès du module propriétaire sont des clés littérales, aucun ne passe par `cle()`. Mais **quinze sites répartis dans neuf fichiers énumèrent les clés par le préfixe `cartouches_`** — ils cesseraient de trouver quoi que ce soit, **en silence**, le jour où la clé devient `<trim>_cartouches_<grilleId>`. Et `purgerCopiesModelesArchive` (l.1042), aujourd'hui correcte, deviendrait **destructive** sous D2-A.
4. **D2-A n'est pas contredite** : c'est le bon régime cible, et je la recommande. Mais elle porte une sous-décision que le plan n'a pas posée (§4-Q(a)), et son coût est celui d'un chantier à trente sites, pas d'un enrobage par `cle()`.
5. **M1 confirmé, exactement tel que décrit** : les deux registres produisent la même clé, la redondance est sans effet, un seul doit rester. Le bloc mort d'`identifierTemplatesUtilises` est confirmé **doublement mort**, avec un témoin daté de la veille dans le dépôt.

Ce qui tient : `cleSource()` est déjà le bon traducteur inter-trimestre et gère déjà la forme namespacée des cartouches ; `js/reserve.js` traite déjà les deux formes de clé ; la discipline `db.modifier` du module cartouches est intacte ; les filets `idOriginal` fonctionnent. Détail en §6.

---

## 2. Constats

### 2.1 Le régime de portée des cartouches, en une carte

Autoportant : lisible seul.

| Élément | Où | Portée réelle |
|---|---|---|
| Grille (modèle de travail) | `<trim>_grillesTemplates` | **Par trimestre**, depuis #358 (Option A, 28 juin 2026) |
| Échelle (modèle de travail) | `<trim>_echellesTemplates` | **Par trimestre**, depuis #358 |
| Pratique | `<trim>_pratiquesConfigurables` | **Par trimestre**, depuis le 24 mai 2026 |
| **Cartouche** | **`cartouches_<grilleId>`** | **GLOBALE — partagée par tous les trimestres** |
| Copie d'archive d'une cartouche | `<trim>_cartouches_<grilleId>` | Écrite à l'archivage, lue **uniquement** si le trimestre actif est archivé, détruite au désarchivage |

Le même `grilleId` présent dans plusieurs trimestres est le cas **nominal**, et même **garanti** : la migration #358 a conservé les ids, et surtout `assurerGrilleGenerique` (`grilles.js:1469-1509`) écrit `cle('grillesTemplates')` — donc `<trim>_grillesTemplates` — à chaque initialisation du module sur un trimestre non archivé (`grilles.js:1516-1521`). **Tout trimestre non archivé reçoit donc une grille portant l'id `GRILLE_GENERIQUE`**, pendant que `cartouches.js:213` sème `cartouches_GRILLE_GENERIQUE` en clé nue, une seule fois pour tous. VÉRIFIÉ. Autrement dit : dès qu'il existe deux trimestres vivants, il existe au moins une clé de cartouches partagée — le partage n'est pas un cas de figure, c'est l'état par défaut de toute installation. Les cartouches des exemplaires homonymes n'ont **qu'une seule collection pour tous**.

Une cartouche porte son propre instantané de structure :
`{ id, nom, criteres:[{id,nom}], niveaux:[{code,nom}], commentaires: { '<critereId>_<code>': texte }, verrouille, dansBibliotheque }` (`cartouches.js:180-211`).
C'est ce qui rend le partage mesurable : ce ne sont pas deux cartouches qui divergent, c'est **la grille de chaque côté** qui bouge sous une cartouche unique, et les clés `<critereId>_<code>` cessent de correspondre.

**Les trois routes vers une cartouche, aujourd'hui :**

- `cle('cartouches_X')` — 7 sites, tous des **lecteurs** de la chaîne d'évaluation : `evaluation.js:1491`, `evaluation-chargement.js:717/810/1163`, `evaluation-retroaction.js:250`, `liste-evaluations.js:913`, `synthese-retroaction-data.js:1229`. Routés vers la copie archivée si le trimestre actif est archivé, sinon vers la clé nue.
- `cleSource('cartouches_X', srcId)` — 2 sites, l'import inter-trimestre : `grilles.js:2423`, `cartouches.js:4276`.
- **Clé littérale `cartouches_${grilleId}`** — tout le reste, dont **les dix chemins d'écriture** du module propriétaire, qui ne consultent jamais `cle()`.

### 2.2 BLOQUANT

#### B1 — L'archivage détruit des modèles vivants, et il n'existe aucune copie de secours [CONFLIT]

`js/trimestres.js:727-799` (`creerSnapshotRessources`), appelée par `archiverTrimestre` l.624. **VÉRIFIÉ** (mécanisme et absence de filet), **SUPPOSÉ** (volume détruit chez Grégoire — dépend de ses données).

```js
// trimestres.js:741-742 — lecture des collections DE TRAVAIL du trimestre
const toutesGrilles  = db.getSync(`${trimestreId}_grillesTemplates`, []);
const toutesEchelles = db.getSync(`${trimestreId}_echellesTemplates`, []);
// trimestres.js:746-747 — filtrage aux seuls modèles « utilisés »
const grillesUtilisees  = toutesGrilles.filter(g => grilleIds.has(g.id));
const echellesUtilisees = toutesEchelles.filter(e => echelleIds.has(e.id));
// trimestres.js:752-753 — RÉÉCRITURE DES MÊMES CLÉS avec le sous-ensemble
db.setSync(`${trimestreId}_grillesTemplates`,  grillesUtilisees);
db.setSync(`${trimestreId}_echellesTemplates`, echellesUtilisees);
```

Avant #358 ces clés étaient des copies d'archive neuves ; depuis #358 ce sont **les collections de travail vivantes du trimestre**. La fonction n'a pas été relue à ce moment-là : le commentaire de la l.737-740 dit explicitement que « le filtrage par ids utilisés + l'écriture vers `${trimestreId}_*` restent inchangés » — c'est la ligne où le régime a changé sous le code sans que le code change.

**Ce que l'audit parent dit et qui est faux.** §2.2-B1 écrit qu'une grille non utilisée « ne survit que dans le snapshot de backup, l.782 ». Le plan reprend la même phrase dans l'option B de T0.1. **VÉRIFIÉ : le snapshot ne la contient pas non plus.**

```js
// trimestres.js:767-779 — l'objet « backup complet »
const ressources = {
    productions: db.getSync(`${trimestreId}_productions`) || db.getSync('productions', []),
    grilles:  grillesUtilisees,     // ← le sous-ensemble DÉJÀ FILTRÉ
    echelles: echellesUtilisees,    // ← idem
    pratiques: pratiquesUtilisees,  // ← idem
    cartouches: nbCartouchesCopies, // ← un NOMBRE, pas les cartouches
```

Le snapshot enregistre exactement les survivants. Les cartouches n'y sont pas du tout : `nbCartouchesCopies` est un compteur (l.757, 762). **Il n'existe donc, à ce stade, aucune copie des modèles retirés.** L'export automatique n'en est pas une non plus (voir B2 ci-dessous : il est appelé APRÈS, l.635, et lit les mêmes clés déjà écrasées).

**Conséquence pour la décision D1.** Grégoire a choisi l'option A (moratoire) : aucun dommage. Mais l'option B lui a été présentée comme « archiver quand même en acceptant le risque — un snapshot de backup existe ». **Cette prémisse est fausse**, et elle est écrite dans deux documents que la prochaine session relira comme un fait vérifié. À corriger dans le plan (T0.1) et dans l'audit parent (§2.2-B1) — je ne les modifie pas moi-même, ils appartiennent à `kuekatsheu-bc`.

**Mécanisme de perte propre aux échelles, plus large qu'il n'y paraît.** `echelleIds` ne peut pas être alimenté par les grilles (voir M1 ci-dessous : le bloc est mort). Il ne contient donc que les `echelleId` cités **directement** par une production ou une évaluation (l.681-683, l.694-701). Une échelle utilisée par une grille mais jamais référencée directement n'est pas « utilisée » : elle est retirée de `<id>_echellesTemplates`. INFÉRÉ, mais mécaniquement contraint.

**Écriture inconditionnelle.** `toutesGrilles` a `[]` pour défaut ; si `<id>_grillesTemplates` était absente, `db.setSync` **crée** la clé avec `[]`. `cle()` la trouve alors non nulle et la rend au trimestre archivé : une liste de modèles vide au lieu d'un repli. VÉRIFIÉ (code), INFÉRÉ (atteignabilité).

#### B2 — L'export automatique écrase ses propres champs corrects par des lectures du trimestre ACTIF [CONFLIT] — constat NEUF

`js/trimestres.js:1093-1160` (`exporterTrimestreArchive`). **VÉRIFIÉ** (l'écrasement), **INFÉRÉ** (« vide » plutôt que « amputé »).

```js
// trimestres.js:1116-1122 — CORRECT : toutes les clés namespacées du trimestre CIBLE
CLES_NAMESPACEES.forEach(nomCle => {
    const cleComplete = `${id}_${nomCle}`;
    const valeur = db.getSync(cleComplete, null);
    if (valeur !== null) { exportData.donnees[nomCle] = valeur; }
});
...
// trimestres.js:1138-1142 — ÉCRASE deux de ces entrées par le trimestre ACTIF
const presences = obtenirDonneesSelonMode('presences');
exportData.donnees.presences = presences.filter(p => coursIds.includes(p.coursId));
const snapshots = db.getSync(cle('snapshots'), { hebdomadaires: [], interventions: [] });
exportData.donnees.snapshots = snapshots;
```

`presences` et `snapshots` sont **tous deux dans `CLES_NAMESPACEES`** (`trimestres.js:60, 64`) : la boucle l.1116 les a donc déjà remplis, correctement, depuis `<id>_presences` et `<id>_snapshots`. Puis :

- `obtenirDonneesSelonMode` (celle qui gagne est `modes.js:622` — celle de `db.js:1667` n'est pas exportée, et `db.js:1916` le dit) appelle `window.cle(cle)` à sa l.663 : elle lit le **trimestre actif**, puis filtre par le **cours actif**. Le `.filter(p => coursIds.includes(p.coursId))` de la l.1139 la restreint ensuite aux cours du trimestre **cible**. Deux ensembles construits sur des trimestres différents : le résultat est vide, ou fortement amputé si un cours chevauche deux trimestres (#455 a rendu `coursId` multi-trimestres neutre, donc le chevauchement n'est pas impossible — d'où l'INFÉRÉ).
- `cle('snapshots')` rend `<actif>_snapshots` : les captures hebdomadaires et les interventions du trimestre **actif** sont écrites dans l'export d'un **autre** trimestre, sans le moindre filtre.

Les l.1132-1136 (`etudiants`, `evaluations`) souffrent du même défaut de lecture mais écrivent sous des noms de champs neufs : elles n'écrasent rien et ajoutent seulement deux champs faux à côté des champs justes.

**Pourquoi c'est BLOQUANT et pas SÉRIEUX — trois portes, dont une irréversible.**

1. `archiverTrimestre` l.635 : l'export est produit après la destruction de B1, et la modale annonce « Un export automatique sera généré » (`trimestre-v2-liste.js:181`), puis « Un fichier d'export a été téléchargé » (l.188).
2. **`confirmerSuppressionTrimestre` (#361), `trimestre-v2-liste.js:398-405`** : cet export est **le filet de sécurité d'une suppression définitive et irréversible** de tout un trimestre. Le code en fait une condition explicite — si l'export échoue, la modale demande « Supprimer quand même, SANS copie de secours ? ». L'utilisateur est donc informé qu'un filet existe. Ce filet perd les présences et emporte les captures d'un autre trimestre.
3. Le bouton « Exporter » est offert sur **chaque ligne** de l'écran Trimestres (`trimestre-v2-liste.js:116, 122, 140`). Sur la ligne du trimestre **actif**, `id` égale le trimestre actif : les l.1139 et 1142 tombent juste, l'export est correct. Sur **toute autre ligne**, le fichier produit n'est pas une sauvegarde fidèle — et rien ne le distingue à l'œil.

**Conséquence pour le périmètre du moratoire D1.** Le moratoire, tel qu'écrit, couvre « ne pas utiliser Archiver un trimestre ». Il ne couvre ni « Supprimer… » ni « Exporter » sur une ligne non active. Recommandation en §8.

#### B3 — Le snapshot de pratiques ne croise pas les namespaces : il REMPLACE la collection du trimestre archivé [CONFLIT]

`js/trimestres.js:743, 748, 754`. **VÉRIFIÉ.**

```js
const toutesPratiques   = db.getSync(cle('pratiquesConfigurables'), null) || [];   // l.743 — trimestre ACTIF
const pratiquesUtilisees = toutesPratiques.filter(p => pratiqueIds.has(p.id));      // l.748 — ids du trimestre ARCHIVÉ
db.setSync(`${trimestreId}_pratiquesConfigurables`, pratiquesUtilisees);           // l.754 — namespace ARCHIVÉ
```

`cle()` route par le trimestre **actif** ; or on ne peut archiver qu'un trimestre **non actif** (garde l.615-618). La lecture et l'écriture sont donc garanties de porter sur deux namespaces différents — c'est la classe de l'incident #340, dans le code courant, sans garde (celle de #340 ne couvre que `productions`, `productions-namespace-garde.js`).

**L'audit parent formule cet effet comme un ajout** (« reçoit un extrait des pratiques de H2026 »). **C'est un remplacement.** `db.setSync` écrase : la collection propre du trimestre archivé est remplacée par l'intersection de la collection de l'ACTIF et des ids utilisés par l'ARCHIVÉ.

Deux pertes distinctes en découlent, et la seconde est la plus discrète :

- **Disparition** : une pratique qui n'existait que dans le trimestre archivé n'est pas dans `toutesPratiques` — elle n'est nulle part dans le résultat. `groupesCours[].pratiqueId` du trimestre archivé pointe alors dans le vide.
- **Substitution silencieuse** : la migration `migration_pratiques_namespacees_done` (`main.js:663-681`) a copié **la même collection, ids compris**, dans tous les trimestres. Les ids concordent donc, et le filtre ne rend pas vide : il rend **la version de l'actif**. Comme les pratiques sont namespacées depuis le 24 mai précisément pour qu'elles divergent d'un trimestre à l'autre (Hybride h2026 vs 4-meilleurs a2025, commentaire l.98-101), la substitution est le cas attendu, pas le cas rare. Les notes du trimestre archivé se recalculent alors avec le modèle de calcul d'un autre trimestre, sans un mot dans la console.

INFÉRÉ pour l'ampleur (dépend de la divergence réelle des deux collections chez Grégoire) ; VÉRIFIÉ pour le mécanisme.

#### B4 — Les cartouches vivent hors du régime de portée de leur grille [CONFLIT]

Constat parent §2.2-B2. **CONFIRMÉ intégralement**, avec deux précisions et une aggravation.

**(a) Le régime, VÉRIFIÉ à la ligne.** `cle()` rend la clé nue pour tout trimestre non archivé :

```js
// trimestres.js:343-346
// Vérifier si c'est une clé globale (jamais namespacée sauf archive)
if (CLES_GLOBALES.includes(nomCle) || nomCle.startsWith('cartouches_')) {
    return nomCle;
}
```

Ce test précède le test `CLES_NAMESPACEES` (l.353). **Inscrire `cartouches_` au registre des clés namespacées ne changerait donc rien** : le retour anticipé de la l.344 gagne. C'est le point d'entrée du diff D2-A (§6.2).

**(b) Le module propriétaire ne consulte jamais `cle()` — VÉRIFIÉ, et c'est intégral.** Vingt-quatre accès dans `cartouches.js`, tous en clé littérale. Les **dix chemins d'écriture** : `obtenirCartouchesGrille` (l.76, réparation de forme), `persisterCartouchePartielle` (l.807), `sauvegarderCartouche` (l.1022), `basculerVerrouillageCartouche` (l.1576), `dupliquerCartouche` (l.1631), `supprimerCartoucheConfirm` (l.1822), `importerDansCartoucheActive` (l.2996), `importerCartoucheJSON` (l.3973), `retirerCartoucheDeBibliotheque` (l.4711), `supprimerCartoucheDefinitivement` (l.4753). Plus la graine `cartouches_GRILLE_GENERIQUE` (l.213), écrite en global.

**(c) Le cerveau divisé sur trimestre archivé est ATTEIGNABLE — précision que l'audit parent laisse ouverte.** Les trois gardes `estTrimestreArchive` de `cartouches.js` (l.4320, 4509, 4552) ne couvrent que **l'import inter-trimestre** (Brique C) — leurs commentaires le disent. **Aucun des dix chemins d'écriture n'est gardé.** Sur un trimestre archivé, l'éditeur de cartouches écrit donc la clé **globale** pendant que les sept lecteurs d'évaluation lisent, via `cle()`, la copie **archivée**. La modale d'archivage annonce pourtant « Un trimestre archivé passe en lecture seule et ne peut plus être modifié » (`trimestre-v2-liste.js:180`). VÉRIFIÉ pour le code ; SUPPOSÉ pour ce que l'écran montre (angle mort §7-A2).

**(d) Aggravation : un chemin de suppression détruit les cartouches des autres trimestres.** `js/donnees-v2.js:1564-1574`, troisième homonyme de `supprimerGrilleDefinitivement` :

```js
// donnees-v2.js:1569-1573
try { await db.remove(`cartouches_${grilleId}`); }
catch (e) { console.warn('[donnees-v2] Erreur suppression cartouches grille:', e.message); }
...
// donnees-v2.js:1582-1584 — le commentaire qui suit, trois lignes plus bas
// #358 Option A : `cle('grillesTemplates')` = `<trim>_grillesTemplates`. On ne
// purge QUE le trimestre actif — les copies archivées d'autres trimestres sont
// des enregistrements figés (reproductibilité des notes), on n'y touche pas.
```

L'intention est écrite, et elle est juste pour les grilles. Elle est démentie trois lignes plus haut pour les cartouches : `cartouches_<grilleId>` est la clé nue, partagée. Supprimer une grille depuis Réglages › Données pendant que H2026 est actif efface les cartouches de la grille homonyme d'A2025 — dont la grille, elle, survit dans `a2025_grillesTemplates`. La grille reste, ses cartouches disparaissent, aucun message. **C'est la classe de l'incident du 24 août, retournée** : là, des cartouches vivaient sous une clé que personne ne lisait ; ici, elles meurent sous une clé que tout le monde partage. VÉRIFIÉ.

**(e) L'effet miroir sur les gardes d'orphelinage, confirmé.** `grilles.js:2677` et `grilles.js:3858` lisent la même clé nue et **bloquent** la suppression si elle n'est pas vide. Des cartouches créées dans un autre trimestre bloquent donc la suppression dans le trimestre actif — et le message de `grilles.js:3859-3866` **nomme** ces cartouches. Trois chemins, deux politiques opposées, et les deux se trompent pour la même raison : la clé n'a pas la portée que son appelant lui prête.

Le point (d) est dans les fichiers de **Z2** (`donnees-v2.js` §suppressions) et relève de **D3**. Il a été signalé à `kuekatsheu-bc` pour `kuekatsheu-82`, avec la recommandation d'ordonnancement du §8.

### 2.3 SÉRIEUX

#### Z1-S1 — Quinze énumérations par préfixe cesseraient de trouver quoi que ce soit, en silence, sous D2-A [INCOHÉRENCE]

**VÉRIFIÉ** (les sites), **INFÉRÉ** (le silence). C'est le principal coût caché de D2-A, et il n'est pas dans le plan.

Quinze sites, dans neuf fichiers, énumèrent les clés de stockage et retiennent celles qui **commencent** par `cartouches_` :

| Fichier:ligne | Rôle | Sous D2-A |
|---|---|---|
| `cartouches.js:1895` | `exporterCartouches` — export JSON de toutes les cartouches | Rend « Aucune cartouche à exporter » |
| `evaluation.js:290` | énumération des clés de cartouches | Aucune correspondance |
| `echelles.js:578` | recensement des clés cartouches | Aucune correspondance |
| `import-export.js:2101, 2920, 3239` | analyse d'un import, sélection, export complet | Cartouches absentes des trois |
| `codex.js:504` | `estCleBibliotheque` — sur `cleBase` | Dépend du dénamespaçage amont |
| `codex-data.js:240, 261` | lecture d'un Codex chargé | Aucune correspondance |
| `labo-codex-data.js:430` | lecture Codex — sur `cleBase` | Dépend du dénamespaçage amont |
| `reserve.js:696` | passe « cartouches globales » des Archives | Devient mort (voir ci-dessous) |
| `reserve-ouvrir.js:265` | réouverture d'une archive | Aucune correspondance |
| `demo-activation.js:213, 437` | pose et retrait du matériel démo | Démo invisible, purge sans effet |

Aucun de ces quinze sites ne lève d'erreur si le préfixe ne correspond plus : ils itèrent sur zéro élément et rendent une collection vide. C'est exactement la mécanique silencieuse que `cle()` a fermée pour les clés futures avec le fallthrough bruyant #464/CT-26 — mais un `startsWith` sur une énumération n'a pas d'équivalent.

Deux nuances importantes, en faveur de D2-A :

- **`js/reserve.js` traite DÉJÀ les deux formes.** Sa l.660 teste `nomCourt.indexOf('cartouches_') === 0` où `nomCourt` est la partie dénamespacée d'une clé `<trim>_*` — le commentaire l.659 le dit (« Cartouches namespacés par trimestre archivé : laisser passer »). Sous D2-A, cette branche couvre le cas courant, et c'est la passe globale de la l.696 qui devient un RÉSIDU à retirer. Le pipeline Codex USB n'est donc pas à réécrire, seulement à élaguer.
- **`demo-activation.js` itère les clés du PACK, pas du magasin** (`Object.keys(PACK_DEMARRAGE)`, l.209 et 433). Les deux sites doivent composer `cle(nom)` à l'écriture et à la purge, sinon le matériel démo est posé sous la clé nue et lu sous la clé namespacée.

#### Z1-S2 — `purgerCopiesModelesArchive` deviendrait destructive sous D2-A [CONFLIT latent]

`js/trimestres.js:1017-1045`. **VÉRIFIÉ.**

```js
// trimestres.js:1030-1036 — la condition est dérivée du REGISTRE, elle s'auto-ajuste
CLES_TEMPLATES_ARCHIVES
    .filter(nomCle => CLES_GLOBALES.includes(nomCle))
    .forEach(nomCle => retirer(`${id}_${nomCle}`));

// trimestres.js:1039-1042 — celle-ci est EN DUR, elle ne s'auto-ajuste pas
// Les cartouches restent GLOBALES (`cartouches_<grilleId>`) → leur copie
// namespacée redevient bien orpheline au désarchivage : on la purge toujours.
const { grilleIds } = identifierTemplatesUtilises(id);
grilleIds.forEach(grilleId => retirer(`${id}_cartouches_${grilleId}`));
```

Aujourd'hui, cette purge est **correcte** : la copie namespacée n'est qu'un doublon d'une donnée globale vivante. Sous D2-A, `<id>_cartouches_<grilleId>` **est** la donnée du trimestre : désarchiver l'effacerait. C'est précisément la perte que #358/#359 ont déjà corrigée pour les grilles — le bloc l.1030-1036 en porte la trace, et sa condition dérivée du registre a été écrite pour « s'auto-ajuster au déplacement du registre ». La branche cartouches, elle, est écrite en dur : elle ne s'auto-ajustera pas. Elle doit être retirée **dans le même diff** que le changement de régime, pas après.

#### Z1-S3 — Le snapshot d'archivage copierait une cartouche sur elle-même [RÉSIDU latent]

`js/trimestres.js:756-764`. **VÉRIFIÉ.** Sous D2-A, `db.getSync('cartouches_' + grilleId)` devient une lecture d'une clé qui n'existe plus, et la destination `<trimestreId>_cartouches_<grilleId>` est déjà la source. La boucle entière perd son objet et doit être retirée — comme l'ont été les copies de grilles au moment de #358. Le compteur `nbCartouchesCopies` (l.757, 762, 772, 790) disparaît avec elle.

Note incidente sur le régime actuel : la copie n'a lieu que `if (cartouches.length > 0)` (l.760). Une grille « utilisée » dont la collection de cartouches est vide au moment de l'archivage n'obtient donc pas de copie ; `cle()` retombe alors indéfiniment sur la clé globale pour ce trimestre archivé (l.339, « Fallback vers la clé globale »). Sans conséquence tant que les cartouches sont globales ; c'est un des cas que la migration D2-A doit décider explicitement (§4-Q(a)).

### 2.4 MINEUR

- **Z1-M1 [RÉSIDU]** — Constat parent M1, **confirmé exactement tel que décrit**. `grillesTemplates`, `echellesTemplates` et `pratiquesConfigurables` figurent à la fois dans `CLES_NAMESPACEES` (`trimestres.js:102, 111, 112`) et dans `CLES_TEMPLATES_ARCHIVES` (l.160-166). Les deux branches de `cle()` produisent la même clé : pour un trimestre archivé, la l.324 rend `<trim>_<nom>` si la copie existe, sinon on retombe l.353 sur `<trim>_<nom>` — le même résultat. Idem dans `cleSource()` (l.399 vs l.413). La redondance est **sans effet**, et le commentaire de `CLES_TEMPLATES_ARCHIVES` décrit encore ces clés comme des « templates globaux », ce qu'elles ne sont plus depuis #358 : deux explications concurrentes du même routage. VÉRIFIÉ.
  ⚠ `CLES_TEMPLATES_ARCHIVES` **n'est pas retirable telle quelle** : `purgerCopiesModelesArchive` (l.1030) l'utilise comme liste de départ. Le diff du §6.4 dit comment.
- **Z1-M2 [RÉSIDU]** — Le bloc mort d'`identifierTemplatesUtilises` (`trimestres.js:675-680`) est **doublement** mort, et le dépôt en porte le témoin daté de la veille :
  ```js
  // trimestres.js:676-680
  const grilles = db.getSync('grillesTemplates', []);   // clé NUE
  grilles.forEach(g => { if (grilleIds.has(g.id) && g.echelleId) { echelleIds.add(g.echelleId); } });
  ```
  1. La clé nue `grillesTemplates` est vidée au boot par `viderModelesGlobalHerite` (l.884-913) : elle ne contient au mieux que des orphelins non capturés, jamais les modèles de travail.
  2. **Aucune grille ne porte plus de champ `echelleId`.** Deux témoins dans le dépôt, tous deux du 29 août 2026, la veille de l'audit parent. Le diagnostic #578, `cartouches.js:3250` : « Aucune grille ne porte d'echelleId : lire `grille.echelleId` laisserait TOUTE cartouche neuve sans colonnes — c'est pourquoi la cartouche prend son échelle du FORMULAIRE, jamais de la grille (option A, 29 août 2026). » Et le gabarit lui-même, `grilles.js:1489-1490` : « #574/#578 (29 août 2026) : plus d'`echelleId` — l'échelle générique n'est plus semée, et une grille dit les CRITÈRES ; l'échelle se choisit là où on s'en sert. »
  Contribution nulle sur les deux plans. VÉRIFIÉ. À retirer — c'est un bloc mort dans une fonction dangereuse, et c'est lui qui prive `echelleIds` de sa seule source indirecte (voir B1).
- **Z1-M3 [INCOHÉRENCE]** — `cartouches.js:230` déclare `const cle = \`cartouches_${grille.id}\`` **à l'intérieur** de `migrerCartouchesVersBibliotheque`, qui appelle la fonction globale `cle('grillesTemplates')` quatre lignes plus haut (l.226). Il n'y a pas de bug aujourd'hui : le `const` est porté par le bloc `for`, la l.226 est hors de ce bloc et résout vers la fonction globale. Mais c'est un piège direct pour le diff D2-A, qui doit précisément introduire un appel à `cle()` dans ce corps de boucle — il y lèverait un `TypeError`. À renommer avant, pas pendant.
- **Z1-M4 [RÉSIDU, hors périmètre]** — `db.js:1667` définit un second `obtenirDonneesSelonMode`, non exporté et sans appelant (`db.js:1916` le documente : « exportée par modes.js »). Ce n'est pas la double définition `window` dangereuse de la classe habituelle — l'ordre de chargement n'arbitre rien — mais c'est une fonction morte de 22 lignes dans le fichier le plus lu du projet. Signalé parce que je l'ai croisé en établissant qui gagne pour B2 ; il n'appartient à aucune des trois zones Z.
- **Z1-M5 [RÉSIDU, hors périmètre]** — `planification-carte.js:7815` cherche `echelles.find(e => e.id === grille.echelleId)` : même champ retiré que Z1-M2, donc toujours `undefined`. Appartient au périmètre de la carte mentale, pas au mien. Inscrit ici pour ne pas le perdre.

### 2.5 Ce qui est solide — ne pas y toucher au temps 3

- **`cleSource()` est déjà prêt pour D2-A.** Sa branche l.399-405 cherche `<src>_cartouches_X` en priorité et ne retombe sur la clé nue qu'à défaut. Après la migration, la l.408 ne servira plus, mais le contrat de la fonction ne change pas : `grilles.js:2423` et `cartouches.js:4276` n'ont **rien** à modifier. VÉRIFIÉ.
- **`js/reserve.js` traite déjà les deux formes de clé** (l.660 pour `<trim>_cartouches_*`, l.696 pour la globale). Le pipeline Codex USB survit à D2-A par élagage, pas par réécriture. VÉRIFIÉ.
- **La discipline `db.modifier` du module cartouches** est intacte sur les dix chemins d'écriture : relecture dans la file, confirmations hors file, `security-ok` inline documentés (l.4817, 4829). Le changement de régime ne touche que le NOM de la clé, jamais la mécanique d'écriture. VÉRIFIÉ.
- **Les gardes `estTrimestreArchive` de l'import inter-trimestre** (`cartouches.js:4320, 4509, 4552`) sont correctes pour ce qu'elles couvrent, et leurs commentaires disent honnêtement ce qu'elles couvrent. Le trou du B4(c) est ailleurs — dans les chemins d'écriture ordinaires, qui n'en ont jamais eu. VÉRIFIÉ.
- **Les filets `idOriginal`** des lookups de cartouches (`cartouches.js:454, 620, 3564-3568`) amortissent réellement les `echelleId` périmés. VÉRIFIÉ (confirmation du constat parent).
- **Le boot atomique de #358** (`main.js:696-723`) est le patron à copier pour la migration D2-A : drainer `db.flush()` **avant** de poser le flag, pour qu'un échec partiel fasse re-tenter au prochain démarrage. VÉRIFIÉ.

---

## 3. Le diagnostic console (T1.1) — écrit, testé, non exécuté sur les données réelles

Livré à `kuekatsheu-bc` le 30 août au soir pour exécution par Grégoire (T1.2). Lecture seule stricte : uniquement `db.keysSync()` et `db.getSync()`, aucun `db.set`, aucun `db.remove`.

**Conformité aux contraintes** : une seule ligne physique ; zéro arrow function ; zéro `const` et zéro `let` — uniquement `var`, tous enfermés dans une IIFE, donc recollable indéfiniment sans « Can't create duplicate variable ».

**Validation avant remise** : `node --check` (syntaxe) ; banc synthétique reproduisant B4 (deux trimestres, grille homonyme aux critères divergents, cartouche partagée, copie archivée divergente) — détecte 1 grille homonyme, critères divergents, 1 commentaire orphelin en H2026, 1 archive divergente ; **témoin négatif** avec critères concordants — rend 0 divergence et 0 orphelin. Il ne rend pas zéro par construction.

**Ce qu'il mesure, et pourquoi ce choix.** La clé nue est UNE collection : elle ne peut pas diverger d'elle-même. Ce qui diverge, c'est la grille de chaque côté. Le diagnostic compare donc, pour chaque `grilleId` présent dans au moins deux trimestres, les jeux de `criteres[].id` de chaque exemplaire, et compte les commentaires `<critereId>_<code>` de la cartouche partagée qui pointent un critère absent de l'exemplaire **de ce trimestre-là**. Il mesure en outre l'écart entre chaque copie archivée et la clé globale — le cerveau divisé de B4(c), chiffré.

Sept compteurs rendus : `nbTrimestres`, `nbClesNues`, `nbCopiesNamespacees`, `nbGrillesHomonymes`, `nbHomonymesCriteresDivergents`, `nbHomonymesAvecCommentairesOrphelins`, `nbArchivesDivergentes`. JSON complet en console et dans `window.__DIAG619`.

**T1.2 — résultat sur les données réelles de Grégoire : EN ATTENTE.** À consigner ici tel quel, brut, quand il l'aura exécuté. Le §4-Q(b) reste sans réponse chiffrée jusque-là, et c'est lui qui règle la sous-décision du §4-Q(a).

---

## 4. Réponses aux quatre questions du §3-Z1

**(a) Quel régime cible pour `cartouches_*`, et quel chemin de migration ?**

**Je ne contredis pas D2-A. Je la confirme comme le bon régime cible, et je recommande de la maintenir** — pour quatre raisons mesurées, pas par déférence à une décision déjà écrite :

1. Elle aligne la cartouche sur sa grille, qui est déjà namespacée depuis #358. Toute autre option laisse deux objets couplés sous deux régimes.
2. Elle ferme le cerveau divisé B4(c) sans garde supplémentaire : lecteurs d'évaluation et éditeur convergent sur la même clé.
3. Elle rend correcte, sans la toucher, la suppression de `donnees-v2.js:1571` (B4-d) — `db.remove(cle('cartouches_' + grilleId))` ne portera plus que sur le trimestre actif, ce que son propre commentaire annonce déjà.
4. Elle supprime le faux blocage des gardes d'orphelinage B4(e), et elle ne crée pas d'orphelin en retour : les grilles étant déjà namespacées, supprimer la grille de H2026 ne touche pas celle d'A2025, dont les cartouches restent rattachées.

**Ce que je signale, en revanche, c'est que son coût a été sous-estimé** : ce n'est pas un enrobage par `cle()`, c'est un chantier à une trentaine de sites (§2.3-Z1-S1), plus deux fonctions d'archivage à corriger dans le même diff (Z1-S2, Z1-S3), plus deux sites démo. Et surtout :

⚠ **Une sous-décision que le plan n'a pas posée, et qu'aucune lecture de code ne peut trancher.** Quand une seule clé `cartouches_X` est partagée par N trimestres, la migration écrit quoi dans chaque `<T>_cartouches_X` ?
  - **A-copie** — une copie profonde de la collection partagée dans chaque trimestre qui possède la grille. Rien n'est perdu ; la divergence future devient possible, ce qui est le but ; le coût est de la place et une duplication ponctuelle.
  - **A-attribution** — attribuer la collection à un seul trimestre. Perte de données pour les autres.
  **Recommandation : A-copie**, avec deux règles de préséance et une règle de silence :
  - Un `<T>_cartouches_X` **déjà présent pour un trimestre ARCHIVÉ** est conservé tel quel, jamais écrasé : c'est l'enregistrement figé que les lecteurs d'évaluation servent déjà pour ce trimestre. L'écraser par la clé globale changerait les rétroactions affichées d'un trimestre archivé.
  - Un `<T>_cartouches_X` présent pour un trimestre **non archivé** est un résidu d'un cycle archivage/désarchivage : la clé globale, vivante, gagne, et le fait est journalisé.
  - Une clé `cartouches_X` dont le `grilleId` n'appartient à **aucun** trimestre est **laissée en place et journalisée bruyamment**, jamais supprimée : ce sont les orphelins de la classe du 24 août, et leur sort appartient à S6 / #542, pas à cette migration.
  Le chiffre qui dit si A-copie coûte cher est `nbGrillesHomonymes` du diagnostic — d'où la dépendance à T1.2.

**(b) Quelles clés sont effectivement partagées, et les contenus ont-ils divergé ?**
Sans réponse chiffrée : le diagnostic est écrit et testé, son exécution appartient à Grégoire (T1.2). Le mécanisme, lui, est VÉRIFIÉ, et le partage est **structurellement garanti** — pas seulement possible — dès qu'un `grilleId` existe dans deux trimestres, ce que la migration #358 à id conservé rend nominal. La question ouverte n'est donc pas « est-ce partagé » mais « le partage a-t-il déjà produit des commentaires désalignés », et de combien.

**(c) L'archivage détruit-il effectivement des modèles vivants, et le snapshot pratiques croise-t-il les namespaces ?**
**Oui aux deux, VÉRIFIÉ par lecture, sans exécution** — voir B1 et B3. La destruction est inconditionnelle (`db.setSync` du sous-ensemble filtré sur la clé de travail), le croisement de namespaces est garanti par la garde anti-actif elle-même. Ce que la lecture n'établit pas, c'est le **volume** chez Grégoire : combien de ses grilles et échelles A2025 ne sont référencées par aucune production ni évaluation, et de combien ses deux collections de pratiques divergent. Ces deux chiffres demandent une mesure sur ses données, pas une exécution d'archivage — voir §7, angles morts A1 et A3, et §8, proposition de diagnostic complémentaire.

**(d) Le bloc mort et le double registre ?**
Confirmés tous les deux (Z1-M1, Z1-M2), avec une réserve d'exécution sur M1 : `CLES_TEMPLATES_ARCHIVES` sert aussi de liste de départ à `purgerCopiesModelesArchive`. Le retrait n'est donc pas la suppression de la constante mais celle de ses deux tests redondants dans `cle()` et `cleSource()`. Diff au §6.4.

---

## 5. T1.3 — l'archivage instruit par lecture, sans exécution

Le moratoire interdit d'archiver, y compris un trimestre jetable. Le test §4.1 de l'audit parent n'a donc **pas** été exécuté. Voici ce que la lecture établit seule, et ce qu'elle laisse ouvert.

**Ce que la lecture tranche, sans exécution :**

| Question du test §4.1 | Verdict | Preuve |
|---|---|---|
| Les grilles non « utilisées » disparaissent-elles de `<id>_grillesTemplates` ? | **Oui** | `trimestres.js:741` lit, `:746` filtre, `:752` réécrit la même clé |
| Les échelles non « utilisées » aussi ? | **Oui**, et le filtre est plus étroit qu'il n'y paraît | `:747`, `:753` ; `echelleIds` privé de sa source indirecte par Z1-M2 |
| `<id>_pratiquesConfigurables` reçoit-il des pratiques du trimestre actif ? | **Oui, et il REMPLACE** | `:743` lit `cle(...)` = actif, `:754` écrit le namespace archivé |
| Le snapshot de backup rattrape-t-il la perte ? | **Non** | `:769-772` n'enregistre que le sous-ensemble filtré ; les cartouches n'y sont qu'un compte |
| L'export automatique la rattrape-t-il ? | **Non, et il a son propre défaut** | appelé `:635` après la destruction ; l.1139/1142 écrasent par le trimestre actif |
| Le désarchivage restaure-t-il ? | **Non** | `desarchiverTrimestre` (`:964-996`) retire le drapeau et purge ; il ne restaure rien |

**Ce que seule une exécution établirait**, et que je n'ai pas produit : le volume réel de la perte chez Grégoire, et ce que l'écran affiche après coup (une collection de modèles vide se manifeste-t-elle par un message ou par un silence).

**Mon avis sur la nécessité d'exécuter** — c'est un avis, pas un verdict, et la décision appartient à Grégoire : **le test d'archivage sur trimestre jetable n'est pas nécessaire pour spécifier les diffs de S4.** Les six lignes du tableau sont VÉRIFIÉES au niveau du mécanisme, et aucun diff du §6 n'attend un chiffre pour être écrit. Ce qu'un test jetable apporterait — le volume — se mesure **sans archiver**, par un diagnostic en lecture seule qui compte, pour chaque trimestre, les modèles qui ne survivraient pas au filtre. C'est strictement plus sûr et plus informatif qu'un archivage jetable, qui ne dirait rien des données réelles. Je propose ce diagnostic complémentaire au §8 ; il n'est pas écrit, faute d'un accord préalable sur son opportunité.

Reste une case que rien ne remplace : **après la livraison de S4**, archiver un trimestre jetable pour vérifier que le correctif tient. Cela appartient à S4, pas à S1.

---

## 6. Correctifs proposés — NON APPLIQUÉS

Chaque diff dit ce qu'il retire. Ils ne sont **pas** indépendants : l'ordre imposé est **§6.1 (S4) → §6.2 + §6.3 (S5)**, et §6.4 (M1) s'intercale n'importe où. Les trois premiers touchent `js/trimestres.js` : ils ne peuvent pas être menés en parallèle.

### 6.1 — B1 + B3 : l'archivage cesse d'écrire dans les collections de travail et de croiser les namespaces (S4, #622)

```diff
--- a/js/trimestres.js
+++ b/js/trimestres.js
@@ creerSnapshotRessources
-            const toutesGrilles = db.getSync(`${trimestreId}_grillesTemplates`, []);
-            const toutesEchelles = db.getSync(`${trimestreId}_echellesTemplates`, []);
-            const toutesPratiques = db.getSync(cle('pratiquesConfigurables'), null) || [];
+            // #619/B3 : cle() route par le trimestre ACTIF, et on ne peut archiver
+            // qu'un trimestre NON actif (garde l.615-618) : lire par cle() garantissait
+            // de lire un AUTRE trimestre puis d'écrire sous celui-ci. Le trimestre
+            // archivé est nommé, on lit son namespace explicitement.
+            const toutesGrilles   = db.getSync(`${trimestreId}_grillesTemplates`, []);
+            const toutesEchelles  = db.getSync(`${trimestreId}_echellesTemplates`, []);
+            const toutesPratiques = db.getSync(`${trimestreId}_pratiquesConfigurables`, null) || [];
 
             // Filtrer pour ne garder que les utilisés
             const grillesUtilisees = toutesGrilles.filter(g => grilleIds.has(g.id));
             const echellesUtilisees = toutesEchelles.filter(e => echelleIds.has(e.id));
             const pratiquesUtilisees = toutesPratiques.filter(p => pratiqueIds.has(p.id));
 
-            // ✅ AJOUT (28 jan 2026) : Copier vers des clés namespacées pour l'archivage
-            // Ces copies seront utilisées quand le trimestre est en mode archive
-            db.setSync(`${trimestreId}_grillesTemplates`, grillesUtilisees);
-            db.setSync(`${trimestreId}_echellesTemplates`, echellesUtilisees);
-            db.setSync(`${trimestreId}_pratiquesConfigurables`, pratiquesUtilisees);
+            // #619/B1 — RETIRÉ : les trois db.setSync qui réécrivaient les clés de
+            // TRAVAIL avec le sous-ensemble filtré. Écrit en janvier 2026, quand
+            // `<id>_*Templates` étaient des copies d'archive neuves ; depuis #358
+            // (28 juin 2026) ce sont les collections VIVANTES du trimestre. Archiver
+            // retirait donc du stockage tout modèle non « utilisé », sans copie de
+            // secours (le snapshot ci-dessous n'enregistrait que les survivants).
+            // L'archivage est désormais une LECTURE : il n'écrit que le snapshot.
@@ — la boucle de copie des cartouches reste, tant que les cartouches sont globales ;
@@   elle est retirée par le diff 6.3, dans le même chantier que le changement de régime.
@@
             // Ressources pour le snapshot (backup complet)
             const ressources = {
                 productions: db.getSync(`${trimestreId}_productions`) || db.getSync('productions', []),
-                grilles:  grillesUtilisees,
-                echelles: echellesUtilisees,
-                pratiques: pratiquesUtilisees,
-                cartouches: nbCartouchesCopies,
+                // #619/B1 — le snapshot enregistrait le sous-ensemble filtré : il ne
+                // pouvait donc rien restaurer de ce que l'archivage venait de retirer.
+                // Il enregistre désormais les collections COMPLÈTES, et les cartouches
+                // elles-mêmes plutôt que leur compte.
+                grilles:   toutesGrilles,
+                echelles:  toutesEchelles,
+                pratiques: toutesPratiques,
+                cartouches: cartouchesSnapshot,   // { grilleId: [...] }
+                utilises: {
+                    grilleIds:   Array.from(grilleIds),
+                    echelleIds:  Array.from(echelleIds),
+                    pratiqueIds: Array.from(pratiqueIds)
+                },
```

**Ce que ce diff RETIRE** : les trois `db.setSync` des l.752-754 (destruction des collections de travail) ; l'appel `cle('pratiquesConfigurables')` de la l.743 (croisement de namespaces) ; le champ `cartouches: nbCartouchesCopies` (un compte présenté comme un backup).
**Ce qu'il conserve délibérément** : le calcul de `grilleIds`/`echelleIds`/`pratiqueIds`, désormais enregistré comme **métadonnée** `utilises` dans le snapshot. L'information « quels modèles ont servi » a une valeur (statistiques finales, futur élagage explicite) ; ce qui était fautif, c'est de s'en servir pour écrire.
**Sentinelle S4, avec break-test** : peupler `a2025_grillesTemplates` avec deux grilles dont une seule est référencée par une évaluation ; appeler `creerSnapshotRessources('a2025')` avec `h2026` actif ; asserter que `a2025_grillesTemplates` contient **toujours les deux**, et que `a2025_pratiquesConfigurables` est **inchangée**. Muter les deux côtés : remettre un `setSync` filtré → ROUGE ; remettre `cle(...)` en l.743 → ROUGE. Cadre §6 : `db.set` étant synchrone sous Node, forcer `useIndexedDB` avec une fausse connexion (patron `tests/unit/sentinelle-522-pratiques-serialisees.test.js`).

### 6.2 — B2 : l'export cesse de lire le trimestre actif (S4, #622 — même fichier, même session)

```diff
--- a/js/trimestres.js
+++ b/js/trimestres.js
@@ exporterTrimestreArchive
-            // ✅ NAMESPACING (Beta 95.5) - obtenirDonneesSelonMode filtre deja par coursId
-            const etudiants = obtenirDonneesSelonMode('groupeEtudiants');
-            exportData.donnees.etudiants = etudiants.filter(e => coursIds.includes(e.coursId));
-
-            const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees');
-            exportData.donnees.evaluations = evaluations.filter(e => coursIds.includes(e.coursId));
-
-            const presences = obtenirDonneesSelonMode('presences');
-            exportData.donnees.presences = presences.filter(p => coursIds.includes(p.coursId));
-
-            const snapshots = db.getSync(cle('snapshots'), { hebdomadaires: [], interventions: [] });
-            exportData.donnees.snapshots = snapshots;
+            // #619/B2 — RETIRÉ : quatre lectures via obtenirDonneesSelonMode / cle(),
+            // qui passent toutes par le trimestre ACTIF. Elles servaient un export
+            // dont la CIBLE est `id`, un trimestre par construction non actif (on
+            // exporte pour archiver, pour supprimer, ou depuis une ligne inactive).
+            // Deux d'entre elles ÉCRASAIENT en outre des champs que la boucle
+            // CLES_NAMESPACEES ci-dessus avait déjà remplis correctement :
+            // `presences` et `snapshots` sont l'une et l'autre au registre
+            // (trimestres.js:60, 64). Résultat : présences vidées, captures d'un
+            // AUTRE trimestre — dans le fichier qui sert de filet à la suppression
+            // définitive (trimestre-v2-liste.js:398-405).
+            // `donnees.groupeEtudiants`, `donnees.evaluationsSauvegardees`,
+            // `donnees.presences` et `donnees.snapshots` viennent désormais
+            // UNIQUEMENT de `${id}_*`, posés plus haut. Les alias `etudiants` et
+            // `evaluations` sont retirés : ils dupliquaient ces champs sous un
+            // autre nom, avec une valeur fausse.
```

**Ce que ce diff RETIRE** : les l.1131-1142 en entier — quatre lectures et deux écrasements, plus les deux champs alias `etudiants` et `evaluations`.
⚠ **Vérification préalable obligatoire** avant d'appliquer : grepper `donnees.etudiants` et `donnees.evaluations` chez tout consommateur d'un fichier d'archive (`import-export.js`, `reserve-ouvrir.js`, `js/import-*`) — un lecteur qui attend ces noms doit être migré vers `groupeEtudiants` / `evaluationsSauvegardees` **dans le même commit**. Je n'ai pas mené ce grep : il appartient au chantier d'application, et l'annoncer sans l'avoir fait serait le perdre.
**Sentinelle S4** : construire `a2025_presences` et `h2026_presences` distinctes, activer `h2026`, appeler `exporterTrimestreArchive('a2025')`, asserter `donnees.presences === a2025_presences` et `donnees.snapshots === a2025_snapshots`. Break-test : remettre la l.1139 → ROUGE.

### 6.3 — B4 : les cartouches suivent le régime de leur grille (S5, #623 — après S4)

**Trois volets indissociables. Appliqués séparément, les volets (a) et (b) sans (c) font perdre des cartouches au désarchivage.**

**(a) Le routage** :

```diff
--- a/js/trimestres.js
+++ b/js/trimestres.js
@@ cle()
-        if (trimestreId && estTrimestreArchive()) {
-            if (CLES_TEMPLATES_ARCHIVES.includes(nomCle)) { ... }
-
-            // Cas 2: Cartouches (format cartouches_{grilleId})
-            if (nomCle.startsWith('cartouches_')) {
-                const cleArchivee = `${trimestreId}_${nomCle}`;
-                if (db.getSync(cleArchivee, null) !== null) { return cleArchivee; }
-                // Fallback vers la clé globale
-            }
-        }
+        // #619/B4 — RETIRÉ : la branche « copie archivée » des cartouches. Elle
+        // n'avait de sens que parce que la clé courante était GLOBALE : il fallait
+        // dévier vers une copie pour qu'un trimestre archivé garde ses rétroactions.
+        // Les cartouches étant désormais namespacées comme leur grille, le routage
+        // normal (plus bas) rend déjà `<trim>_cartouches_X`, archivé ou non — une
+        // seule vérité, plus de cerveau divisé entre l'éditeur et l'évaluation.
 
-        // Vérifier si c'est une clé globale (jamais namespacée sauf archive)
-        if (CLES_GLOBALES.includes(nomCle) || nomCle.startsWith('cartouches_')) {
+        // Vérifier si c'est une clé globale (jamais namespacée)
+        // #619/B4 — RETIRÉ du test : `|| nomCle.startsWith('cartouches_')`. C'est ce
+        // retour anticipé, PLACÉ AVANT le test CLES_NAMESPACEES, qui rendait la clé
+        // nue — inscrire `cartouches_` au registre n'aurait donc rien changé.
+        if (CLES_GLOBALES.includes(nomCle)) {
             return nomCle;
         }
@@
         if (CLES_NAMESPACEES.includes(nomCle)) {
             return `${trimestreId}_${nomCle}`;
         }
+        // #619/B4 : famille de clés composées `cartouches_<grilleId>` — un registre
+        // d'égalité ne peut pas les énumérer. Même régime que leur grille.
+        if (nomCle.startsWith('cartouches_')) {
+            return `${trimestreId}_${nomCle}`;
+        }
```

Symétriquement dans `cleSource()` : retirer `|| nomCle.startsWith('cartouches_')` de la l.408 et ajouter la même clause après la l.414. La branche l.399-405 **ne change pas** : après migration, la copie existera toujours, et elle sera rendue en premier — comportement identique, pour la bonne raison.

**(b) La migration au boot**, à insérer dans `js/main.js` **après** le bloc `migration_modeles_namespacees_done` (qui se termine l.723) — l'ordre est contraint : la migration a besoin de `<T>_grillesTemplates` peuplée pour savoir quel trimestre possède quelle grille.

```diff
--- a/js/main.js
+++ b/js/main.js
@@ après le bloc migration_modeles_namespacees_done
+        // #619/B4 (S5) — Les cartouches suivent le régime de leur grille.
+        // Règle A-copie : chaque trimestre qui POSSÈDE la grille reçoit sa propre
+        // copie de la collection partagée. Rien n'est retiré tant que la copie
+        // n'est pas confirmée durable (db.flush avant la purge ET avant le flag).
+        if (!db.getSync('migration_cartouches_namespacees_done', false)) {
+            try {
+                const trimestres = db.getSync('trimestres', []) || [];
+                const orphelines = [];
+                const nues = db.keysSync().filter(function (k) { return k.indexOf('cartouches_') === 0; });
+                nues.forEach(function (cleNue) {
+                    const grilleId = cleNue.substring('cartouches_'.length);
+                    const lot = db.getSync(cleNue, null);
+                    if (lot === null) return;
+                    let proprietaires = 0;
+                    trimestres.forEach(function (t) {
+                        if (!t || !t.id) return;
+                        const grilles = db.getSync(t.id + '_grillesTemplates', []) || [];
+                        if (!grilles.some(function (g) { return g && g.id === grilleId; })) return;
+                        proprietaires++;
+                        const cible = t.id + '_' + cleNue;
+                        // Trimestre ARCHIVÉ dont la copie existe : enregistrement figé,
+                        // déjà servi aux écrans d'évaluation. On n'y touche JAMAIS.
+                        if (t.archive === true && db.getSync(cible, null) !== null) return;
+                        // Trimestre vivant : la clé globale est la donnée courante.
+                        if (db.getSync(cible, null) !== null) {
+                            console.warn('[migration cartouches #619] ' + cible + ' existait déjà sur un trimestre non archivé (résidu d\'un cycle archivage/désarchivage) — remplacé par la collection globale vivante.');
+                        }
+                        db.setSync(cible, JSON.parse(JSON.stringify(lot)));
+                    });
+                    if (proprietaires === 0) orphelines.push(cleNue);
+                });
+                if (orphelines.length > 0) {
+                    // Aucune grille d'aucun trimestre ne les réclame : classe des
+                    // orphelines du 24 août. On les CONSERVE telles quelles et on le
+                    // DIT — leur sort appartient à S6 / #542, pas à cette migration.
+                    console.warn('[migration cartouches #619] ' + orphelines.length + ' clé(s) de cartouches sans grille propriétaire, CONSERVÉE(S) en clé nue : ' + JSON.stringify(orphelines));
+                }
+                if (db && typeof db.flush === 'function') { await db.flush(); }
+                // Purge des clés nues APRÈS drainage : une copie non durable ne doit
+                // jamais autoriser la suppression de sa source (patron #358, main.js:709-716).
+                nues.forEach(function (cleNue) {
+                    if (orphelines.indexOf(cleNue) !== -1) return;
+                    db.removeSync(cleNue);
+                });
+                if (db && typeof db.flush === 'function') { await db.flush(); }
+                db.setSync('migration_cartouches_namespacees_done', true);
+            } catch (e) {
+                console.warn('[migration_cartouches_namespacees] erreur — flag NON posé, nouvelle tentative au prochain boot :', e);
+            }
+        }
```

⚠ **Migration de DONNÉES RÉELLES.** Le plan l'impose déjà pour S5 : **sauvegarde préalable PAR COPIE obligatoire** (jamais `git checkout`, jamais l'export automatique — qui est troué tant que §6.2 n'est pas livré ; c'est une raison de plus pour l'ordre S4 → S5).

**(c) Les deux fonctions d'archivage, dans le MÊME commit** :

```diff
--- a/js/trimestres.js
+++ b/js/trimestres.js
@@ creerSnapshotRessources
-            // ✅ AJOUT (28 jan 2026) : Copier les cartouches des grilles utilisées
-            let nbCartouchesCopies = 0;
-            grilleIds.forEach(grilleId => {
-                const cartouches = db.getSync(`cartouches_${grilleId}`, []);
-                if (cartouches.length > 0) {
-                    db.setSync(`${trimestreId}_cartouches_${grilleId}`, cartouches);
-                    nbCartouchesCopies += cartouches.length;
-                }
-            });
+            // #619/B4 — RETIRÉ : la copie global → namespacé. Elle n'existait que
+            // parce que la clé courante était globale. `<trimestreId>_cartouches_X`
+            // est désormais la donnée du trimestre : cette boucle se copierait sur
+            // elle-même. Les cartouches entrent au snapshot comme les grilles.
+            const cartouchesSnapshot = {};
+            grilleIds.forEach(grilleId => {
+                const lot = db.getSync(`${trimestreId}_cartouches_${grilleId}`, []);
+                if (lot && lot.length > 0) cartouchesSnapshot[grilleId] = lot;
+            });
@@ purgerCopiesModelesArchive
-        // Copies de cartouches, une par grille utilisée (mêmes grilleIds qu'à l'archivage).
-        // Les cartouches restent GLOBALES (`cartouches_<grilleId>`) → leur copie
-        // namespacée redevient bien orpheline au désarchivage : on la purge toujours.
-        const { grilleIds } = identifierTemplatesUtilises(id);
-        grilleIds.forEach(grilleId => retirer(`${id}_cartouches_${grilleId}`));
+        // #619/B4 — RETIRÉ : la purge des copies de cartouches. Elle était correcte
+        // tant que les cartouches étaient globales (la copie n'était qu'un doublon).
+        // Namespacées, `<id>_cartouches_<grilleId>` est la SEULE donnée du trimestre
+        // désarchivé : la purger l'effacerait. Exactement la perte que #358/#359 ont
+        // corrigée pour les grilles, dont le bloc ci-dessus garde la trace. Aucune
+        // clé de cartouche ne redevient orpheline au désarchivage : il n'y a plus
+        // rien à purger ici.
```

**(d) Les sites d'accès**, à traiter un fichier à la fois, cadre §13 à chaque pas :
- **Clés littérales** (~24 dans `cartouches.js`, plus `grilles.js:2677/3858`, `import-export.js:2552/2563`, `cc-license.js:1315`, `export-pdf.js` ×9, `productions.js:1493`, `accompagnement.js:537`, `donnees-v2.js:1198/1571`, `partage-validation.js:623`) → envelopper par `cle(...)`. ⚠ `cartouches.js:230` d'abord (Z1-M3) : renommer le `const cle` local, sinon `TypeError`.
- **Énumérations par préfixe** (les quinze de Z1-S1) → comparer sur `<trim>_cartouches_` ou dériver du `cle()` courant. `reserve.js:696` : retirer la passe, la l.660 couvre déjà. `demo-activation.js:213/437` : composer `cle(nom)` à partir du nom du pack.
- **Ne rien changer** : `cleSource` (§2.5), `grilles.js:2423`, `cartouches.js:4276`, les sept lecteurs par `cle()`.
**Sentinelle S5, avec break-test** : deux trimestres portant la même grille ; écrire une cartouche dans H2026 ; asserter qu'A2025 ne la voit pas. Puis archiver puis désarchiver A2025 et asserter que ses cartouches sont **toujours là** — c'est le break-test de (c) : remettre la purge → ROUGE. Cadre §7 : la barre latérale des cartouches et la matrice sont du **rendu** ; Vitest ne les voit pas. Playwright/WebKit ou test manuel consigné, sur Mac **et** iPad.

### 6.4 — M1 + M2 : un seul registre, un bloc mort retiré (S11, #629 — ou absorbé par S4)

```diff
--- a/js/trimestres.js
+++ b/js/trimestres.js
@@ cle() — trimestre archivé
-        if (trimestreId && estTrimestreArchive()) {
-            // Cas 1: Template global (grilles, échelles, pratiques)
-            if (CLES_TEMPLATES_ARCHIVES.includes(nomCle)) {
-                const cleArchivee = `${trimestreId}_${nomCle}`;
-                if (db.getSync(cleArchivee, null) !== null) { return cleArchivee; }
-            }
-        }
+        // #619/M1 — RETIRÉ : la branche « copie archivée » des templates. Les trois
+        // clés de CLES_TEMPLATES_ARCHIVES sont AUSSI dans CLES_NAMESPACEES depuis
+        // #358 : les deux branches rendaient `<trim>_<nom>`, et le repli de celle-ci
+        // tombait sur l'autre. Redondance sans effet, mais deux explications
+        // concurrentes du même routage — et un commentaire qui décrivait encore ces
+        // clés comme « templates globaux », ce qu'elles ne sont plus.
@@ identifierTemplatesUtilises
-        // Collecter les IDs des échelles utilisées (via les grilles ou directement)
         const echelleIds = new Set();
-        const grilles = db.getSync('grillesTemplates', []);
-        grilles.forEach(g => {
-            if (grilleIds.has(g.id) && g.echelleId) {
-                echelleIds.add(g.echelleId);
-            }
-        });
+        // #619/M2 — RETIRÉ : la dérivation des échelles depuis les grilles. Morte
+        // deux fois. (1) La clé nue `grillesTemplates` est vidée au boot par
+        // viderModelesGlobalHerite (l.884-913) : elle ne contient au mieux que des
+        // orphelins non capturés. (2) Aucune grille ne porte plus de champ
+        // `echelleId` — cf. le diagnostic #578, cartouches.js:3250 (29 août 2026) :
+        // la cartouche prend son échelle du FORMULAIRE, jamais de la grille.
         productions.forEach(p => { if (p.echelleId) echelleIds.add(p.echelleId); });
```

**Ce que ce diff RETIRE** : la branche archive de `cle()` (six lignes) ; le bloc de dérivation des échelles (six lignes) ; le commentaire périmé « templates globaux » l.160-161.
**Ce qu'il NE retire PAS** : la constante `CLES_TEMPLATES_ARCHIVES` elle-même, ni son usage dans `cleSource()` l.399 (qui, lui, n'est pas redondant : il donne la priorité à la copie du trimestre SOURCE, ce que la branche l.413 ne ferait pas dans le même ordre), ni son usage comme liste de départ de `purgerCopiesModelesArchive` l.1030. La retirer entièrement casserait la purge.
⚠ **Ce diff est neutre en régime post-#358 seulement.** Il ne doit pas être appliqué avant que §6.1 le soit : tant que l'archivage écrit `[]` dans une clé absente (B1, écriture inconditionnelle), la branche archive de `cle()` masque des cas de repli qu'il faut d'abord fermer.
**Sentinelle** : sur trimestre archivé, `cle('grillesTemplates') === 'a2025_grillesTemplates'` avec ET sans copie présente. Break-test : rétablir un ordre où la branche retirée gagnait → doit rester VERT (c'est la preuve de la redondance).

---

## 7. Angles morts — ce que cette lecture n'établit pas

Mac et iPad séparément. Les cases restent vides : je n'ai rien exécuté.

- **A1 — Volume de la perte à l'archivage (B1).** Combien de grilles et d'échelles de chaque trimestre ne sont référencées par aucune production ni aucune évaluation. Mesurable **sans archiver** (§8). Observé : ______
- **A2 — Le trimestre archivé est-il vraiment en lecture seule (B4-c) ?** Ouvrir la section Cartouches sur un trimestre archivé : l'éditeur est-il accessible, la sauvegarde aboutit-elle, et l'écran d'évaluation du même trimestre montre-t-il alors un autre contenu ? Observé : ______
- **A3 — Divergence des collections de pratiques (B3).** À quel point `a2025_pratiquesConfigurables` et `h2026_pratiquesConfigurables` diffèrent aujourd'hui. Détermine si la substitution de B3 change les notes ou seulement les objets. Observé : ______
- **A4 — Cartouches partagées, manifestation à l'écran (B4).** Modifier une grille homonyme dans un seul trimestre, éditer sa cartouche, basculer : que voit l'autre trimestre ? C'est le test §4.2 de l'audit parent ; le diagnostic T1.2 donne les chiffres, pas l'écran. Observé : ______
- **A5 — Le fichier d'export, ouvert (B2).** Ouvrir un fichier produit par « Exporter » sur une ligne **non active** et lire `donnees.presences` et `donnees.snapshots`. C'est la vérification la moins coûteuse de tout ce rapport, et elle confirme ou infirme le seul INFÉRÉ de B2. Observé : ______
- **A6 — Consommateurs des champs alias.** Le grep annoncé au §6.2 sur `donnees.etudiants` / `donnees.evaluations` : non fait, à faire avant d'appliquer ce diff.
- **A7 — Les quinze énumérations, une par une.** J'ai établi qu'elles filtrent sur le préfixe et ce que le changement de clé leur fait. Je n'ai lu en entier que `reserve.js`, `demo-activation.js` et `cartouches.js:1895`. Les douze autres demandent une lecture individuelle au moment du diff §6.3(d) — le tableau de Z1-S1 est un inventaire, pas une spécification.

---

## 8. Ce que je transmets à `kuekatsheu-bc` pour inscription

Je n'écris ni dans `BACKLOG.md`, ni dans `SESSION.md`, ni dans `RELAIS.md`, ni dans les deux plans. Voici ce qui doit y aller.

**À REPRÉSENTER À GRÉGOIRE CE SOIR — élargissement du moratoire D1.** Question fermée : le moratoire couvre-t-il, jusqu'à la livraison de S4, trois gestes de l'écran Trimestres au lieu d'un ?
  (a) « Archiver » — déjà couvert ;
  (b) « Supprimer… » un trimestre — son filet de sécurité est troué (B2) ;
  (c) « Exporter » sur une ligne **non active** — le fichier n'est pas une sauvegarde fidèle (B2). Sur la ligne du trimestre **actif**, l'export reste correct et utilisable.
C'est un élargissement de périmètre, pas une décision neuve.

**Corrections factuelles à porter aux documents partagés** (les deux disent une chose fausse) :
- `plans de travail/PLAN-modele-objets-conception-2026-08-30.md`, T0.1, option B : « un snapshot de backup existe, trimestres.js:782 » — **faux**, le snapshot n'enregistre que les survivants (§2.2-B1).
- `Rapports/AUDIT-modele-objets-conception-2026-08-30.md` §2.2-B1 : même phrase, et §2.2-B1 dit « ajoute » là où le code **remplace** (§2.2-B3).

**Ordonnancement à inscrire au tableau d'état** :
- **S4 (#622) strictement AVANT S5 (#623)** — Z1-S2 : `purgerCopiesModelesArchive` deviendrait destructive sous D2-A, et le filet d'export doit être réparé avant qu'une migration de données réelles s'appuie dessus. Les deux touchent `trimestres.js` de toute façon.
- **S5 (#623) AVANT S6 (#624)** — B4(d) : sous D2-A, la suppression de `donnees-v2.js:1571` devient correcte sans changer la politique. Dans l'autre ordre, S6 doit écrire une garde inter-trimestres que S5 rendra inutile.
- **S4 absorbe le diff §6.2** (même fichier, même fonction voisine) plutôt que d'ouvrir un item séparé.

**Pour `kuekatsheu-82` (Z2)** : B4(d), `donnees-v2.js:1564-1574` — déjà transmis. Sa cause est dans Z1, son correctif dans Z2.

**Numéro neuf demandé** : le diagnostic complémentaire du §5 (compter, en lecture seule et sans archiver, les modèles de chaque trimestre qui ne survivraient pas au filtre `identifierTemplatesUtilises`) n'a **pas** d'ID. Il donne le chiffre A1 et rend inutile tout archivage jetable. Je ne l'ai pas écrit et je n'ai employé aucun numéro : si Grégoire le veut, `kuekatsheu-bc` inscrit l'ID avant que je l'emploie.

**Cases à cocher** : T1.1 fait, T1.4 fait, T1.5 fait. **T1.2 en attente** de l'exécution par Grégoire — le §3 est à compléter avec son résultat brut. **T1.3 fait par lecture**, sans exécution, moratoire respecté ; la case « archivage sur trimestre jetable » de l'audit parent §4.1 reste ouverte et appartient désormais à la validation **post-S4**.
