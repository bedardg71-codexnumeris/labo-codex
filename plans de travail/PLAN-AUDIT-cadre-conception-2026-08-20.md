# PLAN : Audits « Cadre du trimestre » et « Conception »

> **Date** : 20 août 2026 · **Référence** : bêta publique 1.88.2 (build `0820-0745`)
> **Préparé** : en Cowork avec Grégoire. **Exécution** : Claude Code, deux sessions distinctes.
> **Nature** : audit de constats. **Aucun correctif pendant l'audit**, aucune écriture de code.

---

## 1. But

Vérifier la solidité des premiers modules qu'un utilisateur de Labo Codex rencontre,
dans l'ordre où il les rencontre : d'abord le cadre du trimestre (cours, enseignant·e,
groupe-cours), puis la conception du cours (productions, grilles, cartouches, pratiques
de notation). Trois qualités visées : **fonctionnalité** (tout marche), **logique**
(cohérence des données et des flux entre modules), **efficacité** (pas de gaspillage
manifeste de rendu ou de stockage).

## 2. Décisions actées (Cowork, 20 août 2026)

1. **Constats seulement.** Chaque audit produit un rapport ; les correctifs se décident
   ensuite avec Grégoire. Aucune modification de `js/`, `css/`, `index.html` pendant
   l'audit. Seuls livrables écrits : le rapport, `SESSION.md`, `RELAIS.md`.
2. **Deux sessions Claude Code distinctes**, dans l'ordre : session 1 = Cadre du
   trimestre ; session 2 = Conception. Chacune suit le rituel complet début/fin de
   session et fusionne vers `main`.
3. **Dépendances incluses sans audit complet** : les **horaires** (session 1, le
   groupe-cours référence un `horaireId`) et les **échelles de performance**
   (session 2, une grille sans échelle n'est pas vérifiable). On vérifie leurs
   points de contact, pas leur module entier.
4. **Performance : observations qualitatives** au fil de la revue (rendus coûteux,
   relectures redondantes du stockage). Pas de campagne de mesure chiffrée.
5. **Vérification fonctionnelle au Chromium** (Playwright), sur profil de test avec
   données de démonstration. **Jamais sur les données réelles de Grégoire.**

## 3. Périmètre exact (noms de navigation réels, `js/config.js`)

### Audit 1 : « Calendrier › Trimestre »

Le sous-onglet Trimestre et son pattern bibliothèque + assemblage :
**cours**, **enseignant·e·s**, **groupes-cours** ; **horaires** en dépendance.
Hors périmètre : la gestion des étudiants (`trimestre-v2-etudiants.js`), le
sous-onglet « Calendrier scolaire », les présences.

### Audit 2 : « Conception » (quatre sous-onglets sur six)

**Productions étudiantes**, **Grilles de critères**, **Cartouches de rétroaction**,
**Pratiques de notation** ; **Échelles de performance** en dépendance.
Hors périmètre : la **Carte d'alignement** (déjà couverte par
`AUDIT-carte-alignement-exports-productions-2026-08-08.md` et les portes terrain
d'août) et le module Évaluations (consommateur aval, pas objet d'audit).

## 4. Méthode commune aux deux sessions

### 4.1 Rituels du dépôt (non négociables)

- Démarrer par le subagent `audit-debut-session` (rituel `debut-de-session-labo-codex`).
- Lire `RELAIS.md` avant toute chose ; lectures **ciblées** de `SESSION.md` et
  `BACKLOG.md` (`offset`/`limit`, jamais de lecture intégrale).
- Vitest **depuis `tests/`**, jamais de la racine.
- Zones protégées intouchées : `js/config.js`, `js/navigation.js`, `noms_stables.json`.
- Fin de session : `/fin-de-session`, fusion vers `main`. **Pas de bump de version**
  (aucun code applicatif livré) : la procédure release ne s'applique pas.

### 4.2 Les six axes, pour chaque module du périmètre

1. **Intégrité des données.** Conformité au registre `docs/DATA-OWNERSHIP.md`, clé
   par clé : propriétaire unique (SSOT), namespacing correct (`window.cle()` pour
   les clés de trimestre, clés globales pour les gabarits partagés, régime #358),
   références par id (jamais d'objet copié dans un assemblage), hydratation à
   l'affichage seulement.
2. **Logique fonctionnelle.** CRUD complet de chaque entité ; flux bibliothèque →
   assemblage ; cas limites : suppression d'une entité référencée ailleurs,
   renommage, doublons, champ vide, annulation en cours de saisie.
3. **Cohérence inter-modules.** Session 1 : groupe-cours ↔ cours / enseignant·e /
   horaire / pratique. Session 2 : production ↔ grille ↔ échelle ↔ cartouche ↔
   pratique ↔ `modalitesEvaluation`. Vérifier que chaque lien survit à la
   modification et à la suppression de sa cible, ou qu'une garde l'empêche.
4. **Vérification fonctionnelle.** Scénarios Chromium du §5.3 / §6.3, en
   incarnant un nouvel utilisateur. Chaque écart entre l'attendu et l'observé
   devient un constat.
5. **Performance (qualitative).** Relever sans mesurer : reconstructions
   `innerHTML` intégrales sur petite interaction, lectures répétées de
   `db.getSync` en boucle, sérialisations massives à chaque frappe, travail au
   chargement qui pourrait être différé.
6. **Écarts doc/code et sécurité.** Les docs du périmètre datent de janvier 2026
   (Beta 95) : relever les écarts sans les corriger (proposition au rapport).
   Sécurité en lecture : `echapperHtml()` sur toute donnée utilisateur injectée
   en `innerHTML`, zéro handler inline, `console.log` résiduels.

### 4.3 Format d'un constat (obligatoire, dans le rapport)

```
[CT-07] (ou CO-xx pour la session 2)
Gravité   : Bloquant | Majeur | Mineur | Note
Axe       : 1-6 (§4.2)
Où        : fichier:ligne, ou pas-à-pas UI reproductible
Constat   : fait observé, vérifiable (pas d'inférence présentée comme un fait)
Impact    : conséquence concrète pour l'utilisateur ou les données
Proposition : item BACKLOG candidat (une ligne), sans l'inscrire au BACKLOG
```

Gravités : **Bloquant** = perte ou corruption de données possible, fonction
inutilisable. **Majeur** = comportement erroné ou incohérence de données sans
perte, écart SSOT. **Mineur** = irritant UX, libellé, incohérence visuelle.
**Note** = observation (perf, dette, doc périmée) sans urgence.

Chaque constat distingue explicitement **fait observé**, **inférence** (avec son
degré de confiance) et **hypothèse non vérifiée**. Un soupçon non reproduit est
une hypothèse, pas un constat.

### 4.4 Garde-fous

- Ne pas laisser un constat devenir une enquête sans fin : au-delà de ~30 minutes
  sur un même point, consigner l'état et passer au suivant (protocole
  `docs/00-START-HERE.md`, section bugs).
- Les checkpoints de `00-START-HERE.md` s'appliquent : aucune clé supprimée ou
  renommée, aucune migration, aucune structure modifiée. L'audit lit.
- Anticiper Mac et iPad **séparément** (CLAUDE.md, « Procédure de développement »,
  point 4) : les scénarios
  tactiles non exécutables au Chromium sont relevés comme « porte terrain à
  prévoir pour Grégoire », pas simulés.

---

## 5. Session 1 : audit « Calendrier › Trimestre »

### 5.1 Lectures préalables (ciblées)

1. `docs/modules/trimestres.md` (⚠ Beta 95, janvier : à confronter au code, pas à croire)
2. `docs/architecture/pattern-bibliotheque-assemblage.md` (même réserve : le régime
   de namespacing a changé avec #358, cf. `docs/00-START-HERE.md`)
3. `docs/DATA-OWNERSHIP.md` : les clés `cours`, `enseignants`, `horaires`,
   `{trimestre}_groupesCours` et voisines
4. `docs/legacy/A2025-migration-incomplete.md`
5. `SESSION.md` (fin du fichier) et `RELAIS.md` : le chantier cours est **chaud**
   (`trimestre-v2-cours.js` modifié le 20 août ; #449 « suppression fiche cours »
   et portes terrain du 19 août). Identifier ce qui vient d'être livré pour ne pas
   auditer un état transitoire sans le savoir.

### 5.2 Fichiers à auditer (liste indicative, à confirmer via `index.html` et `js/ordre-chargement.txt`)

| Bloc | Fichiers |
|---|---|
| Orchestration Trimestre | `js/trimestre-v2.js`, `trimestre-v2-init.js`, `trimestre-v2-orchestre.js`, `trimestre-v2-liste.js` |
| Cours | `js/trimestre-v2-cours.js`, `js/cours.js`, `js/entites/cours-entite.js` |
| Enseignant·e·s | `js/trimestre-v2-enseignants.js`, `js/entites/enseignants.js` |
| Groupes-cours | `js/trimestre-v2-groupes-cours.js`, `js/groupe.js`, `js/entites/groupe-cours.js` |
| Registre trimestres et namespacing | `js/trimestres.js` (107 Ko : lecture ciblée par fonction) |
| Dépendance horaires (points de contact seulement) | `js/entites/horaires.js`, `js/trimestre-v2-horaires.js`, `js/horaire.js` |

### 5.3 Scénarios Chromium (profil de test)

1. **Parcours vierge** : créer un trimestre, puis un cours, un·e enseignant·e, un
   horaire ; assembler un groupe-cours. Vérifier : nom généré, état « Complet »
   dans la sidebar, persistance après rechargement.
2. **Modification d'une entité référencée** : renommer le cours, changer l'horaire.
   Le groupe-cours hydraté reflète-t-il le changement partout (sidebar, formulaire,
   nom généré), sans copie périmée nulle part ?
3. **Suppression d'une entité référencée** par un groupe-cours : garde explicite,
   ou référence orpheline silencieuse ? Que voit l'utilisateur ensuite ?
4. **Durée de période** : recouper le constat terrain **#328-T1** (changer la durée
   viderait les selects de l'assemblage d'un groupe-cours existant ; désync
   sidebar/nom généré). Statut incertain dans `SUIVI-BUGS.md` : à trancher par
   reproduction sur 1.88.2.
5. **Doublons de cours** : recouper **#282-T1** (cours en double/triple dans la
   Bibliothèque). Créer deux cours au même tuple naturel : dédup ou pollution ?
6. **Bascule de trimestre** : créer un second trimestre, basculer, revenir. Les
   données namespacées restent isolées ; les entités de bibliothèque globales
   restent visibles des deux côtés ; rien ne fuit.
7. **Suppression d'une fiche cours** (#449, livré le 19 août) : re-dérouler le
   parcours sur le build courant, en tant que vérification indépendante.
8. **iPad** : relever les interactions à risque au tactile (accordéons, dropdowns,
   modales) et les consigner en « portes terrain à prévoir ». Ne pas simuler.

### 5.4 Points d'attention connus

- `coursEnEdition` dans `js/config.js` : résidu legacy documenté, zone protégée.
  Le mentionner au rapport pour mémoire, sans y toucher.
- Statut des horaires incertain dans la doc : le pattern d'assemblage (janvier)
  donne `horaires` comme clé globale de bibliothèque, `docs/00-START-HERE.md`
  (post-#358) ne les cite pas parmi les gabarits globaux, et #328-T1 évoque un
  modèle « horaire propre au trimestre ». Vérifier ce que fait réellement le code
  en 1.88.2 et noter l'écart doc/code le cas échéant.

### 5.5 Livrables de la session 1

1. `plans de travail/AUDIT-cadre-trimestre-2026-08-XX.md` : rapport de constats
   (format §4.3), classés par gravité, avec synthèse en tête (5 lignes max) et
   annexe « items BACKLOG candidats ». **Ne pas écrire dans `BACKLOG.md`** : le
   tri se fait avec Grégoire.
2. `SESSION.md` : entrée de session ; `RELAIS.md` si un point doit atteindre la
   session 2 avant sa lecture du rapport.
3. Fusion vers `main`.

---

## 6. Session 2 : audit « Conception »

### 6.1 Lectures préalables (ciblées)

1. Le **rapport de la session 1** (obligatoire, en premier) : méthode éprouvée,
   constats transversaux déjà relevés (namespacing, doc périmée), liens
   groupe-cours → pratique déjà vérifiés côté Cadre.
2. `docs/modules/evaluations-productions.md` et `docs/modules/pratiques.md`
   (⚠ Beta 95, janvier : à confronter, pas à croire)
3. `docs/architecture/GABARITS-BIBLIOTHEQUES.md` et
   `docs/decisions/2025-11-systeme-pratiques.md`
4. `docs/DATA-OWNERSHIP.md` : `grillesTemplates`, `echellesTemplates`,
   `cartouches_*`, `bibliothequeGrilles`/`bibliothequeEchelles`,
   `pratiquesConfigurables`, `modalitesEvaluation`, clés productions
5. `RELAIS.md` et la fin de `SESSION.md`

### 6.2 Fichiers à auditer (liste indicative)

| Bloc | Fichiers |
|---|---|
| Productions | `js/productions.js` (104 Ko), `productions-liste.js`, `productions-bibliotheque.js`, `productions-bibliotheque-ui.js`, `productions-import-export.js`, `productions-namespace-garde.js` |
| Grilles | `js/grilles.js` (179 Ko : lecture ciblée par fonction), `grilles-bibliotheque.js` |
| Cartouches | `js/cartouches.js` (148 Ko : idem), `cartouches-bibliotheque.js` |
| Pratiques | `js/pratiques.js`, `pratiques-gestion.js` (130 Ko), `pratiques-bibliotheque.js`, `wizard-pratique-v2.js` (136 Ko), `pratique-notation-v2.js`, répertoire `js/pratiques/` (registre, familles SOM/STD/SPE/DEN) |
| Dépendance échelles (points de contact seulement) | `js/echelles.js`, `echelles-bibliotheque.js` |

Quatre de ces fichiers dépassent 100 Ko : lecture par table des matières
(`grep` des définitions de fonctions) puis ciblée. Jamais de lecture intégrale.

### 6.3 Scénarios Chromium (profil de test)

1. **Grille** : créer une grille (critères, pondérations totalisant 100 %),
   l'associer à une échelle. Sauvegarde, rechargement, relecture fidèle.
   Que se passe-t-il si la somme des pondérations n'atteint pas 100 ?
2. **Cartouche** : créer un cartouche lié à la grille (commentaires par critère ×
   niveau). Puis renommer la grille : le cartouche suit-il ? Supprimer la grille :
   cartouche orphelin silencieux, ou garde ?
3. **Production** : créer une production (type, pondération, échéance), lier la
   grille. Le select des grilles est-il peuplé selon le bon mode et le bon
   trimestre ?
4. **Pratique** : créer une pratique au wizard (une SOM et une famille PAN),
   l'appliquer au cours. `modalitesEvaluation` reçoit-elle une référence ou une
   copie qui peut diverger (SSOT #328) ?
5. **Chemins d'édition d'une pratique** : sidebar, modale Bibliothèque et, si
   visible, banc d'exploration. Recouper **#326-T3** (édition non préremplie
   depuis le banc) et **#326-T4** (dérivation de maquette parasite). Statuts
   incertains : à trancher par reproduction sur 1.88.2.
6. **Wizard, finitions** : recouper **#343-T3/T4/T5** (hover du tag DEN absent,
   libellés « eliminee » / compteur « 3/2 » / « SOM, STD ou SPE » qui oublie DEN,
   portes d'entrée enfouies). Vérifier ce qui a déjà été résorbé depuis juin.
7. **Import/export** : exporter une bibliothèque du périmètre, réimporter.
   Passage par `validerZipSecurite()`, intégrité au retour, gestion des doublons.
8. **Suppression d'une production** référencée par des évaluations existantes
   (données de démo) : garde, ou évaluations orphelines ?
9. **Cohérence des pondérations** : la somme des productions sommatives vs ce que
   la pratique appliquée attend ; signalement à l'utilisateur.
10. **iPad** : wizard 9 étapes et matrices de cartouches au tactile : relever les
    risques, consigner en « portes terrain à prévoir ». Ne pas simuler.

### 6.4 Points d'attention connus

- Régime post-#358 : gabarits globaux (`bibliothequeGrilles`, `bibliothequeEchelles`,
  `cours`, `enseignants`) vs modèles de travail namespacés (`grillesTemplates`,
  `echellesTemplates`, `pratiquesConfigurables`, `modalitesEvaluation`).
  Toute clé du périmètre qui déroge au registre est un constat Majeur.
- `RELAIS-grilles-h2026-desappariees.md` (#362) : historique utile avant de
  conclure sur un lien grille ↔ évaluation.
- `cartouches_{grilleId}` : clé paramétrée par grille ; vérifier le cycle de vie
  quand la grille disparaît (candidat orphelins).

### 6.5 Livrables de la session 2

1. `plans de travail/AUDIT-conception-2026-08-XX.md` : même format que la
   session 1, plus une courte section « Cohérence Cadre ↔ Conception » (le
   groupe-cours référence une pratique : les deux audits se rejoignent là).
2. `SESSION.md`, `RELAIS.md` le cas échéant ; fusion vers `main`.

---

## 7. Relais entre les deux sessions

La session 1 termine en laissant dans son rapport une section « À transmettre à
la session 2 » : constats transversaux (namespacing, doc, perf) qui vaudront
aussi pour la Conception, et tout point de contact groupe-cours ↔ pratique déjà
observé. La session 2 commence par lire ce rapport. Si la session 1 découvre un
**Bloquant** (risque de perte de données), elle s'arrête, le consigne, et le
signale à Grégoire avant toute session 2 : un correctif urgent passerait alors
avant l'audit suivant, conformément à la politique retours testeurs.

## 8. Critères de fin

Un audit est terminé quand : les six axes ont été passés sur chaque module du
périmètre ; tous les scénarios Chromium ont été déroulés (ou consignés comme
non exécutables, avec motif) ; chaque entrée « à recouper » a un statut tranché
par reproduction (confirmée / non reproduite sur 1.88.2 / non testable) ; le
rapport est fusionné vers `main`. Ce que l'audit ne fait **pas** : corriger,
prioriser à la place de Grégoire, écrire dans `BACKLOG.md` ou `SUIVI-BUGS.md`.

## 9. Prompts de lancement

### Session 1

> Lance l'audit « Cadre du trimestre » selon
> `plans de travail/PLAN-AUDIT-cadre-conception-2026-08-20.md`, section 5.
> Rituel de début de session d'abord (subagent `audit-debut-session`), puis
> lectures préalables §5.1, revue §4.2, scénarios §5.3. Constats seulement,
> format §4.3. Livrable : `plans de travail/AUDIT-cadre-trimestre-<date>.md`.
> Aucun correctif, aucune écriture hors rapport/SESSION/RELAIS.

### Session 2

> Lance l'audit « Conception » selon
> `plans de travail/PLAN-AUDIT-cadre-conception-2026-08-20.md`, section 6.
> Rituel de début de session d'abord, puis lecture du rapport de la session 1,
> lectures préalables §6.1, revue §4.2, scénarios §6.3. Constats seulement,
> format §4.3. Livrable : `plans de travail/AUDIT-conception-<date>.md`.
> Aucun correctif, aucune écriture hors rapport/SESSION/RELAIS.
