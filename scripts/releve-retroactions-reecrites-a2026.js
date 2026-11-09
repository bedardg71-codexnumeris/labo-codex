// Relevé LECTURE SEULE (9 nov. 2026) — lot « Un mot pour ton étudiant·e », le STOCK.
//
// Une retouche tapée dans le cadre « Générale » n'est jamais allée au PDF de l'élève. Ce relevé compte,
// parmi les évaluations d'A2026, celles marquées `retroactionReecrite === true` (le cadre a été retouché
// à la main), par production, et combien sont verrouillées. Il ne dit PAS si la retouche contenait un
// mot pour l'élève : seul Grégoire peut le juger, copie par copie.
//
// ⛔ N'écrit RIEN, ne répare RIEN. Aucun nom, aucun DA dans la sortie : des titres de productions et
// des comptes. À coller dans la console de Chrome, l'application ouverte (n'importe quelle section).
// Le résultat est copié dans le presse-papier (JSON) et affiché en tableau ; la console rend une promesse,
// dont la valeur est la phrase de synthèse.
(async () => {
    const trimestres = (db.getSync('trimestres', []) || []).filter((t) => t && (
        /^a2026/i.test(String(t.id || '')) || (String(t.session || '').toUpperCase() === 'A' && Number(t.annee) === 2026)));
    if (!trimestres.length) return 'Aucun trimestre A2026 trouvé dans « trimestres ».';
    const parProduction = {};
    let total = 0;
    // `db.get` (asynchrone) : une liste lourde peut vivre dans IndexedDB sans être dans le cache mémoire.
    for (const t of trimestres) {
        const evaluations = (await db.get(t.id + '_evaluationsSauvegardees', [])) || [];
        const productions = (await db.get(t.id + '_productions', [])) || [];
        const titre = (id) => { const p = productions.find((x) => x.id === id); return (p && (p.titre || p.nom)) || '(production introuvable)'; };
        evaluations.forEach((e) => {
            if (!e) return;
            total++;
            const cle = t.id + ' · ' + titre(e.productionId);
            const ligne = parProduction[cle] || (parProduction[cle] = {
                evaluations: 0, reecrites: 0, reecritesVerrouillees: 0, reecritesRemplacees: 0, sansMarque: 0 });
            ligne.evaluations++;
            if (e.retroactionReecrite === undefined && e.retroactionFinale) ligne.sansMarque++;   // stock d'avant le 26 sept. : inconnu
            if (e.retroactionReecrite !== true) return;
            ligne.reecrites++;
            if (e.verrouillee === true) ligne.reecritesVerrouillees++;
            if (e.remplaceeParId) ligne.reecritesRemplacees++;
        });
    }
    const lignes = Object.entries(parProduction).map(([production, c]) => Object.assign({ production }, c));
    const somme = (k) => lignes.reduce((s, l) => s + l[k], 0);
    const resume = {
        releve: 'retroactionReecrite === true, A2026, lecture seule',
        date: new Date().toISOString(),
        trimestres: trimestres.map((t) => t.id),
        evaluationsLues: total,
        reecrites: somme('reecrites'),
        reecritesVerrouillees: somme('reecritesVerrouillees'),
        reecritesRemplacees: somme('reecritesRemplacees'),
        sansMarqueAvecTexte: somme('sansMarque'),
        parProduction: lignes
    };
    try { copy(JSON.stringify(resume, null, 2)); } catch (e) { /* hors console Chrome */ }
    console.table(lignes);
    return 'Copié : ' + resume.reecrites + ' rétroaction(s) retouchée(s) sur ' + total + ' évaluation(s), dont '
        + resume.reecritesVerrouillees + ' verrouillée(s).';
})();
