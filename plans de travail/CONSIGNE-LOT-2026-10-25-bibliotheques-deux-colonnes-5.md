# Consigne – Les bibliothèques en deux colonnes, lot 5 : les tampons (#1158)

> Écrite par Cowork le dimanche 25 octobre 2026 à 17 h 10 (Toronto). Branche `bibliotheques-deux-colonnes` = `d331c3fa` ; `main` = `9c94f30d`.
> **Font partie de cette consigne** : celles des lots 1 à 4 et leurs verdicts. Ce qui suit ne dit que ce qui change.

## 0. Avant tout

- **Sur la branche**, `main` au repos. Pas de `git stash`. Rituel de début de session.
- **Un commit de docs seul** : ce fichier et `VERDICT-RELECTURE-2026-10-25-bibliotheques-deux-colonnes-4.md` (écrits sur le Mac hors de la branche).
- **D'abord la retouche du lot 4** (son verdict, § 2) : l'aide validée, les deux phrases de la Carte, le plan réécrit. Un commit à part, `fix(bibliotheques)`, qui nomme #1157. **Puis** le lot 5.

## 1. Les tampons : deux colonnes, la palette à gauche

Évaluation › Annoter › bouton de la bibliothèque au bas de la palette (`js/tampons-bibliotheque.js`, `afficherBibliothequeTampons` l. ~305). Mesuré par Cowork : la palette (`tamponsPersonnalises` et les tampons intégrés) et la bibliothèque (`bibliothequeTampons`) sont toutes deux communes à tous les trimestres ; les deux passages **gardent le même `id`** (`partagerTampon`, `ajouterDepuisBibliotheque`). La relation se lit donc par l'`id`, et les états calmes sont possibles.

**Les mots validés par Grégoire** (25 oct., 16 h 55) : colonnes **« Dans ta palette »** et **« Dans ta bibliothèque »** ; passage **« Garder dans ma bibliothèque → »** et **« ← Utiliser dans ma palette »**. Les états calmes suivent le patron : « ✓ Aussi dans ta bibliothèque » et **« ✓ Déjà dans ta palette »** (décidé par Cowork, le patron de « Déjà dans ce trimestre »).

| Aujourd'hui | Dans la nouvelle fenêtre |
|---|---|
| « Partager » sur un tampon (`partagerTampon`) | « Garder dans ma bibliothèque → » ; « ✓ Aussi dans ta bibliothèque » |
| « Ajouter » (`ajouterDepuisBibliotheque`) | « ← Utiliser dans ma palette » ; « ✓ Déjà dans ta palette » |
| ⋮ d'un tampon de la palette : Exporter | ⋮ : « Exporter » (libellé d'aujourd'hui) |
| ⋮ de la bibliothèque : Supprimer (`supprimerDeBibliotheque`) | ⋮ : « Supprimer de ma bibliothèque » |
| « Partager » et « Exporter » sur l'intertitre d'une catégorie (`partagerCategorie`, `exporterCategorie`) | un ⋮ sur l'intertitre de la catégorie : **« Tout garder dans ma bibliothèque »** (la phrase validée, pour la catégorie) et « Exporter » |
| « Importer un fichier JSON », « Exporter la bibliothèque », et la phrase sur les droits des images | « Importer ou exporter ▾ » : « Importer des tampons », « Exporter ta bibliothèque », la note « Fichiers .json », et la phrase d'aujourd'hui « Assure-toi d'avoir les droits sur les images importées. » |
| Sous-titre « Partagez et réutilisez vos collections… » | parti (en-tête sur une ligne, comme ailleurs) |

1. **Regroupés par catégorie dans les deux colonnes**, sous l'intertitre de leur catégorie (l'option `rangee.groupe` des cartouches). Les tampons anciens (`legacy`) restent exclus, comme aujourd'hui.
2. **Les phrases de colonne** : « Les tampons de ta palette, dans Annoter, pour tous tes trimestres. » et « Les tampons que tu gardes pour les retrouver ou les partager. » (proposées par Cowork ; tout autre mot neuf, dans la demande).
3. **La ligne en clair** : ce que l'étiquette disait (« Intégré » pour un tampon de l'application), sans étiquette ; rien pour un tampon personnel, sauf « par <auteur> » s'il y a un auteur qui n'est pas l'utilisateur. **L'aperçu** : le tampon tel qu'il paraît sur une copie, **si le composant peut l'afficher avec un rendu d'image déjà existant** ; sinon, sa description s'il en a une, et pas d'aperçu du tout s'il n'a rien de plus.
4. **À mesurer** : un tampon **intégré** gardé dans la bibliothèque, puis « ← Utiliser » : `ajouterDepuisBibliotheque` ne cherche que dans les tampons personnels. Crée-t-il un doublon d'un tampon intégré dans la palette ? Si oui, c'est une fonction d'avant le lot : **inscris-le**, ne corrige pas ; et l'état « ✓ Déjà dans ta palette » doit, lui, reconnaître les tampons intégrés.

## 2. La phrase de Grégoire, dans la gestion des tampons (validée le 25 oct., 16 h 47)

Dans la fenêtre où l'on gère les tampons et leurs catégories (`js/travaux-outils.js`, le bouton « + Ajouter une catégorie », `ajouterCategorieRetroObs`, l. ~2642), juste sous ce bouton, en texte d'aide (`--texte-secondaire`, pas d'encadré) :

**« Tu enseignes plus d'un cours ? Crée une catégorie par cours pour y ranger ses tampons. »**

Mot pour mot. Un essai qui la lit ; break-test.

## 3. La preuve

Celle des lots précédents : banc neuf dans le vrai `index.html`, depuis la démonstration (Annoter, la palette, sa bibliothèque), à 1 440 et à 820 px ; break-tests ; bancs réancrés, motif écrit (`grep -rlE "afficherBibliothequeTampons|modalBibliothequeTampons|tamponsBibliotheque\.|Mes tampons" tests/`) ; ceux des six autres fenêtres inchangés et verts. En plus : « Garder → » met un tampon dans la bibliothèque et sa rangée de palette dit « ✓ Aussi dans ta bibliothèque » ; « ← Utiliser » le remet dans la palette ; les intertitres de catégorie dans les deux colonnes ; le ⋮ de catégorie. **Captures** : `plans de travail/captures-<date>-bibliotheques-deux-colonnes-5/`, Mac 1 440 clair et sombre, iPad 820 clair, et la gestion des tampons avec la phrase.

## 4. Ce qui n'entre pas

Les cours, trimestres et groupes-cours (lot 6) ; le rangement des tampons par trimestre ou par cours (Grégoire, 16 h 44 : ils restent communs) ; tout geste neuf ; la fusion, les Nouvelles, la porte terrain (fin du lot 6).

## 5. Clôture

- Le commit de la retouche du lot 4, puis un commit `feat(bibliotheques)` qui nomme #1158 ; leurs lignes au plan.
- **Pas de release, ni verdict complet, ni push.** La copie de travail revient sur `main` à la fin, `RELAIS.md` à jour (commit de docs seul).
- **Demande de relecture** : `plans de travail/DEMANDE-RELECTURE-<date>-bibliotheques-deux-colonnes-5.md` : la retouche du lot 4 (dont ce que tu as trouvé pour « le ramène » dans les autres fenêtres) ; le mesuré et le supposé du lot 5 ; § 1.4 ; les bancs réancrés ; tes écarts ; **à part, pour Grégoire : tout mot neuf** (dont les deux phrases de colonne si tu les changes) ; les trouvailles et leur issue.
