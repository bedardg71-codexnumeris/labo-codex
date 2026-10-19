# Consigne – la dissection : la version 1.207.0 (« Créer ta grille, même incomplète »)

> Écrite par Cowork le dimanche 18 octobre 2026 à 20 h 09 (Toronto, mesuré par `date`). Les lots 9 (`cb73e818`) et 9b (`364e3fcb`) sont relus et acceptés (`VERDICT-RELECTURE-2026-10-18-dissection-9b-la-garde.md`). Grégoire a tranché à 20 h 08, sur sa page des mots, tous les textes des lots 9 et 9b, le message du paquet `.lcz` et l'entrée des Nouvelles. **Deux temps, deux relais** : la release, relue par Cowork ; puis, Cowork fermé, **un seul verdict complet** sur le dernier commit, qui couvre la 1.206.0 et la 1.207.0, et le push. Règles 2, 7 et 8 de `PROTOCOLE.md` ; skills `fin-de-session-labo-codex` (§4.5) et `release-et-changelog`.

## Temps A — la release (dès que Grégoire relaie)

1. **Les textes des lots 9 et 9b** (les tableaux des deux demandes de relecture) : tous validés tels quels, sauf deux, qui prennent le mot de « Grilles de critères » pour une grille en points ; marque leurs commentaires « validé G. 18 oct. 20 h 08 » :
   - sous la note, à l'évaluation : « Pas de note tant qu'un critère n'a pas ses points : A, B. Donne-lui ses points dans Conception → Grilles de critères. » (au pluriel : « Donne-leur leurs points ») ; **pour une grille en pourcentages**, « sa pondération » au lieu de « ses points » (« Donne-lui sa pondération », « Donne-leur leur pondération ») ;
   - le refus d'enregistrer et la synthèse : « sans points : A, B » ; en pourcentages, « sans pondération : A, B ».
2. **Le paquet `.lcz`** (verdict du lot 9b) : avant de générer le paquet, une grille qui porte un critère marqué « à compléter » est refusée avec ce message, à la place de l'alerte de validation : « Cette grille ne peut pas encore être partagée : 2 critères n'ont pas leurs points (A, B). Donne-leur leurs points dans « Grilles de critères », puis partage-la. » (au singulier : « 1 critère n'a pas ses points (A). Donne-lui ses points… »). Le schéma de partage ne change pas. Un essai (Vitest ou WebKit selon où vit le geste) et son break-test.
3. **L'entrée des Nouvelles**, `version: '1.207'`, `couleur: 'vert'`, en tête (au-dessus de la 1.206, qui reste telle quelle), mot pour mot, espaces insécables comme la 1.206 :
   - Titre : « Créer ta grille, même incomplète »
   1. « Dans « Apporter mon matériel », « Créer ma grille » ne bloque plus quand des critères n'ont pas encore leurs points : tu les complètes ensuite dans « Grilles de critères », qui dit combien il en reste. »
   2. « Tant qu'un critère n'a pas ses points, la note d'une copie évaluée avec cette grille affiche « -- », plutôt que de se calculer sur les autres critères sans le dire. Il en va de même si tu vides le champ des points d'un critère dans « Grilles de critères ». »
4. `/fin-de-session` jusqu'au commit de release **inclus** : intention **minor**, `scripts/release.mjs` → **1.207.0**. La 1.206.0 et la 1.207.0 partiront ensemble au push.
5. Vitest complet **après** le commit de release.
6. La porte : Cowork a ajouté sa reprise à `PORTE-TERRAIN-2026-10-18-la-dissection.md` (§7) ; commite-la telle quelle.
7. Demande courte : `plans de travail/DEMANDE-RELECTURE-2026-10-18-version-1.207.0.md`. **Puis arrête-toi.**

## Temps B — le verdict et le push (second relais de Grégoire)

**Chrome, Safari et Cowork fermés, Mac sur secteur.** Verdict complet sur le **dernier commit** ; vert : push (la 1.206.0 et la 1.207.0 ensemble) ; rouge : pas de push, nomme le lot en cause, arrête-toi. Rapport court : vert ou rouge, l'heure du push.
