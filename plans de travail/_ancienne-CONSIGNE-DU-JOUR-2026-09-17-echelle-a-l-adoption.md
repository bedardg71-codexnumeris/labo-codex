# Consigne suivante – adopter un modèle Standards demande l'échelle (lot 34 : #898)

> Écrite le 17 septembre 2026, 13 h 18 (Toronto), par Cowork, après le push du lot 33 (`932e594a`, 1.142.30).
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` doit montrer **`932e594a` (1.142.30)** ; sinon, arrête-toi et signale-le. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-export-recherche.md` et renomme `plans de travail/CONSIGNE-SUIVANTE-echelle-a-l-adoption.md` en `CONSIGNE-DU-JOUR.md`.
> **Prochain identifiant libre : #909** (dernier utilisé : #908). Relis la ligne « Dernier ID utilisé » sur `main` avant d'en prendre un, et `grep` les DEUX registres.

Mandat : **#898**, tranché par Grégoire le 17 sept. vers 9 h 15, mots choisis. **Aucune question ne l'attend**, sauf la phrase de « Nouvelles » et toute phrase de l'Aide que tu réécrirais.

## 1 · La règle et les mots (#898)

- **Adopter un modèle Standards qui n'a pas d'échelle DEMANDE l'échelle.** Tant qu'aucune échelle n'est choisie, le modèle n'est pas adopté.
- **Texte, tel quel** : **« Ce modèle a besoin d'une échelle de performance pour calculer la note. Choisis-la : »**, suivi de la **liste des échelles du trimestre** et du bouton **« Adopter »**.
- **Écarté par Grégoire** : fixer une échelle dans le gabarit lui-même.
- ⚠ **Ne devine pas l'échelle**, même s'il n'en existe qu'une : la demande est la règle tranchée. `obtenirEchelleResolue()` sans id refuse déjà de deviner quand il y en a plusieurs ; ce n'est pas la sortie retenue ici.

## 2 · Ce que Cowork a lu `[lecture]`, à REMESURER avant de coder

- **Le symptôme** (audit du 16 sept., constat B-1, `[exécuté]`) : les gabarits Standards « N meilleures » et « N plus récentes » n'ont pas d'`echelleId`. Adoptés tels quels, ils ne produisent pas d'instance (« Champ obligatoire manquant : echelle ») : `simulerIndices` rend `null` – **export « non constructible », Comparateur muet** – pendant que le **profil calcule 77,32** par son chemin riche. Deux écrans se contredisent sur le premier geste du labo.
- **Le chemin d'adoption est à MESURER et à NOMMER par toi**, par ce que l'écran affiche, pas par un nom de fonction ni un commentaire : pars de `estGabarit` (`pratiques-gestion.js`, `pratiques-bibliotheque.js`) et de la bibliothèque des pratiques (`data-action="afficherBibliothequePratiques"`, `index.html:~5469`). **Vérifie qu'un appelant vivant existe** pour la fonction que tu modifies : `appliquerModeleSelectionne` (`pratiques-bibliotheque.js:791`) n'a **aucun appelant** hors de son fichier (`grep` sur `index.html` et `js/` : zéro) – si c'est le seul chemin que tu trouves, c'est que le vrai geste est ailleurs : dis-le et cherche.
- **La liste à offrir** : les échelles du trimestre, comme les dropdowns de l'éditeur de pratique, donc `echellesTemplates` filtré sur `dansBibliotheque !== false` (la règle qu'applique déjà `verifierDependancesPratique`, `pratiques-gestion.js:613`). **Le pack porte deux échelles** (« IDME et niv 0 », « IDME 4 niv ») : le cas « plusieurs » est le cas normal.
- **Après le choix**, l'échelle va dans `configuration.echelleId` de la pratique adoptée, et **l'instance se construit** : prouve que `simulerIndices` rend un nombre là où il rendait `null`, et que **l'export et le Comparateur disent la même chose que le profil**. C'est la promesse du lot, pas le fait d'afficher une modale.
- **Les autres familles ne changent pas** : SOM, SPE et DEN s'adoptent comme aujourd'hui, sans question. Un modèle Standards qui PORTE déjà une échelle s'adopte sans question lui aussi.
- **La sortie existante reste** : rouvrir la pratique par l'assistant, qui exige l'échelle (« Choisis une échelle de performance… ») et garde la méthode « récents » depuis 1.142.24. Ne la casse pas.

### ⛔ Arrêt, sur ce que TU peux mesurer
- **Aucune échelle utilisable dans le trimestre** (`echellesTemplates` filtré = vide) : la liste serait vide et le bouton « Adopter » sans objet. **Arrête-toi sur ce cas et rapporte-le** – il demande un mot de Grégoire, pas une phrase inventée. Le reste du lot continue.
- **Si l'adoption d'un gabarit passe par un chemin qui ne peut pas poser de question** (import, activation automatique, pack de démarrage) : nomme-le, ne le change pas, et dis ce qu'il produit aujourd'hui.

## 3 · Au passage, sans mot, sans release si c'est seul

**Les trois essais de comportement dus par la relecture croisée du lot 32** (en tête de la section 1.142.28 de `RELAIS.md`, ajout de 12 h 45). Les mutations **E2b, E3b, E4b** survivent à la suite entière : le filtre des exclus est GARDÉ dans son texte et rendu inopérant (`!estEtudiantExclu(e) || e.statut`) dans `presences-apercu.js`, `snapshots.js` (relevés hebdomadaires) et `graphiques-progression.js` (~2651). Depuis le lot 32, ces filtres portent seuls la promesse « l'exclu reste hors des moyennes du groupe », et **aucun essai de COMPORTEMENT ne les juge**.
⮕ Trois essais, sur un groupe qui a un exclu CALCULÉ : **la moyenne d'assiduité de l'aperçu des présences**, **les moyennes du relevé hebdomadaire**, **la courbe du groupe** sont celles des seuls actifs. **E2b, E3b, E4b doivent rougir** – une assertion sur le texte du filtre ne suffit pas (erreur 16 : une preuve « par le texte » ne juge pas le comportement).

## 4 · Preuve attendue

- Une **sentinelle du lot** : le geste d'adoption d'un modèle Standards sans échelle (la question est posée, rien n'est adopté tant qu'on ne choisit pas), l'adoption après choix (`echelleId` posé, instance construite), **la parité profil / export / Comparateur** sur le même élève, et les familles qui ne changent pas.
- **Des mutations qui changent le CALCUL**, pas seulement le texte : au moins une qui garde la phrase exigée et neutralise le choix de l'échelle.
- **Un banc WebKit** sur le pack démo pour le geste réel (la question paraît, la liste porte les deux échelles, « Adopter » adopte), **mesuré à 768 px**.
- **Porte terrain probable (iPad, Safari)** : si la question s'ouvre dans une modale ou un panneau, dis-le en fin de lot – Cowork prépare la porte pour Grégoire.

## 5 · Mots et traces

- **Phrase de « Nouvelles »** : à proposer à Grégoire (par Cowork) avant la release ; ne l'écris pas de ton chef.
- **Aide** : si une phrase de l'Aide décrit l'adoption d'un modèle, vérifie-la **contre ce que l'écran affiche** avant de la réécrire, et propose les mots plutôt que de les poser.
- **Fichiers de Cowork à commiter avec le lot** : `plans de travail/CONSIGNE-DU-JOUR.md` (cette consigne, renommée), son archive `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-export-recherche.md`, et `CONSIGNE-DEMARRAGE-COWORK.md` si Cowork l'a réécrite d'ici là.
