# Consigne du jour – corriger E3 (« Renvoyer aux archives », #1024)

> Écrite par Cowork le 5 octobre 2026 à 7 h 19 (Toronto, mesurée par `date`). Remplace la consigne de 4 h 36, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-05-e3-renvoyer-trimestre.md`.

## Où on en est

E3 est codé sur `claude/e3-renvoyer-trimestre` (`2cf725f0`, `ae4f06cd`), ni poussé ni publié. Cowork l'a relu : **verdict orange, trois corrections**, dans `VERDICT-RELECTURE-2026-10-05-e3-renvoyer-trimestre.md`. Lis-le en entier.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork (ce verdict, cette consigne, son archive), à écrire dans `BACKLOG.md`, et à travailler sur la même branche. **Ne pousse pas le lot et ne fais pas de release.** Pousse `RELAIS.md` seul sur `main` en t'arrêtant.

## Ce que tu fais, dans cet ordre

1. **Commite** le verdict, cette consigne et son archive.
2. **Correction 1** : relire le contenu de chaque copie de l'archive au moment du renvoi. Mesure durée et pic à taille réelle (394 copies).
3. **Correction 2** : la clé `<trimestre>_*` qui vaut `null`.
4. **Correction 3** : #1027 dans « Vérifier ». Coche #1027 si elle est close.
5. **Tests** : les essais et les trois mutations rouges du verdict ; Vitest complet ; les bancs WebKit d'E1, E2 et E3 à 820 px.
6. **Arrête-toi et rends.**

## Ce que tu rends

Une ligne par correction : faite, sa mesure, sa mutation. Ce que tu as supposé, en une ligne. Si une mesure dément une décision du verdict, dis-le avant de coder autour.
