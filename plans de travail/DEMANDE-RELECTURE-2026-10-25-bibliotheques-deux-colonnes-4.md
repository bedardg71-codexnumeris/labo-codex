# Demande de relecture – Les bibliothèques en deux colonnes, lot 4 : la Carte d'alignement, puis ce qui prépare la mise en ligne (#1157)

> Claude Code, dimanche 25 octobre 2026, fin d'après-midi. Branche `bibliotheques-deux-colonnes` : consigne `2798558e` (docs) ; lot `63c324c6` (`feat(bibliotheques)`). `main` = `ccc02ccc`, non touché.
> Consigne : `CONSIGNE-LOT-2026-10-25-bibliotheques-deux-colonnes-4.md`. Captures : `captures-2026-10-25-bibliotheques-deux-colonnes-4/` (la Carte, Mac 1 440 clair et sombre avec un aperçu et un ⋮ ouverts, iPad 820 clair ; le spécimen).
> **Pas de release, ni verdict complet, ni push, ni fusion.** La copie de travail revient sur `main` à la fin.

## 0. Ce que tu trouveras, en bref

1. La Carte d'alignement passe en deux colonnes, **sans relation** entre une carte et son exemplaire : aucun état calme, aucun « Tout garder », le passage reste sur chaque rangée. #1165 inscrite.
2. Le composant prend trois options et une aide, sans rien changer à ce que les cinq autres fenêtres reçoivent.
3. Le spécimen, section 25 de `design-system.html`.
4. Le markdown de la porte terrain ; les étapes de la livraison au plan.
5. **À part, pour Grégoire (§ 5)** : le texte proposé de l'aide, celui des Nouvelles, les mots neufs. Rien de cela n'est codé, sauf les mots neufs de la fenêtre.

## 1. Mesuré et supposé

| | Constat | Comment |
|---|---|---|
| Mesuré | « Partager » et « Garder → » sont le même geste : `partagerAlignement` → `demanderMetadonneesEnrichies` → `ajouterAlignementALaBibliotheque`, `id` neuf `ALI_…`. | Lecture ; banc : la fenêtre des métadonnées est appelée une fois avec `('alignement pédagogique', nom)`, annulée → rien n'est écrit, validée → un exemplaire de plus. |
| Mesuré | Les deux passages font des copies séparées : `importerDepuisBibliotheque` et `exporterCartePourBibliotheque` clonent par `JSON.parse(JSON.stringify(…))`. **La seconde phrase de « Dans ce trimestre » est gardée.** | `js/planification-donnees.js` l. ~340 et ~379. |
| Mesuré | Aucun des deux passages ne nomme sa source : rien ne permet de dire « déjà gardée ». | Lecture des deux fonctions ; banc : après chaque passage, `.biblio2-etat` = 0 et le passage reste. |
| Mesuré | « Importer depuis un autre trimestre » écrit dans ce trimestre (`importerCarteTrimestreVersActif` → `reprendreCarte`) : au pied de « Dans ce trimestre ». | Lecture. |
| Mesuré | La dernière carte ne se supprime toujours pas : la notification d'avant, aucune question posée, l'index intact. | Banc. |
| Mesuré | Aucune écriture de données n'a changé : les fonctions `partagerAlignement`, `ajouterAlignementDepuisBibliotheque`, `supprimerAlignement…`, `importerAlignementFichier`, `importerCarteTrimestreVersActif`, `dupliquerAlignementDuTrimestre` sont intactes. | `git show 63c324c6 -- js/planification-bibliotheque.js` : seuls l'affichage et `importerAlignementsTrimestre` (le rendu des rangées « Voir les cartes ») bougent. |
| Supposé | Une carte du trimestre n'a jamais d'aperçu : son entrée d'index ne porte ni description, ni auteur, ni licence. | Lecture de `creerEntreeIndex` ; la rangée d'avant ne montrait que les comptes. |
| Supposé | La phrase de colonne vide du trimestre n'est presque jamais lue : un trimestre garde toujours au moins une carte. | Lecture (`initialiserSiNecessaire`, la garde de la dernière carte). Écrite au patron des autres quand même. |

## 2. La correspondance des gestes

| Avant | Maintenant | Action |
|---|---|---|
| « Partager » (bouton vert) | « Garder dans ma bibliothèque → » | `partagerAlignement`, fenêtre des métadonnées comprise |
| « Ajouter » | « ← Utiliser dans ce trimestre » | `ajouterAlignementDepuisBibliotheque` |
| ⋮ du trimestre : Dupliquer, Exporter, Supprimer | ⋮ : « Dupliquer », « Exporter », séparateur, « Supprimer définitivement » (rouge) | `dupliquerAlignementDuTrimestre`, `exporterAlignementJSON`, `supprimerAlignementDuTrimestre` (codex, question, refus pour la dernière carte : inchangés) |
| ⋮ de la bibliothèque : Supprimer | ⋮ : « Supprimer de ma bibliothèque » (rouge) | `supprimerAlignementDeBibliotheque` |
| « Importer une carte (JSON) » sous la première section | « Importer ou exporter ▾ » › « Importer une carte », note « Fichier .json » | le même champ `#biblio-alignements-fichier-import`, le même `_importerAlignementFichierChange` |
| « Importer depuis un autre trimestre », « Même cours », « Reprendre », « Voir les cartes », « Importer » | Au pied de « Dans ce trimestre », replié ; mêmes mots, mêmes actions, mêmes identifiants | `importerAlignementsTrimestre`, `importerCarteTrimestreVersActif` |
| Étiquettes « Trimestre actif », « Bibliothèque » ; « 17 noeud(s) · 12 lien(s) · auteur · licence » | « 17 nœuds · 12 liens », puis « par <auteur> » quand ce n'est pas l'utilisateur actif ; l'aperçu : description courte, « Auteur », « Licence » | — |

Aucun geste perdu, aucun geste neuf.

## 3. Le composant (`js/bibliotheque-ui.js`)

Les cinq autres fenêtres passent toujours un `apercu` et un `actionTout` (mesuré : `apercu:` présent dans les rangées des cinq modules) ; rien ne change pour elles.

- `rangee.apercu` absent : le nom est un `<p class="biblio2-rangee-nom biblio2-rangee-nom--fixe">`, pas un bouton, et aucun aperçu n'est rendu (§ 1.3 de la consigne).
- `importAutreTrimestre.actionTout` absent : pas de « Tout importer » (la Carte n'en a jamais eu).
- `importAutreTrimestre.enTete = { id, titre, rangees }` : « Même cours » en tête du repli.
- `importAutreTrimestre.ouvert` : le repli s'ouvre d'emblée (écart 1, § 6).
- `BibliothequeUI.renderRangeesImport(rangees)` : les rangées d'import au patron `biblio2-import-rangee` des autres fenêtres, échappées dans le composant ; sert à « Même cours » et à « Voir les cartes ».

CSS : `.biblio2-rangee-nom--fixe`, `.biblio2-import-entete`. Aucun style en ligne dans le HTML généré : `planification-bibliotheque.js` n'en construit plus du tout.

## 4. La preuve

- **Banc neuf** `tests/integration/bibliotheque-deux-colonnes-1157.spec.js`, dans le vrai `index.html`, depuis la démonstration, par le vrai bouton « Consulter la bibliothèque » : 8 essais + les captures, à 1 440 et à 820 px. **9 break-tests**, tous rougissent (liste en tête du fichier).
- **Bancs réancrés**, motif écrit dans chaque fichier :

| Banc | Motif | Break-test |
|---|---|---|
| `integration/planif-barre-lot3.spec.js` | le menu ⋮ d'une rangée s'appelle `biblio-menu-trimestre-<id>` ; « Supprimer » devient « Supprimer définitivement » | le banc neuf porte la même assertion (⋮ → `supprimerAlignementDeBibliotheque` rougit) |
| `integration/planif-toolbar.spec.js` (« import inter-trimestre ») | la ligne d'import est repliée : le banc ouvre le repli avant de choisir le trimestre | le banc neuf (« Même cours », `ouvert: false` rougit) |
| `unit/sentinelle-echappement-audit-386.test.js` | `ligneCarteTrimestre` est partie ; l'échappement vit dans le composant (`renderRangeesImport`) | `echapperHtml(r.nom)` → `r.nom` : rougit ; une chaîne `'<span>' + nom +` remise dans le module : rougit |
| `unit/sentinelle-467-affichage-echappe.test.js` | `planification-bibliotheque.js` : 2 → 0 interpolations nues, à la baisse | la même chaîne remise : rougit |

- `grep -rlE "afficherBibliothequeAlignements|modalBibliothequeAlignements|Mes cartes d'alignement|partagerAlignement" tests/` : `planif-barre-lot3.spec.js` (réancré), `sentinelle-tactile-alignement-444.test.js` (le bouton de la barre, inchangé, vert), et le banc neuf.
- **Vitest** : 9 694 sur 9 695 sur `63c324c6` ; le seul rouge est `sentinelle-anticache-fichiers-modifies`, connu (§ 7). En chemin, le cliquet #858 a refusé la découpe par `indexOf` de #386 réancrée : elle passe par `tranche()`.
- **Playwright** (WebKit), les bancs des six fenêtres et ceux qui touchent une bibliothèque ou la Carte (`bibliotheque-deux-colonnes-1154` à `-1157`, `bibliotheques-*`, `doublons-*`, `repertoires-*`, `planif-barre-lot3`, `planif-toolbar`, `pratiques-compatibles-retirees`, `productions-biblio-ajout-identite`, `type-grille-lot1`, `cours-actif-hors-bibliotheque-916`, `diagnostic-doublons-lecture-seule`) : **117 verts, 4 sautés** (les essais de captures, sans leur variable), 0 rouge, 10,5 min. Lancé avant le commit, sur l'arbre de travail du lot ; pendant le passage, j'ai rejoué le break-test de #386, qui a modifié `js/bibliotheque-ui.js` quelques secondes (remis à l'identique, `git diff` vérifié) : aucun rouge n'en est sorti. Le verdict complet suit la règle 7, à la livraison.
- **Le spécimen** : `design-system.html` s'ouvre sans erreur de console (WebKit, relevé des `console.error` et `pageerror` : vide) ; capture `specimen-design-system-1440.png`.

## 5. À part, pour Grégoire

### 5.1 L'aide « Comment fonctionne la bibliothèque » (proposée, PAS codée)

Elle se pose en retouche une fois validée, dans `js/accompagnement-contenu-popup.js` (`bibliotheque-fonctionnement`), avec la même forme de sections. Les six fenêtres de la Conception y mènent ; les quatre autres aussi, et elle leur restera fausse jusqu'aux lots 5 et 6 (assumé).

> **Deux colonnes**
> « Dans ce trimestre » : ce que le menu de l'écran te propose pendant ce trimestre. « Dans ta bibliothèque » : ce que tu gardes pour tous tes trimestres.
>
> **Passer d'une colonne à l'autre**
> - « Garder dans ma bibliothèque → » copie un élément de ce trimestre dans ta bibliothèque.
> - « ← Utiliser dans ce trimestre » copie un élément de ta bibliothèque dans ce trimestre.
> - Chaque colonne garde son propre exemplaire : ce que tu modifies dans ce trimestre ne change pas celui de ta bibliothèque.
>
> **Retirer ou supprimer** (dans le menu ⋮)
> - « Retirer de ce trimestre » : l'élément quitte le menu de l'écran, ses données restent. S'il est dans ta bibliothèque, « ← Utiliser dans ce trimestre » le ramène.
> - « Supprimer définitivement » : l'élément est effacé de ce trimestre. Son exemplaire de ta bibliothèque reste.
> - « Supprimer de ma bibliothèque » : l'exemplaire de ta bibliothèque est effacé ; ce trimestre n'est pas touché.
>
> **Les dossiers**
> Au-dessus de ta bibliothèque, le menu « Tous les dossiers » n'en montre qu'un à la fois ; « Gérer les dossiers… » les crée et les renomme ; dans ⋮, « Classer dans » y range un élément.

Choix faits, à confirmer : « Supprimer de ma bibliothèque » ajouté (il est sur l'écran, et c'est le troisième geste qu'on confond) ; « Importer ou exporter ▾ » et « Masquer ce qui est déjà dans ce trimestre » laissés de côté (ils se lisent seuls). « ramène » : le geste remet un **exemplaire** de la bibliothèque dans ce trimestre, pas l'élément retiré lui-même ; si Grégoire préfère l'exactitude à la brièveté : « … en remet un exemplaire ».

### 5.2 Les Nouvelles (proposées, pour la release qui portera les quatre lots)

```
{ version: '1.218', couleur: 'vert', titre: 'Les bibliothèques en deux colonnes', items: [
  'Conception : les six bibliothèques (grilles, échelles, cartouches, productions, pratiques, cartes d’alignement) s’ouvrent en deux colonnes, « Dans ce trimestre » à gauche et « Dans ta bibliothèque » à droite. Sur l’iPad en portrait, elles s’empilent.',
  'Un seul bouton par rangée fait passer un élément d’une colonne à l’autre : « Garder dans ma bibliothèque → » ou « ← Utiliser dans ce trimestre ». Une coche te dit quand il est déjà de l’autre côté. Les autres gestes (Dupliquer, Exporter, Retirer, Supprimer) sont dans le menu ⋮.',
  'Touche le nom d’un élément pour voir ce qu’il contient (les critères d’une grille, par exemple) sans quitter la fenêtre.',
  '« Supprimer définitivement » efface l’élément de ce trimestre, mais garde son exemplaire de ta bibliothèque, et te le dit avant d’effacer.',
  'Les fichiers sont réunis dans « Importer ou exporter ▾ », en haut de la fenêtre ; les dossiers et « Masquer ce qui est déjà dans ce trimestre », au-dessus de ta bibliothèque.',
  'Carte d’alignement : « Partager » s’appelle maintenant « Garder dans ma bibliothèque → ». Ici, pas de coche : le bouton reste offert même pour une carte déjà gardée.'
] }
```

Le numéro `1.218` est supposé (une `minor` après la 1.217) : la release le fixera. Le skill demande 6 à 8 items ; il y en a 6.

### 5.3 Les mots neufs dans la fenêtre de la Carte (codés)

| Mot | D'où il vient |
|---|---|
| « Importer une carte » (au lieu de « Importer une carte (JSON) ») | la consigne, § 1 ; la note « Fichier .json » dit le format |
| « Supprimer définitivement », « Supprimer de ma bibliothèque » | la consigne, § 1 ; mots déjà validés |
| « Aucune carte d'alignement dans ce trimestre. Prends-en une dans ta bibliothèque, ou crée-la avec « Nouvelle carte ». » | le patron des cinq autres fenêtres ; « Nouvelle carte » est le libellé existant d'« Actions ▾ » |
| « Ta bibliothèque est vide. Garde-y une carte de ce trimestre pour la retrouver plus tard. » | la consigne, § 1.4 |
| « Auteur », « Licence » (aperçu) | libellés existants de la fenêtre des métadonnées (`js/cc-license.js`) |
| Bulles (`title`) : « Créer une copie dans ce trimestre », « Supprimer cette carte de ce trimestre » | « le trimestre actif » devient « ce trimestre », comme ailleurs |

**Non touché** : la question de « Supprimer définitivement » dit encore « … du trimestre actif ? », et la notification « Impossible de supprimer la dernière carte du trimestre actif. » La consigne n'en parlait pas.

## 6. Mes écarts

1. **Le repli « Importer depuis un autre trimestre » s'ouvre d'emblée quand « Même cours » a des cartes** ; sinon il est replié, comme ailleurs. Motif : c'est le geste de la rentrée (#368), visible d'emblée avant ce lot ; le replier l'aurait caché derrière un toucher. À refuser si la règle « replié sur une ligne » doit valoir partout.
2. **« Reprendre » et « Importer » perdent leur vert** (`btn-confirmer` → `btn-secondaire`) et le détail quitte les parenthèses pour la ligne sous le nom : le patron `biblio2-import-rangee` des cinq autres fenêtres (une seule couleur forte, le passage).
3. **`design-system.html` charge `css/accompagnement.css`**, sans quoi le bouton d'aide du spécimen était un carré gris ; la section porte `aide-contextuelle-active` (dans l'app, le bouton ne paraît qu'avec l'aide contextuelle). Les autres sections du guide n'emploient pas `btn-aide-contextuelle` : rien d'autre ne change à l'œil (relu sur la capture).
4. **Le spécimen montre la fenêtre des grilles**, pas celle de la Carte : c'est la seule qui porte à la fois un passage, un état calme, un aperçu en tableau et la barre des dossiers.

## 7. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| Aucune relation entre une carte et son exemplaire : garder deux fois fait deux exemplaires | **Inscrite** : #1165 (consigne § 1.1) |
| La bulle d'aide de « Consulter la bibliothèque » reste affichée par-dessus la fenêtre quand la souris n'a pas bougé (vue sur la première capture à 1 440 px ; le banc éloigne désormais la souris). Existait avant ce lot, même bouton, même fenêtre par-dessus | **Commenter et oublier** : une bulle au survol qui part au premier mouvement ; pas de symptôme vécu |
| Les questions et notifications de la Carte disent « trimestre actif » | **Commenter et oublier** : vrai, hors du lot, sans conséquence |
| `sentinelle-anticache-fichiers-modifies` rouge en Vitest | **Rien** : connu, le même que l'audit de début de session et le relais ; la release posera les `?v=` |
