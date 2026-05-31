# Analyse de cohérence — page d'assemblage du groupe-cours

> Analyse de lecture seule. Aucune modification de code.
> Cible : sous-section « Trimestre » de la section Calendrier (`index.html`, lignes ~6595-7848), composée de six accordéons : Gestion des trimestres, Cours, Enseignant·e, Groupe d'étudiants, Horaire, Groupe-cours.
> Modules JS : `trimestre-v2-init.js`, `trimestre-v2-cours.js`, `trimestre-v2-enseignants.js`, `trimestre-v2-etudiants.js`, `trimestre-v2-horaires.js`, `trimestre-v2-groupes-cours.js`, `trimestre-v2-orchestre.js`.

---

## 1. Constat : trois modèles d'édition coexistent

Ce que tu observes (« parfois un bouton de sauvegarde, parfois de création, parfois rien ») n'est pas un détail cosmétique : c'est la surface de **trois mécanismes de persistance différents** sous le capot.

| Section | Bouton(s) du formulaire | Modèle de persistance | État interne |
|---|---|---|---|
| **Gestion des trimestres** | « Sauvegarder le trimestre » **+** auto-save par champ | **Hybride** : chaque champ a `data-on-change="sauvegarder…"` ET un bouton explicite | `evenementPrevuEnEditionV2` / `…ImprevuEnEditionV2` |
| **Cours** | Annuler / **Enregistrer** / Supprimer / Activer | Save explicite | `coursEnEditionV2` |
| **Enseignant·e** | Annuler / **Enregistrer** / Supprimer | Save explicite | `enseignantEnEditionId` |
| **Horaire** | Annuler / **Enregistrer** / Supprimer | Save explicite | `horaireEnEditionId` |
| **Groupe-cours** | Annuler / **Créer** / Supprimer / Activer | Save explicite | `groupeCoursEnEditionId` |
| **Groupe d'étudiants** | « Ajouter l'étudiant » (pas de save de formulaire) | **Ajout immédiat** ligne par ligne | `etudiantEnEditionIndex` |

Les trois familles :

1. **Auto-save par champ** — uniquement *Gestion des trimestres*. Chaque `input` déclenche `sauvegarderIdentificationTrimestreV2` ou `sauvegarderCadreCalendrierV2` au `change`. Le bouton « Sauvegarder le trimestre » est donc **partiellement redondant** : il rejoue `sauvegarderCadreCalendrierV2`, déjà appelé à chaque modification de date.
2. **Save explicite via formulaire** — *Cours, Enseignant·e, Horaire, Groupe-cours*. Modèle le plus répandu (4 sections sur 6) et le plus homogène structurellement : variable module-scope `XEnEditionId` qui distingue création (`null`) et édition, validation, `db.setSync`, rafraîchissement des dropdowns.
3. **Ajout immédiat** — *Groupe d'étudiants*. Pas de bouton « Enregistrer » au niveau du formulaire parce qu'on ne sauvegarde pas *une* entité mais on pousse une ligne dans une liste de N. Chaque clic sur « Ajouter l'étudiant » persiste immédiatement.

**Inférence** : la famille 2 est le candidat naturel de modèle cible. La famille 3 n'est pas une incohérence à corriger mais une **différence de nature** (collection vs entité unique) — la traiter comme les autres serait une régression UX.

---

## 2. Incohérences fines (même à l'intérieur de la famille « save explicite »)

Au-delà des trois modèles, des écarts de détail subsistent là où l'uniformité serait pourtant simple :

- **Libellé du bouton de confirmation.** *Cours / Enseignant·e / Horaire* disent « Enregistrer » ; *Groupe-cours* dit « Créer ». De plus, *Cours, Horaire, Groupe-cours* font basculer ce libellé selon le mode (création vs édition) via un `<span id="v2-btnTexte…">`, alors que *Enseignant·e* reste figé sur « Enregistrer » dans les deux modes.
- **État vide vs formulaire toujours visible.** *Cours, Horaire, Groupe-cours* ont un bloc « état vide » + formulaire masqué (`u-hide`). *Enseignant·e* et *Groupe d'étudiants* affichent le formulaire en permanence. Deux logiques d'apparition différentes.
- **Sémantique divergente de `data-on-change`.** Le même attribut signifie trois choses : *sauvegarder* (Trimestre), *mettre à jour la carte de prévisualisation* sans persister (Enseignant·e → `mettreAJourCarteEnseignant`), *recalculer le nom généré* (Groupe-cours → `mettreAJourNomGroupeCoursV2`). C'est le piège principal pour quiconque touchera ces sections sans lire le JS.
- **Boutons Supprimer / Activer.** « Activer » n'existe que pour *Cours* et *Groupe-cours* (logique d'élément actif). *Étudiants* a sa propre famille (« Vider la liste », « Supprimer ce groupe », « Exporter CSV »).

---

## 3. Risques à surveiller avant toute uniformisation

C'est le cœur de ta demande : qu'est-ce qui casse si on touche à ça.

### 3.1 Atomicité `groupeCoursActif` / `infoCours` (risque élevé)

Documenté comme **Écart #6** dans `trimestre-v2-orchestre.js` et dans le `CLAUDE.md`. Le couple `db.setSync('groupeCoursActif', …)` + `db.setSync('infoCours', …)` doit rester **consécutif, sans `await` ni `break` entre les deux**. La création d'un groupe-cours (`sauvegarderGroupeCoursV2`) écrit `groupeCoursActif` quand c'est le premier GC. Toute refonte du save groupe-cours doit préserver cette séquence — sinon `obtenirEtudiantsCoursActif`, qui lit `infoCours` de façon synchrone, peut lire un état incohérent.

### 3.2 Effet de bord « premier élément = actif » (risque moyen)

Deux sections auto-activent l'élément créé s'il est le premier : *Cours* (`_activerSiPremierCours`) et *Groupe-cours* (`estPremier` → `groupeCoursActif = nouveauGC`). Si l'uniformisation factorise la création dans un helper commun, **cette logique d'auto-activation doit être préservée par entité** — elle n'est pas générique.

### 3.3 État module-scope cloisonné par IIFE (risque moyen)

Chaque module garde son `XEnEditionId` en variable **privée** dans son IIFE. Un helper d'uniformisation partagé entre modules devrait passer par des exports `window.*`. Le projet a déjà subi une **régression silencieuse cross-IIFE** exactement de ce type (le `window.setValue` oublié, corrigé le 22 mai 2026, noté dans `trimestre-v2-cours.js`). À refaire avec prudence et grep systématique des call-sites.

### 3.4 Double sauvegarde si on bascule le Trimestre vers le modèle explicite (risque moyen — dette)

Si tu veux aligner *Gestion des trimestres* sur le modèle « save explicite », il faut **retirer les `data-on-change` auto-save** en même temps. Les laisser « au cas où » créerait une double persistance et violerait le principe **zéro-dette** du projet (« le chantier n'est pas fini tant que l'ancien n'est pas retiré »).

### 3.5 Changement d'ID de trimestre sans migration (risque latent préexistant)

`sauvegarderIdentificationTrimestreV2` recalcule l'`id` du trimestre (`h2026`, `a2025`…) à partir de session+année. Le code contient un `if (ancienId !== id) { }` **vide** : un changement de session ou d'année réécrit l'ID **sans migrer les données namespacées** (`h2026_groupeEtudiants`, etc.). Ce n'est pas causé par l'incohérence des boutons, mais si l'uniformisation te conduit à retoucher cette fonction, c'est le moment d'y penser — le namespacing par trimestre est structurant.

### 3.6 Zones protégées et dispatcher (risque faible mais à connaître)

`config.js` et `navigation.js` sont des zones protégées (ne pas toucher sans autorisation). L'uniformisation passe par le **dispatcher `data-action` de `main.js`** (lignes ~700-780) : tout nouveau bouton doit y être routé, jamais de handler inline (règle de sécurité CSP non négociable).

### 3.7 Filet de tests mince (risque méthodologique)

`tests/unit/refactor-trimestre-v2.test.js` ne contient que des **sentinelles** : canari de chargement de module et vérification que ~20 exports existent (`sauvegarderCoursV2`, `soumettreEtudiantV2`, etc.). **Aucun test ne vérifie le comportement de sauvegarde lui-même.** Conséquence : la protection automatique contre une régression d'uniformisation est quasi nulle. Validation manuelle Mac **et** iPad indispensable, et selon les règles du projet, tout passage touchant un module sensible doit ajouter au moins un test.

---

## 4. Pistes de modèle cible (à arbitrer avec toi)

Hypothèse de travail, à valider : viser **un modèle « save explicite » unique** pour les entités singulières (Cours, Enseignant·e, Horaire, Groupe-cours, et possiblement l'identité/cadre du trimestre), et **laisser le Groupe d'étudiants dans son modèle « ajout immédiat »** (nature collection).

Convergences à faible risque, à fort gain de cohérence :

1. **Libellé unique.** « Enregistrer » partout, avec bascule « Créer / Enregistrer » homogène via le `<span>` déjà en place — ou inversement « Créer / Modifier ». À choisir une fois.
2. **Apparition du formulaire homogène.** Soit état vide + formulaire masqué partout, soit formulaire toujours visible partout. Aujourd'hui c'est 3 contre 2.
3. **Clarifier `data-on-change`.** Idéalement réserver l'attribut à *une seule* sémantique et nommer explicitement les autres (`data-on-change="majApercu…"` vs `data-on-change="sauvegarder…"`), pour lever le piège du §2.
4. **Trancher le cas Trimestre.** Soit auto-save assumé partout (et on retire le bouton), soit save explicite (et on retire les `data-on-change`). Ne pas garder les deux.

Démarche recommandée, fidèle au principe « un fichier à la fois » du projet : commencer par la convergence **purement cosmétique** (libellés + apparition du formulaire) qui ne touche pas la persistance, valider sur Mac/iPad, puis seulement ensuite arbitrer le cas Trimestre et le cas `data-on-change` qui, eux, touchent le comportement.

---

## 5. Ce qui reste à décider

Avant d'écrire la moindre ligne :

- Modèle cible pour le Trimestre : auto-save assumé ou save explicite ?
- Le Groupe d'étudiants reste-t-il en ajout immédiat (recommandé) ou veux-tu lui ajouter un bouton de cohérence visuelle ?
- Libellé canonique : « Créer / Enregistrer » ou « Créer / Modifier » ?
- Souhaites-tu que cette uniformisation s'accompagne d'au moins un test comportemental (pour ne pas rester sur des sentinelles d'exports) ?

---

## 6. Décisions actées — 31 mai 2026

> Arbitrages du §5 tranchés avec Grégoire. Le chantier d'uniformisation lui-même reste **post-AQPC** (#306) : ces décisions le préparent, l'implémentation ne démarre pas avant le 3 juin.

1. **Modèle du Trimestre → save explicite.** On retire les `data-on-change` auto-save de *Gestion des trimestres* et on conserve le bouton « Sauvegarder » comme point de persistance unique. Aligne 5 sections sur 6 et lève la double-persistance du §3.4 (zéro-dette). Vigilance §3.5 à traiter au passage : `sauvegarderIdentificationTrimestreV2` réécrit l'ID sans migrer les données namespacées.
2. **Groupe d'étudiants → bouton de fin de saisie (cosmétique).** Le modèle « ajout immédiat » est conservé : chaque étudiant reste persisté au clic « Ajouter l'étudiant ». Le bouton ajouté ne fait que clôturer/valider visuellement la liste pour homogénéiser l'apparence — **aucun changement de persistance** (pas d'état tampon, pas de save groupé). Risque faible.
3. **Libellé canonique → « Créer / Modifier ».** Bascule homogène via le `<span id="v2-btnTexte…">` déjà en place sur Cours / Horaire / Groupe-cours ; à étendre à Enseignant·e (aujourd'hui figé sur « Enregistrer ») et à substituer au « Créer » seul du Groupe-cours. Décrit l'intention (nouveau vs existant).
4. **Au moins un test comportemental.** Ne pas rester sur les sentinelles d'exports (§3.7) : ajouter au minimum un test qui vérifie le comportement de sauvegarde d'une entité. Conforme à la règle CLAUDE.md pour tout module sensible.
