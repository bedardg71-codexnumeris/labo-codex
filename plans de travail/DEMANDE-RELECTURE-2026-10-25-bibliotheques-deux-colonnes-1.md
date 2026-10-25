# Demande de relecture – les bibliothèques en deux colonnes, lot 1 : le composant et la bibliothèque des grilles (#1154)

> Claude Code, dimanche 25 octobre 2026 (Toronto). Pour Cowork (`PROTOCOLE.md`). Consigne exécutée : `CONSIGNE-LOT-2026-10-24-bibliotheques-deux-colonnes-1.md` ; plan `PLAN-2026-10-24-bibliotheques-deux-colonnes.md`, lot 1.
> **Branche `bibliotheques-deux-colonnes`**, partie de `main` = `05843aba` : `3d3918c4` (tes documents, seuls, § 0), `9ee51473` (les six fiches #1154 à #1159, reportées au plan), puis le lot, `ae34b7cd`, et un commit de docs (la ligne du plan, l'acquit `security-ok` d'une donnée fictive du banc). Pas de release, ni verdict, ni push (§ 7). Le merge attend la fin du lot 3 et la version du soir : noté dans `RELAIS.md`.
> Les trois docs suivis que tu avais modifiés sur `main` (consigne des noms réels, plan de l'Aide, verdict Aide lot 1) ne sont **pas** dans mes commits : ils restent modifiés dans l'arbre de travail, à toi.

## 0. Ce que j'ai mesuré, ce que j'ai supposé

| Question | Mesuré | Ce que j'ai fait |
|---|---|---|
| § 1.2 : le sens trimestre → bibliothèque partage-t-il l'objet ? | `importerGrillesDansBibliotheque` → `ajouterGrilleALaBibliotheque` : `assainirObjet` reconstruit la grille (critères compris, `SCHEMAS_IMPORT.grille`), puis `{...grilleSafe}` est écrit sous `bibliothequeGrilles`, une autre clé. Aucun chemin d'enregistrement de `grilles.js` n'écrit dans `bibliothequeGrilles` (seul l'import JSON, l. ~2072). Éprouvé au banc (« mesure : … exemplaire séparé ») : après « Garder », renommer la grille du trimestre et son premier critère laisse l'exemplaire de la bibliothèque intact. | **La phrase reste** : « Ce que tu y modifies ne change pas l'exemplaire de ta bibliothèque. » ⚠ Les deux exemplaires gardent le **même `id`** (c'est le critère d'existence). |
| § 1.3 : le critère de « Aussi dans ta bibliothèque » | `ajouterGrilleALaBibliotheque` compte une « existante » quand `bibliotheque.some(g => g.id === grilleSafe.id)`. | Même critère, sur la bibliothèque entière (avant le filtre démo). `dansBibliotheque` n'est pas lu pour cet état. |
| § 1.5 : la correspondance des trois gestes | voir § 2 | Les deux mots validés collent ; le troisième garde son libellé. |
| Piège 2 : une grille retirée qui n'est pas dans la bibliothèque | Introuvable. Voir § 3. | **Inscrit (#1160), pas corrigé.** |
| La phrase de « Dans ta bibliothèque » | « C'est d'ici que tu peux les partager. » est **fausse dans ce lot** : le ⋮ de la bibliothèque n'a aucun geste de partage aujourd'hui (« Exporter pour partager » est sur la rangée du trimestre, § 1.5), et le lot n'en crée pas (§ 6). | **Retirée.** Reste : « Les grilles que tu gardes pour tous tes trimestres. » **À soumettre à Grégoire** : la remettre quand un geste de partage existera de ce côté, ou la reformuler. |

**Supposé** (corrige-moi en dix secondes) :
- « Garder dans ma bibliothèque → » pour une grille **ne demande pas de confirmation** ; « Tout garder » garde celle d'aujourd'hui. Motif : il n'ajoute qu'un exemplaire, qui se retire d'un geste.
- La notification du passage à l'unité : « Grille ajoutée à la bibliothèque ! » (celle du geste groupé, au singulier) ; « Cette grille était déjà dans la bibliothèque. » si rien n'est écrit. Celle de « ← Utiliser » reste celle de `ajouterGrilleIndividuelle` : « Grille ajoutée à ta sélection ! », voir § 7.
- Le badge « Dépistage » (`genererBadgeGrilleDepistage`) reste après le nom d'une rangée de la bibliothèque : c'est un mot, pas un code ; il dit une chose qu'aucune autre ligne ne dit.
- « Inspiré de … » et la discipline quittent la ligne de la rangée : « Inspiré de » passe dans l'aperçu, sous la description ; **la discipline n'est plus affichée** (la consigne fixe la ligne : types, nombre, auteur).
- Le sous-titre « Gère les grilles de critères de ta sélection. » est parti (en-tête sur une ligne, § 1.1).

## 1. Le lot

**L'API** (`js/bibliotheque-ui.js`) : `BibliothequeUI.creerFenetreDeuxColonnes(config)`. Le module passe des textes et des gestes ; le composant échappe tout et pose toutes les classes. Forme complète en tête de la section `#1154` du fichier :

```
config = { modalId, titre, aide, menuFichiers, champsFichier, avantColonnes,
           trimestre: colonne, bibliotheque: colonne + { dossiers, partages } }
rangee = { id, nom, ligne, afficherId, marqueHtml, dossier,
           apercu: { paragraphes, lignes: [[nom, type, valeur]], total },
           passage: { label, action, param, sens } | etat: '…', menu: [geste | {separateur}] }
```

Avec elle : `fermerFenetre` (×, Échap : rien n'est retenu), `basculerApercu`, `choisirDossier`, `ouvrirGestionDossiers` / `fermerGestionDossiers`. `renderMenuActions` prend trois options (`libelle`, `ariaLabel`, `classeBouton`) et deux entrées (`{separateur}`, `{note}`) : le menu « Importer ou exporter ▾ » est le popover existant, mêmes ouverture, fermeture et Échap. `repertoires` expose `estDeplie` / `poserDeplie` (la gestion des dossiers reste ouverte après créer, renommer, supprimer, comme avant).

**`js/grilles.js`** : `preparerDonneesBibliothequeGrilles` rend des rangées (plus aucun HTML) ; `afficherBibliothequeGrilles` appelle le composant ; deux aides de données, `ligneGrilleBibliotheque` et `apercuGrilleBibliotheque` ; un geste, `garderGrilleDansBibliotheque(id)` (= `importerGrillesDansBibliotheque([grille])`, la même écriture que le geste groupé). L'aperçu de « Importer depuis un autre trimestre » passe à des classes. Les fonctions de données (ajouter, retirer, supprimer, dupliquer, importer) ne changent pas.

**Le défilement après un passage** : les neuf `fermerModalBibliothequeGrilles()` sont **tous** suivis de `afficherBibliothequeGrilles()` (mesuré). `BibliothequeUI.fermerModal` retient donc, pour une fenêtre en deux colonnes, le défilement, les aperçus ouverts et les replis ouverts ; la reconstruction les rend (au plus 10 s après). La case « Masquer » et les dossiers, qui redessinent sans fermer, sont capturés sur la fenêtre encore là. **Les aperçus ouverts restent ouverts.**

**Un autre fichier : `js/partage-section.js`** — `partageSection.rangeesDeuxColonnes(type)`, la section « Partagés par des collègues » en données : mêmes mots, mêmes gestes (« Dupliquer vers mes documents », ⋮ « Exporter pour partager », « Supprimer ») que `genererSectionHTML`, que gardent les neuf autres fenêtres. Sans elle, la section aurait gardé ses anciennes cartes à styles en ligne au milieu de la nouvelle fenêtre.

**`styles.css`** : un bloc `biblio2-*`, jetons existants seulement, deux modes (les deux panneaux : `--bleu-tres-pale` / `--fond-page-sature` en sombre, `--bleu-pale` / `--gris-tres-pale` en clair, les valeurs de la maquette). La règle `[id^="modalBibliotheque"] .btn { padding … !important }` des anciennes fenêtres exclut la nouvelle (`:not(.biblio2-voile)`), sinon ses boutons tombaient sous 44 px. Le `<select>` suit le patron de `.rangee-selection` ; spécificité `(0,3,1)` : `.mode-clair .modal-js-contenu select { background: white }` effaçait le chevron en clair (vu sur la première capture, corrigé).

**`index.html`** : les jetons de `styles.css`, `bibliotheque-ui.js`, `grilles.js`, `partage-section.js`.

## 2. ⋮ : la correspondance des trois gestes (§ 1.5)

| Libellé | Action | Ce qu'elle fait (mesuré) | Verdict |
|---|---|---|---|
| « Retirer de ce trimestre » | `retirerGrilleDeBibliotheque` | pose `dansBibliotheque = false` sur la grille du trimestre : elle quitte le menu de l'écran et la colonne ; ses données restent dans `grillesTemplates` du trimestre. | **Colle**, du point de vue de ce que l'utilisateur voit (la grille quitte « Dans ce trimestre »). Nuance : ses données restent dans le trimestre ; voir § 3. Éprouvé au banc. |
| « Supprimer définitivement » | `supprimerGrilleDefinitivement` | supprime la grille du trimestre (porte de sortie #624 : évaluations, productions, cartouches) **et** la retire de la bibliothèque (même `id`). | **Libellé gardé** (celui du `title` d'aujourd'hui). Aucun des deux mots validés ne le décrit : « Supprimer de ma bibliothèque » ne dit pas qu'elle quitte aussi le trimestre. **Question pour Grégoire** : le mot lui convient-il, sachant qu'il emporte aussi l'exemplaire de la bibliothèque ? |
| « Supprimer de ma bibliothèque » | `supprimerGrilleDeBibliothequePartagee` | retire la grille de `bibliothequeGrilles` seulement (codex proposé, confirmation, tombstone d'un gabarit). | **Colle.** |

Les deux libellés rouges du trimestre et celui de la bibliothèque gardent leurs confirmations (§ 6).

## 3. Piège 2 : la grille retirée qui n'est pas dans la bibliothèque

Introuvable dans l'interface : « Dans ce trimestre » ne liste que `dansBibliotheque !== false`, « Dans ta bibliothèque » ne lit que `bibliothequeGrilles`, le bandeau des doublons ne voit que ces deux listes, et le menu de l'écran comme celui des cartouches filtrent aussi. Seul « ← Utiliser dans ce trimestre » remet le drapeau, et il n'existe que sur une rangée de la bibliothèque. Elle reste lue par ses évaluations et part dans « Exporter les grilles de ce trimestre ». **Ce n'est pas neuf** : l'ancienne fenêtre avait le même trou. **Inscrit : #1160** (issue 2), avec deux pistes à trancher avec Grégoire. Une grille retirée **qui est** dans la bibliothèque se ramène, elle, par « ← Utiliser » (même `id`, `ajouterGrilleIndividuelle` remet le drapeau).

## 4. La preuve

**Banc neuf** `tests/integration/bibliotheque-deux-colonnes-1154.spec.js` (WebKit, vrai `index.html`, démonstration, vrai bouton « Consulter la bibliothèque ») : dix essais.
Les deux titres mot pour mot et les quatre anciens boutons absents (garde de non-vide : plus de 10 boutons lus) ; « Importer ou exporter ▾ » : ses trois entrées dans l'ordre, le séparateur, la note, et l'action de chacune (le sélecteur de fichier de l'import JSON pour la première, des témoins pour les deux autres) ; les trois passages et leurs états calmes (« ← Utiliser », « Garder → », « Tout garder ») avec l'écriture dans `bibliothequeGrilles` ; le défilement (décalage ≤ 2 px) et les aperçus ouverts des deux colonnes après un passage ; l'aperçu (lignes des critères, type, total « 100 % », `aria-expanded`) et la ligne en clair ; ⋮ des deux colonnes, libellés, rouges, et l'action appelée avec la bonne grille, puis « Retirer de ce trimestre » pour de vrai ; ni puce ni badge sans doublon (les lignes en clair lues, garde ≥ 6), puis un homonyme fictif semé : la puce sur les rangées nommées seulement, « Voir » qui pointe la rangée visée et la met dans la vue ; 44 px pour toutes les cibles (plus de 20 lues, bandeau compris), puis celles d'un ⋮ ouvert ; à 820 px, les panneaux empilés (boîtes mesurées) et les flèches ↓ ↑ ; Échap, menu puis fenêtre ; les dossiers (« Gérer les dossiers… », créer, « Classer dans », filtrer, « Non classées ») ; la mesure de l'exemplaire séparé (§ 0) ; les captures (`CAPTURES_1154`, sinon sauté).

**Break-tests, tous ROUGES puis original remis** (copie de sauvegarde, comparée octet pour octet après) : les seize écrits en tête du banc et des bancs réancrés ; liste : titres, action du menu, état « Aussi dans ta bibliothèque », aperçu, action de « Retirer », puce sans doublon, 44 px, défilement (la retenue de `fermerModal`), seuil de 760 px, Échap, filtre des dossiers, total de l'aperçu ; et pour les réancrés : `data-dossier` (T1), `afficherId` (291), « te propose » (1147), `echapperHtml(r.nom)` (467), `aide` de l'import (textes relus), la ligne des types (pratiques compatibles), `genererBadgeComposition` remis (P.a.4).

**Vitest** : 9 692 sur 9 693. **Le rouge restant est attendu et je ne l'ai pas contourné** : `sentinelle-anticache-fichiers-modifies` exige un `?v=` daté du jour du build ; le build est `1024-1447`, mes jetons sont du 25 (`20261025a`). `scripts/release.mjs` les repose à la version de fin du lot 3 (pas de release avant, plan « La livraison »). Leur donner une date du 24 aurait fait passer l'essai en disant faux.

**Playwright WebKit** : 110 essais verts, 0 rouge, 0 instable, dans les 33 fichiers de bibliothèque, de grilles, de doublons, de partage, de dossiers et des pratiques compatibles. Pas de verdict complet (règle 7, au signal de Grégoire).

**Captures** : `plans de travail/captures-2026-10-25-bibliotheques-deux-colonnes-1/` — `mac-1440-clair.png`, `mac-1440-sombre.png` (un aperçu et un ⋮ ouverts), `ipad-820-clair.png`.

## 5. Les bancs réancrés, et pourquoi

| Banc | Motif (écrit dans le fichier) |
|---|---|
| `integration/bibliotheques-menu-1147.spec.js` (« les cinq sous-titres tutoient ») | La fenêtre des grilles n'a plus de sous-titre (en-tête sur une ligne) ; l'essai lit, pour elle, la phrase sous « Dans ce trimestre », et ferme par le nouveau ×. |
| `integration/doublons-bandeau-291.spec.js` | Les cartes deviennent des rangées : la puce se compte dans `.biblio2-rangee`. Même défense (puce sur toute rangée nommée, ancre, « Voir »). |
| `integration/repertoires-grilles-T1-rendu.spec.js` | Plus de select compact par dossier : la rangée porte `data-dossier`, le menu de la barre a l'option du dossier, le passage remplace « Ajouter », ⋮ porte « Retirer du dossier ». |
| `integration/pratiques-compatibles-retirees.spec.js` | Le badge HOLIS / MIXTE devient la ligne en clair : l'essai lit « Algorithmique · 2 critères », « Holistique et algorithmique · 2 critères », « 0 critère ». |
| `integration/type-grille-lot1.spec.js` | Le badge parti, l'essai lit la composition qu'il affichait (`compositionGrille` : `ANALY`, puis `MIXTE`). |
| `unit/sentinelle-467-affichage-echappe.test.js` | `formaterTitre` en texte dans grilles.js 1 → 2 (les deux colonnes ; `libelle` parti) ; interpolations nues de bibliotheque-ui.js 29 → 40, **sans désescape**, les onze nommées dans le fichier. |
| `unit/sentinelle-pratiques-compatibles-retirees.test.js` | P.a.4 et P.c.2 : le badge est retiré (zéro dette, son dernier lecteur était cette fenêtre) ; reste tenu que la composition ignore le champ déclaré. |
| `unit/sentinelle-type-grille-lot1.test.js` | Deux lignes sur le badge retirées ; la composition reste éprouvée. |
| `unit/sentinelle-textes-relus-15-oct.test.js` | « Importer depuis un autre trimestre » des grilles est dessinée par le composant : l'essai lit les données de grilles.js (titre, aide, action, bulle) et le bouton d'aide du composant. |
| `fixtures/cliquets/classes-sans-regle-679.json` | Deux entrées sorties : `grilles.js:biblio-groupe-repertoire` et `gabarits-utils.js:badge-composition`, disparues. |

Les sentinelles #458 (cours), #468, #476 et #793 et le volet unitaire de #291 ne bougent pas : elles portent sur des fonctions que le lot ne touche pas (vérifié, vertes sans retouche).

## 6. Mes écarts avec la consigne

1. **Un fichier de plus : `js/partage-section.js`** (§ 1, « Partagés par des collègues » en données) ; et **`js/gabarits-utils.js`** : `genererBadgeComposition` et `LIBELLES_COMPOSITION_LONGS` retirés, leur dernier lecteur était cette fenêtre (règle « est-ce que je viens de le rendre orphelin ? »). `compositionGrille` reste (lue par `grilleEntierementEnPoints`).
2. **La seconde phrase de « Dans ta bibliothèque » retirée** (§ 0).
3. **Une seule couleur forte** : « Tout importer », les « Importer » de l'aperçu d'un autre trimestre et « Créer le dossier » passent en bouton secondaire (ils étaient principal ou vert). Mots et actions inchangés.
4. `BibliothequeUI.conduireAuxImportes` lit le libellé de la case « Masquer… » dans la fenêtre au lieu de le citer en dur : sinon, après un import JSON masqué, la phrase aurait nommé une case que la nouvelle fenêtre n'a plus. Les quatre autres fenêtres lisent leur libellé d'aujourd'hui, à l'identique.
5. Le banc écrit ses captures seulement avec `CAPTURES_1154` (le cliquet de la CI refuse un banc qui écrit dans `plans de travail/`).
6. `design-system.html` n'a pas reçu de spécimen de la fenêtre : la consigne ne le demandait pas ; à faire au lot 2 ou 6 si tu le veux.

## 7. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| Une grille retirée qui n'est pas dans la bibliothèque est introuvable (piège 2). | **2 — inscrite, #1160** (la consigne l'exige ; pas vécue par Grégoire). |
| « ← Utiliser dans ce trimestre » notifie encore « Grille ajoutée à ta sélection ! » (`ajouterGrilleIndividuelle`, fonction de données que le lot ne change pas). « Ta sélection » n'est plus un mot de la fenêtre. | **À soumettre à Grégoire** (mots qu'il lit) ; proposition : « Grille ajoutée à ce trimestre ! ». Même question pour l'`alert` « est déjà dans ta sélection » de la garde #476 et le bandeau des doublons (« Dans ta sélection », « Bibliothèque »), gardés tels quels. |
| « Tout garder dans ma bibliothèque » (`ajouterMesGrillesALaBibliotheque`) verse **toutes** les grilles du trimestre, y compris celles retirées de « Dans ce trimestre » ; son compte « tes N grilles » les inclut. Comportement d'aujourd'hui, gardé (§ 1.3). | **3 — nommée ici**, sans conséquence observable mesurée. |
| En démonstration, « Garder » écrit dans `bibliothequeGrilles`, la clé globale (pas de `demo_`) : la grille de démo y reste après la démo, masquée par le filtre démo. Même chose avec le geste groupé d'aujourd'hui. | **3 — nommée ici**, à mesurer si Cowork le juge utile. |

