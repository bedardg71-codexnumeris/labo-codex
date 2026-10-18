# Consigne – la dissection, lot 2a : créer sa grille en points depuis ses étiquettes

> Écrite par Cowork le dimanche 18 octobre 2026 à 8 h 11 (Toronto, mesuré par `date`). Plan : `PLAN-2026-10-18-la-dissection-pour-lundi.md`, étape 2, première moitié (« d'abord les grilles en points »). Les grilles en niveaux sont le lot 2b. Règles 2 et 7 de `PROTOCOLE.md`.

## Ce que l'enseignant fait à la fin de ce lot

Il a étiqueté sa grille. Sous « Ta grille, telle que l'application la comprendrait », un bouton « Créer ma grille ». Il le touche : sa grille est rangée dans Grilles de critères, et la confirmation qu'il connaît s'affiche (le nom, le nombre de critères, « sur N points », « La voir dans Grilles de critères », « Aller plus loin avec ta grille »). Il l'ouvre dans Grilles de critères et il y retrouve ses critères, ses sous-critères, ses réponses et leurs points, dans ses mots.

## Ce que Cowork a mesuré (à remesurer avant d'écrire)

- `materielCreation.creer(m)` construit par `materielAssistant.construire(m, ctx)`, ajoute sans rien modifier, défait en cas d'échec, refuse sans trimestre ouvert ou dans un trimestre clos. **C'est le seul chemin d'écriture** : aucun écrivain neuf.
- `construireGrilleEnPoints` : grille et critères `analytique`, la pondération est le maximum de points, sous-critères à la forme de l'éditeur, descripteurs dans `descripteurs.parNiveau` **sans** `echelleId` (pas d'échelle, #941), clés au nom du niveau. Grilles de critères affiche la clé en titre (`rendreAttenduNiveaux`). Le schéma de partage borne `parNiveau` à 20 clés de 5 000 caractères.
- `materielAssistant.calculs(m).manquants` dit déjà, en mots, ce qui empêche de créer une grille en points (pondération hors de 0 à 100 ou non entière, plus de 50 critères, noms trop longs, plus de 30 sous-critères…).
- 1.203 préfixait la partie au nom du critère : `Partie – Critère`, avec la casse de la règle 8.16 de Grégoire (`materielLecture.casseDePartie`).
- La lecture de la dissection (`comprendre`) rend, par critère : `nom` (ou `auto` et `numero` s'il est à nommer), `section`, `desc`, `sous`, `pond` ou `pondDeduite`, `niv` (descripteurs et points par niveau), `reponses` (sans niveaux : texte et points).

## Ce qu'il faut

1. **De la lecture au modèle, en fonction pure, testée.** `R` (et son `bilan`) devient le modèle que `construire` sait écrire en points (`enPoints`). Réutilise `construire` ; s'il ne peut pas recevoir les réponses sans niveaux, ajoute ce cas à `construireGrilleEnPoints` **sans changer ce qu'il produit pour l'assistant** (ses bancs restent verts tels quels). La correspondance :
   - Titre → nom de la grille ; Description hors critère → `description` de la grille.
   - Critère → critère ; Section → préfixe `Section – ` avec `casseDePartie` ; un critère à nommer prend « Critère N » (son numéro de la lecture), texte provisoire.
   - Description d'un critère → sa description ; Élément observable → ses sous-critères, dans l'ordre.
   - Pondération écrite, sinon celle tirée des points → `ponderation`.
   - **Avec des niveaux nommés** (logique « les deux ») : une clé par niveau, **au nom du niveau tel qu'écrit** (décision de Grégoire, 7 h 31) ; le texte est le ou les descripteurs du niveau, puis, sur une ligne à part, ses points tels que l'enseignant les a écrits (« 3-4 »). Les points ne se convertissent pas, ils restent sous ses yeux.
   - **Sans niveaux** (des réponses en lignes) : une clé par réponse, ses points tels qu'écrits (« 2 », « 0,5 ») ; une réponse sans points prend « Réponse N » ; deux clés identiques se distinguent par « (2) ». Clés provisoires.
   - Rien d'inventé : pas de niveau, pas d'échelle, pas de cartouche.
2. **Quand « Créer ma grille » est possible.** La logique lue est « des points » ou « les deux » (des points par défaut, décision de 7 h 31). Il est refusé, avec sa raison écrite à côté du bouton, quand : aucun Titre n'est étiqueté ; un morceau étiqueté est « sans place » (la liste est déjà à l'écran : rien ne disparaît en silence) ; `calculs(m).manquants` n'est pas vide (ses mots, tels quels) ; un critère dépasse 20 réponses ou niveaux. Une grille **seulement en niveaux** : à la place du bouton, une ligne qui dit que la création des grilles en niveaux arrive bientôt (texte provisoire). Le total qui ne tombe pas juste n'empêche pas de créer : le constat est déjà affiché.
3. **L'écriture et la confirmation** : `materielCreation.creer`, puis l'écran de confirmation existant (`materiel.js`, avec « Aller plus loin avec ta grille ») ; « Coller une autre grille » y reste. Un échec affiche le message de `creer`, et la dissection reste intacte pour réessayer.
4. **La trouvaille 1 de ta demande de relecture du lot 1, tranchée par Cowork** : une « Suite » complète le dernier **texte** lu. Points et Pondération ne la remettent plus à zéro (ce sont des nombres, pas du texte à continuer). Banc : (b) avec les points sur la première rangée et la « Suite » sur la seconde, aucun morceau sans place.
5. **Les bancs.** Vitest sur les grilles fictives (a), (b), (c) : le modèle, puis l'objet construit (critères, pondérations, sous-critères, clés et textes de `parNiveau`, préfixe de section, « Critère N ») ; chaque refus du point 2 ; un collage piégé dont le texte arrive tel quel dans l'objet, jamais interprété. Une spec WebKit : l'exemple fictif, étiqueté par les événements DOM, créé, puis retrouvé dans Grilles de critères avec ses critères et son total ; à 820 px, le bouton fait au moins 44 px et la page ne défile pas de côté. Break-tests : la garde du « sans place », la ligne des points sous le descripteur, la « Suite » après des points.

## Ce qu'il ne faut pas

- Ne modifier aucun objet existant ; rien n'est effacé (règle de Grégoire du 20 sept.).
- Pas de grille en niveaux, d'échelle ni de cartouche : lot 2b.
- Aucune zone protégée ; pas de numéro de version (étape 4).

## Livrer

Un commit sur `main` ; Vitest complet vert ; la spec neuve et les specs touchées vertes dans WebKit ; la demande de relecture courte `plans de travail/DEMANDE-RELECTURE-2026-10-18-dissection-2a.md` : ce que tu as réutilisé et étendu, les textes d'écran neufs (pour l'inventaire de l'étape 3), ce que tu as supposé. **Puis arrête-toi.**
