# Consigne du jour – le verdict rouge de la 1.213.0 : la spec se corrige, puis on pousse (mercredi 21 octobre 2026)

> Écrite par Cowork le mercredi 21 octobre 2026 à 13 h 42 (Toronto, mesuré par `date`). Elle remplace celle de la norme française (faite : `01b40658`, relue, partie dans la 1.213.0 `8372a987`), archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-21-note-norme-francaise.md`. Elle répond au bloc de 13 h 40 en tête de `RELAIS.md`.

## Ce que la relecture tranche

1. **Le rouge, `depistage-542-niveau-global-selon-pratique.spec.js` › « pas 3c » : ta lecture est juste, la spec est en défaut.** Mesuré par Cowork : elle lit `container.innerHTML` (l. 141). Le navigateur y sérialise l'espace insécable U+00A0 sous la forme `&nbsp;`, et le motif `/\d+\s*%/` ne la reconnaît pas. L'application affiche bien « 78 % », c'est la norme française voulue par Grégoire. **Correction : la spec**, pas l'app. Le même motif est à la l. 187 (pas 3b) : corrige les deux à l'identique, par exemple `/\d+(?:\s|&nbsp;)*%/`. Le bloc reste lu en `innerHTML`, parce que les autres assertions lisent des balises et des `title`.
2. **L'instable, `presences-lot-d-enregistrement.spec.js` › « Liste » : rien à corriger.** Mesuré par Cowork dans `tests/test-results/…-survit-au-rechargement-webkit/error-context.md` : le premier essai a échoué sur `page.goto` (délai de 90 s dépassé au chargement d'`index.html`), avant toute saisie. C'est la charge de la machine pendant le verdict, pas l'écriture des présences. Troisième issue : on n'y touche pas.

## Le mandat

1. Corrige les deux motifs de la spec. Break-test : rends le motif strict sur U+00A0 seul, et il doit rester rouge sur « 78&nbsp;% ».
2. Relance cette seule spec : verte.
3. Un commit après la release, qui porte la correction de la spec et le bloc de `RELAIS.md`, mis à jour pour dire que la relecture a tranché.
4. **Le verdict complet sur ce commit tourne ce soir**, au signal de Grégoire (cadence du 11 oct. : Chrome, Safari et Claude fermés, Mac sur secteur, sans veille). Pas maintenant.
5. Vert : `scripts/pousser.sh`, puis constate qu'`origin/main` porte le SHA jugé. Ensuite seulement, mets à jour `OU-EN-EST-ON.md` et `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`, comme le prévoit la fin de session.
6. Rouge : arrête-toi au rouge, comme cet après-midi.
