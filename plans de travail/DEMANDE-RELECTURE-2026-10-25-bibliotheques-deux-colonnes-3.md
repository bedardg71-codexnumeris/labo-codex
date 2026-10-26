# Demande de relecture – Les bibliothèques en deux colonnes, lot 3 : les productions et les pratiques (#1156)

> Claude Code, dimanche 25 octobre 2026 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-25-bibliotheques-deux-colonnes-3.md` (et celles des lots 1 et 2, avec leurs verdicts). Branche `bibliotheques-deux-colonnes`, partie de `115747e1` ; commit de docs `c4ac6d13` (consigne, verdict du lot 2, plan). Pas de release, pas de verdict complet, pas de push.

## En bref

Les deux fenêtres (Conception › Productions étudiantes, et › Pratiques de notation, « Consulter la bibliothèque ») passent par le composant du lot 1. Les productions reprennent les gestes des échelles. Leur import d'un autre trimestre écrit dans la bibliothèque : sa ligne est au pied de « Dans ta bibliothèque ». Les pratiques reprennent ceux des cartouches : aucun passage sur une rangée du trimestre. L'encadré « Pour éditer une pratique… » est parti. Dans les productions, « Supprimer définitivement » garde maintenant l'exemplaire de la bibliothèque. Pour les pratiques, ce chemin le gardait déjà. La question le dit dans les deux fenêtres, et au chemin 2 des cartouches. Les deux bulles sont corrigées. Ce lot a migré les deux dernières fenêtres qui lisaient la zone « Mes dossiers », la ligne-select des dossiers et `partageSection.genererSectionHTML` : ces trois aides sont retirées.

## 1. Ce que j'ai mesuré, ce que j'ai supposé

**Mesuré**

- **L'import des productions d'un autre trimestre écrit dans la bibliothèque.** « Importer » passe par `importerUneProductionTrimestre` → `ajouterALaBibliotheque`, « Tout importer » par `importerToutTrimestreModal` → `importerDansBibliotheque`. Le banc le vérifie : la production importée est dans `bibliothequeProductions`, et absente de ce trimestre. Sa ligne est donc au pied de « Dans ta bibliothèque », comme pour les échelles, et sa bulle prend la phrase de Grégoire (§ 3).
- **Productions, les deux sens créent des objets séparés.** « ← Utiliser » crée un `id` neuf et pose `idOriginal`. « Garder → » copie la production sous le même `id`, dans une autre clé. Le banc modifie les deux copies ; aucun exemplaire ne bouge. **La seconde phrase de « Dans ce trimestre » est gardée.**
- **Pratiques, « ← Utiliser » (`ajouterPratiqueALaSelection`) garde le même `id`, mais écrit une copie dans `pratiquesConfigurables`.** Aucun code n'écrit une pratique du trimestre dans la bibliothèque. `importerPratiquesDansBibliotheque`, `ajouterPratiqueALaBibliotheque` et `mettreAJourConfigurationPratique` n'ont aucun appelant dans l'interface (vérifié par `grep`). Le banc modifie la copie, et l'exemplaire ne bouge pas. **La seconde phrase est gardée.**
- **Pratiques, « Supprimer définitivement » n'écrivait déjà que `pratiquesConfigurables`.** Je n'ai rien changé à ce que la fonction écrit. J'ai seulement ajouté la phrase.
- **Les pratiques de la démo n'ont pas de `type` au premier niveau** : il est sous `configuration.type`. Avant, aucun badge ne s'affichait pour elles. La famille est maintenant lue comme le moteur la lit (`PratiqueConfigurable._typeFamille`).
- **#1160, pratiques : oui, même défaut, et déjà avant ce lot.** Une pratique retirée qui n'est pas dans la bibliothèque n'apparaît dans aucune des deux colonnes. La section 2 d'avant ne lisait que la bibliothèque. Ses données restent. Rattachée à #1160.
- **#1160, productions : non.** Les retirées sont listées, comme celles des cartouches (§ 4).
- **#1161, productions : même défaut, lu dans le code mais pas sondé.** « Tout garder » ne teste l'existence que par `id` (`ajouterALaBibliotheque`). Rattachée à #1161.

**Supposé**

- **La ligne des productions donne la pondération de tout type**, artefacts compris (« Artefact d'un portfolio · 6,67 % »). C'est ce que la rangée disait, et la consigne cite « 6,67 % ». Le type s'écrit avec son libellé de lecture, sans le 📁 du portfolio : « Portfolio (conteneur) », le libellé existant.
- **L'aperçu ne nomme que ce qu'il trouve.** Pour les productions, la grille, l'échelle et la cartouche sont cherchées dans ce trimestre (par `id` ou `idOriginal`), puis dans la bibliothèque. Pour les pratiques, c'est `configuration.echelleId` et `configuration.grilleId`. Un identifiant que rien ne résout n'est pas montré. L'échelle intégrée des pratiques de la démo (`pratique.echelle`, sans nom) n'est pas montrée.
- **Le nom d'une rangée de production reste « Titre - Activité »**, comme avant.
- **Avant le lot, « Déjà dans ce trimestre » des productions écartait la rangée.** Il suit maintenant l'identité d'avant (`identitesEnSelection`, la règle du 22 août). Cette règle contient la relation unique et la déborde d'un cas : la copie sœur, qui a le même `idOriginal`, et que la garde #476 refuserait de toute façon. « Aussi dans ta bibliothèque » lit `lieeAExemplaire`.

## 2. Les gestes de ⋮, fenêtre par fenêtre

| Fenêtre | Rangée | Avant | Maintenant |
|---|---|---|---|
| Productions | trimestre | « Dupliquer » (bouton vert) ; ⋮ : Exporter pour partager, Retirer, Supprimer | « Garder dans ma bibliothèque → » (`garderProductionDansBibliotheque` → `importerDansBibliotheque([prod])`) ou « ✓ Aussi dans ta bibliothèque » ; ⋮ : « Dupliquer », « Exporter pour partager », **« Retirer de ce trimestre »** (`retirerProductionDeBibliotheque`), **« Supprimer définitivement »** (`supprimerProductionDefinitivement`) |
| Productions | bibliothèque | « Ajouter à ma sélection » ; ⋮ : Classer dans, Retirer du dossier, Supprimer | « ← Utiliser dans ce trimestre » (`ajouterProductionIndividuelle`) ou « ✓ Déjà dans ce trimestre » ; ⋮ : « Classer dans : … », « Retirer du dossier », **« Supprimer de ma bibliothèque »** (`supprimerProductionDeBibliothequePartagee`) |
| Productions | en-tête | « Ajouter mes productions à la bibliothèque » | « Tout garder dans ma bibliothèque », quand au moins deux productions n'y sont pas |
| Pratiques | trimestre | « Dupliquer » ; ⋮ : Exporter pour partager, Exporter (JSON), Retirer, Supprimer | **aucun passage** ; « ✓ Aussi dans ta bibliothèque » quand la relation le dit ; ⋮ : « Dupliquer », « Exporter pour partager », « Exporter (JSON) », « Retirer de ce trimestre » (`retirerPratiqueDeBibliothequeMateriel`), « Supprimer définitivement » (`supprimerPratiqueDefinitivement`) |
| Pratiques | bibliothèque | « Ajouter » (bouton marine) ; ⋮ : Classer dans, Retirer du dossier, Supprimer | « ← Utiliser dans ce trimestre » (`ajouterPratiqueALaSelection`) ou « ✓ Déjà dans ce trimestre » ; ⋮ : « Classer dans : … », « Retirer du dossier », « Supprimer de ma bibliothèque » (`supprimerPratiqueDeBibliothequePartagee`) |

Chaque libellé fait ce qu'il dit. Je n'ai gardé aucun ancien libellé.

Le menu « Importer ou exporter ▾ » reprend les mots des lots 1 et 2 :
- productions : « Importer des productions », « Importer le partage d'une ou d'un collègue », « Exporter les productions de ce trimestre » ;
- pratiques : « Importer des pratiques », la même ligne de partage, « Exporter les pratiques de ce trimestre ».

L'action de chaque entrée ne change pas. ⚠ Comme avant, l'import JSON écrit dans la bibliothèque, pour les deux familles.

## 3. Les phrases et les deux bulles

| Phrase | Gardée, changée ou ajoutée |
|---|---|
| « Les productions / pratiques que le menu de l'écran te propose pendant ce trimestre. Ce que tu y modifies ne change pas l'exemplaire de ta bibliothèque. » | **Gardée** dans les deux fenêtres (mesures du § 1) |
| « Les productions / pratiques que tu gardes pour tous tes trimestres. » | Gardée, sans « C'est d'ici que tu peux les partager. » (même raison qu'aux lots 1 et 2) |
| « Son exemplaire de ta bibliothèque reste. » | **Productions** : ajoutée à la question de « Supprimer définitivement » (`uiDialogues.confirmerAction`, sur une ligne, après un espace), quand `lieeAExemplaire` le dit. Ses deux chemins, le ⋮ et le bandeau des doublons, passent par cette fonction. **Pratiques** : même condition. Le `confirm` natif est gardé, et la phrase vient après une ligne vide. **Cartouches, chemin 2** (`supprimerCartoucheConfirm`) : elle remplace « Elle reste dans la Bibliothèque. », et la condition passe à `lieeAExemplaire`. Rien d'autre ne change |
| « ta sélection » → « ce trimestre » | Refus de la garde #476 : productions et pratiques. « Cette pratique est déjà dans ce trimestre. » « Pratique retirée de ce trimestre ». La question de « Retirer » des productions devient « Retirer de ce trimestre » / « Retirer cette production de ce trimestre ? … » (la suite ne change pas). Lieux du bandeau des doublons, case « Masquer » |
| Après un import JSON | « Consulte « Productions / Pratiques disponibles » pour les ajouter à ta sélection. » nommait une section qui n'existe plus. Elle devient la phrase des trois autres fenêtres : « Elles sont dans ta bibliothèque : « Utiliser dans ce trimestre » les ajoute à ce trimestre. » (`productions-import-export.js`, `pratiques-gestion.js`) |
| Bulle `import-trimestre-tout-echelles` | « Copie toutes les échelles de ce trimestre dans ta bibliothèque. Les originales restent intactes. » (Grégoire, 25 oct.) |
| Bulle `import-trimestre-tout-productions` | « Copie toutes les productions de ce trimestre dans ta bibliothèque. Les originales restent intactes. » (mesure du § 1 : leur import écrit dans la bibliothèque) |

Les trois autres bulles sont inchangées.

## 4. Les retirées (consigne, § 3.1)

- **Productions.** Une production retirée reste dans « Dans ta bibliothèque », avec la ligne « Retirée de ce trimestre · … », à la même place que les cartouches. « ← Utiliser » la remet. Son ⋮ garde « Classer dans » et « Retirer du dossier » s'il y a des dossiers, et perd le « Supprimer » d'avant, qui n'y faisait rien. Une retirée qui porte l'`id` d'un exemplaire n'est listée qu'une fois : « ← Utiliser » sur l'exemplaire la remet.
- **Pratiques.** Mesurées et rattachées à #1160 (§ 1).

## 5. Le chemin 2 de la suppression d'une cartouche (consigne, § 4)

C'est fait : la phrase est celle de Grégoire, et la relation passe par `lieeAExemplaire`. La sentinelle #647 est réancrée. Elle a un essai neuf, sur une cartouche ramenée (`idOriginal`), et son assertion d'absence devient insensible à la casse, sans quoi elle ne prouvait plus rien.

## 6. Les bancs

**Neuf : `tests/integration/bibliotheque-deux-colonnes-1156.spec.js`.** Ce sont 17 essais WebKit dans le vrai `index.html`, depuis la démo, à 1 440 et à 820 px, plus l'essai des captures (`CAPTURES_1156`). Chacun des 16 break-tests listés en tête du fichier rougit.

**Réancrés**, chacun avec son motif écrit dans le fichier et un break-test qui rougit :

| Banc | Motif | Break-test |
|---|---|---|
| `unit/sentinelle-textes-relus-15-oct` | les deux fenêtres passent en données ; texte corrigé par Grégoire le 25 oct. (échelles, productions : `toBe` exact) | bulle des productions remise en « ton trimestre actif » → ROUGE |
| `unit/sentinelle-647-suppression-cartouche-dit-vrai` (chemin 2) | la phrase et la relation ; essai neuf sur la cartouche ramenée ; absence sans la casse | l'ancienne phrase → ROUGE ; la relation par `id` seul → ROUGE |
| `unit/exploration-maquette-filtre-326` | le site devient `preparerDonneesBibliothequePratiques`, avec `sites: 2` (une fois par colonne) | le filtre retiré d'une seule colonne → ROUGE (resté VERT avant `sites: 2`, d'où l'ajout) |
| `unit/sentinelle-467-affichage-echappe` (C.t, C.n) | comptes à la baisse (la zone et la ligne-select retirées) ; pratiques, titres 1 → 2 (le nom des rangées, en texte, échappé par le composant, comme grilles et échelles) | `echapperHtml(r.nom)` → `r.nom` → ROUGE |
| `unit/sentinelle-lot-C-memes-gestes` (A.a) | la corbeille des dossiers vit dans la barre de la fenêtre : le banc rend la fenêtre et la lit | un « ✕ » plein ajouté à la barre → ROUGE |
| `unit/partage-section-P4` (5 essais) | `genererSectionHTML` retirée : `rangeesDeuxColonnes` | « Dupliquer vers mes documents » → « Dupliquer » → ROUGE |
| `unit/sentinelle-898-echelle-a-l-adoption` | « ← Utiliser » redessine la fenêtre : le faux composant reçoit ce qu'elle lit. Aucune assertion changée | sans objet |
| `fixtures/cliquets/classes-sans-regle-679.json` | le cliquet descend : `biblio-groupe-repertoire` quitte deux fichiers | aucun (il ne fait que descendre) |
| `integration/bibliotheques-menu-1147` (sous-titres) | les deux fenêtres lisent la phrase de « Dans ce trimestre » | « te propose » → « vous propose » → ROUGE |
| `integration/productions-biblio-ajout-identite` | l'item ne quitte plus la colonne : plus de passage, et « ✓ Déjà dans ce trimestre » | `dejaDansCeTrimestre` toujours faux → ROUGE |
| `integration/repertoires-productions-T3-rendu`, `…-L2-rendu` | comme T2 au lot 2 : le menu de la barre, `data-dossier`, « Classer dans » et « Retirer du dossier » au ⋮ ; L2 joue aussi le filtre | `dossier` retiré des rangées → ROUGE (×2) |
| `integration/repertoires-bibliotheque-L1-rendu` | la zone repliable part : la gestion s'ouvre par « Gérer les dossiers… » et se ferme par « Fermer » | `zone.hidden = false` retiré → ROUGE |

**Inchangés et verts** : 1154, 1155, `doublons-bandeau-291`, `doublons-lisibilite-291`, `import-grilles-conduit-a-la-carte`, `import-pratiques-inter-trimestre-briqueC`, `import-preview-inter-trimestre-prod-echelles`, `maquettes-decouvrabilite-326`, `partage-import-rendu`, `pratiques-898`, `pratiques-909-903`, `productions-ajout-refus-garde-340`, `repertoires-grilles-T1-rendu`, `repertoires-echelles-T2-rendu`, `bibliotheques-import-persistance`.

Ensemble, 92 essais passent. Un seul est instable : un `page.goto` a expiré dans `doublons-lisibilite-291`, sans lien avec le lot, et il est vert trois fois de suite.

Vitest : 9 694 sur 9 695. Le seul rouge est l'anti-cache, pour `gabarits-utils.js` (jeton du 25, posé au lot 1, accepté). `partage-section.js`, modifié par ce lot, a pris le jeton que proposait le hook (`20261024a`, jamais servi pour ce fichier), et il sort de ce rouge. Les jetons des fichiers touchés suivent le patron du lot 2.

## 7. Mes écarts avec la consigne

1. **Ce lot a retiré trois aides qui n'avaient plus de lecteur** : la zone « Mes dossiers » (`repertoires.genererZone`, `basculer`), la ligne-select des dossiers (`renderLigneDossierSelect` et ses quatre gestes `…Sel`, `_labelItem`, `_reps`, `_labelPluriel`), et `partageSection.genererSectionHTML` avec son `echapper`. Les modules n'enregistrent plus que `rafraichir`. J'ai appliqué le test « est-ce que je viens de l'écrire ? » : c'est ce lot qui les rendait orphelines. `creerModal`, `renderCarteSelection` et `renderCarteDisponible` restent, quatre fenêtres s'en servent encore (lot 6).
2. **`genererBadgeSourcePratique` et `genererIdCourtPratique` sont retirés.** La première n'a plus de lecteur depuis ce lot. La seconde n'en avait déjà plus avant.
3. **La note des maquettes (#326) est gardée** au-dessus des colonnes, avec les mêmes mots et le même geste, en classes (`.biblio2-note`, nouvelle, avec les jetons d'information). La consigne ne la nommait pas, et c'est un geste d'aujourd'hui.
4. **« ← Utiliser » des pratiques redessine maintenant la fenêtre**, à la même position de défilement. Avant, il la fermait. C'est la règle du lot 1, § 1.7.
5. **Le composant gagne deux options** pour l'import des productions : `selectOnChange`, et `selectSecond` pour le filtre de cours. Les autres fenêtres n'en reçoivent rien.
6. **La famille des pratiques** est lue sur le code du registre. `DEN` couvre la dénotation canonique comme l'ancien `denombrement`.
7. **`FAMILLES_TAXONOMIQUES`** éclate la table de `obtenirDescriptionCourtePratique`, qui la recompose telle qu'avant.

**Fichiers touchés** :
- `js/productions-bibliotheque-ui.js`, `js/pratiques-gestion.js`, `js/bibliotheque-ui.js`, `js/partage-section.js`, `js/cartouches.js` (chemin 2), `js/accompagnement-contenu-hover.js`, `js/productions-import-export.js` (la phrase d'après l'import) ;
- `js/grilles.js` et `js/echelles.js` : `labelPluriel` retiré de l'enregistrement, et rien d'autre ;
- `styles.css`, `index.html` (jetons), `BACKLOG.md`, le plan, les bancs.

Je n'ai touché ni `js/config.js` ni `js/navigation.js`. **Stock** : rien n'est réparé. Les productions déjà supprimées ont perdu leur exemplaire.

## 8. Les trouvailles

| Trouvaille | Issue |
|---|---|
| « Garder une pratique dans ma bibliothèque » : le geste n'existe pas, mais l'écriture existe | **Inscrit : #1164** (consigne, § 2.1), avec la même question de références que #1163 (`configuration.echelleId`, `grilleId`) |
| Une pratique retirée et absente de la bibliothèque est introuvable | **Rattaché à #1160**, mesuré par le banc (pas de « Retirée » pour les pratiques) |
| « Tout garder » des productions verse un second exemplaire d'une production ramenée | **Rattaché à #1161** (lu, pas sondé) |
| La phrase d'après l'import JSON nommait « Productions / Pratiques disponibles » | **Corrigé maintenant** : le lot rendait la phrase fausse. J'ai repris les mots validés des trois autres fenêtres |
| `ajouterProductionsABibliotheque` n'a pas d'appelant et lit des cases à cocher qui n'existent pas | **Commenter et oublier** : déjà mort avant le lot, commentaire posé |
| La démo ne fixe le type de ses pratiques que dans `configuration.type`, et leur échelle y est intégrée, sans nom | **Commenter et oublier** : la lecture du moteur suffit, c'est dit au code |

## 9. Les mots neufs, à part (pour Grégoire)

1. **« Retirée de ce trimestre · … »** sur une production retirée. C'est le mot qu'il a gardé pour les cartouches, appliqué ici : la consigne, § 3.1, le prévoit. Je le signale seulement.
2. **Les phrases de colonne vide.**
   - Productions : « Aucune production dans ce trimestre. Prends-en une dans ta bibliothèque, ou crée-la à l'écran. » ; « Ta bibliothèque est vide. Garde-y une production de ce trimestre pour la retrouver plus tard. »
   - Pratiques : « Aucune pratique dans ce trimestre. Prends-en une dans ta bibliothèque, ou crée-la à l'écran. » ; « Ta bibliothèque est vide. » (sans « Garde-y » : le geste n'existe pas, #1164). Les gabarits la remplissent toujours, donc cette phrase ne devrait pas paraître.
   - Filtre : « Toutes les productions / pratiques de ta bibliothèque sont déjà dans ce trimestre. » ; « Aucune production / pratique dans ce dossier. »
   - Ces phrases suivent le patron des échelles. Seul « crée-la à l'écran » est neuf : les échelles nomment leur bouton (« + Nouvelle échelle »), et je n'ai pas voulu nommer un bouton sans l'avoir vérifié.
3. **« Dénombrement » pour DEN.** C'est le libellé de la table taxonomique, cité par la consigne. Mais l'infobulle du badge DEN de l'éditeur dit « PAN – Dénotation » : l'app nomme la même famille de deux façons. **À trancher par Grégoire.**
4. **Les libellés de l'aperçu** : « Grille de critères d'évaluation », « Échelle de performance », « Cartouche de rétroaction », précédés d'« Objectif : ». Ce sont les libellés de la fiche production, et ils servent aussi pour les pratiques. L'éditeur de pratique dit « Échelle à utiliser » et « Grille de critères (optionnelle) ».

## 10. Captures

`plans de travail/captures-2026-10-25-bibliotheques-deux-colonnes-3/` : productions et pratiques, Mac 1 440 clair et sombre (un aperçu et un ⋮ ouverts), iPad 820 clair.
