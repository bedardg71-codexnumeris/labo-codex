# Consigne du jour – mettre en ligne l'avertissement (#1012, suite)

> Écrite par Cowork le 1er octobre 2026 à 18 h 57 (Toronto, mesurée par `date`). Remplace la consigne de 17 h 52 et son ajout de 17 h 55, archivés sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-01-1012-avertissement.md`. L'ordre des chantiers de 13 h 02 ne change pas.

## Où on en est

Ton commit `8377dba0` (branche locale `fix-1012-avertissement`) est relu : **vert, aucune correction**. Lis `plans de travail/VERDICT-RELECTURE-2026-10-01-1012-avertissement.md` en entier avant de commencer : tes trois choix du § 9 y sont tranchés (noms de cause gardés, « le détail y sera » non posé, bouton rouge gardé). Grégoire a accepté la ligne des Nouvelles (« c'est ok », à 18 h 57).

## Ce que tu fais, dans cet ordre

1. **Pousse les deux commits de documents de `main`**, avec les fichiers de Cowork qui traînent dans l'arbre (le verdict, cette consigne, l'ancienne archivée).
2. **Inscris sous #1012** les quatre relevés du verdict, sans rien corriger : la copie vraiment perdue qui fait revenir la fenêtre pour toujours ; l'ancien `.zip` par la case qui remplace la liste des copies ; la sélection exportée sans ses copies ; et, dans #1001, la note pour le lot « alléger » (une copie partie aux archives ne compte pas comme attendue).
3. **La release** (skill `release-et-changelog`, `scripts/release.mjs`). L'intention, à toi de la juger par le skill : je penche pour une mineure, parce qu'un geste nouveau paraît à l'écran (la fenêtre d'avertissement) ; si le skill dit patch, suis-le et dis-le. La ligne des Nouvelles, acceptée par Grégoire, à poser telle quelle, espaces insécables selon l'usage du fichier :
   - Titre : « Ton codex te prévient quand des copies lui manquent. »
   - Texte : « Si des copies ne sont pas dans l'application quand tu écris ton codex, une fenêtre le dit avant d'écrire, puis l'application te demande où ranger le fichier au lieu de remplacer l'ancien. « Exporter une sélection » n'écrit plus dans ton fichier de codex. Et le bilan d'un codex ouvert incomplet dit, pour chaque cause, si le rouvrir peut ramener les copies. »
4. **Verdict Playwright complet, puis push, puis fusion vers `main`** (règle 2). Si le verdict demande une correction de code, arrête-toi et rends-la à Cowork avant de pousser.
5. **Constate la mise en ligne chez Netlify**, et dis l'heure mesurée.
6. **La porte terrain, le markdown** : `plans de travail/PORTES-TERRAIN-2026-10-01-1012-avertissement.md`. Cowork publiera l'artefact jumeau. Dans Chrome sur le Mac. Rien n'y écrit dans le vrai fichier de codex de Grégoire. Les rangées, à toi de les écrire au mot près, selon ce que tes bancs couvrent :
   - le numéro de version ;
   - **en fenêtre privée**, son vrai codex ouvert par le menu : il s'ouvre incomplet, faute d'espace (comme à ses portes de 12 h 37 et de 16 h 55). Dis-lui s'il répond « Recharger » ou « Annuler » à la fenêtre du bilan : choisis ce que ton banc (1) éprouve ;
   - menu Codex, « Mettre à jour le codex » : la fenêtre « Ce codex n'aura pas toutes tes copies », ses mots, ses deux nombres (champ), le bouton « Écrire sans ces copies » ;
   - « Annuler » : rien ne s'ouvre ensuite, ni fenêtre de destination, ni « Codex mis à jour » ;
   - de nouveau « Mettre à jour le codex », puis « Écrire sans ces copies » : après l'aperçu, **la fenêtre d'enregistrement de Chrome s'ouvre** ; il y clique « Annuler ». C'est la seule rangée qui lève une inférence de ton § 10, et elle n'écrit rien ;
   - une rangée **sans échéance**, hors fenêtre privée : à sa prochaine mise à jour habituelle de son codex, aucune fenêtre d'avertissement ne passe (son compte mesuré est zéro). Il ne fait pas cette mise à jour pour la porte.
   Le « si ça finit autrement » de la deuxième rangée (refus d'avant l'ouverture, ou ouverture complète) : la porte n'a pas vu la fenêtre, elle n'a pas échoué.
7. **`RELAIS.md` et `OU-EN-EST-ON.md` à jour.** Le chantier du codex n'est pas clos : il lui reste deux lots, l'ancien `.zip` par la case et la sélection exportée sans ses copies. Écris-le ainsi.

## Ce que tu ne fais pas

Tu ne corriges ni l'ancien `.zip` par la case, ni la sélection aux copies manquantes, ni la copie vraiment perdue : chacun attend une décision de Grégoire.

## Ce que tu rends

À Grégoire, trois lignes : le numéro en ligne et l'heure constatée ; le résultat du verdict complet (instables compris) ; où est la porte. Ce que tu as supposé, en une ligne.
