# Consigne suivante — saisir un résultat obtenu APRÈS le trimestre (#913)

> Écrite le 17 septembre 2026, 16h31 (Toronto), par Cowork.
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` doit montrer une version PLUS RÉCENTE que `1.142.32` portant #912 (la synthèse sans copie). Si #912 n'est pas poussé, **arrête-toi et dis-le** : ce lot ne se met pas devant un lot en cours. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-synthese-sans-copie.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> ⚠ `CONSIGNE-SUIVANTE-date-d-arrivee.md` (#735) reste en file DERRIÈRE celle-ci.
> **Identifiant** : relis « Dernier ID utilisé » sur `main` (elle était à **#912**) avant d'en prendre un ; `grep` les deux registres.

---

## 1 · Le contexte, en trois phrases

Grégoire reçoit de la Direction des études, à chaque fin de trimestre, les **résultats de ses anciens élèves dans les cours qui suivent son 101** (102, 103…). Les élèves ont donné leur accord explicite à la DÉ pour cette transmission. Il veut pouvoir, plus tard, mettre en rapport ce que son 101 observe (indices, présences, critères, relevés hebdomadaires) et ce que ces élèves obtiennent ensuite.

**Ce lot ne fait PAS cette analyse.** Il pose la seule pièce qui manque : **un endroit où déposer un résultat obtenu après le trimestre, et sa sortie dans l'export de recherche.** Aucun calcul, aucun graphique, aucune statistique. Cadrage complet : `plans de travail/CADRAGE-2026-09-17-resultats-ulterieurs-101-102.md`.

**Une seule note finale par cours**, pas le détail : c'est tout ce que la DÉ transmet. **Saisie à la main** par Grégoire : le fichier de la DÉ est fait à la main et change de forme à chaque trimestre — **n'écris aucun lecteur de fichier.**

## 2 · Ce que Cowork a lu `[lecture]` — À REMESURER AVANT DE CODER

- **Un trimestre passé est en lecture seule** : `body.mode-archive` (index.html l. 1148-1162) neutralise boutons, `input`, `textarea` et `select`, sauf une liste d'exceptions. **Une écriture temporaire existe déjà** : `checkbox-ecriture-temp` (index.html l. 4011) → `basculerModeEcritureTemp` (`js/trimestres.js:2796`) pose `body.mode-ecriture-temp`, que toutes les règles de `mode-archive` excluent. ⮕ **Le geste se branche là. Ne crée aucun mécanisme de déverrouillage neuf.**
- **Le patron de rangement à suivre existe** : `notesRapport` (#866, 15 sept.) — un objet `{ [da]: … }` **namespacé par trimestre**, déclaré dans `CLES_NAMESPACEES` (`js/trimestres.js`, vers l. 124), **sans semis** (contenu propre à l'utilisateur, le pack démo n'en pose pas, un trimestre neuf part vide).
- **L'export de recherche** : `exporterFormatRecherche` (`js/trimestres.js:1988`) sort le trimestre ACTIF. Les élèves y sortent sous `observations.etudiants[]` avec `id_anonyme` et un bloc `profil`. `meta.version_format` vaut `'1.1'`.
- ⛔ **L'écran d'accueil de la saisie n'est PAS mesuré.** Deux candidats : la liste du Cadre (`js/trimestre-v2-etudiants.js`) et l'écran « Liste des étudiant·es » (`js/etudiants.js`). **Mesure lequel des deux rend les élèves ligne par ligne ET reste atteignable sur un trimestre archivé**, et pose le geste là. Dis lequel, et pourquoi.

## 3 · Ce que le lot doit tenir

1. **Sur un trimestre passé, chaque élève peut porter zéro, un ou plusieurs résultats ultérieurs.** Trois champs, pas un de plus : **le cours**, **le trimestre où il l'a suivi**, **la note finale**.
2. **Trente saisies doivent être rapides.** Ligne par ligne dans une liste, pas un profil à ouvrir trente fois. Si l'écran retenu ne s'y prête pas, **dis-le et arrête-toi** plutôt que d'inventer un écran.
3. **Le cours et le trimestre sont du texte libre.** Pas de liste fermée de sigles (on ne connaît pas les programmes des autres), et **surtout pas un identifiant de trimestre de l'application** : ce trimestre-là n'existe pas chez lui, c'est un cours donné par quelqu'un d'autre.
4. **La note est un nombre de 0 à 100**, une décimale admise. Une saisie hors bornes ou non numérique n'est pas écrite, et l'écran le dit.
5. **Retirer un résultat est possible** — c'est une saisie manuelle, donc une faute de frappe est certaine.
6. **Rien ne s'écrit sans l'écriture temporaire** sur un trimestre archivé. Contrôle comme au lot #911 : sur un trimestre archivé SANS écriture temporaire, les données du trimestre sont **identiques octet pour octet** après l'ouverture de l'écran.
7. **L'export ressort ces résultats**, sous l'élève anonymisé, en additif : `observations.etudiants[].resultats_ulterieurs: [{ cours, trimestre, note }]`. `meta.version_format` passe à `'1.2'`. **Le DA ne sort jamais** — la clé de rangement est le DA, la sortie est `id_anonyme`, comme tout le reste du fichier. Un élève sans résultat ultérieur sort avec une liste vide, jamais avec un champ absent.

## 4 · Les mots — PROPOSÉS PAR COWORK, à remplacer par ceux de Grégoire s'il les corrige

- Titre de la zone : **« Résultats ultérieurs »**
- Sous-titre : **« Les notes obtenues par cet élève dans les cours suivants. »**
- Champs : **« Cours »** (exemple affiché : 601-102-MQ) · **« Trimestre »** (exemple : H2026) · **« Note finale »**
- Bouton : **« Ajouter »**
- Refus de saisie : **« La note doit être un nombre entre 0 et 100. »**
- Sur un trimestre archivé sans écriture temporaire : **« Active l'écriture temporaire pour ajouter un résultat. »**

⚠ **Ces mots sont de moi, pas de lui.** S'il en a corrigé un dans le message de relais, **c'est sa version qui va au code**, et en UN seul endroit (une constante, pas six littéraux).

## 5 · Cas d'arrêt — rapporte et arrête-toi, n'invente pas

- Aucun des deux écrans candidats ne rend les élèves ligne par ligne sur un trimestre archivé.
- L'écriture temporaire n'est pas atteignable sur l'écran retenu (la case vit ailleurs).
- Un élève du trimestre n'a pas de DA (la clé de rangement tombe).

## 6 · La preuve exigée

- **Une sentinelle Vitest** : la forme rangée, la namespacing par trimestre (un résultat saisi en A2024 n'apparaît pas en H2026), le refus d'une note hors bornes, le retrait, et **la sortie de l'export** (`resultats_ulterieurs` présent, liste vide quand il n'y a rien, `version_format` à `'1.2'`, **aucun DA dans le fichier produit** — verrou structurel sur le JSON rendu).
- **Des mutations qui CHANGENT le comportement en gardant le texte exigé** : la clé lue sans `cle()` (namespace sauté) ; les bornes inversées ; l'export qui écrit le DA au lieu de l'`id_anonyme` ; l'écriture qui passe malgré `mode-archive` sans écriture temporaire. Toutes doivent rougir.
- **Un banc WebKit** sur le vrai écran : ajouter deux résultats à un élève, en retirer un, mesuré **à 768 px** (iPad) ; cibles tactiles à 44 px au moins.
- **Le contrôle octet pour octet** du point 6 de la section 3.

## 7 · Ce que ce lot NE fait PAS

Aucun lecteur de fichier Excel ou CSV. Aucun calcul, aucune corrélation, aucun graphique, aucun seuil. Aucun écran d'analyse. Aucun export multi-trimestres. **Et surtout : ne touche à aucun seuil d'`interpretation-config.js`** — le commentaire « validation 101→102 » sous `defiSpecifique: 0.70` est en cause dans un autre dossier (`plans de travail/RELECTURE-2026-09-17-analyse-101-102-de-2025.md`), et une décision de Grégoire y est due.

## 8 · Sécurité, règles non négociables

`echapperHtml()` sur **« Cours » et « Trimestre »** : ce sont des textes libres saisis par l'utilisateur, rendus dans une liste. Zéro handler inline (`data-action`). Zéro `console.log`. La clé neuve entre dans `CLES_NAMESPACEES` avec son commentaire daté, **sans semis démo**.

## 9 · À la livraison

Inscris la fiche (**#913** si elle est libre) et mets à jour la ligne « Dernier ID utilisé » dans le même commit. **Phrase de « Nouvelles » : à demander à Grégoire, ne l'invente pas.** Fichiers de Cowork à commiter avec le lot : cette consigne renommée, son archive, `plans de travail/CADRAGE-2026-09-17-resultats-ulterieurs-101-102.md`, `plans de travail/RELECTURE-2026-09-17-analyse-101-102-de-2025.md` et `plans de travail/RELECTURE-2026-09-17-lot-34.md`.
