---
name: gestion-projet
description: Pilotage de la gestion du projet Labo Codex — échéancier, rencontres institutionnelles, registre des dépenses, dossiers d'interlocuteurs. Distinct du développement, qui passe par task-management et BACKLOG.md. Déclencher quand Grégoire demande ce qui s'en vient, parle d'une rencontre avec la direction, les TI, le secrétariat général ou l'AQPC, veut inscrire ou clore une échéance, saisir une dépense, connaître le coût du projet, préparer une demande budgétaire, ou dit « qu'est-ce que j'ai cette semaine », « j'ai rencontré X », « ça m'a coûté », « où en est le dossier ».
---

# Gestion du projet Labo Codex

Piloter le versant **administratif et institutionnel** du projet : échéances, rencontres, dépenses, dossiers d'interlocuteurs. Ne pas confondre avec le versant **développement**, qui relève de `task-management` et de `BACKLOG.md`.

## Routage

| La demande porte sur | Skill | Fichier source |
|---|---|---|
| Bug, tâche de code, version, refactoring | `task-management` | `BACKLOG.md` (dépôt de code) |
| Vocabulaire, concept pédagogique ou technique | `memory-management` | `CLAUDE.md`, `.claude/skills/` |
| Échéance, rencontre, jalon | **ce skill** | `Gestion du projet/ECHEANCIER.md` |
| Dépense, coût, budget | **ce skill** | `Gestion du projet/DEPENSES.md` |
| Démarche institutionnelle, interlocuteur | **ce skill** | `Institutionnalisation de Labo Codex/` |

Les trois derniers vivent dans le **dossier Cowork**, pas dans le dépôt de code.

## Sources de vérité

1. `Gestion du projet/ECHEANCIER.md` — échéances à venir, jalons, échéances passées avec leur issue, intentions non engagées
2. `Gestion du projet/DEPENSES.md` — abonnements récurrents, registre mensuel, cumul, demandes
3. `Institutionnalisation de Labo Codex/DOSSIER-INSTITUTIONNALISATION.md` — document d'entrée du dossier institutionnel, avec ses questions ouvertes, décisions et journal
4. `Institutionnalisation de Labo Codex/<n> - <service> (<nom>)/` — un sous-dossier par interlocuteur, contenant courriel, aide-mémoire et pièce à remettre

## Règle de rigueur, non négociable

**Ne jamais inscrire au passé une démarche qui n'a pas eu lieu.**

Cette règle vient d'un incident réel : `PRIVACY.md` a affirmé pendant trois mois qu'une demande d'avis avait été envoyée au responsable de la protection des renseignements personnels du Cégep. Elle ne l'avait jamais été. L'affirmation était née d'une intention notée en session de rédaction, reprise au passé lors d'une révision, puis recopiée sans vérification.

En pratique :

- Une intention se note au §4 de `ECHEANCIER.md` («Intentions, non engagées»), jamais ailleurs.
- Une ligne ne migre du §4 vers le §3 que si Grégoire confirme que la démarche a réellement eu lieu.
- En cas de doute sur un fait passé, demander plutôt que supposer. Une question coûte dix secondes ; une affirmation fausse dans un document destiné à une direction coûte la crédibilité de tout le document.
- Distinguer systématiquement fait établi, inférence et intention. Marquer les inférences comme telles.

## Rituels

### Ce qui s'en vient

Lire `ECHEANCIER.md` §1 et §2. Rapporter ce qui arrive dans les deux prochaines semaines, ce qui est en retard, et ce qui est bloqué faute d'une décision. Signaler les échéances passées restées au §1 : elles doivent être closes.

### Inscrire une échéance

Ajouter une ligne au §1 avec date, objet, interlocuteur, état et pièces associées. Si la démarche n'est pas engagée, l'inscrire au §4 plutôt qu'au §1.

### Clore une échéance

Déplacer la ligne du §1 vers le §3 en remplaçant la colonne «État» par l'issue réelle. Demander à Grégoire ce qui en est ressorti, ne pas l'inférer. Si la rencontre a produit des décisions, les porter au journal du `DOSSIER-INSTITUTIONNALISATION.md`.

### Saisir une dépense

Ajouter une ligne au §2 de `DEPENSES.md` : mois, poste, montant, qui a payé. Recalculer le §3. Si le montant diffère de l'abonnement inscrit au §1, mettre le §1 à jour et noter la variation.

### Produire le tableau budgétaire

À partir du §1 et du §3 de `DEPENSES.md`, produire un tableau des coûts annualisés. Ne jamais présenter une estimation comme un montant constaté. Si le cumul autofinancé n'est pas établi faute de dates de début, le dire plutôt que d'extrapoler.

### Préparer une rencontre

Lire le sous-dossier de l'interlocuteur dans `Institutionnalisation de Labo Codex/`. Rapporter ce qui y est prévu, ce qui a changé depuis la rédaction des pièces, et ce qui reste à vérifier. Si l'interlocuteur n'a pas de sous-dossier, en proposer un sur le modèle des autres : courriel de prise de contact, aide-mémoire, pièce à remettre.

### Après une rencontre

Trois gestes, dans l'ordre : clore l'échéance au §3, porter les décisions au journal du dossier, inscrire les suites au §1. Proposer ensuite un courriel de suivi consignant ce qui a été convenu.

## Ce que ce skill ne fait pas

- Il ne crée pas de système parallèle. Deux fichiers sources, un dossier de pièces, rien d'autre. C'est l'application du principe «une couche, pas un système parallèle» du plugin.
- Il ne gère pas d'agenda externe. La décision d'août 2026 est de tenir l'échéancier en fichier plutôt que dans un agenda connecté.
- Il n'envoie rien. Les courriels et messages sont rédigés, jamais transmis.
