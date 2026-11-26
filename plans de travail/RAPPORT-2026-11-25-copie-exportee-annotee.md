# Rapport : la copie exportée porte ses annotations (correctif, 25 nov. 2026)

> **Rien n'a été jugé sous Safari ni sur l'iPad.** Le nuage n'a pas WebKit : tout ce qui suit a tourné sous Chromium (Linux). Le passage WebKit est à lancer sur le Mac, depuis `tests/` (sans `-c`, la configuration par défaut est WebKit) :
>
> ```bash
> cd tests && npx playwright test integration/copie-exportee-annotee-2026-11-25.spec.js integration/exporter-des-travaux-une-carte-895.spec.js integration/export-lea-verrouillees.spec.js integration/eleve-supprime-masque-1013.spec.js integration/parcours-4-recevoir-et-rendre-2026-11-09.spec.js integration/je-regarde-recevoir-2026-11-17.spec.js integration/nous-faisons-recevoir-2026-11-19.spec.js --trace off
> ```

**Dernier relais.** Consigne de Cowork du 25 nov., 5 h 45 ; décision de Grégoire de 5 h 40 : une correction urgente, qui part seule. Branche `correctif/copie-exportee-annotee`, partie d'`origin/main` à `57f759ceb`. Correctif et banc au commit `8259aa90c` ; ce rapport au commit suivant. Ni fusion dans `main`, ni bump, ni ligne de Nouvelles dans le code. Demande en brouillon « APERÇU, ne pas fusionner » : [bedardg71-codexnumeris/labo-codex#61](https://github.com/bedardg71-codexnumeris/labo-codex/pull/61). Reste : le passage WebKit, les gestes de l'iPad, le feu vert de Grégoire, la mise en ligne sur le Mac.

---

## La cause

`aplatirAnnotationsImage` (`js/travaux-archivage.js`, lignes 633, 647 et 670 sur `main`) fabrique la version annotée d'une copie reçue en image. Elle dessine l'image, appelle le dessin des annotations, puis fait aussitôt le JPEG. Or ce dessin, `travauxExportPDF.dessinerAnnotationsSurCtx` (`js/travaux-export-pdf.js:274`), est asynchrone : il attend d'abord les images des tampons, **même quand la page n'en porte aucun** (une fonction `async` rend toujours la main avant de continuer). L'appel n'était pas attendu : le JPEG se faisait avant le premier trait. La version annotée sortait identique à l'original : ni code, ni trait, ni tampon.

Catégorie (skill `debug-labo-codex`) : 2.6, concurrence asynchrone.

## Depuis quand

Mesuré par `git log` sur les deux fichiers (le clone a été approfondi jusqu'au 1er déc. 2025) :

| Date | Commit | Ce qui change |
|---|---|---|
| 6 févr. 2026 | `7ec09750a` (Beta 96.3) | `aplatirAnnotationsImage` naît, avec l'appel non attendu. |
| 7 févr. 2026 | `5c6d27f72` | Le dessin est délégué à `travauxExportPDF.dessinerAnnotationsSurCtx`, encore synchrone. |
| **19 févr. 2026** | **`0fbe7dca6` (Beta 97.8, build `0219-1515`)** | **`dessinerAnnotationsSurCtx` devient `async` pour attendre les tampons : le défaut commence.** |

**Le défaut existe donc depuis le 19 février 2026**, Beta 97.8. Depuis ce jour, toute version annotée d'une copie en image exportée en ZIP est sortie sans ses annotations. Avant, du 6 au 19 février, le dessin était synchrone : il devait fonctionner (inférence tirée du code, pas rejouée).

## Les chemins touchés

`genererFichierAnnote` n'a qu'un appelant, `_ajouterFichierAuZip` (`js/travaux-archivage.js:181`), et deux moteurs l'appellent. Mesuré par le banc, sur des copies fictives en JPEG, en PNG et en PDF :

| Geste | Moteur | Copie en image (JPEG, PNG) | Copie en PDF |
|---|---|---|---|
| Profil de l'élève, « Télécharger ZIP des travaux » | `exporterParEtudiant` (versions annotées demandées) | touchée, **réparée** | jamais touchée, inchangée |
| « Exporter des travaux », filtrée sur un·e élève | `exporterTravaux({ da })` | touchée, **réparée** | jamais touchée, inchangée |
| « Exporter des travaux », filtrée sur une production | `exporterTravaux({ productionId })` | touchée, **réparée** | jamais touchée, inchangée |
| « Exporter des travaux », sans filtre (l'archive du groupe) | `exporterTravaux({})` | touchée, **réparée** | jamais touchée, inchangée |

- **JPEG et PNG** : les deux étaient touchées, les deux sont réparées. Les mêmes chiffres au pixel près (code 2 291, trait 3 864, tampon 9 794 pixels encrés). La version annotée d'une PNG reste un JPEG nommé `.png` : c'est ce qui existait avant (trouvaille plus bas).
- **La copie en PDF** (`rendrePDFAvecAnnotations`, qui attend son dessin à `js/travaux-export-pdf.js:1227`) : mêmes mesures avant et après (code 4 787, trait 8 874, tampon 21 588 pixels). Le fichier n'est pas touché.
- **L'export pour Léa** (`genererDocPDF`, qui attend son dessin à `js/travaux-export-pdf.js:165` et `:217`) : le fichier n'est pas touché ; son banc voisin `export-lea-verrouillees.spec.js` est vert sur `main` comme sur la branche. **Les PDF de rétroaction téléversés sur Léa n'ont jamais eu ce défaut.**
- **La forme « par élève » de la carte** (sans dossier par production) passe par la même fonction : lu, pas rejoué.

## Ce qui est fait

- `js/travaux-archivage.js` :
  - le dessin est **attendu** avant le JPEG (`img.onload` devient `async`, `await` devant l'appel, et `dessinerAnnotationsSurCanvas` rend la promesse du dessin) ;
  - **la précaution** : une image illisible, un dessin qui lève ou un canevas qui ne rend aucune image **rejettent** la promesse. Avant, l'image illisible rendait `null`, que l'appelant sautait en silence. Une exception dans le dessin laissait la promesse sans réponse : l'export restait bloqué. Sans la précaution, le seul `await` aurait d'ailleurs fait d'un dessin qui échoue un export bloqué pour toujours (c'est le break-test B3) ;
  - une constante neuve, `RAISON_SANS_VERSION_ANNOTEE` : le mot que l'enseignant·e lit dans ce cas (ci-dessous).
- `index.html:11920` : le jeton de `travaux-archivage.js` passe de `20261122s` à `20261123r` (jour du build en cours, `1123`, comme l'exige la sentinelle). ⚠ La branche du lot des codes en lettres change la ligne 11919, voisine : **conflit attendu à la fusion du lot**, à résoudre en gardant les deux jetons. Les branches des tampons changent les lignes 11917 et 11918 : une ligne inchangée les sépare de 11920, git fusionne sans conflit.
- `tests/integration/copie-exportee-annotee-2026-11-25.spec.js` : le banc (six essais, plus bas).

### Ce que l'utilisateur voit quand la version annotée ne peut pas être produite

**Mesuré avant de trancher** : `_ajouterFichierAuZip` met l'original dans l'archive, puis appelle `genererFichierAnnote` ; un `null` y est sauté sans un mot (`if (annote) …`). Un `null` légitime reste muet : copie sans annotation, copie absente, type inconnu. Une exception remonte à l'appelant, qui nomme la copie dans son bilan (#565, #891) et ne la marque pas « exportée ». C'est déjà ce qui arrive aujourd'hui à une copie en PDF dont le rendu échoue.

**Tranché** : une copie en image dont la version annotée échoue reçoit le même traitement qu'un PDF en échec. L'export continue, l'archive se télécharge, et le bilan (une alerte, à la fin) nomme la copie. Rejoué dans Chromium, une image illisible parmi trois copies :

> 2 exporté(s) sur 3, 1 en échec :
>   • Fictif_Alpha_FICTIF01 / copie-fictive-a.jpg — sa version annotée n’a pas pu être produite (l’original est dans l’archive)

L'original reste dans le ZIP ; la copie n'est pas marquée « exportée » et sera reproposée au prochain export (prudent : sa version annotée manque).

**Le mot proposé** (lu par l'enseignant·e seulement, corrigeable) : « sa version annotée n’a pas pu être produite (l’original est dans l’archive) ». Il vit dans `RAISON_SANS_VERSION_ANNOTEE`, marqué « PROPOSÉ ».

## Tarir n'est pas réparer

- **La source est tarie** : tout export fait après la mise en ligne produit des versions annotées qui portent leurs annotations.
- **Le stock ne peut pas être réparé.** Les ZIP déjà téléchargés depuis le 19 février 2026 portent des versions « _annote » sans annotations, pour toute copie reçue en image. Ils sont chez les enseignant·es, hors de l'application : rien ne peut les atteindre. Des élèves en ont peut-être reçu.
- **Ce qui reste possible** : les annotations elles-mêmes sont intactes dans l'application, puisque seul l'aplatissement échouait. Un nouvel export produit les bonnes versions (rejoué : la même copie, les mêmes annotations, exportée avant puis après le correctif). Exception, lue et pas rejouée : une copie mise aux archives n'a plus son image dans l'application. Il faut la faire revenir avant de l'exporter.
- **Rien n'est écrit dans les données de qui que ce soit.**

### La ligne de Nouvelles proposée (pas écrite dans le code)

> La version annotée d'une copie reçue en image (une photo ou une numérisation) porte maintenant tes annotations quand tu exportes tes travaux. Depuis février, elle sortait sans elles. Les archives déjà téléchargées ne peuvent pas être réparées ; tes annotations, elles, sont intactes dans l'application : exporte de nouveau pour obtenir les bonnes versions.

Ce sont des mots que des utilisateurs liront : Grégoire les corrige.

### La ligne proposée pour `Retours des testeurs/SUIVI-BUGS.md` (pas écrite)

Le numéro se prend à la fusion. `BACKLOG.md` sur `main` dit « Dernier ID utilisé : #1304 », mais `RELAIS.md` annonce #1307 à #1310 pris par la branche des tampons : le suivant serait #1311, à revérifier ce jour-là.

| # | Testeur | Date rapport | Corrigé | Build | Description | Correction |
|---|---|---|---|---|---|---|
| #1311 ? | Grégoire | 24 nov. | 25 nov. | (à la mise en ligne) | La version « _annote » d'une copie en image sortait du ZIP sans ses annotations | 2.6 concurrence : `aplatirAnnotationsImage` n'attendait pas le dessin, asynchrone depuis le 19 févr. (`0fbe7dca6`) ; attendu, et un échec rejette au lieu de rendre `null` (`js/travaux-archivage.js`) |

## La preuve

### Le banc : rouge sur `main`, vert après (Chromium)

`tests/integration/copie-exportee-annotee-2026-11-25.spec.js`. Trois copies fictives sur une page blanche (JPEG, PNG, PDF), chacune annotée d'un code d'un chiffre (« 7 »), d'un trait de stylo et d'un tampon. Le banc compte les pixels encrés de chaque annotation dans sa zone ; la zone est blanche sur l'original (témoin).

| Essai | `main` (`57f759ceb`) | Branche |
|---|---|---|
| « profil », « eleve », « production », « archive » : image annotée | **rouge** : 0 / 0 / 0 pixel (code / trait / tampon), en JPEG comme en PNG | **vert** : 2 291 / 3 864 / 9 794 |
| Les mêmes : PDF annoté (témoin) | 4 787 / 8 874 / 21 588 | 4 787 / 8 874 / 21 588 |
| Précaution : un dessin qui échoue | **rouge** : aucun échec nommé, les deux images marquées « exportées », leur version annotée blanche | **vert** : l'export rend la main ; les deux images nommées au bilan, leurs originaux dans le ZIP ; seul le PDF marqué « exporté » |
| Précaution : une image illisible, par « Télécharger » de la carte | **rouge** : aucun bilan, la version annotée sautée en silence | **vert** : le bilan ci-dessus |

### Break-tests (chaque fois une seule défense retirée, sur la branche, puis le fichier restauré et comparé octet pour octet)

| Retiré | Rouge |
|---|---|
| B1 : seulement l'`await` devant le dessin | les quatre chemins, et la précaution du dessin (5 sur 6) |
| B2 : l'image illisible rend de nouveau `null` | la précaution de l'image illisible |
| B3 : plus de `catch` autour du dessin | la précaution du dessin (l'export reste bloqué : l'essai coupe à 20 s) |

### L'image annotée exportée, avant et après

Dossier `plans de travail/captures-2026-11-25-copie-exportee-annotee/`. Rejoué par les gestes de l'écran, servis en http comme l'aperçu. Le fichier d'essai du lot des codes ; la copie fictive annotée d'un code (« K-A »), du tampon « Unistructurel » et d'un trait de stylo ; puis « Exporter des travaux », « Télécharger ».

- `copie-exportee-annotee-avant.jpg` (`main`) : la version « _annote » du ZIP, **0 pixel** différent de l'original ;
- `copie-exportee-annotee-apres.jpg` (la branche) : **4 520 pixels** différents, le code, le tampon et le trait là où ils sont à l'écran ;
- `copie-annotee-a-l-ecran.png` : la copie à l'écran avant l'export, pour comparer.

### Vitest et bancs voisins

- **Vitest complet**, lancé depuis `tests/` sur la branche : 958 fichiers, 12 334 tests, verts (sentinelles de complexité et d'anti-cache comprises).
- **Bancs voisins de l'export et de l'archivage**, `main` contre branche (Chromium) : `export-lea-verrouillees`, `exporter-des-travaux-une-carte-895`, `eleve-supprime-masque-1013`, `parcours-4-recevoir-et-rendre-2026-11-09`, `je-regarde-recevoir-2026-11-17`, `nous-faisons-recevoir-2026-11-19`. **22 verts sur `main`, 22 verts sur la branche.**

## Ce qui n'est pas vérifié

- **Safari et l'iPad** : le dessin attendu puis `toBlob` sous WebKit ; la limite de mémoire des canevas de l'iPad pour une très grande photo. Elle serait maintenant nommée au bilan au lieu de passer en silence ; je ne l'ai pas vue.
- La forme « par élève » de la carte : même fonction, lue.
- Le bouton du profil : joué par sa fonction (`exporterParEtudiant`), pas par le clic.
- Les copies mises aux archives : lu, pas rejoué.

## Rejoué ou seulement lu

- **Rejoué** (Chromium) : le défaut sur `main` par les quatre chemins, en JPEG et en PNG ; le PDF inchangé ; la réparation ; les deux précautions et leur bilan ; les trois break-tests ; les gestes de l'écran avant et après (les images) ; les bancs voisins des deux côtés ; Vitest.
- **Seulement lu** : l'ancienneté (par `git log`, et le fonctionnement probable du 6 au 19 février) ; la forme « par élève » ; la Léa n'appelle pas la fonction corrigée ; les copies aux archives.

## Trouvailles hors du correctif (issue « inscrire et continuer »)

1. **La version annotée d'une PNG est un JPEG nommé `.png`** : rejoué aujourd'hui, son en-tête est `ffd8ffe0` (`js/travaux-archivage.js`, `'image/jpeg'` dans `aplatirAnnotationsImage`). Déjà inscrit, seulement lu, au rapport du lot des codes en lettres (trouvaille 13). Sans conséquence observée.
2. **Sous `file://`, l'image SVG par défaut d'un tampon « teinte » le canevas** (origine opaque), et tout export qui la dessine échoue. C'est un artefact des bancs, pas de l'application servie en https : le banc emploie une image en `data:` et le dit dans son en-tête. Issue « commenter et oublier » (c'est fait dans le banc).
3. La date du nom du ZIP en temps universel : déjà inscrite au rapport du lot des codes en lettres (trouvaille 11), pas reprise ici.

## Aperçu

**https://deploy-preview-61--codexnumeris-051225.netlify.app/** (demande en brouillon [bedardg71-codexnumeris/labo-codex#61](https://github.com/bedardg71-codexnumeris/labo-codex/pull/61)). L'aperçu est une adresse à part : il ne voit pas les données d'`app.codexnumeris.org`, et rien de ces gestes ne s'écrit dans les tiennes.

## Les gestes à essayer (sur l'iPad, tels que je les ai joués)

Il faut une copie reçue en image : je me sers du fichier d'essai d'hier, qui en porte une (fictive). Ses codes en lettres s'y dessinent comme sur `main` (petit cercle) : les pastilles sont dans le lot, pas dans ce correctif.

1. **Ouvrir le fichier d'essai dans l'aperçu du correctif.** Si tu ne l'as plus, télécharge-le sur https://deploy-preview-59--codexnumeris-051225.netlify.app/departs.html (« Télécharger le fichier », sous « Essai : les codes en lettres »). Puis ouvre **https://deploy-preview-61--codexnumeris-051225.netlify.app/** (pas le bouton « Ouvrir l'application » de la page d'hier : il mène à l'aperçu du lot). « Codex », « Ouvrir un codex », choisis `ESSAI-codes-en-lettres-lot-1.zip`, « Recharger ».
2. **Annoter la copie.** « Évaluations », la liste ; sur la ligne de Fictif-01 Personne-01, le menu des actions, « Annoter ». Touche « K-A » dans la palette Codes, puis la copie. Touche « Unistructurel » dans la palette Tampons, puis la copie. Touche « Stylo », puis glisse le doigt sur la copie.
3. **Exporter et ouvrir la version annotée.** Le sous-onglet « Exporter » ; dans la carte « Exporter des travaux », touche « Télécharger ». Dans Fichiers, ouvre le ZIP `travaux_a2026_<date>.zip`, puis les dossiers `Fictif-01_Personne-01_2390001` et `Production fictive - codes en lettres`, et `copie-fictive_annote.jpg`.
   ⮕ Attendu : le code, le tampon et le trait, là où tu les as posés. Avant le correctif, cette image était identique à l'original.
