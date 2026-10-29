# Consigne – La fusion voit 127 conflits qui n'existent pas (29 octobre 2026, retouche de #1182)

> Écrite par Cowork le jeudi 29 octobre 2026 à 17 h 52 (Toronto, mesuré par `date`), sur `main` = `origin/main` = `746426c2` (1.225.0 en ligne). **Urgent** : Grégoire attend cette retouche pour fusionner. Passe avant le lot des copies aux archives. Un seul lot qui écrit à la fois.
> **Retour de Grégoire (17 h 49, capture, Chrome, 1.225.0)** : sur le Mac, « Fusionner avec un codex… » avec le codex de l'iPad annonce « Viendront de l'autre codex : 18 évaluations, 18 annotations, 18 mesures du chronomètre et 4 autres données » (juste), puis « Différent des deux côtés (127) » : une annotation, trois évaluations d'« Artefact 5 », des dizaines de copies d'« Artefact 1 »… Il a annulé (4) : rien n'est écrit.

## 1. Ce que Cowork a mesuré (les témoins)

Les deux fichiers écrits juste avant la fusion (iCloud Drive › Téléchargements) : `codex-…-2026-10-29-17h46.zip` (Mac — Chrome, 1.225.0, l'espace d'ici au moment de la fusion) et `codex-…-2026-10-29-17h45.zip` (iPad — Safari, 1.225.0, le fichier choisi). Comparés en Python, par `id`, à contenu égal (clés triées) **et** à l'octet près :

- éléments présents des deux côtés et différents : **3**, tous dans `a2026_fichiersTravaux` (les trois copies attendues) ; aucune évaluation, aucune annotation ;
- l'annotation `ANN_1789577624951` de la capture : **identique** des deux côtés ; les trois évaluations d'« Artefact 5 » communes aux deux côtés : **identiques** ; `h2026_fichiersTravaux` : 0 différence.
- clés de données différentes : `personnalisationObservations`, `retroactionsObservations`, `preferencesRythme` (attendues).

Une fusion juste montre donc **6 conflits**, pas 127. La fonction pure appliquée aux deux fichiers (ta mesure du lot) le confirme : elle ne voit pas le défaut, parce qu'un fichier passe par le JSON.

## 2. La cause (inférence forte, lue au code ; non observée dans son navigateur)

L'externe vient du JSON du codex ; l'ici vient d'IndexedDB (`db.get`, `actionFusionner`). Les deux sont comparés par `_jsonStable` (`js/codex.js:~2173`), qui **ne suit pas la sémantique du JSON** :

- une propriété qui vaut `undefined` (IndexedDB la garde, le JSON du codex la retire) donne `"k":undefined` d'un côté et rien de l'autre → différent ;
- une `Date` (objet sans clés propres) donne `{}` ici et sa chaîne là-bas → différent.

Le code en pose : `evaluation-jetons.js:630-631` (`dateModification: undefined`), et d'autres. Le codex de 17 h 46 a été écrit par `JSON.stringify` des mêmes `db.get`, une minute avant : c'est pourquoi les fichiers sont égaux.

## 3. La correction (décision de Cowork, technique)

**Comparer comme le codex écrit** : `_jsonStable` suit la sémantique de `JSON.stringify` (propriété `undefined`, fonction ou symbole : absente ; dans une liste : `null` ; `toJSON` respecté, donc une `Date` devient sa chaîne), clés triées comme aujourd'hui. Vaut pour tous ses usages (conflits, union par contenu du chronomètre, comptes de l'aperçu). Mesure s'il reste ailleurs dans la fusion une comparaison qui ne passe pas par elle ; dis-le. **Ne réécris aucune donnée** : la fusion compare, elle n'a pas à nettoyer les `undefined` d'ici (le stock reste, sans conséquence).

## 4. Les tests

- Sentinelle `sentinelle-1182-…` : un élément d'ici qui porte une propriété `undefined`, un autre une `Date`, et le même élément venu d'un JSON → **identiques, aucun conflit** ; une vraie différence reste un conflit. Rouge avant la correction.
- Le banc WebKit `codex-1182-…` : un élément d'ici écrit **par IndexedDB** avec une propriété `undefined` (c'est ce qui a manqué au banc : ses données d'ici étaient déjà « propres ») → « Fusionner » n'annonce aucun conflit.
- Break-test (arbre restauré par sha256) : l'ancienne `_jsonStable` → les deux rougissent.
- Vitest depuis `tests/`.

## 5. Clôture

Demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-29-fusion-retouche-valeurs-indefinies.md`, courte. Un commit pour le code, un pour les docs. **Puis arrête-toi** : Cowork relit, et la mise en ligne (1.225.1, sans nouvelle entrée aux Nouvelles : celle de 1.225 décrit déjà ce que la fusion doit faire) part au signal de Grégoire.
