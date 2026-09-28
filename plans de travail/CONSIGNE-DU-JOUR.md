# Consigne – lot E3 de l'enregistrement : créer ou modifier, productions, interventions, volet confidentiel, et les réglages (D3, D0)

> Écrite le 28 septembre 2026, à 17 h 14 (Toronto), par Cowork. Source qui fait foi : `plans de travail/DECISIONS-2026-09-26-enregistrement.md`, **D3** (« partout ailleurs ») et **D0** (un seul témoin ; plus de bouton « Enregistrer » là où tout s'écrit déjà ; un échec ne se déguise pas en réussite). Constat : `INVENTAIRE-ENREGISTREMENT-2026-09-26.md`, § 3 (Conception › Production ; Interventions et rencontres ; Profil ; Réglages ; Autres écrans) et annexe A3. **Modèles : les lots E1 (1.164.0) et E2 (1.166.0)**, leurs demandes et relectures dans `plans de travail/`. Reprends leurs mécanismes (témoin commun, `modifierEtAnnoncer` / `ecrireEtAnnoncer`, `quitterCreationSiConfirme`, « Fermer », `beforeunload` commun, `raisonPourTemoin`), n'en invente pas.
>
> **Au début du lot** : archive `CONSIGNE-DU-JOUR.md` (lot E2, livré) sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-28-lot-E2-cadre-eleves.md`, puis renomme celle-ci en `CONSIGNE-DU-JOUR.md`.
>
> **Condition de départ** : `main` contient 1.166.0 (`e4149cb1` ou plus récent), aucun autre lot en cours dans `js/`. Branche `lot-e3-productions-interventions` ; fusion après la relecture croisée seulement.
>
> **À remesurer avant le code** : les lignes citées viennent de l'inventaire du 26 ; mesuré par Cowork le 28 vers 17 h 30 : « Production modifiée avec succès » (`productions.js`), « Intervention enregistrée » / « Rencontre enregistrée » (`interventions.js`), « Préférences enregistrées » après un refus des seuils (`preferences-v2.js` l. 443-446) existent toujours ; aucun de ces fichiers ni `profil-etudiant-confidentiel.js` ne passe encore par le témoin.

## 1 · Ce que Grégoire a décidé (D3, D0)

- **Créer** : un bouton qui nomme le geste ; rien n'existe avant ; quitter avant avertit.
- **Modifier** : tout s'enregistre tout seul, champ par champ.
- Dans une fiche existante, « Annuler » devient « Fermer ».
- Un seul témoin ; là où tout s'écrit déjà, le bouton « Enregistrer » disparaît ; un refus n'est jamais suivi d'un succès.

## 2 · Les zones, et les décisions techniques de Cowork

**Étape 1 · Productions** (`productions.js`, vers les l. 2020-2112) : une production existante s'enregistre champ par champ ; une nouvelle n'existe qu'au clic sur « Créer la production » ; « Fermer » et la question de sortie ; « Production modifiée avec succès ! » disparaît (le témoin dit « Enregistré »). ⚠ Une production est reliée à des évaluations, des grilles, des cartouches : **ne change aucune de ces références** ; si un champ modifiable touche un lien (grille, cartouche, pondération d'une production déjà évaluée), mesure ce que l'écriture automatique déclencherait sur les évaluations existantes. **Si une écriture de champ recalcule ou réécrit une évaluation déjà faite, arrête-toi et dis-le** : ça remonte à Grégoire (ses données réelles).

**Étape 2 · Interventions et rencontres** (`interventions.js`, vers les l. 1423-1580) : une intervention ou une rencontre existante s'enregistre seule ; une nouvelle attend « Créer l'intervention » / « Créer la rencontre » ; la perte silencieuse au changement d'onglet (l. 1690-1697) devient la question de sortie pendant une création. ⚠ **Le report vers les présences** (l. 1567-1573, `saisie-presences.js` l. 2345-2362) : une intervention « complétée » écrit des présences. **N'automatise pas ce report** : une modification champ par champ d'une intervention complétée ne doit pas réécrire de présences à chaque frappe. Mesure d'abord ce qui se passe aujourd'hui quand on modifie une intervention complétée (l'inventaire le dit probablement sans effet sur les présences, `[lu]`). Si la règle juste exige de toucher aux présences déjà saisies, **arrête-toi et dis-le**. « Créer mon service » : inchangé.

**Étape 3 · Le volet confidentiel du profil** (`profil-etudiant-confidentiel.js`, vers la l. 264 ; notes de présence l. 201-219) : les champs s'enregistrent seuls, par le témoin ; « Annuler » et × deviennent « Fermer » ; la pastille verte ne remplace plus un mot. Le lot A a posé le mode anonymisation (volet masqué, « Masqué en anonymisation ») : **ne l'affaiblis pas**, et vérifie que rien ne s'écrit depuis un volet masqué.

**Étape 4 · Réglages et bilan** : 
- Préférences et Outils d'observation (`preferences-v2.js`, aides `index.html` ~l. 8686 et 11235) : déjà automatiques au changement ; **le bouton « Enregistrer » disparaît** ; les écritures passent par le témoin.
- **Les seuils mal ordonnés** : aujourd'hui une alerte d'erreur **et** « Préférences enregistrées » (mesuré à l'inventaire) : le refus parle par le témoin, « Non enregistré – Seuils : ‹raison› », le champ revient à la valeur enregistrée, aucun succès.
- Auto-réflexion du bilan réflexif (`bilan-reflexif-reflexion.js`, l. 50, 349-353, 408-415) : déjà automatique à la sortie du champ ; le bouton disparaît ; le témoin.

**Hors du lot** (ne touche pas ; inscris ce qui n'a pas de fiche) : Codex, Réserve, copie de secours et textes de l'Aide (lot F, les mots) ; le texte modifiable du Rapport et sa bulle (lot F) ; « Charger les données de démonstration » du bilan réflexif, qui remplace sans confirmation (fiche, issue 2) ; Tirage (fiche) ; `navigation.js` (zone protégée : si un avertissement l'exige, arrête-toi) ; l'archivage d'un trimestre (moratoire #622).

**Fiches** : cherche dans `BACKLOG.md` et `SUIVI-BUGS.md` celles que le lot règle ; liste-les « réglée / en partie / non ».

## 3 · Les mots – Cowork les soumet à Grégoire avant le push

Sur le patron de E1 et E2, proposés : « Créer la production », « Créer l'intervention », « Créer la rencontre » ; « Cette production n'est pas encore créée. » (et jumeaux), « Rester » / « Quitter sans créer » ; « Production « … » créée. », « Intervention créée. », « Rencontre créée. » ; « Non enregistré – Seuils : les seuils doivent aller du plus bas au plus haut. » (à vérifier contre la raison actuelle). Tous les messages neufs au tutoiement, sans tiret cadratin (réservé aux dialogues chez Grégoire). **Nouvelles** : à proposer à la fin, pour la zone réellement couverte.

## 4 · Preuves

- Par comportement, par étape : fiche existante modifiée puis quittée → en base, le témoin dit « Enregistré » ; nouvelle fiche : rien en base avant le bouton, « Fermer » pose la question, « Rester » ne perd rien, « Quitter sans créer » n'écrit rien ; un échec d'écriture → « Non enregistré – ‹geste› : … », aucun succès ; seuils mal ordonnés → aucun succès, champ revenu.
- **Interventions** : un essai qui prouve que modifier une intervention complétée n'écrit aucune présence (empreinte des présences avant / après).
- **Confidentiel** : en anonymisation, aucune écriture depuis le volet masqué.
- Mutations, chacune rouge : un écrivain sans témoin ; « Créer la production » qui écrit avant le clic ; la question de sortie retirée ; le succès des préférences rendu après un refus ; le report de présences déclenché par une modification.
- Vitest complet ; bancs WebKit voisins verts ; placement des boutons renommés à 360, 768, 1024 et 1180 px, hors du témoin. Banc WebKit du lot sur le vrai `index.html`.

## 5 · Livraison

- **Relecture croisée par Cowork exigée** (productions reliées aux évaluations, présences, volet confidentiel) : `DEMANDE-RELECTURE-2026-09-28-lot-E3-…md`. Un compte rendu d'étape est bienvenu après l'étape 2.
- Stock : rien n'est réécrit, déplacé ni effacé.
- Release `minor` ; mots et Nouvelles acceptés par Grégoire avant le push ; verdict WebKit complet avec Cowork et les navigateurs fermés (mémoire du Mac), puis `caffeinate -i scripts/pousser.sh origin main`.
- **Porte terrain** : seulement ce qu'aucun test ne peut juger, sur ses données réelles, sans rien de fictif, une rangée de retour pour tout geste qui modifie.
