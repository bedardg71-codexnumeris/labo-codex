// Sonde LECTURE SEULE (16 sept. 2026) — « les 1 meilleures sur 2 évaluées » : quelles évaluations
// comptent comme « évaluées » sans être retenues ? N'écrit rien ; copie le résultat.
(() => {
    const evaluations = obtenirDonneesSelonMode('evaluationsSauvegardees') || [];
    const productions = obtenirDonneesSelonMode('productions') || [];
    const eleves = obtenirDonneesSelonMode('groupeEtudiants') || [];
    const terminal = window.identifierProductionTerminale(productions);
    const pool = window.obtenirArtefactsIdsPoolStd(productions, terminal && terminal.id);
    const prod = (id) => productions.find(p => p.id === id) || {};
    const lignes = [];
    eleves.forEach(el => {
        const comptees = evaluations.filter(e => e.etudiantDA === el.da && pool.includes(e.productionId)
            && e.productionId !== (terminal && terminal.id) && window.evaluationEntreDansLaNote(e)
            && !['plagiat', 'ia'].includes(e.statutIntegrite || 'recevable'));
        const categorisees = comptees.filter(e => ['selection', 'obligatoire'].includes(prod(e.productionId).categorie));
        if (comptees.length !== categorisees.length || comptees.length > 1) {
            lignes.push({
                eleve: el.nom + ', ' + el.prenom,
                comptees: comptees.length,
                categorisees: categorisees.length,
                detail: comptees.map(e => ({
                    id: e.id, production: prod(e.productionId).titre || e.productionId,
                    type: prod(e.productionId).type, categorie: prod(e.productionId).categorie || '(aucune)',
                    note: e.noteFinale, niveau: e.niveauFinal, verrouillee: e.verrouillee, date: e.dateEvaluation
                }))
            });
        }
    });
    const resume = {
        productions: productions.map(p => ({ titre: p.titre, type: p.type, categorie: p.categorie || '(aucune)', dansLePool: pool.includes(p.id) })),
        eleves: lignes
    };
    try { copy(JSON.stringify(resume, null, 2)); } catch (e) { /* hors console Chrome */ }
    console.log(resume);
    return 'Copié : ' + lignes.length + ' élève(s) à examiner.';
})();
