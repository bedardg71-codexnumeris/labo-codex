# Consigne du jour — auditer les six sous-onglets de Suivi (logique propre, affichage, sauvegardes), sans coder

> **Écrite le 6 septembre 2026, 10 h 07 (Toronto), par Cowork, à la demande de Grégoire.**
> **Application au moment de l'écriture : 1.123.5 en ligne (build `0906-0902`), `main` = `origin/main` = `2fb1facf`, arbre propre, run serveur de 1.123.5 vert.** Si #759 (collage sans sauts de ligne) a été livré entre-temps en 1.123.6, l'état a bougé d'un patch : dis-le en tête du rapport et audite la base que tu mesures.
> **Cette séance tourne SUR LE MAC**, dans le dépôt monté. **Remesure avant d'exécuter** (`git --no-optional-locks log --oneline -5`, `git rev-parse --short origin/main`, `cat version.json`, `TZ=America/Toronto date`).
> L'ancienne consigne (mesurer ce que l'élève lit dans son PDF, exécutée le 6 au matin) est archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-06-mesure-pdf.md` ; commets l'archivage avec ton premier commit.

## Le mandat, en une phrase

Exécute `Rapports/prompts-audit/PROMPT-AUDIT-sous-onglets-suivi-2026-09-06.md` : le quatrième audit cadré, **complément** du troisième (5 sept., la chaîne des indices, jugée) — pour chacun des six sous-onglets de Suivi, dans l'ordre de la navigation, ce que l'écran montre, ce que chaque geste fait, et ce que chaque écriture laisse en base après rechargement. **Aucun correctif appliqué** : `js/` reste intact, le banc et le rapport seulement. Grégoire arbitre ensuite, une règle à la fois.

## Ce qui ne se discute pas

- **Lecture seule sur `js/`.** Les break-tests du banc mutent un point et restaurent par copie à empreinte identique ; `git status -- js/` propre à la fin.
- **Aucune donnée réelle.** Élèves de banc et mode démonstration. Ni A2025, ni H2026, ni l'automne en cours.
- **La partie navigateur reste locale** (Playwright WebKit sur le Mac, captures hors du dépôt suivi) : **rien de poussé qui déclenche Playwright sur la CI** pour cet audit. Le banc Vitest et le rapport, eux, se poussent.
- **Ne remesure pas** ce que le rapport du 5 a jugé ni ce que 1.123.2 à 1.123.5 ont corrigé ce matin ; le prompt en porte la liste.
- **Un sous-onglet complet (trois axes) avant de passer au suivant.** Si le temps manque, le rapport dit lesquels sont faits et lesquels ne le sont pas — un sous-onglet à moitié audité se dit comme tel.

## Temps 0 — #759, seulement si Grégoire te l'a relayé

Si Grégoire t'a transmis la réponse « option 2 » pour le collage sans sauts de ligne (#759) et que ce n'est pas encore livré : **il passe avant l'audit**, tel que relayé — mesurer d'abord si le texte mis dans le presse-papiers par « Copier tout » porte des retours ; si oui, le défaut est au collage dans Léa, inscris-le tel quel sans correctif ; si non, corrige le format (une ligne vide entre les blocs, un retour par phrase du bilan), sentinelle rouge avant / verte après, break-test, patch 1.123.6, verdict local, push, puis l'audit repart de cette base. **S'il ne te l'a pas relayé, ne le fais pas** : #759 reste inscrit, l'option 1 tient, et l'audit commence tout de suite.

## Déroulé

1. Remesure ; archive et promeus la consigne ; branche `audit/sous-onglets-suivi-2026-09-06` depuis `main` (après le temps 0, s'il a lieu).
2. Le prompt, section par section. Le rapport s'écrit **au fil des onglets**, pas à la fin : après chaque sous-onglet, sa section est complète dans le fichier.
3. Rituel de fin de session (skill `fin-de-session-labo-codex`) : Vitest depuis `tests/`, `git status -- js/` propre, empreintes vérifiées ; fusion vers `main`, push. Pas de release (rien dans `js/`).
4. `RELAIS.md`, `SESSION.md`, `OU-EN-EST-ON.md` à jour ; BACKLOG : **n'inscris rien** — les fiches se créent à l'arbitrage de Grégoire, comme pour les trois premiers audits. Le prompt reçoit son `statut` et son `rapport_produit`.

## Ce que Grégoire verra

Rien de nouveau à l'écran : c'est une lecture. Ce qu'il recevra, c'est un rapport en six sections, une par sous-onglet, avec en tête le tableau des « corriger maintenant » en phrases qu'il peut arbitrer en un tour. Cowork le relit avant qu'il tranche.
