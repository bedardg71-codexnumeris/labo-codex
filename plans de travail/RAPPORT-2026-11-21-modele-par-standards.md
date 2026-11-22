# Rapport — lot modèle-par-standards (21 nov. 2026)

Un « Modèle par standards » dans la liste « Choisis un modèle » de l'assistant. Le choisir ouvre l'étape des cibles, réglages déjà posés.

## En tête

**PR en brouillon et aperçu** : à compléter après le push.
**Branche** : `lot/modele-par-standards`, partie de `origin/main` à `16360f43c` (1.253.0). Arbre : `../labo-codex-modele-standards`. Ni fusion ni release.

### Ce que j'ai mesuré au point A (lu dans le code, sur main)

Toutes les voies lisent la même source : les cinq modèles prédéfinis (`MODELES_PRATIQUES_PREDEFINIS`) fondus dans la bibliothèque à la lecture.

| Voie | Ce qu'elle ferait d'un modèle « Par standards » sans cibles rangé avec les cinq autres |
|---|---|
| Assistant, « Partir d'un modèle » | Le clonerait tel quel et sauterait au récapitulatif : une pratique sans ensemble de cibles |
| Bibliothèque, « ← Utiliser dans ce trimestre » | Copierait le modèle dans le trimestre : une pratique qui ne nomme aucun ensemble |
| Bibliothèque, « Dupliquer » et « Dupliquer pour créer ma pratique » | Même copie, sous un nom neuf |
| Vue simple | Ne lit que les modèles qu'elle nomme elle-même ; elle a déjà sa propre carte « Par standards », qui demande les cibles avant d'écrire |
| Démo et ses filtres | Ne lisent pas les modèles prédéfinis |

### La garde (point C), tranchée en une ligne

**Le modèle n'est pas rangé avec les cinq autres : il n'existe que dans la liste de l'assistant, et là il passe par l'étape des cibles.** Aucune autre voie ne le voit, donc aucune ne peut l'installer sans cibles. Dans l'assistant, la création repasse par les refus existants : sans cible valable, rien n'est écrit.

### Mesuré, lu, non vu

**Mesuré** :
- Vitest complet : 945 fichiers, 12 203 essais verts. La garde du lot 0 est dans ce compte (16 sur 16).
- Sentinelle du lot : 28 essais ; dix mutations jouées une à une, toutes rouges (journal en fin de fichier). Les cinq modèles existants : liste, ordre et configuration épinglés par une empreinte prise sur main.
- Banc du lot : 5 essais, verts sous Chromium et sous WebKit. Le parcours entier y est : Partir d'un modèle, Modèle par standards, deux cibles, récapitulatif, la pratique créée, son tableau des cibles ouvert. Une mutation au banc : 3 essais rouges.
- Bancs voisins sous WebKit : 12 essais (assistant, « à l'essai », adoption de l'échelle), puis le parcours 9 de la notation alternative (15 verts, 5 sautés par construction), puis 7 essais (deux temps des modèles, ce que l'écran promet). Un essai du parcours 9 a dépassé son délai une fois pendant que le Mac était chargé (charge moyenne de 13 à 18, d'autres sessions) ; rejoué seul : 6,5 s, vert.
- Captures (Chromium, 1180 × 820 et 820 × 1180, clair et sombre) : `plans de travail/captures-2026-11-21-modele-par-standards/`, la liste des modèles et l'étape des cibles.

**Lu, pas joué** : les voies du point A autres que l'assistant (la garde tient par construction : le modèle n'y est pas).

**Non vu** : Safari sur le Mac et sur l'iPad ; le verdict Playwright complet, dû avant toute fusion.

### Ce que j'ai supposé

1. **L'échelle.** Le mandat disait « l'échelle de départ de l'application (0-IDME ou ce qui en tient lieu ; mesure laquelle existe toujours) » et « 0 – Aucun ». Mesuré : l'application sème « Échelle de départ (IDME) », cinq niveaux (PS, I, D, M, E), que l'on peut supprimer et dont le seul niveau à 0 % est « PS – Préstructurel », un niveau d'apprentissage. Aucun niveau « 0 – Aucun » n'existe. J'ai donc pris ce qui en tient lieu pour cette pratique : « Échelle de départ – Par standards » (0 à 4 ; « 0 – Données insuffisantes »), celle que l'assistant et la vue simple proposent déjà, toujours disponible. **C'est un choix pédagogique : il revient à Grégoire.** S'il préfère l'IDME, c'est une ligne à changer.
2. **L'échelle n'est pas doublée.** Si « Échelle de départ – Par standards » est déjà rangée dans le trimestre (même nom, mêmes codes et valeurs), le modèle la réutilise.
3. **L'étape de l'échelle** ne s'ouvre que si l'échelle posée manque ; sinon l'assistant passe des cibles au récapitulatif.
4. **L'étape « Informations de base » est sautée**, comme pour les autres modèles : le nom se change au récapitulatif.
5. **Place dans la liste** : après les cinq modèles de l'application, avant les pratiques de la bibliothèque.
6. **Le double seuil** n'est pas écrit dans la pratique : absent, il est éteint.
7. **Provenance et jetons** : la pratique dit d'où elle vient (le modèle, même identité que celui de la vue simple) et naît avec les jetons éteints, comme toute pratique installée d'un modèle.

### Où je m'écarte du mandat

- **« 0 – Aucun »** : ce niveau n'existe pas ; voir la supposition 1.
- **Aucun changement à `pratiques-bibliotheque.js` ni à `pratiques-gestion.js`** : tout tient dans `js/wizard-pratique-v2.js`.
- **Une sentinelle existante ajustée** : celle de la mention « À l'essai » comptait deux cartes marquées dans l'assistant ; elles sont trois, et l'essai nomme la troisième.
- **Pas de fiche au BACKLOG** : le mandat n'en demande pas.

## Créer une pratique par ce modèle, sur l'aperçu

1. Ouvre Conception, puis les pratiques de notation, puis « + Nouvelle pratique ».
2. Choisis « Partir d'un modèle », puis « Suivant ».
3. Dans la liste, sous les cinq modèles habituels, choisis « Modèle par standards » (il porte la mention « À l'essai »), puis « Suivant ».
4. L'assistant ouvre « Les cibles du cours ». Choisis le cours, écris au moins une cible (une étiquette suffit), puis « Suivant ». Sans cible, il ne passe pas et dit pourquoi.
5. Le récapitulatif montre tes cibles, l'échelle de départ et le niveau « sans donnée ». Change le nom si tu veux, puis crée la pratique.
6. Désigne-la pour un groupe : le tableau des cibles montre une colonne par cible, toutes sans donnée.

## Trouvailles

| Trouvaille | Statut | Disposition |
|---|---|---|
| Deux phrases de l'assistant décrivent l'adoption par copie, ce que ce modèle ne fait pas (S4, S5 du fichier des textes) | Lu | Inscrire (issue 2) : des mots d'écran, à Grégoire |
| Le compteur d'étapes dit « 2/3 » sur la liste des modèles, puis « 3/4 » une fois ce modèle choisi (le total se recalcule sur le chemin réel) | Vu sur les captures | Commenté ici (issue 3) |
| Une capture prise deux images après un changement de thème saisit des cartes à mi-transition (vu sur mes premières captures) ; les captures d'autres lots prises de la même façon peuvent en souffrir | Vu | Inscrire (issue 2). Ici : les transitions sont menées à leur terme avant la capture |

## Ce que le Mac devra passer sous Safari

Sur l'iPad d'abord (le besoin y a été vu), puis sur Safari du Mac.

1. La liste « Choisis un modèle » : la sixième carte, sa mention « À l'essai », lisibles à 820 de large ; un toucher la coche.
2. « Suivant » ouvre « Les cibles du cours » ; le clavier de l'iPad ne masque pas le champ de l'étiquette.
3. Sans cible, « Suivant » ne passe pas et le refus se lit.
4. Deux cibles, « Suivant » : le récapitulatif, sans passer par l'étape de l'échelle.
5. La pratique créée, puis son tableau des cibles.
6. « Précédent » depuis les cibles, un autre modèle : il saute au récapitulatif comme avant.
7. Clair et sombre.

## Fichiers

- `js/wizard-pratique-v2.js` : le modèle, la liste, la préparation, trois enchaînements d'étapes, la provenance à la création, trois exports pour la sentinelle.
- `index.html` : la version de cache de l'assistant.
- `tests/unit/sentinelle-modele-par-standards.test.js`, `tests/integration/modele-par-standards.spec.js`.
- `tests/unit/sentinelle-par-standards-a-l-essai.test.js` : un compte ajusté.
- `plans de travail/TEXTES-2026-11-21-modele-par-standards.md`, les captures.
