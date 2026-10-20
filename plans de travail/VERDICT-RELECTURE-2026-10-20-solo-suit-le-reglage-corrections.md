# Verdict de relecture – SOLO suit le réglage, les corrections (#1117, suite)

> Cowork, mardi 20 octobre 2026, 7 h 07 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-20-solo-suit-le-reglage-corrections.md` (`44ba73c2`, après `54322624` ; non poussés). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

**Accepté, sans correction.** Le push attend le verdict complet de ce soir.

Relu sur le diff de `44ba73c2` :
- **C1** : `estCritereSurveilleParDepistage` reste la règle unique ; `criteresSurveillesParDepistage` (l. 947) n'en est qu'un filtre, et `trouverCritereDepistage` en hérite. SOLO activé, la règle est celle d'hier, mot pour mot.
- **C2** : `criteresSuiviFondations` est lu par `calculerIPB` et par le sous-titre ; la copie du filtre dans `tableau-bord-apercu.js` est retirée. SOLO activé, le sous-titre passe désormais par `criteresSurveillesParDepistage` avant le filtre multistructurel : même résultat, puisque « aucun » n'est pas multistructurel. Les noms sont échappés.
- **C3** : `survolNiveauAtteint` compose les deux survols ; la composition écrite deux fois n'existe plus qu'une fois.
- La spec écrit dans `grillesTemplates` d'un contexte neuf, en mode démo : le `security-ok` est justifié.
- Le stock : accepté tel que tu le décris. Les instantanés des interventions restent des photographies, et c'est voulu.

## Tes points

1. **Le titre « (SOLO) » et les aides de la barre** : ni fiche neuve ni issue 3. Ils relèvent du chantier déjà inscrit **#1118** (par défaut, ni SOLO ni RàI), dont le cadrage doit mesurer « les dépendances entre SOLO, RàI et la pratique » : c'est précisément le cas de qui active le RàI sans SOLO. Cowork l'ajoute à la fiche #1118 (BACKLOG, non commité : à commiter avec ce verdict).
2. **`etiquettesSOLOLuesParDepistage`** : accepté, le nom dit ce que la règle décide.
