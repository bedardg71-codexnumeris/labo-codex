# Demande de relecture – #1007, lot 2b : le codex proposé avant de retirer une ligne qui porte des notes

> Écrite par Claude Code le 3 octobre 2026 vers 19 h 25 (Toronto ; `date` à 19 h 22), sur la consigne de Cowork de 19 h 05.
> Branche locale `claude/1007-lignes-notes` (worktree `.claude/worktrees/1007-lignes-notes`), **non poussée**. Arbre principal laissé sur `main`.

## Pour Grégoire, en trois gestes

1. Dans la Conception, tu retires un critère, un sous-critère ou un niveau d'échelle **qu'au moins une évaluation emploie** : si ton codex n'est pas à jour, la fenêtre « Mettre ton codex à jour avant de supprimer ? » paraît **avant** la question habituelle. « Annuler » ne retire rien.
2. Tu retires une cible de dénotation **déjà cochée** : la même fenêtre vient avant la question que tu connais (« Tu retires une cible déjà cochée… »). « Annuler » remet la liste.
3. Une ligne qu'aucune évaluation n'emploie (ou une ligne neuve) se retire **exactement comme avant** : pas de fenêtre.

---

## 1. La remesure

| Ligne | Où (fonction, porte) | Question d'avant | Quand l'effacement s'écrit | Ce que deviennent les évaluations qui l'emploient |
|---|---|---|---|---|
| Critère, zone d'édition | `js/grilles.js` `supprimerCritereGrille` (bouton corbeille de `afficherCriteresGrille`) | « Es-tu sûr de vouloir supprimer ce critère ? » | **au clic**, après la question (`modifierEtAnnoncer`, enregistrement de la Conception depuis 1.164.0) | *Lu* : l'évaluation garde son entrée `criteres[]` (critereId, niveau) ; les lecteurs qui parcourent les critères de la grille (indice P, PAN-standards `pratique-pan-standards.js:802`) ne la lisent plus, la note se recalcule sans elle au prochain calcul ; `noteFinale` écrite reste telle quelle jusqu'à la réouverture. |
| Critère, liste de la zone d'édition (ancien rendu) | `js/grilles.js` `supprimerCritere(id)` (bouton « Supprimer » de `afficherListeCriteres`) | la même | **au clic** (`sauvegarderGrilleTemplate` avec mutateur) ; grille neuve : en mémoire (`tempCriteres`), jamais proposé | idem. *Lu* : les deux rendus partagent `#listeCriteres` ; je branche les deux. |
| Critère d'une grille neuve | `supprimerCritereTemp` | aucune | jamais avant « Créer la grille » | aucune évaluation ne peut l'employer : **non branché**. |
| Sous-critère | `js/grilles.js` `supprimerSousCritere` | « Supprimer ce sous-critère ? » | **au clic** | *Lu* : les codes saisis restent dans `donneesAlgorithmiques[critereId].codes` ; au prochain calcul, un code sans sous-critère pèse 1,0 au lieu de sa pondération (`evaluation-calcul.js:552`) ; sa rétroaction dominante disparaît. |
| Niveau d'échelle | `js/echelles.js` `supprimerNiveauEchelle` | « Supprimer ce niveau ? » | **au clic** | *Lu* (commentaire mesuré `echelles.js:3264`) : la note relit le code dans l'échelle de l'évaluation ; un code absent tombe à « -- ». |
| Niveau d'une échelle neuve | `supprimerNiveauTemp` | aucune | jamais avant « Créer » | **non branché**. |
| Cible de dénotation, gestion des pratiques | `js/pratiques/editeur-cibles.js` `retirer` → `change` → `js/pratiques-gestion.js` `sauvegarderConfigPratiqueMat` | « Tu retires une cible déjà cochée… » | la ligne quitte l'écran au clic ; **l'écriture** passe par `sauvegarderConfigPratiqueMat`, après la question | Les coches restent, ne comptent plus ; la note est recalculée sans elle (mots du 23 sept.). |
| Cible, assistant (pratique existante) | `js/wizard-pratique-v2.js` `creerPratiqueV2` | la même | à la fin de l'assistant | idem. |

**Autres lignes d'éditeur qui touchent aux notes, que la décision ne nomme pas — non branchées, rendues :**
- **Palier de projection** (`supprimerPalierProjectionGrille`, `grilles.js:6252`, sans question) : il change ce que la projection dit, mais aucune évaluation ne le **cite** ; le test « déjà employé » n'a rien à lire. *Lu, non mesuré.*
- **Type de travail et forfait PAN** (`pratiques-gestion.js` `supprimerTypeTravailMat`, `supprimerForfaitMat` ; `pratique-notation-v2.js`) : ils entrent dans la note des spécifications. Je n'ai pas mesuré si une évaluation les cite. *À classer par Cowork.*
- **Résultat ultérieur du registre** (`retirerResultatLongitudinal`, déjà signalé en 2a-2) : il porte un résultat, sans question.

## 2. Le test « déjà employé »

**Une fonction pour les trois lignes de grille et d'échelle**, chez le propriétaire de la clé : `ligneEmployeeParUneEvaluation(ligne)`, `js/evaluation-sauvegarde.js:1025`, lecture seule, sans effet. Elle lit `db.getSync(cle('evaluationsSauvegardees'))` au moment du geste :

| Ligne | Employée si… |
|---|---|
| `{ grilleId, critere }` | une évaluation de **cette grille** a une entrée `criteres[]` avec ce `critereId` (critère sans identifiant, #674 : par `critereNom`, parmi les entrées sans identifiant) |
| `{ grilleId, critere, sousCritereCode }` | une évaluation de **cette grille** a ce code dans `donneesAlgorithmiques[critere.id].codes` |
| `{ echelleId, niveauCode }` | une évaluation de **cette échelle** porte ce code (`niveauSelectionne` d'un critère, ou `niveauFinal`) ; un code vide, jamais |

**La cible** garde sa lecture existante (`EditeurCibles.ciblesRetireesCochees`, les coches de `jugementsDenotation`) : c'est déjà la condition de la question d'aujourd'hui. Une seconde fonction aurait dit la même chose autrement.

**Le trimestre.** Les éditeurs écrivent sous `cle('grillesTemplates')` / `cle('echellesTemplates')` ; la fonction lit les évaluations sous `cle()`. Même trimestre par construction. **La Bibliothèque partagée** : ses grilles et échelles sont des gabarits, copiés dans un trimestre à l'usage (import = copie) ; aucune de ces portes n'édite une ligne d'un gabarit de la Bibliothèque, et une évaluation cite toujours la copie du trimestre. Une grille « employée dans plusieurs trimestres » est donc plusieurs grilles : chacune est jugée dans le sien.

**Une ligne neuve** : jamais d'évaluation pour elle (critère ou niveau ajouté, cible absente des `anciennes`) ; les grilles et échelles neuves ne passent même pas par ces portes.

## 3. Le branchement, et le tableau des lectures

La même `Codex.proposerAvantSuppression`, quatre clés neuves (`critere`, `sousCritere`, `niveau`, `cible`), la même fenêtre. Partout, la ligne de l'appel est `if (porteDesNotes && … !(await Codex.proposerAvantSuppression('…'))) return …;`, **juste avant la question existante**. Pour la cible, l'appel vit dans `confirmerRetraitCibles`, devenue `async` : un seul endroit pour les deux écrans, qui l'attendent tous deux.

| Porte | Lu avant l'attente | Relu après |
|---|---|---|
| `supprimerCritere(id)` | le critère par son id (pour le test) | le mutateur filtre par id, dans la file |
| `supprimerCritereGrille` | le critère à cet index, en base | dans la file : si la ligne à cet index n'est plus celle lue (id, ou nom sans id), **rien n'est retiré** |
| `supprimerSousCritere` | le critère et le sous-critère à ces index | dans la file : même contrôle (critère, puis code) |
| `supprimerNiveauEchelle` | le niveau à cet index | dans la file : même contrôle par code |
| `confirmerRetraitCibles` | les cibles retirées et cochées | relues après la fenêtre ; la question nomme ce qui est vrai à ce moment ; l'écriture relit l'écran dans la file |

**L'enregistrement automatique.** Grilles et échelles : aucune sauvegarde différée (mesuré : aucun minuteur d'écriture dans `grilles.js`, `echelles.js`, `editeur-cibles.js`) ; le retrait ne s'écrit qu'après la question, donc après la fenêtre. Pendant l'attente, la ligne est encore en base : « Mettre à jour, puis supprimer » écrit un codex qui la contient. Gestion des pratiques : la ligne quitte l'écran au clic, mais **tout** écrivain de la fiche passe par `sauvegarderConfigPratiqueMat`, donc par la même porte : aucune écriture ne contourne l'attente. « Annuler » remet la liste enregistrée (`EditeurCibles.poser`), comme le refus de la question le faisait déjà.

## 4. Les mots, à Grégoire

Sur le modèle accepté, sans autre mot neuf. La seconde phrase est celle du 2 oct.

| Clé | Première phrase proposée | Pronom (« te … rendre ») |
|---|---|---|
| `critere` | Supprimer ce critère l'efface pour de bon. | le |
| `sousCritere` | Supprimer ce sous-critère l'efface pour de bon. | le |
| `niveau` | Supprimer ce niveau l'efface pour de bon. | le |
| `cible` | Retirer cette cible l'efface pour de bon. | la |

**Variante, à part** (non codée) : dire le nombre, en seconde phrase avant celle du codex : « Ce critère est déjà employé dans N évaluations. » (« Ce niveau… », « Ce sous-critère… », « Cette cible est déjà cochée pour N étudiant·es. »). La question de la cible donne déjà ce nombre juste après ; pour les trois autres, ce serait le seul endroit où il paraît.

**Pluriel de la cible** : dans l'assistant, on peut retirer plusieurs cibles avant d'enregistrer ; la phrase reste au singulier. Une variante « Retirer ces cibles les efface pour de bon. » (pronom « les ») demanderait de passer le nombre à la fonction ; non codée.

**Ligne des Nouvelles proposée** : « Avant de retirer un critère, un sous-critère, un niveau d'échelle ou une cible de dénotation déjà employés dans une évaluation, l'application te propose de mettre ton codex à jour. Une ligne qu'aucune évaluation n'emploie se retire comme avant. »

## 5. La preuve

- **Sentinelle de 2a étendue** (`tests/unit/sentinelle-1007-propose-codex.test.js`) : cinq portes de plus (58), registre, compte, forme de la ligne.
- **Banc neuf** `tests/unit/sentinelle-1007-lignes-notes.test.js` (20 essais), sur les vrais écrivains (`grilles.js`, `echelles.js`, `editeur-cibles.js` chargés) : la lecture famille par famille (oui, non, autre grille, autre échelle, code vide, sans identifiant) ; **pour chaque famille, une ligne non employée se retire sans fenêtre** ; une ligne employée : fenêtre, « Annuler » n'écrit rien et ne pose pas la question ; relecture après l'attente (critère, niveau).
- **Banc WebKit** `tests/integration/1007-lignes-notes-2b.spec.js` (3 essais, vrais boutons) : critère employé (fenêtre, « Annuler » ne retire rien, rien d'écrit, pas de question) ; critère non employé (la question, le retrait, aucune fenêtre) ; cible cochée (fenêtre avant la question existante, « Annuler » remet la liste, « Supprimer sans codex » puis la question, telle quelle ; cible non cochée : rien).
- **Mutations** : dix sur le banc unitaire et la sentinelle, **dix rouges** (deux survivaient au premier passage, fixture et essai de relecture renforcés) ; trois sur le banc WebKit, **trois rouges**, chacune à l'assertion visée.
- **Vitest complet** : 675 fichiers, 8 024 essais verts, aucune ligne « Errors » ni « Unhandled ».
- **Bancs voisins** (WebKit) : `denotation-creation-DEN3`, `grille-critere-ajoute-enregistrer-957`, `lot-C-echelles-chevrons-corbeille`, `pratique-edition-preserve-enveloppe`, `grilles-suppression-orphelinage`, `1007-propose-codex-2a2` verts ; `sentinelle-717-editeur-cibles` rougissait (il retire une cible cochée et voyait la fenêtre d'abord) : **doublure « codex à jour »** posée, il juge les identités et la question ; vert.
- Pas de verdict Playwright complet : il viendra avec la release.

## 6. Ce que j'ai supposé

1. **Les brouillons comptent** comme des évaluations qui emploient la ligne : ils portent des notes en devenir.
2. **Une évaluation sans `echelleId`** ne compte pour aucune échelle. Si le stock en porte (échelle par défaut d'avant), un niveau qu'elle emploie ne propose rien.
3. **Relu après l'attente** : si la ligne a changé de place pendant que la fenêtre attendait, rien n'est retiré, **sans message**. La fenêtre est modale ; je ne vois pas de chemin qui y mène, d'où l'absence de mots.
4. **L'ancien rendu `supprimerCritere(id)`** est traité comme vivant (il partage le conteneur) ; s'il ne l'est plus, sa branche est sans effet.
5. **#1007 se clôt avec ce lot** à la release ; les trois lignes du § 1 non branchées restent à classer par Cowork.
