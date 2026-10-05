# Consigne du jour – livrer E3 (« Renvoyer aux archives », #1024)

> Écrite par Cowork le 5 octobre 2026 à 7 h 51 (Toronto, mesurée par `date`). Remplace la consigne de 7 h 19, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-05-e3-corrections.md`.

## Où on en est

Les trois corrections (`d17b0749`) sont relues par Cowork : **vertes**. Grégoire a tranché tous les mots : ils sont dans `VERDICT-RELECTURE-2026-10-05-e3-renvoyer-trimestre.md`, section « Les mots tranchés par Grégoire ». Lis-la en entier : ce sont les textes exacts.

Grégoire t'autorise, en te transmettant cette consigne, à commiter les fichiers de Cowork, à écrire dans `BACKLOG.md`, à fusionner la branche dans `main`, à faire la release et à pousser.

## Ce que tu fais, dans cet ordre

1. **Commite** le verdict mis à jour, cette consigne et son archive.
2. **Les mots** dans `ReserveRenvoyer.MOTS`, exactement comme au verdict. **« Finir de renvoyer » devient « Terminer le renvoi » partout** (bouton, titre, fenêtre « Renvoi inachevé », infobulle, aide, tests). **La virgule décimale** dans tout l'écran des archives (« 1,08 Go », « 80,0 Ko ») : une seule fonction de format si possible. Adapte les essais qui lisent ces textes.
3. **Inscris au BACKLOG** la fiche de la section « À inscrire » du verdict (numéro suivant, ligne du compteur dans le même commit). Coche #1027 et #1024 à la livraison.
4. **Vitest complet**, puis **le verdict Playwright complet** (garde-éveil, Mac branché).
5. **Fusionne** dans `main`, **release mineure** par `scripts/release.mjs` selon le skill `release-et-changelog`. Ligne des Nouvelles, telle quelle :
   « Archives : « Renvoyer aux archives » retire de l'application un trimestre clos que son archive vérifiée garde à l'identique ; « Faire revenir » le ramène tel quel. Si le trimestre a changé depuis son archive, rien n'est retiré. »
6. **Pousse**, mesure la mise en ligne chez Netlify, écris `RELAIS.md`.

## Ce que tu rends

La version en ligne et son heure mesurée ; le verdict Playwright (échecs, instables) ; le numéro de la fiche inscrite. Rien de plus.
