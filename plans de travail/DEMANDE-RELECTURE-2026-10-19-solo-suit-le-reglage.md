# Demande de relecture – SOLO suit le réglage (#1117)

> Claude Code, lundi 19 octobre 2026, ≈ 22 h 50 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-19-solo-suit-le-reglage.md`. Pour Cowork (`PROTOCOLE.md`, règle 2). Un commit sur `main`, **non poussé**, pas de verdict complet, pas de numéro de version.

## Ce que le lot change

| Quoi | Où | Comment le vérifier |
|---|---|---|
| « Complexité SOLO du critère » masqué case décochée, dans les deux éditeurs | `js/grilles.js`, `menuComplexiteSOLOCritere` (un producteur, appelé par `afficherCriteresTemp` et `afficherCriteresGrille`) | Le menu, son étiquette et son aide (`grille-niveau-solo`) ne sont pas rendus. Les `<option>` sont les mêmes, mot pour mot. |
| « Palier SOLO du niveau » masqué, mêmes conditions | `js/echelles.js`, `champPalierSOLONiveau` (appelé par `afficherNiveauxNouvelleEchelle` et `ligneNiveauEchelleHtml`) | `optionsNiveauSOLOEchelle` et les paliers du modèle par défaut sont inchangés. |
| Le défaut d'un critère créé à la main | `js/grilles.js`, `niveauSOLOCritereNeuf(observationSOLOActive())`, aux **trois** chemins de création | Case cochée : `'multistructurel'`. Case décochée : `'aucun'`. |
| « Apporter mon matériel » écrit `'aucun'` | `js/materiel-assistant.js`, `construireGrille` | Dans tous les cas, sans lire la préférence. |
| Les autres affichages de la complexité d'un critère | `js/interventions.js` (badge du formulaire), `js/profil-etudiant-calculs.js`, `nommerDefiAvecSOLO` (cible du profil) | Case décochée : pas de badge, le nom du défi sans parenthèse. |
| La préférence | Lue partout par `obtenirPreference('afficherDescriptionsSOLO') !== false`, le patron existant | Le calcul du dépistage ne la lit pas (`calculerIPB` inchangé). |

## Ce que j'ai tranché seul

1. **Réactiver** : l'éditeur se redessine **à sa prochaine ouverture**. La case vit dans Réglages, l'éditeur dans Conception : on ne voit jamais les deux à la fois, et la navigation rouvre l'éditeur.
2. **Deux chemins de création n'écrivaient pas de `niveauSOLO`** (« + Ajouter un critère », en création et sur une grille existante). Ils écrivent maintenant la valeur du réglage. Case cochée, ils écrivent donc `'multistructurel'` là où le champ était absent. Le sens est le même : tous les lecteurs lisent un champ absent comme multistructurel.
3. **Ce qui ne bouge pas** :
   - l'export du trimestre (`trimestres.js`, `niveau_solo`), parce que ce sont des données et non un affichage ;
   - la barre « Critères multistructurels surveillés » du tableau de bord, parce qu'elle dit ce que le dépistage surveille, pas la complexité d'un critère.

## Ce que le lot ne touche pas, et ses conséquences

- **Le stock.** Les grilles déjà créées par la dissection gardent leur `'multistructurel'`. Tarir la source ne les touche pas ; les réécrire remonterait à Grégoire.
- **Une conséquence des décisions de 22 h 02 et 22 h 05**, nommée pour qu'elle ne soit pas découverte plus tard :
  - Une grille neuve faite par la dissection n'a aucun critère multistructurel, même case cochée. Il en va de même d'une grille faite à la main case décochée.
  - Choisie comme grille de dépistage, une telle grille ne nourrit donc pas l'IPB. Le tableau de bord le dit déjà : « Aucun critère multistructurel dans la grille de dépistage : le suivi des fondations ne surveille rien. »
  - La fiche #1117 l'écrivait déjà pour la dissection. C'est neuf pour qui garde le RàI activé avec SOLO désactivé, et ce sera à reprendre avec #1118.

## Les bancs

- **Nouveau, Vitest** : `tests/unit/sentinelle-1117-solo-suit-le-reglage.test.js`, 12 cas :
  - la règle pure ;
  - « + Ajouter un critère » selon le réglage ;
  - les trois chemins de création ;
  - la dissection, case cochée comprise ;
  - les quatre éditeurs, masqués puis réactivés, avec les valeurs intactes ;
  - les paliers du modèle d'échelle ;
  - la cible du profil et le badge ;
  - `calculerIPB` qui ne lit pas le réglage.
- **Nouveau, WebKit** : `tests/integration/solo-suit-le-reglage-1117.spec.js`, 2 cas, joués avec la vraie case et les vrais éditeurs, en lisant la base :
  - les champs sont absents de Grilles et d'Échelles, et un critère ajouté reçoit `'aucun'` ;
  - un critère « relationnel » enregistré champ masqué, la page rechargée et la case recochée reste « relationnel ».
- **Break-test** : un masquage qui écrit `'aucun'` sur l'objet rendu rougit 4 cas Vitest sur 12. Un enregistrement qui écrase pendant que le champ est masqué (`modifierCritereGrille`) rougit le cas WebKit (« masquer n'écrit rien » : attendu `relationnel`, reçu `aucun`). Le code est restauré dans les deux cas.
- **Sept sentinelles adaptées à la nouvelle forme**, chacune avec son invariant gardé :
  - `sentinelle-542-lot2-solo-echelle` et `sentinelle-810-libelles-solo-distincts` : un producteur appelé par les deux éditeurs, au lieu de deux copies ;
  - `sentinelle-lot4-B-solo-aucun`, A.c : case cochée, le défaut reste multistructurel ; B.c : le badge lit aussi le réglage ;
  - `materiel-lot3a-roles` et `materiel-etape5-points` : `'aucun'` ;
  - `sentinelle-467-affichage-echappe` : le compte des interpolations nues de `grilles.js` passe de **64 à 65**. **Ce compte monte**, ce que son commentaire réserve aux cas justifiés. Il n'y a pas de désescape : c'est le même cas que #574, `${attrs}` porte le handler, `grille.id` et l'index. Raison écrite dans le banc. À regarder.
- **Résultats** : Vitest complet **785 fichiers, 9 219 sur 9 219 verts**. Spec WebKit neuve `solo-suit-le-reglage-1117.spec.js` : **2 sur 2 verts** (34 s, mardi 20 oct. au matin, après un redémarrage de la machine ; Vitest re-mesuré au même moment : 9 219 sur 9 219). Les autres specs Grilles et Échelles n'ont pas été rejouées : le verdict complet reste à faire.

## Les textes

Aucun texte neuf.

## Ce que je demande de regarder

1. Le compte #467 qui monte (64 → 65).
2. La conséquence sur l'IPB pour qui garde le RàI activé avec SOLO désactivé.
3. Le BACKLOG part avec ce commit tel que Cowork l'a laissé. Il contient aussi **#1118**, inscrite à 22 h 11 pendant le lot.
