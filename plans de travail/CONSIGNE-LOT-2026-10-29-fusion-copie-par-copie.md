# Consigne – Fusionner deux codex copie par copie (29 octobre 2026)

> Écrite par Cowork le jeudi 29 octobre 2026 à 14 h 33 (Toronto, mesuré par `date`), sur `main` = `origin/main` = `d2f43d38` (1.224.0 en ligne).
> **Passe AVANT** `CONSIGNE-LOT-2026-10-29-codex-copies-aux-archives.md`, qu'elle ne remplace pas : Grégoire est bloqué, ses évaluations sont réparties entre deux appareils. Si l'autre lot est déjà commencé, finis-le d'abord. Un seul lot qui écrit à la fois (les deux touchent `js/codex.js`).
> Besoin de Grégoire (29 oct., 14 h 25) : réunir le codex du Mac et celui de l'iPad, évalués chacun de leur côté depuis le même codex (`…-2026-10-27-15h30.zip`).

## 0. Avant tout

- Rituel de début de session ; aucune suite qui tourne.
- Fiche au `BACKLOG.md` (prochain numéro libre). Commit de docs seul : ce fichier et la fiche.

## 1. Ce que Cowork a mesuré (les témoins)

Trois fichiers de Grégoire (iCloud Drive › Téléchargements), lus en lecture seule par `python3` : l'ancêtre commun `codex-601-101-A26-A25H26-2026-10-27-15h30.zip` (Mac), `…-2026-10-29-14h08.zip` (Mac), `…-2026-10-29-14h11.zip` (iPad). Écarts par élément (par `id`) depuis l'ancêtre :

| Clé | Mac | iPad | Même élément touché des deux côtés |
|---|---|---|---|
| `a2026_evaluationsSauvegardees` | +3 | +14 | 0 |
| `a2026_annotationsTravaux` | +4 | +14 | 0 |
| `a2026_fichiersTravaux` | 1 modifiée | 2 modifiées | 0 |
| `a2026_chronoEvaluations` (sans `id`, 200 entrées de chaque côté) | changée | changée | à mesurer |
| `a2026_indicesCP`, `a2026_indicesPatternsRaI` (objets par DA, calculés) | 28 / 27 sous-clés | 28 / 27 | toutes |

S'y ajoutent des réglages d'affichage (`elementsMasques`, `monitorage-build-vu`, `profilOngletDeveloppementActif`, d'autres côté iPad). **Aucun élément disparu, ni d'un côté ni de l'autre.** Une fusion juste donne **151 évaluations et 164 annotations, sans aucun conflit** sur ces clés.

## 2. Pourquoi « Fusionner » perd aujourd'hui (lu au code, non reproduit)

1. **Par clé entière.** `_analyserFusion` (`js/codex.js:2286`) compare des clés ; `_resoudreConflits` (l. 2543) garde le local OU l'externe, par clé. Les deux côtés ont changé `a2026_evaluationsSauvegardees` : une des deux séries disparaît.
2. **L'ancêtre est faux entre deux appareils.** C'est le dernier codex écrit ou ouvert sur l'appareil qui fusionne (`_ecrireSnapshotAvant` à l'ouverture, l. 1020, et après l'écriture, `_marquerCodexAJour`, l. 1590). Sur le Mac il vaut 14h08, qui contient déjà ses 3 évaluations : le Mac se voit « inchangé », l'iPad « modifié », et la fusion prend la liste de l'iPad **sans annoncer de conflit**. Les 3 du Mac disparaissent en silence. Même mécanique pour toute clé que l'appareil a changée avant son dernier enregistrement.
3. **Les fichiers ne lisent que la première liste.** `.find(… 'fichiersTravaux')` aux l. 2828 (`_fusionnerTravaux`), 4052 (`actionFusionner`) et 4209 (`actionComparer`) : le défaut H5, corrigé dans `genererCodex` par `_clesDesListesDeFichiers`. Avec le codex de l'iPad, les 394 fichiers d'H2026, aux archives sur le Mac, seraient réimportés sur le Mac (1,1 Go).

## 3. Ce que fait la fusion après ce lot

**Décision de Grégoire (29 oct., 14 h 36)** : un élément présent d'un seul côté est **gardé** ; la fusion n'efface rien. (Il n'a aucune évaluation supprimée.) Faire voyager les suppressions d'un appareil à l'autre, ce sera « plus tard » : inscris-le dans la fiche comme suite possible, sans le faire.

**Décisions de Cowork (techniques)** :

1. **Par élément**, pour toute clé dont la valeur est une liste d'objets à `id` (évaluations, annotations, fiches des copies, bibliothèques…) : union par `id`. Identique des deux côtés : un seul. Différent des deux côtés : conflit **de cet élément**, montré avec ce qui le nomme à l'écran (production, étudiant·e ; jamais dans un rapport ni un test), résolu par les stratégies existantes. Ces clés n'ont pas besoin d'ancêtre. Ordre : celui du local, puis les ajouts de l'externe.
2. **Les listes sans `id`** (`chronoEvaluations` ; mesure s'il y en a d'autres) : mesure qui les écrit et leur règle (le plafond de 200 ?) ; union par le contenu de l'entrée, puis la règle de l'écrivain.
3. **Les valeurs calculées** (`indicesCP`, `indicesPatternsRaI`, et ce que `docs/DATA-OWNERSHIP.md` dit calculé) : ni local ni externe, elles se recalculent après la fusion par leur module propriétaire. Mesure si le recalcul se fait déjà au retour à l'écran ou s'il faut l'appeler ; dis lequel.
4. **Plus aucune prise silencieuse fondée sur l'ancêtre de l'appareil** pour les autres clés d'un trimestre (objets, valeurs simples) : si les deux côtés diffèrent, elles sont montrées. Les réglages d'affichage de l'appareil (clés non rattachées à un trimestre, à lister en mesurant) gardent la valeur locale sans question. Rapporte la liste des deux familles telle que tu l'as tranchée.
5. **Les fichiers** : toutes les listes (`_clesDesListesDeFichiers`, aux trois endroits). Un fichier que la marque locale `_copiesAuxArchives` dit aux archives n'est pas importé. Une copie à la corbeille d'un côté et dans les travaux de l'autre va à la corbeille : la corbeille se reprend, rien n'est perdu.
6. **La fin de la fusion dit ce qui est entré**, en mots d'utilisateur (« 14 évaluations et 14 annotations venues de l'autre codex »), pas en clés. Propose les mots dans la demande de relecture.

## 4. Les tests

- Vitest depuis `tests/`, si la fusion par élément sort en fonction pure (souhaité) : ancêtre commun + deux côtés (+3 / +14, **noms fictifs**) → 17 ajouts ; même `id` différent → un conflit de cet élément ; **l'ancêtre de l'appareil égal à son propre dernier état → ses 3 évaluations restent** (le cas silencieux d'aujourd'hui : rouge avant le correctif). La liste sans `id` ; la corbeille ; un fichier aux archives non importé.
- Un essai Playwright ciblé (WebKit), on attend l'élément, jamais `waitForTimeout` : deux codex construits par le test, « Fusionner » → le nombre d'évaluations attendu et la phrase de fin.
- **Break-test** (arbre restauré par sha256) : remettre la décision par clé → le cas silencieux rougit ; remettre `.find` → le cas des fichiers rougit.
- **Sur les fichiers réels, en lecture seule, comptes seulement** (aucun nom dans un rapport, rien de commité) : la fonction pure appliquée aux `donnees.json` de `…14h08.zip` (local) et `…14h11.zip` (externe) doit rendre 151 évaluations, 164 annotations et zéro conflit sur ces deux clés. Si iCloud Drive t'est fermé, dis-le : Cowork refera la mesure.

## 5. Clôture

Demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-29-fusion-copie-par-copie.md` : la fonction de fusion, les deux familles de clés du § 3.4, le recalcul des valeurs calculées, les mots de fin, le résultat sur les fichiers réels. Un commit pour le code, un pour les docs. Release, verdict et push au signal de Grégoire : ce lot le débloque, Cowork lui proposera la mise en ligne dès la relecture.

**Geste à vérifier à l'écran après la mise en ligne** : sur le Mac (Chrome), d'abord menu Codex › « Mettre à jour le codex » (la sauvegarde d'avant) ; puis « Fusionner » avec `…-2026-10-29-14h11.zip` : aucun conflit n'est annoncé pour les évaluations, la fin dit combien d'évaluations sont venues de l'iPad, et les copies évaluées sur l'iPad montrent leur évaluation sur le Mac.
