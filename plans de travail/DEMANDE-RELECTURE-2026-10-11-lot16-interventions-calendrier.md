# Demande de relecture – lot 16 : les interventions et le calendrier

> Claude Code, 11 octobre 2026, 16 h 39 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, série des lots 14 à 19.
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert (731 fichiers, 8 648 essais).
> **Lot court** : une fiche corrigée, quatre qui reviennent à Grégoire (§ 3).

## 1 · Ce qui change pour l'usager

- Tableau de bord, courbes d'intervention : une intervention datée après la dernière séance n'affiche plus une courbe partie du début du trimestre ; elle n'a pas de point tant qu'aucune séance ne la suit (#729).

## 2 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #729 | `7c0ee6fc` | `idxDebut` restait à 0 sans séance à la date ou après (`correlations-longitudinales.js`) | défaut = nombre de séances : courbe vide |
| #978, #582, #430, #428 | — | voir § 3 | — |

Vérification : #729, 1 mutation rouge (banc neuf repris du harnais de #241 : intervention après, à, et avant les séances).

## 3 · Ce qui revient à Grégoire

- **#978** – la fiche dit elle-même « attend un cas réel ». Reporter une présence pour un·e participant·e ajouté·e après la complétion demande une question (la case est décochée par défaut, décision du 28 sept.) ; corriger une date retirerait la présence de l'ancienne, c'est-à-dire supprimerait une donnée déjà écrite. Fiche laissée telle quelle.
- **#582** – deux affirmations se contredisent. Le commentaire du lot D (#540, `trimestre-v2-horaires.js` ≈ 172-182) : « une heure de cours, au cégep, EST une période », donc théorie + labo = périodes par semaine, partout. La fiche (audit du 27 août) : vrai à Drummondville seulement. La durée d'une période n'est plus un réglage (#540 E3). **Question fermée** : au réseau collégial, une heure de la pondération vaut-elle une période dans tous les cégeps ? Oui : la fiche se ferme. Non : il faudra une donnée par cégep (un écran neuf).
- **#430 et #428** – les deux nettoyages de `main.js` (≈ 498 et ≈ 516) peuvent encore trouver des données anciennes : aucune garde ne refuse à l'ouverture un codex ou une sauvegarde d'avant le 8 août (`grep` d'une version minimale : vide), et un tel fichier sur disque se rouvre. Laissés, comme le veut la consigne. L'échéance « septembre » est passée : les garder pour de bon, ou refuser les fichiers d'avant le 8 août, est une décision.

## 4 · Ce que j'ai supposé – une ligne chacune

- #729 : la courbe vide reste dans la liste (et la légende) plutôt que d'être retirée.

## 5 · Item de Nouvelles proposé

Aucun : le seul changement est un cas rare (une intervention datée après la dernière séance).
