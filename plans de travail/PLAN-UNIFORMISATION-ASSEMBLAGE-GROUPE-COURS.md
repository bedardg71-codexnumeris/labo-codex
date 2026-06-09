# Plan de travail — Uniformisation de la page d'assemblage du groupe-cours

> **Destinataire** : Claude Code.
> **Pré-requis de lecture** : `docs/00-START-HERE.md`, ce plan, l'analyse `Rapports/analyse-coherence-assemblage-groupe-cours.md`.
> **Nature** : harmonisation UI + bascule d'un modèle de sauvegarde. Aucune nouvelle fonctionnalité.
> **Beta de départ** : 99.84 (build 0530-1230). **Demander le numéro de beta à Grégoire avant tout commit — ne jamais renuméroter automatiquement.**

---

## Contexte

La sous-section « Trimestre » (section Calendrier, `index.html` ~6595-7848) regroupe six accordéons d'assemblage. Trois modèles de persistance y coexistent, ce qui produit l'incohérence des boutons signalée par Grégoire. L'analyse complète et la cartographie sont dans `Rapports/analyse-coherence-assemblage-groupe-cours.md` — **la lire avant de commencer**.

## Décisions actées par Grégoire (29 mai 2026)

1. **Trimestre → save explicite.** Retirer l'auto-save par champ, ne persister que via le bouton.
2. **Groupe d'étudiants → inchangé.** Modèle « ajout immédiat » conservé (collection, pas entité unique). On documente que c'est volontaire.
3. **Libellé canonique « Créer / Enregistrer »**, appliqué partout avec bascule selon le mode (création vs édition).
4. **Ajouter au moins un test comportemental** (Vitest), pas seulement des sentinelles d'exports.

## Décision encore ouverte — à confirmer avec Grégoire avant le Lot 1

**Apparition du formulaire.** Aujourd'hui : *Cours / Horaire / Groupe-cours* = état vide + formulaire masqué ; *Enseignant·e / Étudiants* = formulaire toujours visible. Faut-il aligner Enseignant·e sur « état vide masqué » ? Cela change le périmètre du Lot 1. **Hypothèse de travail par défaut retenue dans ce plan : on NE touche PAS à l'apparition pour l'instant** (convergence libellés seulement). Si Grégoire veut l'alignement, ajouter une étape au Lot 1.

---

## Contraintes projet non négociables

- **Zéro-dette** : tout mécanisme remplacé est RETIRÉ dans le même chantier. Pas d'alias « au cas où », pas de `data-on-change` orphelin.
- **CSP `script-src 'self'`** : aucun handler inline. Routage uniquement par `data-action` / `data-on-change` (dispatcher `js/main.js` ~700-780).
- **`echapperHtml()`** obligatoire sur toute donnée utilisateur injectée en `innerHTML`.
- **Design system** : consulter `design-system.html`, variables CSS de `styles.css`, vérifier modes sombre ET clair.
- **Zones protégées** : ne pas toucher `js/config.js`, `js/navigation.js`, `noms_stables.json`.
- **Un fichier à la fois**, validation fonctionnelle après chaque fichier, sur Mac ET iPad.

## Points de vigilance (régressions latentes)

- **Atomicité `groupeCoursActif` / `infoCours`** (Écart #6, cf. `trimestre-v2-orchestre.js`). Ne pas insérer d'`await` ni de `break` entre les deux `db.setSync` dans la chaîne de création de groupe-cours. **Ce chantier ne doit pas remuer cette zone** — si une étape t'y mène, t'arrêter et signaler.
- **Recalcul d'ID de trimestre** dans `sauvegarderIdentificationTrimestreV2` (`trimestre-v2-init.js` ~124) : un changement session/année réécrit l'ID namespacé (`h2026`…) sans migration (le `if (ancienId !== id) {}` est vide). Ne pas aggraver ce comportement en touchant la fonction. Si la bascule save-explicite t'amène à la modifier, préserver le comportement actuel à l'identique et le signaler.
- **État module-scope cross-IIFE** : chaque sous-module garde son `XEnEditionId` privé. Ne PAS introduire de helper partagé sans export `window.*` explicite (régression silencieuse déjà vécue — cf. `window.setValue`, 22 mai 2026). Préférer dupliquer une bascule de libellé triviale plutôt que partager de l'état.
- **Code legacy enseignant** : `trimestre-v2-orchestre.js` contient `afficherFormEnseignantV2` / `modifierEnseignantSelectionneV2` qui manipulent un id `v2-btnTexteEnseignant` **absent du HTML actif** ; le HTML câble en réalité `nouveauProfilEnseignantV2` / `chargerEnseignantSelectionneV2` (`trimestre-v2-enseignants.js`). Vérifier que ces fonctions orchestre sont bien mortes ; si oui, les retirer (zéro-dette) dans le Lot 1.

---

## Lot 1 — Uniformisation des libellés « Créer / Enregistrer » (risque faible)

Ne touche PAS la persistance. Objectif : en création le bouton affiche « Créer », en édition « Enregistrer », dans les quatre sections à entité unique.

### 1a. Cours — déjà conforme, à vérifier
- Span présent : `index.html` ligne ~7159 `<span id="v2-btnTexteCours">`.
- JS le règle déjà en 4 points (`trimestre-v2-cours.js` ~239, 480, 529, 578). **Vérifier** que création = « Créer » et édition = « Enregistrer ». Corriger si un point dit « Enregistrer » en création.

### 1b. Horaire — déjà conforme, à vérifier
- Span : `index.html` ~7677 `<span id="v2-btnTexteHoraire">`.
- JS : `trimestre-v2-horaires.js` ~516, 559. Même vérification que 1a.

### 1c. Groupe-cours — harmoniser la bascule
- Span : `index.html` ~7837 `<span id="v2-btnTexteGroupeCours">Créer</span>`.
- JS : `trimestre-v2-groupes-cours.js` ~458 (création), ~524 (édition). Vérifier création = « Créer », édition = « Enregistrer ».

### 1d. Enseignant·e — cas à corriger (bouton figé)
- HTML `index.html` ~7397 : bouton statique `Enregistrer` **sans span**. Ajouter `<span id="v2-btnTexteEnseignant">Créer</span>`.
- JS `trimestre-v2-enseignants.js` : régler le span à « Créer » dans `nouveauProfilEnseignantV2` (~162) et à « Enregistrer » dans `chargerEnseignantSelectionneV2` et après sauvegarde (~258). Le titre bascule déjà (« Nouveau profil » / « Modifier le profil »).
- Retirer les fonctions legacy `afficherFormEnseignantV2` / `modifierEnseignantSelectionneV2` de `trimestre-v2-orchestre.js` si confirmées mortes (et leurs exports `window.*` ~634-635).

### Validation Lot 1
Pour chacune des 4 sections : ouvrir l'accordéon, « + Nouveau… » → bouton « Créer » ; sélectionner un existant → bouton « Enregistrer ». Tester en mode sombre et clair, sur Mac et iPad. Commit (après accord beta).

---

## Lot 2 — Bascule du Trimestre en save explicite (risque moyen)

Fichiers : `index.html` (section Gestion des trimestres ~6648-6895) + `js/trimestre-v2-init.js`.

1. **Recenser** tous les `data-on-change="sauvegarderIdentificationTrimestreV2"` et `data-on-change="sauvegarderCadreCalendrierV2"` dans la section (champs identification ~6677-6690, bornes/semaines ~6708-6764).
2. **Retirer** ces `data-on-change` de persistance. Conserver les `data-on-change` qui ne sauvegardent pas mais rafraîchissent un affichage (ex. `majAffichageRepriseV2*`) — les distinguer soigneusement.
3. Le bouton « Sauvegarder le trimestre » (~6888, `sauvegarderCadreCalendrierV2`) devient le **seul** point de persistance du cadre. Vérifier qu'il sauvegarde bien l'identification ET le cadre (sinon, faire appeler les deux fonctions par le bouton, ou fusionner proprement — sans dupliquer la logique).
4. **Ne pas modifier** la logique interne de recalcul d'ID (voir Points de vigilance). Si l'identification n'est plus auto-sauvée, s'assurer qu'elle l'est au clic sur le bouton.
5. Auditer les call-sites de `sauvegarderIdentificationTrimestreV2` / `sauvegarderCadreCalendrierV2` ailleurs dans le code (`grep`) : si d'autres modules s'appuyaient sur l'auto-save par effet de bord, traiter le cas.

### Validation Lot 2
Modifier nom/session/année/dates SANS cliquer : vérifier que rien n'est persisté (recharger → valeurs anciennes). Cliquer « Sauvegarder le trimestre » : vérifier persistance complète. Vérifier qu'aucun champ ne sauvegarde encore tout seul (zéro `data-on-change` de save résiduel). Mac + iPad, deux modes. Commit (après accord beta).

---

## Lot 3 — Test comportemental (risque faible)

Fichier : nouveau test dans `tests/unit/` (Vitest). Cf. `docs/securite/TESTS-AUTOMATISES.md` et le helper `chargerScript()` pour les fonctions en IIFE.

- Couvrir au minimum un aller-retour persistance : enregistrer une entité (cours OU groupe-cours) puis la relire de `db` et vérifier l'égalité des champs.
- Idéalement, ajouter un cas pour le Trimestre vérifiant que **sans clic** rien n'est persisté (garde-fou anti-retour de l'auto-save).
- Lancer `cd tests && npm test` — toute la suite doit passer.

### Validation Lot 3
Suite verte. Commit (après accord beta).

---

## Procédure de commit (rappel CLAUDE.md)

À chaque commit, après validation :
1. **Demander le numéro de beta à Grégoire.**
2. Mettre à jour `version.json` (`{"build":"MMJJ-HHMM","beta":"XX.X"}`, heure Toronto).
3. Mettre à jour les fallback dans `js/init-inline.js` (~103-104).
4. Mettre à jour le snapshot `window._SCRIPT_BUILD_main` dans `js/main.js` (~19) — même valeur que `version.json`.
5. Si fonctionnalité visible utilisateur : envisager une entrée changelog (`js/changelog-data.js`).

## Critères de « terminé »

- Les 4 sections à entité unique affichent « Créer » en création, « Enregistrer » en édition.
- Enseignant·e a un span de libellé dynamique ; code legacy orchestre retiré si mort.
- Le Trimestre ne se sauvegarde plus que par son bouton ; zéro `data-on-change` de persistance résiduel.
- Groupe d'étudiants inchangé (ajout immédiat).
- Atomicité `groupeCoursActif`/`infoCours` non touchée.
- Au moins un test comportemental ajouté ; suite Vitest verte.
- Validé en modes sombre et clair, sur Mac et iPad.
- `version.json` / `init-inline.js` / `main.js` synchronisés à chaque commit.

## Hors périmètre (à ne pas faire ici)

- Refactor de l'atomicité `groupeCoursActif`/`infoCours`.
- Migration de l'ID de trimestre au changement session/année (risque latent préexistant — chantier séparé).
- Transformation du Groupe d'étudiants en modèle « save explicite ».
- Alignement de l'apparition du formulaire (état vide) tant que Grégoire n'a pas tranché.
