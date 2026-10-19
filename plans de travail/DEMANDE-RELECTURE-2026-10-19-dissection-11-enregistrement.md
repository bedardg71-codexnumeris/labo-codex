# Demande de relecture – la dissection, lot 11 : elle s'enregistre toute seule, à chaque geste

> Claude Code, lundi 19 octobre 2026, matin (Toronto). Consigne : `CONSIGNE-LOT-2026-10-19-dissection-11-enregistrement.md` (7 h 41). Pour Cowork (`PROTOCOLE.md`, règle 2). Fait après le lot 12 (`8eebd2e7`, sa demande à part), comme le voulait la consigne du jour.
> Un commit sur `main`, **non poussé**. Il porte aussi : `RELAIS.md` (avec une ligne d'état mesuré), `VERDICT-RELECTURE-2026-10-18-version-1.207.0.md`, #1110 au BACKLOG (la fiche que ce verdict demande), cette consigne, la consigne du jour et son archive. **Pas de version, pas de push, pas de verdict complet.**

## Ce qui est fait

1. **Une seule clé, `<trim>_brouillonDissection`**, namespacée par trimestre (`CLES_NAMESPACEES`, `trimestres.js`).
   - Elle passe par `db.js`, qui la range dans IndexedDB au-delà de 200 Ko.
   - Elle est inscrite à `DATA-OWNERSHIP.md`, avec son propriétaire : `materiel-dissection.js`.
   - Elle est exclue de l'archive d'un groupe (`CLES_EXCLUES_ARCHIVE`, `reserve.js`) : un travail en cours ne voyage pas.
   - **Pourquoi par trimestre** : les grilles que la dissection crée le sont aussi, et en démo `cle()` range le brouillon sous `demo_` sans rien de plus (point 5).
2. **Le format** (`materiel-dissection-lecture.js`, fonctions pures) : `{ format: 'dissection-1', doc, liens, coupes, rattachements, nomSaisi, compte, valeurs }`.
   - `doc` est le document **déjà disséqué** : jamais le HTML collé (vérifié en WebKit, aucune balise dans la valeur écrite).
   - Chaque coupe garde le document d'avant, donc « Annuler la dernière coupe » marche après une reprise (WebKit).
   - L'état d'écran ne s'enregistre pas : l'outil en main, le morceau choisi, l'erreur affichée.
   - `brouillon(etat)` rend une copie sans référence partagée. `lireBrouillon(b)` valide chaque champ et rend une copie, ou `null`.
3. **L'écriture**, à chaque geste, par `sauvegarderDonneesSelonMode`. C'est le témoin commun de Grilles, Échelles et Cartouches : « Enregistré », ou « Non enregistré » avec la raison, sans texte neuf sur le succès.
   - **Les gestes qui écrivent** :
     - le collage (il remplace le brouillon d'avant) ;
     - la fin d'un surlignage (le geste entier, pas chaque morceau) ;
     - la coupe et son annulation ;
     - la jonction et le détachement (pas le seul choix d'un morceau) ;
     - « Retirer les étiquettes » ;
     - le choix entre points et niveaux.
   - **Le nom et les valeurs des niveaux** s'écrivent à la pause de la frappe (400 ms), et tout de suite au départ du champ (`change`). Une frappe en attente s'écrit aussi sur `pagehide` et à la fermeture de la dissection.
4. **Le retour.** `navigation.js`, zone protégée, n'est pas touché : `materiel.js` écoute son événement public `sectionAffichee` (`conception-materiel`) et attend la DB prête (`auDbPret`).
   - Accueil affiché, aucune dissection ouverte, et un brouillon lisible : la dissection rouvre directement, par les mêmes chemins de rendu (`textContent`).
   - Un brouillon illisible laisse l'accueil s'ouvrir avec un mot, et **il n'est pas effacé**.
5. **La fin du brouillon.** « Coller une autre grille » l'efface au moment du geste (`oublierBrouillon`, dans `materiel.recommencer`). Le collage suivant écrit le nouveau. Recharger entre les deux ramène l'accueil (WebKit). Après « Créer ma grille », il **reste** (`fermer` ne l'efface pas), selon la supposition de Cowork.
6. **Les commentaires** qui disaient « rien n'est écrit avant « Créer ma grille » » disent maintenant : rien n'entre dans les grilles avant elle ; la dissection en cours s'enregistre dans son brouillon. Corrigés dans l'en-tête de `materiel-dissection.js` (quatre endroits) et dans le commentaire de `index.html`.

## Ce que j'ai supposé (une ligne chacun)

- **Par trimestre**, pas globale (point 1). Conséquence : changer de trimestre montre le brouillon de l'autre trimestre, ou l'accueil.
- Le bouton « Coller une autre grille » **de la confirmation** (après « Créer ma grille », `materiel.recommencer`) efface aussi le brouillon : même mot, même effet. Sans cela, recharger après lui rouvrirait la grille déjà créée.
- **Pas de nouvel « Enregistré » à la reprise** : relire n'est pas un geste.
- Le codex apprend chaque écriture du brouillon, comme toute écriture du témoin commun : le menu dira « pas à jour » après une séance de dissection.

## Les textes

- **Le témoin** : ses mots, tels quels.
- **Neufs, PROVISOIRES** (Claude Code, 19 oct.) :

| Où | Texte |
|---|---|
| Ligne d'état, à la reprise | Dissection reprise telle que tu l'as laissée. |
| Accueil, brouillon illisible (`materiel.js`) | Ta dissection précédente n'a pas pu être relue : elle reste gardée telle quelle. Colle une grille pour en commencer une autre ; elle la remplacera. |
| Le geste, dans « Non enregistré – ‹geste› : ‹raison› » | enregistrer ta dissection |

## Les bancs

- **Vitest** : `materiel-dissection-11-brouillon.test.js` (6 essais).
  - A : l'aller-retour, sur (d7) découpée, deux coupes empilées, un rattachement et la saisie en niveaux. Tout est identique après un `structuredClone` : la lecture de l'application, l'annulation des deux coupes, aucune référence partagée.
  - I : seize brouillons abîmés rendent `null`, sans être touchés.
  - R : le registre, l'exclusion de l'archive et `DATA-OWNERSHIP`.
  - **Vitest complet : 781 fichiers, 9 273 essais verts.**
- **WebKit** : `materiel-dissection-11.spec.js` (3 essais).
  - Coller, étiqueter, couper, rattacher, saisir le nom : un « Enregistré » par geste, compté sur le témoin. Le choix seul n'écrit rien, et rien n'entre dans les grilles. Recharger rend un état identique, la marque, le nom entier, le nom saisi, puis « Annuler la dernière coupe ». « Coller une autre grille » confirmé ramène à l'accueil, qui reste après un rechargement.
  - Un brouillon illisible : l'accueil, le mot affiché, le brouillon intact.
  - **Démo** : après `activerModeDemo()`, `cle()` rend `demo_brouillonDissection`. L'onglet s'ouvre sur l'accueil, sans lire le brouillon de l'enseignant. Un collage en démo écrit sous `demo_`, et « Coller une autre grille » n'efface que celui-là ; `a2032_brouillonDissection` reste identique.
  - **Les 18 specs `materiel-*` sont vertes en WebKit.**
- **Break-tests** (le code est restauré après chacun, `cmp` identique) :

| Ce que j'ai cassé | Ce qui a rougi |
|---|---|
| `lireBrouillon` qui oublie les rattachements | A.a, A.b et A.c |
| La reprise de l'écran (`ouvrir`) qui oublie les rattachements | Le premier essai WebKit (l'état repris diffère) |

## Où regarder en premier

- `reprendreDissection` (`materiel.js`) : elle ne rouvre que depuis l'accueil, jamais par-dessus une confirmation ou une dissection ouverte.
- `fermer` et `oublierBrouillon` : la frappe en attente s'écrit à la fermeture, sauf après « Coller une autre grille », qui annule la minuterie AVANT.
- Non éprouvé par un banc : le brouillon qui reste après « Créer ma grille ». Le code est lu (`montrerCreee` → `fermer`, sans effacement) ; c'est une rangée de porte pour Grégoire.
- `PORTE-TERRAIN-2026-10-18-la-dissection.md` porte le relevé de Grégoire de ce matin, non commité. Je ne l'ai pas mis dans ce commit, faute de consigne.
