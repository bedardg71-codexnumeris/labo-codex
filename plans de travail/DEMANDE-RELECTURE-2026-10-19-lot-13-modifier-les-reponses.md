# Demande de relecture – la dissection, lot 13 : modifier les réponses d'un critère

> Claude Code, lundi 19 octobre 2026, 13 h 32 (Toronto, mesuré par `date`). Consigne : `CONSIGNE-LOT-2026-10-19-dissection-13-modifier-les-reponses.md` (8 h 38), mandat de la consigne du jour (13 h 14). Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit sur `main`, **non poussé**. Il porte aussi la consigne du jour, son archive (`_ancienne-CONSIGNE-DU-JOUR-2026-10-19-version-1.208.md`) et `VERDICT-RELECTURE-2026-10-19-version-1.208.0.md`. **Pas de version, pas de push, pas de verdict complet.**

## Point 0 : mesuré avant tout code, pas d'arrêt

**Une évaluation n'enregistre pas la réponse choisie.** Une copie notée sur un critère en points porte ses points sous l'identifiant du critère, `pointsAnalytiques[critereId]`, un nombre saisi (`evaluation-calcul.js`, `_pointsAnalytiquesDe`). Une copie notée sur un critère lié à une échelle porte le code du niveau, et ce lot ne change pas les niveaux. Aucun module d'évaluation, de note, de bilan ou de PDF ne lit `descripteurs` : les seuls lecteurs sont `grilles.js` (l'affichage), `import-export.js` (l'import), `materiel-assistant.js` et `materiel-creation.js` (la création).

**Donc** changer les points d'une réponse, ou la retirer, ne change aucune note et n'efface aucune réponse d'une copie : ces réponses sont un texte d'aide, la note vit ailleurs. Une sentinelle le verrouille (Z.a) : le jour où un module d'évaluation lira `descripteurs`, elle rougit, et la question remonte à Grégoire.

## Ce qui est fait

1. **Le texte** de chaque réponse est un champ, à sa place, sous « Ce qui est attendu à chaque niveau » (titre gardé, G1). Il s'enregistre au départ du champ, et le témoin le dit.
2. **Les points** (grille en points, sans `echelleId`) sont un champ « Points » au-dessus du texte.
   - Les points sont la **clé** de la réponse (« 2 points », « 3-4 », « Réponse 1 »). Les changer renomme la clé à sa place : l'ordre et le texte restent.
   - Un nombre seul prend son unité, comme à la création (C1, `avecUnite`, désormais exposée par `materiel-dissection-lecture.js`) : « 3 » devient « 3 points ».
   - Le texte et la corbeille de la même réponse suivent la clé neuve, **sans nouveau rendu** : le `change` part au départ du champ, au moment où l'on clique dans le suivant.
3. **Ajouter** (« + Ajouter une réponse ») : en dernier, texte vide, points « Réponse N », le champ des points sélectionné, prêt à taper.
4. **Retirer** : la corbeille commune et la confirmation du retrait d'un critère, mot pour mot sur son modèle. Relu après la fenêtre : si la réponse n'est plus à sa place, rien n'est retiré. La dernière réponse retirée enlève les `descripteurs` du critère, comme un critère créé sans.
5. **Lié à une échelle** : le texte seul se modifie ; ni points, ni corbeille, ni ajout. Une mention le dit, sous le titre.
6. **Les refus** (fonctions pures, `{ refuse }`) passent par le témoin commun, « Non enregistré : ‹raison› », et marquent le champ, comme le nom vide d'un critère. Rien n'est écrit.
7. **Une seule écriture**, `_modifierReponsesCritere`, par la file (`modifierEtAnnoncer`, #510), pour les quatre gestes.
8. **Sécurité** : tout rendu passe par `echapperHtml`, y compris la clé dans `value` et `data-reponse-cle`. Aucun gestionnaire en ligne (`data-on-change`, `data-action`). Cibles de 44 px : la corbeille toujours, les champs et le bouton sur l'iPad (`pointer: coarse`), mesurées en WebKit tactile.

## Ce que j'ai supposé (une ligne chacun)

- **« Points de 0 à 100 »** : la consigne le liste parmi les contraintes de la création, mais à la création cette borne vaut pour la pondération du critère, pas pour une réponse. Je l'applique quand les points sont **un nombre seul** (« 150 » et « -1 » refusés). « 3-4 » ou « /2 » restent libres, comme à la création.
- **Une clé de 200 caractères au plus** : l'import coupe une clé plus longue (`assainirChaine(k, 200)`, `import-export.js`). Je refuse plutôt que de laisser l'import la couper.
- **Deux réponses ne portent pas les mêmes points** dans un critère (refus) : une clé ne peut pas apparaître deux fois.
- **Le texte est taillé** aux deux bouts (`trim`), comme à la création.
- **Pas de proposition du Codex avant le retrait** : celle de #1007 sert aux lignes qui portent des notes, et une réponse n'en porte pas (point 0).
- **Une réponse au texte vide se montre** désormais (avant, elle était filtrée) : c'est celle qu'on vient d'ajouter.
- À 20 réponses, le bouton d'ajout reste, et son geste est refusé avec la raison.

## Les textes, neufs et PROVISOIRES (Claude Code, 19 oct.)

| Où | Texte |
|---|---|
| Champ au-dessus du texte | Points |
| Bouton | + Ajouter une réponse |
| Corbeille (titre) | Supprimer cette réponse |
| Confirmation | Es-tu sûr de vouloir supprimer cette réponse ? |
| Mention, critère lié à une échelle | Les niveaux viennent de l'échelle « ‹nom› » : ici, seul leur texte se modifie. (échelle disparue : « de l'échelle de la grille ») |
| Refus | Au plus 20 réponses par critère · Une réponse fait 5 000 caractères au plus · Les points de la réponse sont obligatoires · Des points qui ne commencent pas par « _ » · Des points de 0 à 100 · Des points de 200 caractères au plus · Une autre réponse de ce critère porte déjà ces points |
| Lecteur d'écran | Texte de la réponse · Texte du niveau ‹nom› |

## Les sous-critères (non touchés)

**Ils devraient suivre**, dans le même bloc, avec les mêmes gestes (texte, ajout, retrait). Une différence à garder en tête : un sous-critère **peut** porter des notes (son code, saisi dans une évaluation, #1007). Son retrait devrait passer par la même garde que `supprimerSousCritere` (proposition du Codex), ce qui n'est pas le cas des réponses.

## Les bancs

- **Vitest** : `materiel-dissection-13-modifier-les-reponses.test.js` (16 essais).
  - Z : le point 0.
  - P : texte, points, ajout, retrait et les sept refus.
  - G : les gestes sur un faux stockage, avec les vrais témoin, corbeille et `avecUnite` ; l'échelle ; la dernière réponse retirée.
  - R : une clé piégée échappée partout, aucun attribut `on…`.
- **Bancs ajustés**, parce qu'ils verrouillaient la lecture seule que ce lot retire : `materiel-lot3b1-visible.test.js` (L.a à L.d, H.a), `materiel-etape5b-reconnaissance.test.js` (C.d), les specs `materiel-dissection-2a`, `materiel-etape5b-reconnaissance` et `materiel-lot3b1-visible` (ce dernier est suspendu).
- **Deux compteurs** : #522, de 24 à 25 écritures par la file dans `grilles.js` (un geste neuf, motif écrit dans la sentinelle). #467 ne bouge pas : les trois interpolations nues qu'ajoutait le premier jet sont reparties.
- **Vitest complet : 782 fichiers, 9 289 essais verts.**
- **WebKit** : `materiel-dissection-13.spec.js`. La grille (b), fictive, est créée par la dissection, puis : corriger un texte, changer des points (« 3 » → « 3 points »), corriger le texte après ce changement, ajouter puis remplir, retirer (confirmation comptée), les 44 px en tactile, recharger. Tout est là.
- **Break-tests**, faits tous les deux, en Vitest puis en WebKit :
  - **le texte qui ne s'enregistre pas** : 4 essais Vitest rouges, et la spec rouge ;
  - **le retrait qui n'en retire pas** : 3 essais Vitest rouges, et la spec rouge.
- **Specs `materiel-*` et Grilles de critères (WebKit)** : 26 fichiers (`materiel-*`, `grille*`, `grilles-*`, `type-grille-lot1`, `repertoires-grilles-T1-rendu`, `import-grilles-*`, `codes-par-grille-*`) : 41 verts, 17 suspendus, 0 échec. Ce lancement avait commencé avant la dernière retouche du rendu (les interpolations nues de #467) : les cinq specs du bloc ont été relancées sur le code final, 6 verts, 5 suspendus.

## Trouvailles

Aucune hors du lot.
