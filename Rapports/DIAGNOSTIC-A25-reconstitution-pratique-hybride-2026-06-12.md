# Diagnostic — Reconstitution de la pratique A25 (mode hybride) et écart avec le résultat officiel

> **Date** : 12 juin 2026
> **Contexte** : A25 a été le trimestre de transition tableur → Labo Codex. Le tableur n'a
> pas de backup complet (arrêt des mises à jour ~3 semaines avant la fin du trimestre).
> Toutes les données vivent dans Labo Codex, mais la note finale calculée ne concorde pas
> avec le résultat officiel remis en décembre 2025. La pratique reconstituée est en mode
> hybride (meilleurs résultats dans le portfolio + rédaction finale obligatoire).
> **Nature** : enquête de code, LECTURE SEULE. Rien n'est appliqué. Le protocole console
> du §6 est à exécuter par Grégoire sur ses données réelles (Mac, trimestre A25 actif).
> **Méthode** : lecture de `profil-etudiant-actions.js`, `portfolio.js`,
> `pratiques/pratique-pan-standards.js`, `pratiques/pratique-configurable.js`,
> `pratiques-gestion.js` ; skills `SKILL_pratiques_notation` (§5, §6, §10) chargés.

---

## 1. Le symptôme et sa cause structurelle

Le sentiment que « la configuration est difficile à comprendre dans son état actuel » est
fondé : **la pratique hybride n'est pas définie à un seul endroit**. Sa définition est
éclatée entre la config de la pratique (`pratiquesConfigurables`) et **quatre champs portés
par les productions elles-mêmes** (`type`, `categorie`, `ponderation`, `facultatif`).
Changer une production change silencieusement la pratique, et inversement. C'est la source
des « liens non explicites » constatés.

S'ajoute un second problème : **deux moteurs hybrides coexistent et ne calculent pas la
même chose** (§3). Selon l'écran consulté (note de session du profil vs indice P du tableau
de bord), la « note finale » affichée peut différer pour le même étudiant avec les mêmes
données. Avant de comparer quoi que ce soit au résultat officiel de décembre, il faut
savoir **lequel des deux chiffres on regarde**.

---

## 2. Chaîne de calcul réelle — chemin « note de session » du profil

C'est `calculerDetailsNoteFinale(da)` (`profil-etudiant-actions.js`) qui produit la note
riche du profil. En mode hybride (config `categories.actif`), étape par étape :

1. **Pool d'artefacts** (`_obtenirArtefactsIdsPortfolio`) : les productions
   `type === 'artefact-portfolio'`, en excluant la terminale. **Fallback** : s'il n'y en a
   aucune, prend les productions à pondération 0/absente (hors `portfolio` et terminale).
2. **Filtrage des évaluations** (`_filtrerEvaluationsArtefactsValides`) : exclut les
   remplacées par reprise (`remplaceeParId`), les sans-note, et les statuts d'intégrité
   `plagiat`/`ia`.
3. **Répartition par catégorie** (`_selectionnerArtefactsHybride`) : pools constitués par
   `production.categorie === 'selection' | 'obligatoire'`. Une production du pool
   d'artefacts **sans `categorie` est silencieusement ignorée** (ni dans un pool ni dans
   l'autre).
4. **Sélection** : les N meilleures du pool Sélection
   (`categories.selection.nombreARetenir`), toutes les Obligatoires.
5. **Règle « obligatoire non remise = 0 »** : appliquée **seulement si
   `configuration.notesFinales` est coché** (mode finale). Le dénominateur des
   obligatoires devient alors le nombre TOTAL de productions `categorie === 'obligatoire'`
   (toutes productions confondues, voir piège L6 au §4). En mode provisoire, les
   non-remises sont ignorées.
6. **Moyenne portfolio** : `(moySélection × pondSel + moyObligatoires × pondObl) / (pondSel + pondObl)`
   avec les pondérations de `categories.selection.ponderation` / `categories.obligatoires.ponderation`.
7. **Plafonnement conformité** : si le nombre d'artefacts évalués < `portfolio.minimumCompletion`
   et que `reglesConformite.actif`, la moyenne est plafonnée (ou mise en échec) selon le déficit.
8. **Agrégation avec la terminale** : la production `type === 'terminale'` est cherchée ;
   la note finale = `portfolio × pondPortfolio + terminale × pondTerminale`, où les
   pondérations viennent de **`production.ponderation` sur la production conteneur
   `type:'portfolio'` et sur la production terminale** — PAS de la config de la pratique.
   Pondérations manquantes → erreur de configuration, note `null`.
9. Terminale non évaluée → la note affichée = moyenne du portfolio seule (« provisoire »).

## 3. Le second chemin — indice P (tableau de bord, snapshots)

L'indice P passe par `PratiquePANStandards.calculerPerformance` (et, pour une pratique
configurable STD `conversion_niveaux`, par `indicesCP.actuel.PAN.P` qui en dérive). En mode
hybride, ce chemin délègue à **`calculerNoteAvecCategories`** (`portfolio.js`), qui diverge
du chemin du profil sur cinq points :

| Aspect | Profil (`calculerDetailsNoteFinale`) | Indice P (`calculerNoteAvecCategories`) |
|---|---|---|
| Pool considéré | artefacts `type:'artefact-portfolio'` seulement | **toutes** les productions ayant une `categorie` |
| Plagiat / IA | exclus | **inclus** |
| Obligatoire non remise | 0 seulement si `notesFinales` coché | **0 toujours** |
| Terminale | agrégée à part, pondérations des productions | **aucune agrégation** — la note = sélection % + obligatoires % ; la terminale ne compte que si elle porte une `categorie` (alors moyennée à poids égal dans son pool) |
| Plafonnement conformité | appliqué | **absent** |

De plus, hors mode hybride, ce chemin identifie la terminale par une **heuristique
différente** du profil : « première production à `ponderation > 0` qui n'est ni
`portfolio` ni `artefact-portfolio` » (avec défauts 60/40 si pondérations absentes), alors
que le profil exige `type === 'terminale'`. Les deux chemins peuvent désigner **deux
productions différentes** comme terminale.

**Conséquence pour A25** : si la note comparée au résultat officiel est l'indice P (tableau
de bord) plutôt que la note de session du profil, l'écart peut venir entièrement de cette
divergence de moteurs, sans qu'aucune donnée ne soit fausse.

---

## 4. Inventaire des liens implicites productions ↔ pratique

C'est la réponse directe à « il y a des liens qui ne sont pas explicites ». Tous vérifiés
à la lecture du code :

- **L1 — `production.type === 'portfolio'`** : production conteneur ; sa `ponderation`
  fixe le poids du portfolio dans la note finale (chemin profil).
- **L2 — `production.type === 'terminale'`** : identifie la rédaction finale pour le
  chemin profil ; sa `ponderation` fixe le poids de la terminale. Une rédaction finale
  typée `travail` n'est **pas** vue comme terminale par le profil.
- **L3 — heuristique terminale du chemin P** : `ponderation > 0` et type ≠
  portfolio/artefact-portfolio. Toute production pondérée « ordinaire » peut être promue
  terminale à l'insu de l'enseignant.
- **L4 — `production.type === 'artefact-portfolio'`** : appartenance au pool du
  portfolio (chemin profil) ; fallback sur pondération 0/absente si aucun type ne matche.
- **L5 — `production.categorie` (`selection`/`obligatoire`)** : posée par les checkboxes
  de l'écran de pratique (`pratiques-gestion.js`), mais **stockée sur la production**, pas
  dans la config de la pratique. Elle ne voyage donc pas avec la pratique (export,
  duplication, reconstruction) — en reconstituant A25, il a fallu re-cocher ces cases, et
  rien ne signale celles qui manquent. Une production sans catégorie est invisible au
  calcul hybride.
- **L6 — terminale cochée « obligatoire » = zéro fantôme** : le dénominateur des
  obligatoires en mode finale compte TOUTES les productions `categorie === 'obligatoire'`
  (y compris la terminale et les types hors pool), mais leurs évaluations ne peuvent
  jamais entrer dans le pool (filtrées en amont). En mode finale, une terminale aussi
  cochée « obligatoire » ajoute donc un **0 permanent** à la moyenne des obligatoires.
  Piège analogue pour toute production obligatoire dont le type n'est pas
  `artefact-portfolio`.
- **L7 — `configuration.notesFinales`** : bascule la règle « non remise = 0 ». Pour un
  trimestre TERMINÉ comme A25, ce flag doit être coché, sinon les étudiants qui ont sauté
  une obligatoire obtiennent une note plus haute que l'officielle.
- **L8 — `portfolio.minimumCompletion` + `reglesConformite`** : plafonnement par déficit
  d'artefacts évalués, chemin profil seulement.
- **L9 — `statutIntegrite` et `remplaceeParId`** sur les évaluations : exclusions du
  chemin profil ; le chemin P n'exclut que les remplacées.

---

## 5. Causes plausibles de l'écart avec le résultat officiel (par ordre de probabilité)

1. **On ne compare pas le bon chiffre** (§3) : note de session du profil ≠ indice P. À
   trancher en premier — le protocole du §6 affiche les deux côte à côte.
2. **Productions sans `categorie`** (L5) : artefacts reconstitués mais jamais re-cochés
   dans Sélection/Obligatoires → silencieusement hors calcul.
3. **`notesFinales` non coché** (L7) : règles « non remise = 0 » inactive → notes trop
   hautes pour les étudiants à obligatoires manquantes.
4. **Terminale mal typée ou doublement cochée** (L2/L6) : rédaction finale typée
   autrement que `terminale` (jamais agrégée), ou typée `terminale` ET cochée
   « obligatoire » (zéro fantôme en mode finale).
5. **Pondérations portfolio/terminale** (L1/L2) : elles vivent sur les productions, pas
   dans la pratique — une reconstitution de la pratique ne les restaure pas. Vérifier
   qu'elles correspondent au plan de cours A25 (ex. 60/40).
6. **`nombreARetenir` / pondérations Sélection-Obligatoires** différents de ceux du
   tableur (la pondération unitaire affichée dans l'écran de config peut induire en
   erreur : le calcul réel est une moyenne de pool, pas une somme de poids unitaires).
7. **Méthode du tableur ≠ méthode de l'app** : le tableur calculait peut-être les
   « meilleurs » sur un autre pool, gérait les reprises autrement (meilleure tentative vs
   récence — l'app retient le **dernier essai non remplacé**), ou arrondissait
   différemment (arrondi par travail vs arrondi final).
8. **Plafonnement conformité** (L8) actif avec un `minimumCompletion` différent d'A25.
9. **Statuts plagiat/IA ou reprises** (L9) saisis différemment entre le tableur et l'app.

---

## 6. Protocole console — décomposition lecture seule (5 min)

**Pré-requis** : Mac, trimestre **A25 actif**, le bon groupe-cours actif, pratique A25
assignée au groupe-cours. Le script ne fait que lire et afficher.

```js
(function diagnosticA25() {
    const out = (t, v) => console.log('%c' + t, 'font-weight:bold', v);

    // 1. Pratique active et config
    const pratiqueId = obtenirPratiqueActiveGroupeCours();
    const cfg = obtenirConfigPratiqueActive();
    out('Pratique active :', pratiqueId);
    out('Config :', cfg);
    out('Mode hybride (categories.actif) :', !!(cfg && cfg.categories && cfg.categories.actif));
    out('notesFinales (« obligatoire non remise = 0 ») :', !!(cfg && cfg.notesFinales));

    // 2. Productions : état des liens implicites
    const productions = obtenirDonneesSelonMode('productions') || [];
    console.table(productions.map(p => ({
        titre: p.titre || p.activiteApprentissage || p.id,
        type: p.type || '(absent)',
        categorie: p.categorie || '(aucune)',
        ponderation: (p.ponderation === undefined || p.ponderation === null) ? '(absente)' : p.ponderation,
        facultatif: !!p.facultatif
    })));

    // 3. Terminale vue par chaque chemin
    const termProfil = productions.find(p => p.type === 'terminale') || null;
    const termP = productions.find(p => p.ponderation > 0 && p.type !== 'portfolio' && p.type !== 'artefact-portfolio') || null;
    out('Terminale (chemin profil, type=terminale) :', termProfil ? termProfil.titre : 'AUCUNE');
    out('Terminale (chemin indice P, heuristique) :', termP ? termP.titre : 'AUCUNE');
    if ((termProfil && termProfil.id) !== (termP && termP.id)) {
        console.warn('⚠ Les deux chemins ne désignent PAS la même terminale.');
    }
    if (termProfil && termProfil.categorie === 'obligatoire') {
        console.warn('⚠ La terminale est AUSSI cochée « obligatoire » → zéro fantôme en mode finale (piège L6).');
    }

    // 4. Productions invisibles au calcul hybride
    if (cfg && cfg.categories && cfg.categories.actif) {
        const horsPools = productions.filter(p =>
            p.type !== 'portfolio' && p.type !== 'terminale' &&
            !(p.type || '').endsWith('-formatif') && !p.categorie);
        if (horsPools.length) {
            console.warn('⚠ Productions SANS catégorie (ignorées par le calcul hybride) :',
                horsPools.map(p => p.titre || p.id));
        }
        const oblHorsPool = productions.filter(p =>
            p.categorie === 'obligatoire' && p.type !== 'artefact-portfolio' && p.type !== 'portfolio');
        if (oblHorsPool.length) {
            console.warn('⚠ Obligatoires HORS pool d\'artefacts (zéro fantôme possible en mode finale) :',
                oblHorsPool.map(p => p.titre + ' (type ' + p.type + ')'));
        }
    }

    // 5. Décomposition par étudiant : note profil vs indice P
    const etudiants = obtenirDonneesSelonMode('groupeEtudiants')
        || db.getSync(cle('groupeEtudiants'), []) || [];
    const lignes = [];
    etudiants.forEach(et => {
        const da = et.da || et.DA || et.numeroDA;
        if (!da) return;
        let det = null, sim = null;
        try { det = calculerDetailsNoteFinale(da); } catch (e) { det = { erreur: e.message }; }
        try { sim = (typeof simulerIndices === 'function') ? simulerIndices(da) : null; } catch (e) { /* noop */ }
        lignes.push({
            etudiant: ((et.prenom || '') + ' ' + (et.nom || '')).trim() || da,
            notePortfolio: det && det.portfolio && det.portfolio.moyenne != null ? det.portfolio.moyenne.toFixed(2) : '—',
            noteTerminale: det && det.terminal && det.terminal.note != null ? det.terminal.note : '—',
            noteProfil: det && det.noteFinale != null ? det.noteFinale.toFixed(2) : (det && det.erreur ? 'ERREUR' : '—'),
            indiceP: sim && sim.P != null ? Number(sim.P).toFixed(2) : '—',
            plafonnee: !!(det && det.portfolio && det.portfolio.plafonnement && det.portfolio.plafonnement.actif),
            provisoire: !!(det && det.estProvisoire)
        });
    });
    console.table(lignes);
    console.log('Comparer la colonne qui correspond au résultat officiel de décembre.');
    console.log('Si noteProfil ≠ indiceP pour les mêmes étudiants : divergence des deux moteurs (§3 du rapport).');
})();
```

**Lecture des résultats** :
- Une colonne `provisoire: true` pour tout le monde → la terminale n'est pas vue (L2).
- `noteProfil` proche de l'officiel mais `indiceP` décalé (ou l'inverse) → cause n° 1.
- Avertissements « sans catégorie » / « zéro fantôme » → causes n° 2 et n° 4.
- Tout est cohérent mais l'écart persiste → causes n° 6-7 (paramètres ou méthode du
  tableur) ; comparer alors un seul étudiant à la main avec `det.portfolio.artefactsRetenus`
  (le script peut être relancé puis `calculerDetailsNoteFinale('1234567')` inspecté).

---

## 7. Rendre la configuration du portfolio explicite dans une pratique STD (proposition à trancher)

Le redesign demandé (« il faudra certainement revoir la configuration du portfolio dans
une pratique STD ») devrait, en cohérence avec le principe zéro-dette et
`SKILL_hygiene_donnees_partagees` (filtrer par identité, jamais par flag) :

1. **Faire de la pratique la propriétaire de ses liens** : la config STD référence les
   productions **par identité** —
   `configuration.portfolio.artefactIds`, `configuration.categories.selection.productionIds`,
   `configuration.categories.obligatoires.productionIds`,
   `configuration.terminale: { productionId, ponderation }`,
   `configuration.portfolioPonderation`. Les champs `categorie` et les pondérations
   portfolio/terminale **quittent les productions** (retrait, pas alias). La pratique
   devient auto-portante : exportable, duplicable, reconstituable sans re-cocher quoi que
   ce soit.
2. **Un seul moteur hybride** : `calculerNoteAvecCategories` (portfolio.js) est retiré ;
   l'indice P dérive du même calcul que la note de session (P = noteFinale/100, comme le
   fait déjà `simulerIndices` pour STD). Les cinq divergences du §3 disparaissent ;
   golden master sur les notes H2026 avant/après.
3. **Écran « Construction de la note »** : une vue qui liste chaque production avec son
   rôle effectif (pool sélection, obligatoire, terminale, hors calcul) et signale les
   états dangereux (sans rôle, zéro fantôme, pondération manquante) — l'inverse des liens
   silencieux actuels.

**Points d'attention** :
- Changement de format de données (`pratiquesConfigurables` + retrait de
  `production.categorie`) → migration des trimestres réels (A25, H2026) et
  **version majeure** : à confirmer avec Grégoire avant.
- Coordination avec **#319** (refonte assistant de pratique — l'étape catégories de
  l'assistant écrit ces liens) et **#328 L2-c** (jetons) ; le chantier devrait s'inscrire
  au BACKLOG comme item dédié (prochain ID : #339).
- ~46 lecteurs de `production.categorie` et des pondérations à auditer (mêmes réflexes
  que #328 L2-b2).

## 8. Trimestre archivé : nature réelle du verrou et déblocage (ajout 12 juin)

A25 est archivé (`trimestre.archive === true`) → bandeau LECTURE SEULE + classe
`mode-archive` sur le body. Constats de lecture :

- **Le verrou est purement UI** : des règles CSS (`index.html`, bloc
  `body.mode-archive:not(.mode-ecriture-temp)`) désactivent boutons et champs. **Aucune
  garde `estTrimestreArchive()` dans le moteur** : `calculerEtStockerIndicesCP`,
  `calculerDetailsNoteFinale` et les recalculs tournent déjà sur un trimestre archivé.
  Les notes affichées aujourd'hui pour A25 sont donc **déjà** des recalculs du moteur
  de juin sur les données A25 — pas les chiffres de décembre. Les seuls témoins
  réellement figés de décembre sont : l'export JSON généré à l'archivage
  (`trimestre-a2025-archive-AAAA-MM-JJ.json`, fichier téléchargé), les
  `statistiquesFinales` du registre, et les snapshots hebdomadaires.
- **Deux déblocages intégrés existent déjà** :
  1. Bandeau LECTURE SEULE → case **« Permission d'écriture »** (mode écriture
     temporaire, prévu pour corrections ponctuelles ; se réinitialise au changement de
     trimestre).
  2. Réglages → Trimestres → **« Désarchiver »** (réversible — le bouton « Archiver »
     re-verrouille ; `statistiquesFinales` est conservé comme référence historique).
- **Subtilité templates archivés** : en mode archivé, `cle()` redirige
  `pratiquesConfigurables`/`grillesTemplates`/`echellesTemplates`/`cartouches_*` vers les
  copies `a2025_…` si elles existent (créées à l'archivage seulement depuis la version du
  28 jan 2026). A25 ayant été monté puis archivé dans une version antérieure, vérifier où
  vit réellement sa pratique (le script du §6 affiche `pratiqueId` + config résolus).

**Doublon de trimestre : n'existe pas dans l'app.** Faisable mais c'est un chantier réel,
pas un correctif : id hors schéma session-année (`a2025` est pris ; un id `[a-z]\d{4}`
libre fonctionnerait avec le namespacing), copie des ~30 clés `CLES_NAMESPACEES`,
réécriture des références internes (`groupesCours[].trimestreId`, liens cours),
enregistrement au registre, et interaction avec la purge #336 (toute clé `^[a-z]\d{4}_`
absente du prochain codex ouvert est signalée orpheline → le bac à sable serait proposé à
la purge). À inscrire au BACKLOG si désiré (prochain ID libre).

**Chemin recommandé pour expérimenter sans risque** (sans doublon) :
1. Backup codex (réflexe existant) ; si l'export d'archive de décembre est introuvable,
   générer MAINTENANT un export du trimestre (bouton « Exporter », actif même archivé)
   pour figer l'état courant avant toute manipulation.
2. Désarchiver A25 (réversible).
3. Expérimenter par **duplication de la PRATIQUE** (bouton « Dupliquer » de la
   bibliothèque) + **simulation lecture seule** (`simulerIndices`, Comparateur #307) :
   c'est le mécanisme conçu exactement pour « essayer une variante sur les mêmes données
   sans toucher aux résultats ». Basculer la pratique active du groupe-cours seulement
   quand la variante concorde avec l'officiel de décembre.
4. Réarchiver.

## 9. Ce que ce rapport ne fait pas

Aucun code modifié, aucune donnée touchée. La reconstitution A25 elle-même (ajuster la
config jusqu'à concorder avec l'officiel) requiert le terrain du §6 avec les données
réelles ; le redesign du §7 requiert les décisions de Grégoire (périmètre, version
majeure, coordination #319).
