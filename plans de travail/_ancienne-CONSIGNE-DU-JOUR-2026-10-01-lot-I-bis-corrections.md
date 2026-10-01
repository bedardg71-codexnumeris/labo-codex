# Consigne du jour – lot I bis, suite : deux corrections, les mots, puis la release

> Écrite le 1er octobre 2026 à 2 h 12 (Toronto) par Cowork. Suit `plans de travail/VERDICT-RELECTURE-2026-10-01-lot-I-bis-un-seul-terme.md` : lis-le d'abord.
> **Condition de départ** : branche `lot-i-bis-un-seul-terme` à `820fe58e`.

## Ce que tu fais

1. **Commite les fichiers de Cowork tels quels** : le verdict, `plans de travail/CONSIGNE-DU-JOUR.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-30-lot-I-bis.md`, `CONSIGNE-DEMARRAGE-COWORK.md`.
2. **Correction 1 : la case « Ouvrir un Codex » ouvre un codex.** Un fichier de codex choisi dans cette case (Réglages › Données) s'ouvre par le chemin du menu Codex, avec ses confirmations habituelles ; l'alerte de `js/import-export.js` l. 1057 disparaît. Un essai de comportement, une mutation rouge. ⛔ Si le chemin du menu ne peut pas recevoir un fichier déjà choisi sans réécriture lourde : arrête-toi avant la release et dis-le.
3. **Correction 2 : le cliquet du mot** prend aussi ` `, `\xa0`, ` ` (écrits en échappement dans le source), `&#8239;`, `&#x202f;` et le caractère U+202F. Un cas de plus dans l'essai du motif ; mes deux mutations survivantes deviennent rouges (verdict, tableau).
4. **Les mots, validés par Grégoire le 1er octobre entre 2 h 07 et 2 h 12, à ne pas modifier** :
   - **La confirmation de suppression** (remplace celle du 30 sept. : dans Chrome, la mise à jour suivante réécrit le même fichier) : « Supprimer définitivement le trimestre « NOM » ? Toutes ses données seront effacées : étudiant·es, évaluations, présences, productions, captures et modèles. Ton codex à jour les contient encore, jusqu'à ta prochaine mise à jour : pour pouvoir revenir en arrière, fais d'abord une copie de ce fichier. »
   - **Le refus sans codex** : ta proposition, telle quelle (« … Tu n'as pas encore de codex : crée-le avec le bouton ci-dessous, puis recommence. »).
   - **L'encadré de la Loi 25** : ta proposition, telle quelle.
   - **Les Nouvelles** (version mineure) – titre : « La copie de secours cède la place au codex » ; ligne : « Dans Réglages › Données, le bouton « Faire une copie de secours » disparaît : pour mettre ton travail en sûreté, mets ton codex à jour. Un fichier de copie de secours déjà fait s'ouvre toujours, par « Ouvrir un Codex… », qui ouvre maintenant aussi un codex. Supprimer un trimestre demande un codex à jour. » Si la correction 1 s'arrête, retire « , qui ouvre maintenant aussi un codex ».
   - Les deux ⚠ restants de ta table (FAQ, formats) : gardés, tranchés par Cowork.
5. **Inscris une fiche** (vérifie d'abord les deux registres) : avant de supprimer un trimestre, écrire un codex à part, sous un autre nom, et ne supprimer qu'une fois ce fichier confirmé. Motif : dans Chrome, le codex « à jour » ne garde le trimestre supprimé que jusqu'à la mise à jour suivante (ta trouvaille 1). Décision de Grégoire à venir ; palier lu, pas mesuré. Réemploi probable : `FichierSortant` et la confirmation « Il y est ».
6. **« Restauration de tes données »** : si aucun geste ne peut atteindre ce repli, retire-le ; sinon laisse, et dis lequel.
7. **Puis la release** (`minor`), Vitest complet, **le verdict WebKit complet sur le commit de release, Cowork fermé**, le push, la fusion vers `main`. Coche #985. Inscris le numéro en ligne dans `PORTES-TERRAIN-2026-09-30-lot-I-bis.md`.

## Ce que tu rends

À Grégoire, trois lignes : le numéro en ligne (mesuré chez Netlify), le verdict, la porte à faire. `RELAIS.md` et `OU-EN-EST-ON.md` à jour. Rappel de la règle 11 : le chantier du codex se dit « clos » quand ce lot est en ligne et sa porte passée ; la suite, arrêtée par Grégoire, est le retour aux archives (lot A3).
