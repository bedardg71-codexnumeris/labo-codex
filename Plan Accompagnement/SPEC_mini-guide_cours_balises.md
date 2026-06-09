# Spec : mini-guide « Les balises du cours » (onglet Cadre → construction du groupe-cours)

**Date** : 29 mai 2026
**Auteur** : Claude (Cowork) en discussion avec Grégoire
**Destinataire** : Claude Code
**Emplacement cible** : aide contextuelle (mode *popup*) sur le formulaire de construction du
cours, onglet **Cadre** (groupe-cours). Icône d'info près des champs **Pondération** /
**Heures d'enseignement** (`index.html` ~ l. 6979-6985).

---

## 1. But

Lever, pour l'utilisateur, l'ambiguïté entre **période**, **heure d'enseignement** et
**unité** — trois grandeurs que le formulaire du cours met en jeu sans les expliquer. Le
guide les définit, les relie, et fixe la **terminologie correcte** (l'OQLF déconseille
« heure-contact »).

> Sources validées (cf. §4) : Office québécois de la langue française (Grand dictionnaire
> terminologique), RREC (C-29, r. 4, art. 1), et documents officiels de cégeps + ministère.

---

## 2. Implémentation

Entrée à ajouter dans `js/accompagnement-contenu-popup.js` (catalogue `popup`, poussé via
`accompagnement.ajouterEntrees`). Convention du fichier : tutoiement ; types de section
`texte` / `liste` / `conseil` / `exemple` / `alerte`. Clé proposée :
`'cadre-cours-balises'`.

Déclencheur : icône d'info (même patron que les autres entrées `popup` du formulaire de
cours) à côté du libellé **Pondération** et/ou **Heures d'enseignement**.

> **Note terminologique pour Claude Code (hors contenu utilisateur)** : l'app emploie
> actuellement « heures-contact » (champ `v2-heuresContact`, fonction
> `proposerHeuresContactDepuisPonderation`, doc `ANALYSE-conformite-RREC-heures-contact.md`).
> L'OQLF **déconseille** « heure-contact » (calque de l'anglais *contact hour*) au profit de
> **« heure d'enseignement »**. À rebaptiser dans un chantier terminologique (libellés UI au
> minimum ; identifiants techniques à voir). Le présent guide emploie déjà le terme correct.

---

## 3. Contenu des sections (texte prêt à intégrer)

```javascript
'cadre-cours-balises': {
    titre: "Comprendre les balises du cours",
    sections: [
        {
            type: 'texte',
            contenu: "Trois grandeurs décrivent la « taille » d'un cours au collégial : la pondération, les heures d'enseignement et les unités. Elles viennent du Règlement sur le régime des études collégiales (RREC) et de la grille de cours de ton programme. Voici comment les lire."
        },
        {
            type: 'liste',
            titre: "La pondération (ex. : 2-2-3)",
            items: [
                "1er chiffre : heures de théorie par semaine.",
                "2e chiffre : heures de laboratoire ou de pratique par semaine.",
                "3e chiffre : heures de travail personnel attendues par semaine (hors classe).",
                "Les deux premiers chiffres comptent le temps en présence de l'enseignant ; le troisième, le travail autonome de l'étudiant."
            ]
        },
        {
            type: 'texte',
            contenu: "Les heures d'enseignement sont le temps où l'enseignant est en présence des étudiants, pour un enseignement théorique ou pratique. On les obtient en additionnant les deux premiers chiffres de la pondération et en multipliant par les 15 semaines du trimestre régulier. Exemple : pondération 2-2-3 → (2 + 2) × 15 = 60 heures d'enseignement."
        },
        {
            type: 'alerte',
            niveau: 'attention',
            contenu: "Terminologie : le terme juste est « heure d'enseignement ». « Heure-contact » est un calque de l'anglais contact hour, déconseillé par l'Office québécois de la langue française."
        },
        {
            type: 'texte',
            contenu: "Ne confonds pas une période et une heure d'enseignement. Une période est le bloc à ton horaire : sa durée dépend du collège (souvent 50 ou 55 minutes, pause comprise). Une heure d'enseignement est l'unité de compte de la charge : une période compte pour une heure d'enseignement, même si elle dure moins de 60 minutes d'horloge. Le RREC compte d'ailleurs les cours en « périodes d'enseignement » (au moins 45 pour un cours typique)."
        },
        {
            type: 'exemple',
            titre: "L'unité (RREC)",
            contenu: "Une unité équivaut à 45 heures d'activités d'apprentissage — travail personnel inclus. Le nombre d'unités d'un cours = somme des trois chiffres de la pondération ÷ 3. Exemple : 2-2-3 → (2+2+3) ÷ 3 = 2 ⅓ unités, soit 2 ⅓ × 45 = 105 heures au total (60 d'enseignement + 45 de travail personnel)."
        },
        {
            type: 'conseil',
            contenu: "Dans Labo Codex, les heures d'enseignement servent de repère de conformité (ce qui est prévu vs ce que ton horaire couvre réellement). Les unités sont un repère descriptif, dérivé de la pondération. En session intensive (été), la pondération « par semaine » devient trompeuse, mais le total d'heures d'enseignement, lui, reste le même : c'est l'invariant à viser."
        }
    ],
    voirAussi: []
}
```

> Si le type `alerte` attend `niveau: 'attention' | 'important'`, conserver `'attention'`.
> Si l'API ne porte pas de champ `niveau`, retirer la clé (un encadré orange par défaut
> convient).

---

## 4. Sources (à conserver au dossier, non affichées à l'utilisateur)

- **OQLF — Grand dictionnaire terminologique, fiche « heure d'enseignement »** (domaine :
  éducation / gestion de l'enseignement, MAJ 2009) : terme privilégié « heure d'enseignement »
  = « Heure pendant laquelle le professeur est en présence des étudiants pour un enseignement
  théorique ou pratique » ; « unité de mesure pour déterminer la charge de travail » ; terme
  **déconseillé** « heure-contact » (calque de *contact hour*). Anglais : *contact hour*,
  *clock hour*.
  https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/8352638/heure-denseignement
- **RREC (C-29, r. 4), art. 1** : « cours » = au moins 45 périodes d'enseignement ;
  « unité » = 45 heures d'activités d'apprentissage. (Ne définit pas la durée d'une période,
  n'emploie pas « heure-contact ».) Fichier local :
  `description de l'application/C-29, R. 4.pdf` (p. 2).
- **Pondération et unités** (sources cégep/ministère) :
  - Cégep de Trois-Rivières, « Comprendre la grille de cours » — https://www.cegeptr.qc.ca/comprendre-grille-cours/
  - Cégep Montmorency, « Comment lire une grille de cours » (PDF) — https://www.cmontmorency.qc.ca/wp-content/uploads/2017/09/zcommentlire.pdf
  - Ministère (Éducation/Enseignement supérieur), « Prescriptions ministérielles et l'élaboration d'un programme » (PDF, oct. 2019) — https://cdn-contenu.quebec.ca/cdn-contenu/adm/min/education/publications-adm/cegeps/services-administratifs/programmes-etudes-preuniversitaires/Prescriptions-ministerielles-Oct2019.pdf
- **Durée d'une période (variable selon le collège, 50 ou 55 min)** :
  - Cégep de Sainte-Foy, « Calendrier scolaire et horaire au cégep » (50 min) — https://www.csfoy.ca/parents/le-cegep-comment-ca-marche/calendrier-scolaire-et-horaire-au-cegep
  - Cégep de Rimouski, « Informations sur l'horaire » (55 min) — https://www.cegep-rimouski.qc.ca/informations-sur-lhoraire
- **Doc projet** : `docs/ANALYSE-conformite-RREC-heures-contact.md` (chaîne de conformité,
  formules) ; `js/horaire.js:286-309` (`obtenirDureePeriode` défaut 55 min,
  `periodesVersHeures`).

---

## 5. Lien avec le chantier en cours (conformité RREC, chantier A)

Le mini-guide et le chantier A partagent les mêmes définitions. Deux points à harmoniser
côté code (hors de ce guide, à acter par Grégoire) :

1. **Terminologie** : remplacer « heures-contact » par « heures d'enseignement » dans les
   libellés (OQLF).
2. **Cohérence de l'unité de mesure** : l'« exigence » (pondération × 15) compte en heures
   d'enseignement où 1 période = 1 heure ; le « réalisé » de l'horaire convertit les périodes
   en minutes (55 min). Pour éviter un faux écart, compter les deux côtés dans la **même**
   unité — idéalement en **périodes / heures d'enseignement**, l'unité du RREC et du devis.
   (Cf. l'analyse remise précédemment ; décision à prendre avec le chantier A.)

---

## 6. Bulle d'information au survol (complément léger)

En plus du mini-guide *popup* (§3), poser une **bulle au survol** (mécanisme `data-tooltip`
+ catalogue `js/accompagnement-contenu-hover.js`) qui porte la nuance heures/périodes là où
l'utilisateur saisit les chiffres. C'est le complément demandé le 29 mai.

**Greffe HTML** : ajouter l'attribut sur la rangée Pondération / Heures du formulaire de
cours (`index.html` ~ l. 6977, le `div.grille-form-2col` qui contient `v2-ponderation` et
`v2-heuresContact`) :

```html
<div class="grille-form-2col u-mb-15" data-tooltip="reglages-cours-ponderation-heures">
```

**Entrée catalogue** (`accompagnement-contenu-hover.js`, registre des bulles courtes) :

```javascript
'reglages-cours-ponderation-heures':
    'Pondération = théorie–laboratoire–travail personnel, en heures par semaine. ' +
    '(Théorie + labo) × 15 = les heures d\'enseignement (présence en classe). ' +
    'Une heure d\'enseignement correspond à une période à l\'horaire (50 à 55 min selon ' +
    'le collège), pas à 60 minutes d\'horloge. En session intensive, c\'est ce total ' +
    'd\'heures qui reste l\'invariant, pas le rythme hebdomadaire.',
```

> Si la bulle paraît trop longue à l'usage, garder les deux premières phrases dans la bulle
> et laisser le reste au mini-guide *popup* (l'icône d'info). La bulle survol = l'essentiel ;
> le popup = le détail chiffré.

**Terminologie (à corriger en même temps)** : le formulaire affiche encore « Heures-contact
attendues » (`index.html:6984`) et « Total d'heures en classe » (`:6986`). Renommer en
**« Heures d'enseignement »** (terme privilégié OQLF ; « heure-contact » est déconseillé).
Cohérent avec la note terminologique du §2.

> ⚠️ **Collision possible** : Claude Code travaille actuellement sur ces mêmes champs
> (`v2-ponderation` / `v2-heuresContact`, chantier A conformité RREC). Intégrer cette bulle
> **dans ce chantier-là**, pas en parallèle, pour éviter d'écraser son travail.

---

**Fin de la spec**

*Compagnon de `docs/ANALYSE-conformite-RREC-heures-contact.md` et de
`Rapports/AUDIT-CONFORMITE-RREC-C29r4.md`.*
