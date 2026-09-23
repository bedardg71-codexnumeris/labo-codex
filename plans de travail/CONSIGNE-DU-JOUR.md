# Consigne du jour – La barre « Assiduité (A) » du Suivi du groupe dit pourquoi elle est vide (#830)

> Écrite le 23 septembre 2026, soir (Toronto), par Cowork, sur `origin/main` = `642ce374` (1.156.0 en ligne).
> La précédente (#895, livrée en 1.156.0) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-23-lot-895-une-carte-exporter.md` (déplacée par Cowork, à commiter avec ce lot).
> **La fiche fait foi** : `BACKLOG.md`, #830, dernier sous-point « Ce qui reste, inscrit ». Symptôme VÉCU par Grégoire le 11 sept. (quatre sondes pour trouver ce qu'un texte aurait dit).

## 0 · Le geste, en une phrase

Dans Suivi du groupe, quand des présences existent pour le groupe mais qu'aucune séance de l'horaire ne porte son nombre de périodes, la barre « Assiduité (A) » affiche une phrase au lieu d'une barre nue.

## 1 · La phrase – VALIDÉE par Grégoire le 23 sept. 2026, mot pour mot

> Assiduité non calculée : aucune séance de l'horaire ne porte son nombre de périodes. Tu peux le saisir dans Cadre › Trimestre › Horaire.

(Le chemin « Cadre › Trimestre › Horaire » est celui qu'emploient déjà l'aide et `cc-license.js` ; l'accordéon s'appelle « Horaire » dans la barre de convergence de la section Trimestre – mesuré par Cowork, `index.html` ≈ l. 6192.)

## 2 · Ce que Cowork a mesuré (lecture seule, à REMESURER avant de coder)

- `js/tableau-bord-apercu.js`, `afficherMetriquesGlobales` (≈ l. 1621) : l'assiduité « connue » se juge par `assiduite !== null` depuis le lot D (≈ l. 1720-1726) ; un texte d'attente existe déjà pour A (`texteAttenteA`, ≈ l. 1706 : « N séances en attente ») et part dans `genererBarreDistribution(…, texteAttente, nbTotal)` (≈ l. 1931). C'est vraisemblablement le bon endroit : un cas de plus pour ce texte, pas un second mécanisme. **Toi seul départages** après mesure.
- La condition exacte est à mesurer, pas à deviner : « des présences existent pour le groupe ET aucune séance de l'horaire n'a de nombre de périodes ». L'écran Horaire compte déjà « N sans nombre de périodes » (`trimestre-v2-horaires.js` ≈ l. 293) : lis sa source pour ne pas écrire une seconde définition de « séance sans périodes ». Rappel : depuis 1.131.1, `obtenirSeancesHoraire` projette `horaire.periodesParSeance` sur les séances qui n'ont pas la leur – un horaire au format déclaré n'est donc PAS dans ce cas.
- Cas à distinguer, et à dire dans ton rapport : (a) aucune présence saisie du tout → comportement actuel inchangé ; (b) présences, mais certaines séances seulement sans périodes → hors de ce lot (la barre se calcule sur les autres) : dis ce qu'elle affiche, sans corriger ; (c) présences, aucune séance avec périodes → la phrase.

## 3 · Limites

- Aucune donnée écrite. Lecture seule sur les présences et l'horaire.
- Un seul fichier de code attendu (`tableau-bord-apercu.js`), plus le banc. Si la mesure exige d'en toucher un autre, dis pourquoi en une ligne et continue si c'est technique.
- Pas de lien cliquable vers l'Horaire : la phrase nomme le chemin, c'est tout ce qui est validé. Un lien serait un autre lot.
- La bulle « A — » et le filtre « A ou C < 70% » (1.147.0) ne bougent pas.

## 4 · Preuve attendue

- Un banc WebKit qui monte le cas (c) – présences + horaire sans aucune période – et lit la phrase dans la barre A, mot pour mot ; et le cas (a) qui ne l'affiche pas. Si le moteur de ces cas est une fonction pure, un essai Vitest en plus.
- Break-tests : condition inversée, phrase retirée – chacune rouge.
- « Nouvelles » : patch 1.156.1. **Proposition de Cowork, à soumettre à Grégoire avant le push** : « Suivi du groupe : quand aucune séance de l'horaire ne porte son nombre de périodes, la barre Assiduité le dit et indique où le saisir, au lieu de rester vide. »
- Relecture croisée de Cowork avant la fusion (règle 2 du PROTOCOLE), puis verdict, fusion, push. À la livraison : #830 se coche (c'était son dernier reste) ; retire-la de `FILE-DES-LOTS.md` si elle y figure.

## 5 · Porte terrain

Une seule rangée possible, et seulement si Grégoire a encore un trimestre dont l'horaire n'a aucune période saisie : ouvrir le Suivi de ce groupe et lire la phrase. Sinon, aucune porte (il ne crée pas de données fictives).
