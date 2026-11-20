# Consigne — les noms des deux seuils (19 nov. 2026)

Relayée par Cowork à Claude Code (session du cloud), sur `lot/autoevaluation-consignes` (PR n° 33), après les
retouches remises à 9 h 16 (faites : `9a523cc7`). Décision de Grégoire, 19 nov. 2026, de 17 h 20 à 17 h 24.
Copiée telle quelle avant de coder ; le rapport : `plans de travail/RAPPORT-2026-11-19-noms-des-seuils.md`.

---

Pour Claude Code, à relayer — les noms des deux seuils (décidé par Grégoire le 19 nov. 2026, de 17 h 20 à 17 h 24)

Même session et même branche que la grille d'autoévaluation (lot/autoevaluation-consignes), après les retouches
remises à 9 h 16. Si elles ne sont pas faites, fais-les d'abord. Écris cette consigne dans le dépôt avant de coder
(plans de travail/).

La décision. Les deux repères de l'échelle changent de nom partout où une personne les lit : « Seuil minimal de
réussite » (seuilSuffisance) et « Seuil de maîtrise » (seuilMaitrise). La donnée ne bouge pas : elle reste sur
l'échelle, seul endroit où on la règle. Aucun changement de schéma, aucune migration, aucune clé interne renommée.

1. L'écran de l'échelle (Conception › Échelles de performance). Titre « Repères de maîtrise » → « Seuils de réussite
et de maîtrise ». Menu « Suffisant à partir de » → « Seuil minimal de réussite ». Menu « Maîtrisé à partir de » →
« Seuil de maîtrise ». Paragraphe : « Ces deux seuils disent à l'application où commence l'apprentissage suffisant,
et où il est acquis. Sans eux, elle ne peut pas savoir quels critères présenter à l'élève comme des priorités. Les
poser sur le même niveau revient à n'en avoir qu'un. »

2. L'éditeur de grilles (Conception › Grilles), dans « Ce qui est attendu à chaque niveau ». La case du niveau qui
porte le seuilSuffisance de l'échelle utilisée affiche l'étiquette « Seuil minimal de réussite » à côté du nom du
niveau ; celle qui porte le seuilMaitrise affiche « Seuil de maîtrise ». L'étiquette se lit, elle ne se règle pas ici.
Tranché par Cowork : les deux seuils sur le même niveau, les deux étiquettes paraissent ; une échelle sans seuils,
aucune étiquette et rien d'autre ne change ; la forme de l'étiquette est à toi (sobre, dans le ton du filet de 2 px
de la case), avec une capture à 1 180 px et une sur téléphone dans le rapport. Vérifie que la rangée ne s'élargit
pas davantage (#1294).

3. La page d'autoévaluation du PDF des consignes (TEXTES dans js/export-pdf.js). La phrase d'introduction devient :
« Le seuil minimal de réussite correspond au niveau D de l'échelle ; le seuil de maîtrise, au niveau M. » (les codes
viennent toujours de l'échelle). Les étiquettes des cases restent « Réussite : » et « Maîtrise : ».

4. Le mot de l'aperçu quand l'échelle n'a pas ses deux seuils (retouche 2 de 9 h 16) devient : « Grille
d'autoévaluation : dans Conception › Échelles de performance, indique pour cette échelle le « Seuil minimal de
réussite » et le « Seuil de maîtrise ». »

5. Le reste de l'application. Cherche tout texte affiché qui dit encore « repère », « Suffisant à partir de »,
« Maîtrisé à partir de », « seuil de suffisance » ou « seuil de réussite » au sens de ce repère (aide, infobulles,
bulles des parcours, messages, démo). Aligne ceux que lit l'enseignant·e et liste-les dans le rapport. Ne touche pas,
et signale-moi : tout texte que lit l'élève en dehors du point 3 (cartouches, autres PDF) ; les entrées passées des
Nouvelles ; config.seuilReussite (la note de passage de 60 %, autre chose).

Bancs : ceux qui lisent les anciens mots mis à jour, un banc pour les étiquettes du point 2 (avec seuils, sans
seuils, deux seuils sur le même niveau) avec break-test, Vitest complet, Chromium portrait et paysage. Propose une
ligne de Nouvelles. Ni fusion ni release. Rapport : plans de travail/RAPPORT-2026-11-19-noms-des-seuils.md, avec ce
que tu as supposé.
