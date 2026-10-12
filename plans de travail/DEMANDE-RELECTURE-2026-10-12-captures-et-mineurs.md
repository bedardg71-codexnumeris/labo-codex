# Demande de relecture – captures et mineurs (12 oct. 2026)

> Écrite par Claude Code le 12 octobre 2026 à 10 h 15 (mesurée par `date`), sur l'ajout de Cowork de 9 h 53 à `CONSIGNE-DU-JOUR.md`. Un commit sur `main` local, non poussé. Aucune release, aucun verdict Playwright.

## 1 · Les captures

**Où** : `tests/test-results/captures-2026-10-12/` (non versionné, `tests/.gitignore`). 48 images et `releve.json`.

**Comment** : un script jetable (`captures-2026-10-12.mjs.txt`, rangé avec les images pour pouvoir le relancer) sert le dépôt en HTTP sur un port éphémère, comme la spec du worker PDF : sous `file://`, le chargement du worker par `fetch` se met hors jeu et #602 ne serait pas vu. Mode démo activé par `activerModeDemo()`. Chromium = **Chrome stable** (`channel: 'chrome'` : seul WebKit est installé dans Playwright sur ce Mac). Viewports 1 280 × 800 et 820 × 1 180.

Noms : `<navigateur>-<largeur>-<écran>.png`.

| Écran | Fichiers | Ce que le relevé mesure (les quatre combinaisons) |
|---|---|---|
| Accueil | `1-accueil` | « Commencer la visite guidée » porte `btn-principal`, fond `rgb(3, 46, 92)` |
| Visite guidée | `2-visite-guidee`, `2b-visite-guidee-bandeau-ferme` | « Commencer : Cadre › » porte `btn-principal`, même fond |
| Profil démo (Aimé Césaire, DEMO004) | `3-profil` et `3-profil-<section>` (7 sections) | 12 en-têtes `u-flex-between-mb15/20` visibles, tous `display: flex`, `justify-content: space-between`, marge 15 ou 20 px |
| Visionneuse PDF | `4-visionneuse-pdf` | 1 page ouverte ; worker demandé à `/libs/pdf.worker.min.js?v=3.11.174`, servi ensuite en `blob:` |

Les huit en-têtes de #679, rendus : « Productions et évaluations », « Développement des habiletés », la ligne du pourcentage global, « Engagement ACP », les trois cartes Assiduité / Complétion / Performance (un même gabarit), « Progression temporelle ACP », « Accompagnement », « Travaux soumis », « Rapport ». **Deux n'apparaissent pas** : les blocs RLO de `profil-etudiant-diagnostics.js` (`genererBlocProfilRLO`, `genererBlocEvolutionRLO`) ; aucune section du profil démo ne les a rendus.

**À savoir avant de regarder** :
- **La copie n'est pas une copie démo** : le pack démo n'en porte aucune (`fichiersTravaux` absent, mesuré le 29 sept.). C'est un PDF fictif d'une page (« Copie fictive - demo »), ouvert par `travauxVisionneuse.ouvrirDepuisBlob`, l'hôte de la visionneuse sorti en plein écran comme dans la spec #937. Le « Chargement... » en haut à gauche vient de cet hôte sorti de sa sous-section ; je ne l'ai pas cherché plus loin.
- **Captures pleine page du profil** : le bandeau vert « Mode démonstration » est fixé au bas de la fenêtre ; dans une capture pleine page, il tombe au milieu de l'image. Ce n'est pas l'écran réel.
- **Observation à 820 px, sans retouche** : à l'ouverture de la visite, le bandeau de transition « Tes premières évaluations sont enregistrées… » (`transitions.js`) recouvre la bulle de la visite et ses deux boutons (`2-visite-guidee`). Une fois le bandeau fermé, les boutons se voient (`2b-…`). À 1 280 px, il recouvre aussi le bas de la bulle. Issue 2 si c'est un symptôme : je ne l'ai pas inscrit, faute de symptôme vécu (règle du 24 août) ; à toi de juger.
- Une erreur console en Chrome à 1 280 : une ressource en 404, non identifiée (le serveur de banc refuse `tests/` et les fichiers cachés) ; aucune ailleurs.

## 2 · Les mineurs

| Point | Fait | Preuve |
|---|---|---|
| #678, le vouvoiement | `trimestre-v2-etudiants.js:1253` : « Colle des données à importer. » ; jeton `?v=20261011r` (le jour du build, comme les lots du matin : la sentinelle anti-cache refuse un jeton d'un autre jour entre deux releases) | aucun essai ne citait l'ancien texte (`grep` dans `tests/`) |
| #627, la cartouche dont l'échelle a été renommée | **pas de code** : comportement voulu, figé par `tests/unit/import-complet-627-cartouche-echelle-renommee.test.js` ; une ligne dans #627 au BACKLOG | 3 essais par le vrai chemin (`ouvrirModalImport` → choix du fichier → `executerImportConfigComplete`) : la cartouche reçue pointe l'échelle reçue et s'importe à côté sous un id neuf ; témoin sans renommage, pas de doublon ; #654 en regard, la production identique garde sa cartouche |
| Les deux points à Grégoire | **#1052** (cinq noms protégés morts de `grilles.js`) et **#1053** (les enveloppes de `afficherSection`/`afficherSousSection`), inscrits avec « ⏳ À Grégoire » | dernier ID #1053 |

Break-test de l'essai #627, deux mutations dans `import-export.js`, restauration par copie et empreinte : (1) retirer `rebrancherReferences(assainie, 'cartouche', tables)` de l'import complet → l'essai 1 rougit (« deux cartouches […] got 1 ») ; (2) donner toujours `tables` aux productions identiques en place → l'essai #654 rougit (« pas de production jumelle […] got 2 »). Chaque rouge vient de l'assertion visée.

Vitest complet (depuis `tests/`, 10 h 13) : **751 fichiers, 8 755 essais, tous verts**.

## 3 · Trouvaille, avec son issue

- **`previsualiserConfigComplete`** (`import-export.js:2019`) n'a aucun appelant ni exposition sur `window` : c'est `previsualiserImport` qui sert le choix du fichier. Code mort hors de mon lot. Issue 3 : nommée ici, pas inscrite (aucun symptôme).

## 4 · Mots d'écran

Un seul changé : « Veuillez coller des données à importer. » → « Colle des données à importer. » (mot d'enseignant, décision de Cowork). Aucun autre mot neuf.

## 5 · Documents à mettre à jour

Aucun.

## 6 · Ce qui attend

L'entrée des Nouvelles, à soumettre à Grégoire ; la release et le verdict Playwright attendent son signal du soir.

## 7 · Réponse au verdict de 10 h 56 (11 h 03)

« Chargement... » : le `<p class="texte-muted">` statique d'`index.html` dans `#evaluations-contenu-fichiers`, déjà là sur 1.199.0 (`bd533702`, même script, deux navigateurs, deux largeurs) ; artefact du banc, qui appelait `afficherVisionneuse()` sans passer par les deux vrais chemins qui vident le conteneur (`travaux-ui.js:1123`, `:3382`) — une ligne dans #602, aucun code. Le 404 : `/favicon.ico`, demandé d'office par Chrome — rien à faire. Lignes inscrites dans #678 (bandeau à 820 px) et #469 (`previsualiserConfigComplete`).
