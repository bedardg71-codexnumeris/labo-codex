# Consigne — « Dupliquer » lie la copie à sa source (19 nov. 2026, 18 h 05)

> Relais de Cowork, reçu le 19 nov. 2026 (18 h 05), recopié tel quel. Branche neuve `lot/dupliquer-copie-profonde`,
> partie de `origin/main` (`ade09e93`). Source : `plans de travail/RAPPORT-2026-11-19-noms-des-seuils.md`,
> « Complément du 19 nov., 17 h 40 » (`9fc57473`, sur `lot/autoevaluation-consignes`). Rapport du lot :
> `plans de travail/RAPPORT-2026-11-19-dupliquer-copie-profonde.md`.

Pour Claude Code, à relayer — « Dupliquer » lie la copie à sa source (19 nov. 2026, 18 h 05)

Nouvelle session, branche lot/dupliquer-copie-profonde depuis origin/main. Écris cette consigne dans le dépôt avant de coder (plans de travail/). Source : plans de travail/RAPPORT-2026-11-19-noms-des-seuils.md, « Complément du 19 nov., 17 h 40 » (9fc57473, sur lot/autoevaluation-consignes). Rends ton rapport en français.

Le défaut, mesuré par l'autre session : le bouton « Dupliquer » de l'éditeur de grilles et « Dupliquer » de la bibliothèque donnent à la copie les mêmes objets critères que la source ; IndexedDB garde ce lien ; changer un texte dans la copie le change dans la source, encore après rechargement. Priorité : Grégoire a décidé le 19 nov. d'avoir une grille par production, ce qui passe par ce geste.

1. Inscris le défaut (fiche, priorité haute) et reproduis-le d'abord dans un banc qui échoue.

2. Copie profonde dans les deux gestes des grilles. Supposé par Cowork : la copie garde les identifiants des critères (le suivi rapproche par le nom, et une identité commune servira plus tard). Vérifie que rien ne suppose ces identifiants uniques entre grilles (évaluations, cartouches, exports, partage) ; si quelque chose le suppose, arrête-toi et décris-le au lieu de choisir.

3. Même forme de code ailleurs : mesure la duplication des échelles, des cartouches et des productions, et tout autre « Dupliquer » ou copie d'objet imbriqué que tu trouves. Là où le lien est confirmé, même correction, un banc par geste. Liste ce que tu as mesuré sain.

4. Mesure ce que devient un lien existant : à l'export puis à l'import d'une sauvegarde, au partage d'une grille, et d'un appareil à l'autre. Dis si deux appareils peuvent diverger à cause de lui.

5. Les données déjà liées. Un diagnostic en lecture seule, sans aucune écriture : il liste les paires de grilles (et d'échelles, cartouches, productions si le point 3 le confirme) qui partagent encore leurs objets. Mets-le où Grégoire peut le lancer sur son iPad et sur son Mac et m'en relayer le résultat (choisis l'endroit, dis-le au rapport). Aucune réparation dans ce lot : ce sont ses données, elle lui sera proposée. Décris seulement ce qu'elle ferait et ce qu'elle ne peut pas savoir (quelle version d'un texte était voulue quand la copie a écrasé la source).

6. Les cartouches ne suivent pas la copie d'une grille : ne change rien, signale-le au rapport avec ce que l'utilisateur voit.

Bancs avec break-test (changer la copie ne change pas la source, avant et après rechargement), Vitest complet, Chromium portrait et paysage. Propose une ligne de Nouvelles. PR « APERÇU, ne pas fusionner », ni fusion ni release. Rapport : plans de travail/RAPPORT-2026-11-19-dupliquer-copie-profonde.md, avec ce que tu as supposé.
