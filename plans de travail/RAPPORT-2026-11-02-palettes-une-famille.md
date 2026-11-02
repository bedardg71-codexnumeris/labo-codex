# Rapport — les palettes d'Annoter et d'Évaluer, une même famille

**Consigne** : `plans de travail/CONSIGNE-LOT-2026-11-02-palettes-une-famille.md` (commit `cc069f08`).
**Pour** : Cowork (relecture croisée), puis Grégoire (gestes sur l'iPad).
**Écrit par** : Claude Code, le 2 novembre 2026.
**État** : les § 0 à 4 sont livrés en commits, un par section. Ni release ni verdict complet (consigne, § 6).

| Section | Commit | Ce qu'elle livre |
|---|---|---|
| § 0 | `cc069f08` | la consigne seule ; mesure « avant » ; `design-system.html` § 26 (avec le § 2) |
| § 1 | `4e2ce227` | ↔ et ↕ retirés, un seul bouton de version, la géométrie d'avant ignorée une fois |
| § 2 | `14103b77` | l'Annotation étendue, en tuiles, la rangée du bas collée |
| § 3 | `63a127a8` | Tampons compacte, aucun nom coupé dans la famille |
| § 4 | `2ee828ab` | un seul verrou, « Verrouiller » / « Déverrouiller », le cadenas de l'en-tête retiré |

---

## 1. La mesure, en tête

Banc : `tests/integration/harness/banc-copie-annotation.js` (une copie, les trois palettes d'Annoter ouvertes), WebKit.
Hauteurs en pixels CSS.

| | 1180 × 820 avant | 1180 × 820 après | 1280 × 720 avant | 1280 × 720 après |
|---|---|---|---|---|
| Zone d'Annoter, hors plein écran | 416 | 416 | 316 | 316 |
| Zone d'Annoter, en plein écran | 777 | 777 | 677 | 677 |
| Annotation : largeur | 188 (seule version) | 200 étendue · 188 compacte | 188 | 200 · 188 |
| Annotation : hauteur de son contenu (étendue) | 339 (compacte, seule version) | 603 | 339 | 603 |
| Annotation : hauteur affichée (étendue) | 341 | 392 (défile) | 292 | 292 (défile) |
| Codes, Tampons : largeur | 200 | 200 étendue · 188 compacte | 200 | 200 · 188 |
| Tampons : hauteur de son contenu | 450 | 482 (noms sur deux lignes) | 450 | 482 |
| Noms de tampons coupés (par défaut) | 5 | 0 | 5 | 0 |

Les cinq noms coupés avant : Unistructurel, Multistructurel, Id. directrice, Id. principale, Id. secondaire.

Mesure « après » prise sur le code du § 4, palettes par défaut (donc en étendue) ; la compacte de l'Annotation n'a pas
changé de contenu.

**Ce que la mesure dit** : l'Annotation étendue (603) tient entière en plein écran (777, 677). Hors plein écran (416,
316), elle défile, et la rangée Annuler · Supprimer · Rétablir · Effacer la page reste collée en bas : « Annuler » est
toujours visible, aux deux formats, et un essai le vérifie (§ 5).

---

## 2. Ce que j'ai décidé seul (suppositions nommées)

1. **Le compte de Codes est une pastille dans les deux versions** (« 23 », les mots « 23 erreurs » dans sa bulle et
   son `aria-label`). Le texte « (23 erreurs) » poussait l'engrenage sur le bouton de version, mesuré. Le titre ne
   revient plus à la ligne.
2. **La rangée du bas de l'Annotation est collante** (`position: sticky`) et passe au-dessus de la poignée du coin :
   un toucher sur « Effacer la page » n'est jamais pris pour un redimensionnement.
3. **Une clé neuve pour la géométrie** (`<id>-geometrie`) : l'ancienne (`<id>-pos`), qui pouvait porter un bandeau de
   1 156 px, n'est plus lue. Rien n'est effacé : le stock reste tel quel chez Grégoire (tarir, pas réparer).
   Conséquence : une palette élargie à la main avant le lot s'ouvre une fois à sa taille par défaut.
4. **Les versions choisies vivent dans `preferencesUtilisateur`**. Ces préférences voyagent avec une Réserve
   (`CLES_SANS_FILTRE`, `reserve.js`) : elles sont donc « par appareil », sauf restauration d'une Réserve.
5. **L'ancienne valeur `'h'` (bandeau) se lit comme l'étendue** ; un choix « compacte » enregistré est gardé ; rien
   n'est réécrit tant qu'on ne touche pas au bouton. Défaut : l'étendue, partout.
6. **« Supprimer » se coupe par césure** dans sa tuile de 45 px de large (« Sup-primer »). Aucun mot n'est tronqué.
7. **Les libellés de Paramètres (élève, production) reviennent à la ligne** comme le reste de la famille, au lieu de
   l'ellipse ; je l'ai lu dans « aucun nom coupé, dans toute la famille ».
8. **Le nom du tampon touché est posé par `textContent`**, lu dans la tuile, dont le nom passe déjà par
   `echapperHtml`. Un essai vérifie qu'un nom balisé reste du texte.
9. **Le verrou garde son objet dans la bulle** : le bouton dit « Verrouiller », son `title` et son `aria-label`
   disent « Verrouiller l'évaluation ». L'infobulle d'aide (« ou par le cadenas »), l'aide de la section et la
   définition du glossaire intégré sont alignées.
10. **Le cadenas de la bande des badges** (`.travaux-badge-verrou`, qui montre l'état et ne se clique pas) **reste**
    : la consigne vise le cadenas cliquable de l'en-tête de Paramètres.

---

## 3. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| Le verdict GitHub de `ffd69a47` est rouge sous Linux (13 specs, dont `palette-evaluation-compacte` et `palette-retroaction-compacte`), sans numéro | **Inscrire et continuer** : rattaché à **#833** (CI WebKit Linux), avec une note : ce lot modifie deux de ces specs, le prochain verdict Linux les jugera sous leur forme nouvelle |
| `RELAIS.md` est périmé | **Commenter et oublier** : la règle de relais ne l'exige que si un merge attend ; rien n'attend ici |
| La branche distante `origin/lot/pauses-apres-ouverture` n'est pas fusionnée | **Inscrire et continuer**, ici seulement : hors du lot, à trancher par Cowork |
| En passant d'une version de l'Annotation à l'autre, la régénération ne remettait pas Annuler et Rétablir à l'état | **Corrigé** : c'était mon propre lot, pas une trouvaille (`mettreAJourBoutonsHistorique` exposée, essai et contre-épreuve) |
| La sentinelle de complexité : `afficherPalettesEval` descend de 41 à 39 | Le cliquet est abaissé (il ne peut que descendre) |
| `temoin-enregistrement-lot-b` rougit à 1024 et 1180 px (le témoin couvre la barre de séance des présences, en démo) | **Déjà inscrit (#1181)**. Rouge aussi sur `09bb691d`, avant le lot, rejoué dans un worktree : ce lot n'y est pour rien |
| Une passe en arrière-plan a lancé toute la suite d'intégration au lieu des 39 specs (un `integration/` en trop) | Sans conséquence : 895 essais verts jusqu'à `lot-j…`, puis les 15 specs restantes (101 verts) |

---

## 4. Ce que les tests vérifient (§ 5)

Spec neuve `tests/integration/palettes-une-famille.spec.js`, aux deux formats de la consigne, et un essai neuf dans
`verrou-palette-annotation-1024.spec.js` :

- **§ 1** : aucun ↔ ni ↕ dans les en-têtes d'Annoter et d'Évaluer ; le bouton de version sur Annotation, Codes,
  Tampons et Évaluation, nulle part ailleurs, son `title` dit ce qu'il fera ; le compte de Codes sur une ligne, en
  étendue comme en compacte ; le stock d'avant (`'h'`, « compacte », une géométrie de bandeau) ;
- **§ 2** : l'étendue par défaut, ses intertitres et sa rangée du bas dans l'ordre, aucune tuile sous 44 px,
  « Annuler » visible hors et en plein écran ; un seul jeu d'actions entre les deux versions (un trait à la souris,
  Annuler dans l'autre version l'annule) ;
- **§ 3** : aucun nom débordant ni coupé (tuiles et titres de catégorie) ; la compacte à 188, les noms cachés, la zone
  qui dit le nom du tampon touché sans que la palette change de hauteur ; un nom balisé reste du texte ;
- **§ 4** : le verrou en haut d'Annotation (étendue et compacte) et de Paramètres, le cadenas fermé et
  « Déverrouiller » sur une ligne, dans la palette ; aucun cadenas dans un en-tête.

**Contre-épreuves faites** (chaque défense cassée, l'essai rougit, puis le code est restauré) : `'h'` lu comme compacte ;
retour au suffixe `-pos` ; la rangée collante retirée ; la mise à jour de l'historique retirée ; l'ellipse remise sur
les noms ; la mise à jour de la zone du nom retirée ; `innerHTML` à la place de `textContent` ; les mots longs remis
dans le verrou.

**Résultats** : Vitest entier vert (10 615). Les specs touchées par chaque section : vertes, sauf deux choses. Un délai
de fermeture du contexte WebKit (`palettes-entetes-meme-ordre`, vert trois fois sur trois rejoué seul). Et les quatre
rouges connus de #1181 dans les 23 specs du verrou (187 verts, 4 rouges, déjà rouges avant le lot).

---

## 5. Les gestes à vérifier sur l'iPad

Aucune machine ne peut répondre à ceux-ci : le vrai doigt, le vrai Safari, la vraie césure.

1. **Annoter, hors plein écran** : l'Annotation s'ouvre en tuiles, à 200. Faire défiler la palette du doigt :
   « Annuler · Supprimer · Rétablir · Effacer la page » reste collée en bas. Sur une page annotée, toucher « Effacer la
   page » près du coin bas-droit : la proposition d'enregistrer ton codex paraît, comme avant ; la palette ne se
   redimensionne pas.
2. **Le bouton de version** (à gauche du « − ») sur Annotation, Codes, Tampons, Évaluation : un toucher passe à la
   compacte, un autre revient. Fermer et rouvrir l'application : le choix est gardé.
3. **Tampons compacte** : toucher un tampon, son nom paraît sous la grille ; la palette ne saute pas.
4. **Les noms** : en Tampons étendue, « Multistructurel » et « Id. directrice » se lisent en entier (sur deux lignes,
   coupés par un trait d'union au besoin). La césure française de Safari est celle qu'on veut juger.
5. **Le verrou** : sur une copie évaluée, en haut d'Annotation, « Verrouiller » avec le cadenas ouvert ; un toucher
   verrouille, le bouton dit « Déverrouiller », cadenas fermé. Passer en Évaluer : le même bouton, en haut de
   Paramètres, et plus de petit cadenas dans l'en-tête.

---

## 6. Ce qui n'est pas fait

- **Pas de release ni de verdict complet** (consigne, § 6). Le prochain verdict jugera aussi les 13 rouges Linux (#833).
- **Pas encore vu sur l'iPad** : tout le § 5 ci-dessus.
