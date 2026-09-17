# Consigne suivante – la date d'arrivée (lot 35 : #735, lot D du dépistage, premier volet)

> Écrite le 17 septembre 2026, 13 h 22 (Toronto), par Cowork, pendant le lot 34 (#898), après l'accord de Grégoire sur le champ.
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` doit montrer la version du **lot 34 (#898)** ; sinon, arrête-toi et signale-le. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-echelle-a-l-adoption.md` et renomme `plans de travail/CONSIGNE-SUIVANTE-date-d-arrivee.md` en `CONSIGNE-DU-JOUR.md`.
> **Identifiant libre** : relis la ligne « Dernier ID utilisé » sur `main` (elle était à #908 le 17 sept. à 13 h) et `grep` les DEUX registres avant d'en prendre un.

Mandat : **#735**, tranché par Grégoire le 16 sept. (17 h 18-17 h 21), mots choisis le 17 au matin. **Aucune question ne l'attend**, sauf la phrase de « Nouvelles » et toute phrase de l'Aide que tu réécrirais.

⚠ **PÉRIMÈTRE : le premier volet du lot D seulement.** Les deux autres volets – **#743** (avant la première présence notée, l'assiduité est INCONNUE : un tiret partout) et **#750** (les deux moyennes A du groupe s'accordent) – **ne sont PAS dans ce lot** : ils touchent le contexte, les snapshots, le filtre « A ou C », et les deux moyennes du groupe. Découpage décidé par Cowork pour tenir un lot d'un seul geste. Si ta mesure montre qu'un de ces deux volets est INSÉPARABLE de la date d'arrivée, **dis-le et arrête-toi sur ce point** plutôt que de l'emporter au passage.

## 1 · La règle et les mots (#735)

- **Une date d'arrivée FACULTATIVE sur la fiche de l'élève.** L'assiduité se compte **à partir de cette date**. Sans date saisie, **rien ne change** – c'est la condition de Grégoire.
- **Aucune donnée existante n'est réécrite.**
- **Mots, tels quels** :
  - libellé du champ : **« Date d'arrivée »** ;
  - bulle d'aide : **« Facultatif : pour un·e étudiant·e arrivé·e en cours de trimestre. L'assiduité se compte à partir de cette date. »**
- **Où** : le formulaire d'ajout et d'édition d'un élève, à côté de DA, Nom, Prénom, Groupe, Programme, SA (`index.html`, `id="v2-formEtudiant"`, vers 7021-7046). **Vérifie que c'est bien l'écran vivant** (le formulaire que le bouton d'ajout et le bouton d'édition ouvrent tous les deux) avant d'y écrire quoi que ce soit.

## 2 · Ce que Cowork a lu `[lecture]`, à REMESURER avant de coder

- **Aucun champ de date n'existe sur un élève** : `grep -rn "dateAjout\|dateInscription\|dateArrivee\|dateEntree" js/*.js` ne rend rien qui porte sur un élève (mesure de la fiche, à refaire). Le nom de la clé est à toi ; choisis-le et dis-le.
- **Le calcul** : `calculerAssiduite(da, dateLimite)` (`js/indices.js:147`) est la fonction canonique unique. Elle construit `dates` en filtrant les séances du groupe (`seancesCompletes` × `datesSaisies`) sur `d > aujourdhui` et sur la saisie du jour. **C'est là que la borne du bas manque** : une date d'arrivée écarte les séances antérieures, du dénominateur comme du numérateur.
- **Ses appelants** (`grep`, à revérifier) : `indices.js:279` (le magasin `indices.sommatif`), `indices.js:471` (le repli de lecture), `snapshots.js:195` (relevés hebdomadaires, avec `dateLimite`). **Un seul calcul, donc un seul endroit à borner** – prouve qu'aucun autre chemin ne recompte les présences à sa façon.
- **L'import d'élèves** (fichier du SRAM, import CSV, pack démo) : dis s'il peut porter une date d'arrivée, et ce qu'il fait d'une colonne absente. N'invente pas de format.
- ⚠ **Une date d'arrivée POSTÉRIEURE à des présences déjà saisies** : mesure ce que ça donne (des séances saisies pour cet élève tombent hors du compte) et rapporte-le. Ne tranche pas la règle pédagogique ; la règle du 16 ne dit rien de ce cas.

### ⛔ Arrêt, sur ce que TU peux mesurer
- **Si borner `calculerAssiduite` change l'assiduité d'un élève SANS date d'arrivée**, sur le pack démo, arrête-toi : la condition de Grégoire est « sans date saisie, rien ne change ».
- **Si un relevé hebdomadaire déjà écrit se met à dire autre chose** qu'avant pour un élève sans date : arrête-toi et rapporte (les snapshots gardent leur valeur ; ce qui change, c'est la prochaine capture).

## 3 · Preuve attendue

- **Une sentinelle du lot** : un élève arrivé en semaine 6 d'un trimestre de 15 semaines – son assiduité ne compte que les séances à partir de sa date (numérateur ET dénominateur), calculée à la main dans l'essai avant le code ; le même élève **sans** date : valeur identique à aujourd'hui ; une date d'arrivée antérieure à toute séance : sans effet.
- **Des mutations qui changent le CALCUL** : au moins une qui garde la borne dans le texte et la rend inopérante (`d >= dateArrivee || true`), une qui borne le numérateur sans le dénominateur.
- **Un banc WebKit** sur le pack démo : le champ paraît dans le formulaire d'ajout ET d'édition, se ressaisit après enregistrement, et l'assiduité affichée au profil change pour l'élève qui porte la date. **Mesuré à 768 px** (le formulaire a déjà six champs).
- **Porte terrain probable (iPad, Safari)** : un champ de date se saisit mal sur iPad si le type de champ ne s'y prête pas – dis lequel tu as posé, et Cowork prépare la porte pour Grégoire.

## 4 · Mots et traces

- **Phrase de « Nouvelles »** : à proposer à Grégoire (par Cowork) avant la release ; ne l'écris pas de ton chef.
- **Aide** : la section qui décrit l'assiduité dit peut-être comment les séances sont comptées. Vérifie-la **contre ce que l'écran calcule** ; propose les mots, ne les pose pas.
- **Fiche #735** : la ligne à cocher et la mention « livré » sont à toi ; les volets #743 et #750 restent OUVERTS et le lot D du cadrage reste ouvert – écris-le dans le même commit.
- **Fichiers de Cowork à commiter avec le lot** : cette consigne renommée et son archive.
