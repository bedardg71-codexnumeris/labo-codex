# Portes terrain – la production diagnostique (#1055)

> Écrit par Claude Code le 15 octobre 2026, sur `CONSIGNE-LOT-2026-10-15-diagnostique.md`. Le markdown est la trace ; **Cowork publie l'artefact** (bouton « Copier mes résultats », champ de saisie sur la rangée 1.1).
> ⚠ **À faire APRÈS la version du soir**, une fois le lot poussé et en ligne. Avant, l'application en ligne est celle d'avant le correctif : la porte jugerait l'ancienne version.
> Ce qui échoue devient une fiche du BACKLOG, pas une note mentale.

Une seule porte. Tout le reste est vérifié par les bancs (25 essais Vitest, 3 essais Playwright au verdict du soir).

## §0 · Préalable

- **0.1** Ouvre `https://app.codexnumeris.org`, recharge, et lis le numéro en bas de page.
  ⮕ Attendu : le numéro de la version du soir (celle qui annonce, dans les Nouvelles, la marque « Diagnostique »). Si c'est encore la 1.201.0, le lot n'est pas en ligne : arrête-toi ici.

## §1 · ⚠⚠ Données – ce que tu fais toi-même sur l'automne 2026

### 1.1 Les productions marquées « Diagnostique »

**Pourquoi.** Jusqu'à cette version, une production créée juste après une production diagnostique pouvait hériter de la case sans que tu l'aies cochée. Elle sortait alors de la note, de la complétion et des graphiques, sans rien dire. Tu as fait écrire un diagnostic en semaine 1 : chez toi, c'est probable. L'application ne corrige rien d'elle-même ; elle te montre maintenant chaque production marquée.

- **1.1.a** Va dans Conception › Productions, trimestre automne 2026, et ne touche à rien.
  ⮕ Attendu : les productions diagnostiques portent une petite étiquette pointillée « Diagnostique » dans la liste de gauche.
  **Écris** : les titres des productions qui portent l'étiquette. *(Champ de saisie : aucune réponse n'est un échec, c'est une mesure.)*
- **1.1.b** Pour chaque production marquée qui n'est PAS un diagnostic : ouvre-la, décoche « Travail diagnostique — ne compte dans aucun calcul », puis ferme la fiche.
  ⮕ Attendu : l'étiquette disparaît de la liste. La production recompte dans la note et la complétion.
  **Écris** : les titres décochés. `⚠⚠ Données`

## §2 · Interface

Aucune rangée : la marque, la case décochée après « + Nouvelle production » et les calculs sont vérifiés par les bancs.

## §3 · Décisions

Aucune dans cette porte. Les questions du lot sont dans la demande de relecture (`DEMANDE-RELECTURE-2026-10-15-diagnostique.md`, § 4).

## §4 · Ce que je n'ai pas pu vérifier

- **Ton stock** : combien de tes productions ont hérité de la case. Je n'ai pas ouvert tes données (règle : on mesure, on ne réécrit pas).
- **Le spec Playwright** (`diagnostique-1055-lu-autrement`) est écrit mais n'a pas été lancé : il part au verdict du soir. Ses sélecteurs (navigation vers la Liste des évaluations, corps du tableau) sont lus dans le code, pas éprouvés.
- **Les captures déjà écrites** gardent leur complétion d'avant tant que tu ne cliques pas « Recalculer les captures » (Réglages › Captures et recherche). Si une production diagnostique était due, la courbe de C de tes élèves change à ce moment-là.
- **Safari et l'iPad** : la marque est une étiquette ordinaire (même gabarit que « À planifier »), je ne l'ai vue à aucun écran : le spec qui la cherche part au verdict du soir, et la passe sur ton Safari se fait en usage normal (pas de porte : un défaut d'apparence se signale et se corrige).
