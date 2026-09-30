# Consigne suivante – chantier des archives, lot de mesure (aucun code, aucune release)

> Écrite le 30 septembre 2026 à 10 h 56 (Toronto) par Cowork. **À exécuter après le lot J0 ter**, quand 1.171 est en ligne. Lis d'abord `CADRAGE-2026-09-30-codex-et-archives-coherence.md`, dont le § 8 porte les décisions de Grégoire.
> **Lecture et mesure seulement** : aucun fichier de `js/` n'est modifié, rien n'est livré. Tu rends `plans de travail/MESURE-2026-09-30-archives.md`.

## 1 · Ce que pèse chaque trimestre dans le codex réel

Sur le dernier fichier de codex de Grégoire (iCloud, lecture seule ; ni déplacé, ni ouvert dans l'application, aucun nom de copie ni d'étudiant·e relevé) : pour chaque trimestre et chaque groupe-cours, le nombre de copies et leur poids, et le poids des données. C'est ce qui dit combien l'archivage rend. Dis aussi combien de copies portent déjà l'état « exporté » ou « manquant ».

## 2 · Ce que « Archiver… » fait aujourd'hui sous Safari, à grande taille

Au banc du lot J0 (500 copies fictives aux tailles réelles, WebKit, `footprint`) : mémoire de la page, disque posé avant écriture, durée, et l'issue de l'écriture (le partage est-il refusé après une préparation longue ?). Hypothèse de Cowork, lue au code et non mesurée : même mur qu'au codex d'avant le lot J0, parce que `verserGroupeCours` confie les copies à JSZip.

## 3 · Trois questions de lecture, à trancher par le code puis par un essai

1. « Ouvrir une archive… » sait-elle remettre des **copies** dans un trimestre, ou seulement des ressources (grilles, échelles, productions, cartouches) ?
2. Qu'est-ce qui pose aujourd'hui `blobStatut: 'exporte'` sur une copie, et ce geste est-il encore atteignable à l'écran ?
3. Une archive relue peut-elle être **vérifiée** copie par copie avec ce qui existe (empreinte des données, `meta.json`, compte de fichiers), ou faut-il y ajouter une empreinte par copie ?

## 4 · L'inventaire du mot « archivé »

Tout texte que l'usager lit et qui emploie « archive », « archivé », « archiver », « désarchiver » : fichier, ligne, texte actuel, et laquelle des deux notions il désigne (l'état clos, ou le dépôt). Pour chaque texte qui désigne l'état clos, propose le texte avec « clos », « clore », « rouvrir ». **Ne change rien** : ces mots sont à Grégoire, il corrigera ta table. Les noms internes du code (`archiverTrimestre`, `mode-archive`) ne sont pas à renommer ; note seulement où ils prêtent à confusion.

## 5 · Ce que tu rends à Grégoire

Quatre lignes : le poids de chaque trimestre ; ce qu'« Archiver… » donne à grande taille ; les trois réponses ; le nombre de textes à renommer.
