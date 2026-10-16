# Consigne – « Apporter mon matériel », lot 1 : le modèle, l'onglet et la lecture d'une grille collée

> Écrite par Cowork le 16 octobre 2026 à 14 h 14 (Toronto, mesuré par `date`). **Remplace la version du 15 oct.**, jamais exécutée (aucune trace au dépôt à 14 h 13 : rien dans `js/config.js`, aucun module neuf). À exécuter maintenant.
> **Lis d'abord** `plans de travail/CADRAGE-2026-10-15-apporter-mon-materiel.md` (décisions, suppositions, lots) **puis** `plans de travail/PROTOTYPE-2026-10-16-apporter-mon-materiel.dc.html` : le prototype validé par Grégoire le 16 oct. à 14 h 13. C'est la **référence de comportement et de textes** ; ce n'est PAS du code à copier (composant de maquette, hors de l'architecture de l'app : pas de `db`, pas de `cle()`, pas de `echapperHtml`). Sa logique de lecture (`lireHtml`, `lireTexte`, `interpreter`, `inverser`, `etapesPour`, `calculs`) est le point de départ des fonctions pures de ce lot.
> ⛔ Aucun nom d'élève ni de collègue dans ce que tu écris au dépôt. Exemples : la grille fictive « Exposé oral » du prototype, ou des critères inventés.
> Skills : `labo-codex`, `design-interface`, `integrite-globaux`, `securite-donnees`, `verification-adverse`.

## Où on en est

Dépôt `labo-codex` (historique purgé ce matin). `main` à `eb6dd86e` à 14 h 13 : **remesure** avant de toucher. Une seule session écrit dans `js/`.

## Le parcours visé, sur trois lots

Conception s'ouvre sur « Apporter mon matériel » → la personne colle sa grille Word ou Pages (ou essaie l'exemple, ou tape à la main) → un **assistant** lui pose, une à la fois, seulement les questions que son document ne règle pas (Sens du tableau, Nature des cases, Plages de notes, Pondération, À classer), avec l'aperçu du tableau toujours visible → la vérification finale (tableau complet, modifiable) → « Créer » → confirmation. Chaque étape se termine par un encadré « Dans l'application » qui nomme le concept (grille de critères, descripteurs ou cartouche de rétroaction, échelle de performance, pondération).

- **Lot 1 (ce lot)** : le modèle, l'onglet, l'accueil de l'onglet, la lecture du collage, l'aperçu.
- **Lot 2** : l'assistant et la création (grille, échelle, et cartouche si les cases sont des rétroactions), la confirmation. Consigne à venir de Cowork.
- **Lot 3** : les mots relus par Grégoire, les liens vers la barre latérale de chaque outil (l'objet créé sélectionné), les Nouvelles, la release.

## Ce que Grégoire verra à la fin du lot

Il ouvre Conception : « Apporter mon matériel » s'affiche en premier, avec le texte d'accueil du prototype, la zone de collage et les boutons « Essayer avec un exemple » et « Taper ma grille à la main ». Il colle une grille copiée dans Word ou clique sur l'exemple : l'aperçu de ce que l'application a reconnu s'affiche (critères, niveaux et leurs plages, pondérations, descripteurs, passages « À classer »), chaque valeur marquée « repris », « complété » ou « à remplir ». Rien n'est encore créé : l'assistant et le bouton « Créer » viennent au lot 2.

## Le mandat

### 1. Le modèle : un descripteur par critère et par niveau

- Mesuré par Cowork le 15 oct. (à remesurer) : le critère n'a qu'une `description` (`js/grilles.js` ~310-323) ; l'échelle a une `description` par niveau, commune à tous les critères (`js/echelles.js` ~53-117) ; seule la cartouche croise critère × niveau, pour des commentaires (`js/cartouches.js` ~697).
- Ajoute au critère un champ de descripteurs par niveau, lié à l'échelle pour laquelle ils ont été écrits (forme à ton choix, par exemple `descripteurs: { echelleId, parNiveau: { <code>: texte } }`). Absent = aucun descripteur : **aucune migration, aucune réécriture des grilles existantes.**
- **Ce qui voyage** : le schéma de partage est fermé (`js/partage-schemas.js`, `grille.criteres` ~215) ; déclare le champ, avec des bornes de taille. Mesure codex, export, import d'un autre trimestre : le champ doit les traverser. Registre `docs/DATA-OWNERSHIP.md` si une clé change.

### 2. Le sous-onglet, en premier

- `configurationsOnglets.conception` (`js/config.js` ~41) : `{ id: 'materiel', label: 'Apporter mon matériel' }` EN TÊTE. Zone protégée : autorisation de Grégoire du 15 oct. 2026, 16 h 17 ; l'écrire dans le commentaire, comme celles du 8 août. Vérifie que `noms_stables.json` protège le nom de la constante, pas les libellés.
- Mesuré : la navigation affiche la première sous-section à l'ouverture d'un onglet (`js/navigation.js` ~441-444). Mesure si un lien, un test ou le guidage suppose que Conception s'ouvre sur la Carte d'alignement ; corrige ce qui en dépend.
- Sous-section `conception-materiel` dans `index.html`, avant `conception-carte`. Info-bulle du bouton (`accompagnement-contenu-hover.js`, patron `nav-conception-…`).

### 3. L'accueil de l'onglet

Textes, ordre et boutons du prototype (écran d'accueil), provisoires : Grégoire relira les mots au lot 3. Le collage se fait dans une zone dédiée ; « Reconnaître le texte ci-dessus » lit du texte tapé ou collé en colonnes à tabulations.

### 4. La lecture du collage : des fonctions pures

Un module neuf (nom à ton choix), **sans DOM de l'application** :

- **Lire** : le presse-papiers `text/html` (Word, Pages) par `DOMParser`, première `<table>`, **`textContent` seulement** ; repli sur `text/plain` à tabulations. Les textes hors du tableau (paragraphes, titres, listes) sont gardés, avant ou après.
- **Interpréter**, règles du prototype : 1re ligne = niveaux, 1re colonne = critères ; colonne de pondération reconnue à son en-tête (pondération, points, pts, total, /N, %) ; plages de notes lues dans l'en-tête (« Excellent (85-100 %) », « 85 à 100 ») ; nom proposé = 1re ligne de texte avant le tableau (≤ 120 caractères) ; **rien ne disparaît** : lignes de forme irrégulière (cases fusionnées), ligne sans nom de critère, ligne de pondération, textes avant (sauf le nom) et après → « À classer », avec leur raison ; parts égales si aucune pondération (marquées « complété ») ; **nature proposée** (descripteurs ou rétroactions) d'après le tutoiement des cases (seuil du prototype : 30 %), marquée « proposé » ; codes de niveau tirés des titres, uniques ; `inverser` = transposition critères × niveaux, la pondération retombant en parts égales et les plages à remplir.
- **Chaque valeur porte son état** : repris (du document), complété (par l'application), à remplir.
- **Plages** : aucune note ponctuelle (`valeurCalcul`) n'est demandée ni écrite (décision du 16 oct., 12 h 55). Plages contiguës comme l'échelle de départ IDME : saisies en entiers (65-74, 75-84), elles s'enregistreront avec `max` = `min` suivant − 0,01 (au lot 2, à la création ; la fonction de conversion peut naître ici).
- **Sécurité** : le HTML collé n'est jamais inséré dans le DOM de l'application ; tout texte rendu passe par `echapperHtml()`.

### 5. L'aperçu, en lecture seule

L'aperçu du prototype (« Aperçu de ta grille », avec sa légende repris / complété / à remplir), alimenté par la lecture. Il servira tel quel à chaque étape de l'assistant au lot 2. iPad : le tableau défile horizontalement dans son cadre, la page non.

## Les bancs

- Vitest (depuis `tests/`), sur les fonctions pures : un HTML de type Word (`<p class=MsoNormal>`, tableau, paragraphe après), du texte à tabulations, une ligne à cases fusionnées → À classer, le nom tiré de la ligne avant, les plages lues dans l'en-tête, la colonne de pondération, les parts égales, la nature proposée, l'inversion, la contiguïté des plages entières ; **sécurité** : un `<script>` et un `onerror` dans le HTML collé ne sont ni exécutés ni retenus ; le champ des descripteurs traverse le schéma de partage ; une grille sans descripteurs reste identique à l'octet près.
- Playwright, écrit et non lancé : ouvrir Conception affiche le nouvel onglet ; l'exemple affiche 3 critères, 4 niveaux et 1 passage à classer.
- Break-test pour chaque essai neuf.

## La porte terrain (une seule)

Ce qu'aucune machine ne peut éprouver : coller une vraie grille depuis **Word** et depuis **Pages**, sur Mac et sur iPad. Écris-en le markdown (skill `portes-terrain`) ; Cowork publiera l'artefact.

## La méthode

Commit (avec ce lot : ce fichier, le cadrage et le prototype, non suivis à l'écriture), Vitest complet, demande `plans de travail/DEMANDE-RELECTURE-2026-10-16-apporter-mon-materiel-1.md`. Bump du bloc de jetons d'`index.html`. **Aucun push, aucune release, aucun verdict Playwright avant le signal du soir de Grégoire.** Rapport court à Grégoire, en gestes d'utilisateur.
