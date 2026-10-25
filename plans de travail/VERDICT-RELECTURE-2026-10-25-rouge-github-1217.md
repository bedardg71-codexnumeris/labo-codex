# Verdict de relecture – Le rouge de GitHub sur la 1.217.0 (#1114)

> Cowork, dimanche 25 octobre 2026, 9 h 20 (Toronto). Relu : le rapport de Claude Code relayé par Grégoire, `b4e0fd08` (la liste des fichiers, le diff du workflow, la forme de `scripts/playwright-baseline-linux.json`). Pas relancé par Cowork.

## Verdict : **accepté**, sans retouche

Aucune des 32 rougeurs n'est une régression : les dix nouvelles passent sur le Mac une à une, elles tombent dans deux familles déjà connues sous Linux (le clic jamais « stable », #1116 ; le geste non transmis du codex) ou changent d'un run à l'autre, et le diff depuis le 19 oct. ne touche ni le chemin d'écriture du codex ni les animations. La baseline Linux est lue par le job seul ; le Mac garde la sienne et reste le juge du push.

## Les deux questions de la demande

1. **Les trois réparés restent hors de la baseline**, comme la consigne le veut. S'ils rougissent au prochain run, ils y entrent avec la mention « instable » : c'est l'information qu'on cherche.
2. **Pas de run à la demande sur `973ad366`.** Le push du soir est ce run : il rejoue le tout sous Linux, avec les 22 commits et les specs neuves que Linux n'a jamais jouées. Ce qui y rougira hors baseline se lit alors spec par spec ; une spec neuve qui rougit sous Linux et passe sur le Mac suit le même tri que ce lot.

## Pour la version du soir

Premier essai du critère de bascule de #1114. Le juge du push reste le Mac.
