# Portes terrain — 19 août 2026 · État vide Enseignant·e (#306) + cours global (#455)

> **Cycle 1.87.8 → 1.87.9** (session cloud du 19 août). Deux décisions de
> Grégoire livrées le jour même : le formulaire Enseignant·e suit le patron
> « état vide masqué » des trois autres sections du Cadre, et le cours est
> GLOBAL (garde anti-seconde-fiche au formulaire).
>
> **Artefact interactif** (l'opération — cocher, filtrer, exporter) : lien
> donné dans la conversation du 19 août. Ce fichier est la TRACE versionnée.
> **Ce qui échoue devient un item de backlog, pas une note mentale.**
>
> État : **NON TRAITÉE** (créée le 19 août 2026).

---

## §0 · Avant de commencer

- [ ] **0.1a** — SEULE commande de Terminal de la liste (app Terminal, dossier
  `Monitorage_v6`) : `git checkout main && git pull origin main`.
  ⮕ Attendu : liste de fichiers reçus puis `Fast-forward`. `[Terminal]` `[Mac]`
- [ ] **0.1b** — Recharger l'app et lire le numéro en bas de page.
  ⮕ Attendu : **1.87.9**, build **0819-0700**. En dessous, rien de cette liste
  ne vaut (deux des quatre échecs des 81 portes étaient des faux rouges de
  build en retard). `[Mac]`
- [ ] **0.1c** — Prévoir les deux appareils et les deux modes (sombre + clair).
  Trois rangées ne se tranchent que sur l'iPad. `[Mac]` `[iPad]`

## §2 · Interface

### 2.1 — Enseignant·e : le formulaire n'apparaît plus tout seul (#306, 1.87.9)

**Pourquoi** : le formulaire du profil s'affichait EN PERMANENCE, même vide —
alors que Cours, Horaire et Groupe-cours cachent le leur tant que rien n'est
sélectionné. Ta décision du 19 août : aligner sur le patron des trois autres.

- [ ] **2.1a** — Ouvrir le Cadre (Réglages → Trimestre), déplier « Enseignant·e »
  sans rien toucher. ⮕ Attendu : ton profil existant est auto-sélectionné et le
  formulaire s'affiche REMPLI (quand un profil existe, rien ne change). `[Mac]`
- [ ] **2.1b** — Dans le menu « Profil enseignant », revenir à « — Sélectionner — ».
  ⮕ Attendu : le formulaire disparaît ; à sa place, le message « Sélectionne un
  profil pour le modifier, ou crée ton profil avec + Nouveau profil ».
  AVANT : le formulaire restait affiché, vide. `[Mac]`
- [ ] **2.1c** — Cliquer « + Nouveau profil ». ⮕ Attendu : le formulaire s'ouvre
  vide, titre « Nouveau profil », bouton « Créer », curseur dans Prénom. `[Mac]`
- [ ] **2.1d** — Cliquer « Annuler ». ⮕ Attendu : retour au message d'état vide,
  menu revenu à « — Sélectionner — ». AVANT : le formulaire restait là. `[Mac]`
- [ ] **2.1e** — Re-sélectionner ton profil dans le menu. ⮕ Attendu : formulaire
  rempli, titre « Modifier le profil », bouton « Enregistrer ». `[Mac]`
- [ ] **2.1f** — Sur l'iPad, rejouer 2.1b → 2.1d. ⮕ Attendu : mêmes
  comportements au doigt. `[iPad]`
- [ ] **2.1g** — Regarder le message d'état vide dans les DEUX modes (sombre et
  clair). ⮕ Attendu : lisible dans les deux — c'est le même bloc gris que
  « Sélectionne un cours pour l'éditer » de la section Cours. `[Mac]` `[iPad]`

### 2.2 — Une seconde fiche de cours au même code est interceptée (#455, 1.87.8)

**Pourquoi** : ta décision du 19 août — « le devis ministériel ne change pas
d'un trimestre à l'autre, le cours est GLOBAL ». Avant, rien n'empêchait de
créer une seconde fiche « 601-101-MQ » : deux fiches pour la même chose, et les
écrans de suivi rattachés à l'une ne voyaient plus les groupes de l'autre — la
famille du bug « productions H26 inaccessibles » du 9 août.

- [ ] **2.2a** — Cadre → Cours → « + Nouveau cours ». Saisir le code
  `601-101-MQ` (ton code EXISTANT) et une discipline, cliquer « Créer ».
  ⮕ Attendu : un avertissement — « Une fiche « 601-101-MQ » existe déjà. Le
  cours est global : la même fiche sert tous les trimestres… Créer quand même
  une seconde fiche ? ». AVANT : la fiche se créait sans un mot. `[Mac]`
- [ ] **2.2b** — Dans cet avertissement, cliquer « Annuler ». ⮕ Attendu :
  AUCUNE fiche neuve — le menu des cours n'a pas grandi. (Rien n'est écrit tant
  que tu annules : ce test ne touche pas tes données.) `[Mac]`

## §4 · Ce que je n'ai pas pu vérifier

1. **Rien n'a été éprouvé sur ton matériel.** WebKit n'existe pas dans le
   conteneur : le parcours Enseignant·e complet (6 transitions) et le garde
   #455 ont été mesurés au Chromium, zéro erreur de page — pas dans Safari,
   pas sur l'iPad. Les rangées iPad et la rangée deux-modes sont exactement
   les trous.
2. **Le thème n'a été mesuré que d'un côté.** Le bloc d'état vide réutilise la
   classe existante des trois autres sections (`etat-vide-formulaire`), déjà
   validée dans les deux modes sur Cours — mais l'œil fait foi (rangée 2.1g).
3. **La suppression d'un trimestre ne purge plus le magasin global `cours`**
   (#455) : vérifié par sentinelle et break-test, PAS rejoué en réel —
   supprimer un trimestre sur ton corpus n'est pas un test raisonnable.
4. **L'import de fiches de cours (JSON) dédoublonne désormais par code seul** :
   verrouillé par sentinelle statique, non rejoué de bout en bout avec un vrai
   fichier d'import.
5. **Cas limite théorique de la fusion legacy** : si deux VRAIS cours distincts
   partageaient un même code (ça ne devrait pas exister au collégial — le code
   EST le devis), la fusion `listeCours`→`cours` n'en laisserait entrer qu'un.
   Si ce cas existe chez toi, dis-le-moi avant tout import d'archives.

---

**Au retour du terrain** : trier les échecs (défaut réel vs build en retard),
verser chaque échec réel au BACKLOG avec son numéro de porte, mettre à jour ce
fichier (état, date, ce qui reste).
