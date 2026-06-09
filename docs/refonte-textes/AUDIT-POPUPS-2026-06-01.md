# Audit des popups d'aide contextuelle — 1er juin 2026

**Périmètre** : les trois catalogues de contenu d'accompagnement
- `js/accompagnement-contenu-popup.js` (60 entrées, mode modale riche, déclenché par `data-aide`)
- `js/accompagnement-contenu-hover.js` (289 entrées, infobulle, déclenché par `data-tooltip`)
- `js/accompagnement-contenu-terme.js` (48 entrées, glossaire)

**Déclencheur de l'audit** : les popups ne correspondent plus toujours au contenu réel des éléments, des renommages/déplacements/suppressions étant survenus depuis leur intégration. La réorganisation de la navigation du 3 avril 2026 (suppression de la section « Structure », déplacement du dépistage) est la principale source d'écarts.

**Méthode** : audit mécanique du câblage (grep/script) + cartographie des libellés réels contre `index.html`, `js/config.js` et les modules. Les constats sont marqués **fait vérifié** (confirmé dans le code), **inférence** ou **à confirmer** (demande ta mémoire contextuelle).

**Sévérité** : 🔴 cassé (l'utilisateur voit une erreur ou rien) · 🟠 trompeur (le texte induit en erreur) · 🟡 cohérence / cosmétique.

---

## Axe A — Intégrité référentielle

### Popup

**🔴 Référence morte** *(fait vérifié)*. `data-aide="labo-etudes"` (`index.html:9206`) est posé sur la sous-section **Labo › Études** (titre visible « Études »). Aucune entrée `labo-etudes` n'existe dans le catalogue popup — seule une entrée *hover* `nav-labo-etudes` existe (mécanisme distinct). Cliquer l'icône info n'ouvre rien.
*Recommandation* : créer l'entrée popup `labo-etudes`, ou retirer le `data-aide`.

**🟡 Entrées orphelines** *(fait vérifié)*. 18 des 60 entrées ne sont déclenchées par aucun bouton `data-aide`. Deux sont **totalement injoignables** (ni bouton, ni lien « Voir aussi ») : `accueil-donnees-demo` et `contexte-horaire`. Les 16 autres ne sont atteignables que comme destination de liens « Voir aussi » depuis d'autres popups (`categories-selection-obligatoires`, `conception-apercu-legacy`, `construction-objectifs-reflexion`, `contexte-cours`, `contexte-groupe-etudiants`, `depistage-interpretation`, `echelle-plage-notes`, `echelle-valeur-ponctuelle`, `grille-niveau-solo`, `grille-type-critere-detail`, `planification-alignement`, `reserve-deja-present`, `reserve-ref-manquante`, `retroaction-grille-descriptive`, `suivi-apprentissage-fondamentaux`, `tableau-bord-rai`).
*Recommandation* : statuer cas par cas — garder (utile comme cible « Voir aussi »), recâbler (poser un `data-aide` sur l'élément décrit), ou retirer (principe zéro-dette). `accueil-donnees-demo` et `contexte-horaire` méritent une décision explicite : injoignables aujourd'hui.

**✅ Liens « Voir aussi »** *(fait vérifié)*. Les 54 `voirAussi` pointent tous vers des clés existantes. Aucune correction.

### Hover

**🔴 Infobulles mortes** *(fait vérifié)*. Trois `data-tooltip` pointent vers des clés hover inexistantes : `tdb-trajectoires`, `tdb-graphique-trajectoires`, `labo-charger-codex-data`. L'infobulle reste vide.
*Recommandation* : créer les entrées ou retirer les `data-tooltip`.

**🟡 Clés hover sans déclencheur statique** *(à confirmer)*. ~80 clés n'ont pas de `data-tooltip` en HTML statique. Une large part est posée dynamiquement via des tables JS (`TOOLTIPS_SOUS_NAV`, maps de sections du profil), donc faux positifs. Le tri manuel n'est pas rentable.
*Recommandation* : réconciliation scriptée (Lot 3) plutôt qu'à l'œil.

### Terme
48 entrées, mécanisme de glossaire. Les écarts détectés concernent les renvois `voir:` (chemins de navigation périmés) — traités en Axe B.

---

## Axe B — Correspondance texte ↔ interface réelle

### Chemins de navigation périmés *(faits vérifiés contre `js/config.js`)*

Rappel de la navigation réelle : sections **Accueil · Cadre · Conception · Évaluation · Suivi · Labo · Aide · Réglages**. Il n'existe **pas** de section « Structure ». Les seuils de **dépistage** sont sous **Labo › Outils d'observation** (`id: accompagnement`). L'alignement est sous **Conception › Alignement pédagogique** (`id: carte`).

| Fichier:ligne | Entrée | Texte actuel | Emplacement réel | Sévérité |
|---|---|---|---|---|
| popup:292 | `tableau-bord-rai` | « Réglages › Dépistage » | Labo › Outils d'observation | 🟠 |
| popup:367 | `suivi-liste` | « Réglages > Groupe » | Suivi › Liste des étudiant·es **(à confirmer)** | 🟠 |
| popup:714 | `suivi-apprentissage-fondamentaux` | « Calendrier → Dépistage » | Labo › Outils d'observation | 🟠 |
| popup:904 | `objectif-verbes-actifs` | « Structure → Alignement pédagogique » | Conception › Alignement pédagogique | 🟠 |
| terme:42 | (groupe d'étudiant·es) | renvoi « Réglages > Groupe » | **à confirmer** | 🟠 |
| terme:60 | (groupe-cours) | renvoi « Réglages > Groupe-cours » | **à confirmer** | 🟠 |
| terme:230 | (zones A-C-P) | « Réglages > Dépistage » | Labo › Outils d'observation | 🟠 |
| terme:258 | (renvoi) | « Réglages > Dépistage » | Labo › Outils d'observation | 🟠 |
| terme:276 | (renvoi) | « Réglages > Dépistage » | Labo › Outils d'observation | 🟠 |

*Note sur « Réglages > Groupe » / « Groupe-cours »* : la gestion des étudiant·es vit sous **Suivi** dans la navigation principale, mais il existe aussi une modale de réglages du groupe-cours (entête) avec un onglet Groupe. Le bon libellé dépend de l'intention — d'où le **à confirmer**.

### Libellés de boutons / contrôles divergents *(faits vérifiés)*

| Fichier:ligne | Entrée | Texte du popup | Libellé réel | Sévérité |
|---|---|---|---|---|
| popup:317 | `suivi-saisie` | bouton « Tous présents » | « Tous 2h » (attribut `title` = « Mettre tous présents », `index.html:8180-8182`) | 🟠 |
| popup:832 | `depistage-interpretation` | bouton « Restaurer » | « Restaurer les valeurs par défaut » (`index.html:8902,9007`) | 🟡 |
| popup:1047,1052 | `accueil-donnees-demo` | « Dupliquer pour créer ma grille » | bouton réel « Dupliquer » (`index.html:5024-5025`) **(à confirmer)** | 🟠 |

### Vérifiés conformes (aucune action)
États de présence Présent/Absent/Justifié/Retard ✅ · zones Fragile/Modéré/Favorable/Très favorable ✅ · « Recopier en double » ✅ · « Données démo » ✅ · « Vérifier le dossier » ✅ · « Réassocier » ✅ · « Anonymiser les noms » ✅ · « Nouvelle intervention » ✅ · Codex › Archiver… / Ouvrir une archive… ✅ · onglet Accompagnement (profil) ✅ · Conception › Grille de critères + tag SOLO ✅ · Réglages › Données / À propos ✅.

---

## Axe C — Cohérence interne

**🟡 Terminologie** *(fait vérifié)*. `popup:292` (`tableau-bord-rai`) écrit « proportions d'élèves ». Le projet impose « étudiant·e ». Seule occurrence de « élève » dans les trois catalogues. À corriger en même temps que le chemin de navigation du même paragraphe.

**🟡 Doublon de contenu** *(fait vérifié)*. `reserve-deja-present` et `reserve-copie-double` expliquent presque la même mécanique (« Recopier en double »), avec une phrase quasi identique sur « les deux versions côte à côte… libre de les comparer ou de supprimer l'une des deux ».
*Recommandation* : différencier nettement (l'une = état d'un item grisé déjà présent ; l'autre = la case globale et le rebranchement des références) ou fusionner.

**✅ Calque « heure-contact »** déjà neutralisé par une alerte explicite dans `cadre-cours-balises`. Aucun nouveau calque détecté.

**🟡 Collision de lettre P** *(inférence)*. Dans `profil-etudiant-indicateurs`, « P (Performance) » (indice A-C-P) cohabite avec « P (Plausibilité) » (habiletés SRPNF). Pas un bug, mais ambiguïté de lecture potentielle. À surveiller, pas à corriger d'office.

---

## Axe E — Formulation / répétition syntaxique

**🟡 Ouvertures stéréotypées** *(fait vérifié)*. 11 entrées (surtout les modales système) ouvrent par « Cette modale… / Cette fenêtre… / Cette section… / Ce panneau… / Cette fiche… / Cette page… ». Cohérence assumée, mais monotone à la lecture en série.
*Recommandation* : acceptable tel quel ; varier seulement si tu le souhaites. Faible priorité.

**🟡 Formule récurrente** *(fait vérifié)*. « verrouiller… pour éviter les modifications accidentelles » apparaît à l'identique 3× (`conception-productions`, `construction-cartouches`, `contexte-cours`). Concept légitime, formulation identique — parallélisme utile ou répétition à alléger, au choix.

**🟡 Quasi-duplication** *(fait vérifié)*. Couplée au doublon C : la phrase « côte à côte dans ta bibliothèque… » se répète entre `reserve-deja-present` et `reserve-copie-double`.

---

## Plan de correction proposé

**Lot 1 — sûr, sans ambiguïté** (corrigeable immédiatement) :
- `popup:904` : « Structure → Alignement pédagogique » → « Conception → Alignement pédagogique ».
- `popup:292` : « élèves » → « étudiant·es » **et** « Réglages › Dépistage » → « Labo › Outils d'observation ».
- `popup:714` : « Calendrier → Dépistage » → « Labo › Outils d'observation ».
- `terme:230,258,276` : « Réglages > Dépistage » → « Labo › Outils d'observation ».
- `popup:832` : « Restaurer » → « Restaurer les valeurs par défaut ».
- Hover : retirer (ou créer) les 3 `data-tooltip` morts.

**Lot 2 — à confirmer avec Grégoire** (sa mémoire contextuelle tranche) :
- Bon libellé pour « Réglages > Groupe » / « Groupe-cours » (`popup:367`, `terme:42`, `terme:60`).
- `popup:317` : « Tous présents » — citer le libellé réel « Tous 2h », ou décrire l'action sans citer le libellé (qui varie selon le format horaire) ?
- `popup:1047,1052` : « Dupliquer pour créer ma grille » — vérifier le libellé exact du bouton de duplication démo.
- Sort des entrées orphelines (garder / recâbler / retirer), en particulier `accueil-donnees-demo` et `contexte-horaire`.
- `labo-etudes` : créer l'entrée popup ou retirer le `data-aide`.
- Fusion ou différenciation de `reserve-deja-present` / `reserve-copie-double`.

**Lot 3 — mécanique scriptée** :
- Réconciliation complète hover/terme (clés ↔ déclencheurs, en filtrant les déclencheurs dynamiques).

---

## Critères d'audit retenus (réutilisables)

1. **Intégrité référentielle** : tout `data-aide`/`data-tooltip` pointe vers une clé existante ; toute clé est atteignable ; tout `voirAussi`/`voir` cible une clé existante.
2. **Texte ↔ interface** : chemins de navigation, libellés de sections/onglets/boutons et procédures cités correspondent aux libellés réels actuels (`config.js`, `index.html`).
3. **Cohérence interne** : terminologie métier (étudiant·e, indices A-C-P, IDME, RàI, artefact, pratique de notation), pas de calque, pas de doublon de contenu.
4. **Formulation** : repérer les répétitions syntaxiques (ouvertures, formules) — distinguer parallélisme utile et boilerplate.
