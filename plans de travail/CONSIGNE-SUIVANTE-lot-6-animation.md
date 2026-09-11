# Consigne suivante — Animation : le tirage au sort dit vrai, son état vit par groupe-cours et par trimestre, et ce qui est projeté aux élèves est décidé (lot 6 du cadrage 11)

> **Écrite le 11 septembre 2026 à 17 h 48 (Toronto, `TZ=America/Toronto date`) par Cowork, À FROID, en file derrière les lots 3, 4 et 5.**
> Elle devient la consigne du jour quand le lot 5 est livré et VU. Application au moment de l'écriture : **`1.132.0`**. ⚠ **Une consigne
> peut se tromper : mesure, n'obéis pas.** `boite-outils.js` n'a pas bougé depuis le 6 hors `#770` (CM-4, livré) — remesure les lignes.
>
> **Préalables** : le cadrage 11 (§ 7) ; `Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md` **§ 6 seulement** (l. 330-381 : ce que c'est,
> ce qui est projeté, le tableau des gestes, le tirage, les questions). Le patron du lot 1 pour une clé par trimestre et par groupe-cours
> (`cleEtudiantsSuivis`, semis lu une fois). Skills : `labo-codex`, `securite-donnees` (ce qui est projeté), `verification-adverse` § 4.

---

## 0 · CE QUE CE LOT CHANGE POUR GRÉGOIRE ET SES COLLÈGUES

L'Animation (Suivi › Animation) est **projetée en classe** : c'est le seul écran de l'application que les élèves regardent. Deux outils :
le **tirage au sort** d'élèves et les **questions flash**. Ce lot : (1) l'état du tirage (qui a été tiré, qui est exclu) vit **par
groupe-cours et par trimestre** au lieu d'une clé nue partagée ; (2) l'infobulle du tirage dit ce que le code fait ; (3) ce qui est
projeté ne change pas — sa décision : « ça fait partie d'un jeu » ; (4) du code mort, un en-tête menteur, deux commentaires.

---

## 1 · LE LOT — `js/boite-outils.js`, `js/accompagnement-contenu-hover.js`

### A. L'état du tirage par trimestre et par groupe-cours
`etatTirage` (`:19-38`, écrit `:40`) est une clé **nue** qui porte pourtant `coursId` ; `questionsFlash_<coursId>` (`:508`) est composée
mais sans trimestre. ⮕ Les deux passent au patron du lot 1 (`cle(...) + '_gc_' + <id>`), inscrites à `CLES_NAMESPACEES` et à
`docs/DATA-OWNERSHIP.md`. **Stock — tranché par Cowork, nommé** : semis de la clé nue `etatTirage` **seulement si son `coursId` est celui
du groupe actif** (sinon rien : l'état d'un autre groupe ne se copie pas) ; `questionsFlash_<coursId>` : semis entier vers la clé du
trimestre courant (une banque de questions ne dépend pas du trimestre, on ne la perd pas). Clés nues intactes, orphelines
(diagnostic-353). Au passage : le champ `dejaPositions` — « déjà posées » — se renomme **si** aucun stock ne le porte sous ce nom
(mesure ; sinon, un commentaire, et le nom reste : tarir n'est pas réparer).

### B. Le tirage dit ce qu'il fait
- **L'infobulle** (`accompagnement-contenu-hover.js:800` : « jusqu'à ce que le groupe soit épuisé, **puis réinitialisé** ») promet une
  remise à zéro automatique que le code ne fait pas (`:192-195` : le bouton se désactive ; seule la modale → « Réinitialiser » repart).
  **Décision de Cowork, nommée** : c'est **le code qui a raison** — un tirage qui repart tout seul trahit l'enseignant qui compte les
  passages ; l'infobulle dit désormais : « … jusqu'à ce que le groupe soit épuisé ; le bouton se désactive alors, et « Réinitialiser »
  (dans les paramètres) repart pour un nouveau cycle. » **Et** : quand le groupe est épuisé, un bouton « Réinitialiser » s'affiche **à côté
  du tirage**, pas seulement dans la modale — un geste évident en classe, sans ouvrir une liste devant les élèves (§ 3). Mot de
  l'infobulle : proposé, silence = tel quel.
- **Élève retiré du groupe** entre deux initialisations (pool figé `:129-133`) : commenter ; à l'initialisation suivante il est purgé de
  `dejaTires` et l'état réécrit (`:143-147`) : **une écriture à la lecture**, à retirer — filtrer à la lecture, comme au lot 1.
- `fermerModalParamsTirage` : le commentaire `:407` promet Escape, seul l'overlay est câblé → câbler Escape (patron des autres modales,
  mesure), ou corriger le commentaire — tranche.

### C. Ce qui est projeté — TRANCHÉ par Grégoire à 17 h 50 : rien ne change
Dans ses mots : *« Il n'y a pas d'enjeu de confidentialité dans le tirage au sort. Au contraire, ça fait partie d'un jeu. Les élèves
voient les noms qui défilent à l'écran et, finalement, quelqu'un est choisi. »* ⮕ **Aucun bandeau, aucune modification de la modale
« Paramètres du tirage », le DA dans le DOM reste** (il n'est vu par personne et il sert au handler). Le tirage projette prénom + nom ;
les questions, aucun nom : conforme, et c'est voulu. **Ce qui reste technique** : en mode anonymisation, le module écrit `db.setSync`
direct (`:40`, `:508`) — `#736`, **cité, pas rejugé** (règle des modes, après le 14). Le bouton « Réinitialiser » à côté du tirage (B)
reste : un geste évident en classe, pas une question de confidentialité.

### D. Code mort et en-tête menteur
`appliquerParamsQuestions` (`:1016`, exportée `:1193`, aucun `data-action`) : retirer après mesure par chaque lecteur. L'en-tête du module
annonce un « Ordonnancement (Futur) » qui n'existe pas : retirer la promesse. Les messages « 0 questions disponibles » en démo (le pack
n'a aucune question) : **inscrire** (pack : trois questions, deux catégories), pas dans ce lot.

---

## 2 · CE QUI NE SE FAIT PAS ICI
La banque de questions (ajout, catégories, `prompt()` pour modifier — fonctionne, laid, personne ne s'en est plaint) ; le rendu projeté à
1366 × 1024 (l'audit le dit lisible) ; les 5 cibles tactiles : lot 7.

---

## 3 · CE QUI REMONTE À GRÉGOIRE
| Où | Question | Sa réponse |
|---|---|---|
| C — ce qui est projeté | aucun enjeu de confidentialité : « ça fait partie d'un jeu » | ✅ tranché à 17 h 50, dans ses mots — rien ne change |
| B — le mot de l'infobulle | « … jusqu'à ce que le groupe soit épuisé ; le bouton se désactive alors, et « Réinitialiser » repart pour un nouveau cycle. » | _______ (silence = tel quel) |

## 4 · LIVRER — `minor` : le tirage change de comportement visible (bouton Réinitialiser, état par groupe)
Changelog, une phrase : « Suivi › Animation : le tirage au sort garde son état par groupe-cours et par trimestre, et dit vrai sur la fin
d'un cycle — « Réinitialiser » est à portée de main quand tout le monde est passé. »

---

## 5 · LA PORTE TERRAIN — en classe ou au bureau, ses deux groupes
| # | Geste | Attendu |
|---|---|---|
| 1 | Groupe A, Animation, trois tirages ; groupe B, Animation | B n'a **aucun** « tiré » ; retour A : les trois tirés sont encore marqués |
| 2 | Épuise le groupe (ou un groupe de démo) | le bouton de tirage se désactive **et** « Réinitialiser » apparaît à côté ; l'infobulle dit la même chose |
| 3 | Mode anonymisation, un tirage | les noms projetés sont anonymes (comme avant) |
| 4 | Questions flash, un tirage | comme avant ; aucun nom |

⚠ Les rangées 1-2 écrivent l'état du tirage de sa main (réversible par « Réinitialiser ») : dis-le dans la porte.

---

## 6 · TROUVAILLES ET RAPPORT
Trois issues nommées. Rapport : `OU-EN-EST-ON.md`, le rapport du 6 (§ 6 : lot 6 livré), `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`,
entrée 10 des cadrages (lot 7 suivant : le transversal), la consigne commise avec le lot.
