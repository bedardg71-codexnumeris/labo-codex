// Relevé LECTURE SEULE (9 nov. 2026) — lot « Deux liens vers la carte d'alignement », le STOCK.
//
// Ce que Grégoire verra après la fusion, carte par carte : combien de propositions « Relier » dans
// l'Inspecteur d'une évaluation (un objectif de leçon identique à l'objectif de la production
// choisie), et combien de blocs Compétence proposeront « Relier à la fiche du cours » (dont combien
// montreront deux textes différents). Le lot ne relie RIEN d'office : ces propositions attendent un
// geste. Les critères sont ceux du code (planification-carte.js : `objectifsARelierPourEvaluation`,
// `peutRelierCompetence`, `sectionCompetenceInspecteurHTML`) ; le banc
// `tests/unit/releve-stock-deux-liens.test.js` confronte ce relevé aux fonctions de la carte elles-mêmes.
//
// ⛔ N'écrit RIEN, ne répare RIEN. Aucun nom d'élève, aucun texte : des comptes et des identifiants
// de cartes et de blocs. À coller dans la console de Chrome, l'application ouverte (n'importe quelle
// section). Le résultat est copié dans le presse-papier (JSON) et affiché en tableau ; la console rend
// une promesse, dont la valeur est la phrase de synthèse.

/**
 * Le relevé lui-même : une fonction PURE. Elle ne reçoit qu'une lecture et la liste des clés.
 * @param {function(string): *} lire
 * @param {Array<string>} cles
 */
function releverStockDeuxLiens(lire, cles) {
    const NOM = 'planification_mindmap';
    const RANG_SEANCE_MAX = 4;
    const norm = (t) => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
    const semaine = (n) => {
        const s = n && n.type === 'lecon' && n.metadata ? parseInt(n.metadata.semaine, 10) : NaN;
        return isNaN(s) || s < 1 ? null : s;
    };
    const rang = (n) => {
        const r = n && n.type === 'lecon' && n.metadata ? parseInt(n.metadata.rangSeance, 10) : NaN;
        return isNaN(r) || r < 1 || r > RANG_SEANCE_MAX ? null : r;
    };
    const avant = (a, b) => {
        const sa = semaine(a), sb = semaine(b);
        if (sa === null || sb === null) return false;
        if (sa !== sb) return sa < sb;
        const ra = rang(a), rb = rang(b);
        return ra !== null && rb !== null && ra < rb;
    };
    const objectifs = (n) => (n && n.metadata && Array.isArray(n.metadata.objectifs) ? n.metadata.objectifs : [])
        .filter((o) => o && typeof o.texte === 'string');

    const cours = Array.isArray(lire('cours')) ? lire('cours') : [];
    const sortie = { releve: 'deux liens vers la carte, lecture seule', date: new Date().toISOString(), trimestres: {} };

    cles.filter((k) => k === NOM || k.endsWith('_' + NOM)).forEach((k) => {
        const prefixe = k === NOM ? '(clé nue)' : k.slice(0, -(NOM.length + 1));
        const donnees = lire(k);
        if (!donnees || !donnees.cartes) return;
        // Même lecture que `productionsDuTrimestre` : la clé du trimestre, avec repli sur la clé nue.
        const prods = (k === NOM ? null : lire(prefixe + '_productions')) || lire('productions');
        const productions = Array.isArray(prods) ? prods : [];
        const objectifProd = (id) => {
            const p = productions.find((x) => x && x.id === id);
            return p && typeof p.objectif === 'string' ? p.objectif.trim() : '';
        };
        const index = donnees.index && Array.isArray(donnees.index.cartes) ? donnees.index.cartes : [];
        const r = {
            cartes: 0,
            propositionsRelierObjectif: 0, objectifsARelier: 0, evaluationsAvecProposition: 0,
            blocsRelierCompetence: 0, competencesARelier: 0, dontDeuxTextesDifferents: 0,
            blocsFicheSansCompetence: 0, blocsSansFiche: 0,
            dejaLies: { objectifs: 0, competences: 0 },
            detail: []
        };
        Object.keys(donnees.cartes).forEach((carteId) => {
            const noeuds = (donnees.cartes[carteId] && Array.isArray(donnees.cartes[carteId].noeuds))
                ? donnees.cartes[carteId].noeuds.filter(Boolean) : [];
            r.cartes++;
            const parId = {};
            noeuds.forEach((n) => { parId[n.id] = n; });
            const lecons = noeuds.filter((n) => n.type === 'lecon');
            const leconDeObjectif = {};
            lecons.forEach((l) => objectifs(l).forEach((o) => {
                leconDeObjectif[o.id] = l;
                if (o.productionId) r.dejaLies.objectifs++;
            }));

            // --- Partie 1 : « Relier » dans l'Inspecteur d'une évaluation ---
            const aRelier = new Set();
            noeuds.filter((n) => n.type === 'evaluation').forEach((ev) => {
                const pid = ev.metadata && ev.metadata.productionId;
                const cible = norm(objectifProd(pid));
                if (!cible) return;
                const hote = ev.parent && parId[ev.parent] && parId[ev.parent].type === 'lecon' ? parId[ev.parent] : null;
                const groupes = hote ? [hote].concat(lecons.filter((l) => l !== hote && avant(l, hote))) : [];
                (Array.isArray(ev.metadata.objectifsServis) ? ev.metadata.objectifsServis : []).forEach((oid) => {
                    const l = leconDeObjectif[oid];
                    if (l && groupes.indexOf(l) === -1) groupes.push(l);
                });
                let ici = 0;
                groupes.forEach((l) => objectifs(l).forEach((o) => {
                    if (o.productionId || norm(o.texte) !== cible) return;
                    ici++;
                    aRelier.add(l.id + '::' + o.id);
                    r.detail.push({ carteId, evaluation: ev.id, lecon: l.id, objectif: o.id, quoi: 'Relier' });
                }));
                r.propositionsRelierObjectif += ici;
                if (ici) r.evaluationsAvecProposition++;
            });
            r.objectifsARelier += aRelier.size;

            // --- Partie 2 : « Relier à la fiche du cours » sur un bloc Compétence ---
            const entree = index.find((e) => e && e.id === carteId) || {};
            const fiche = entree.coursId ? cours.find((c) => c && c.id === entree.coursId) : null;
            const enonce = fiche && fiche.nature !== 'service' ? norm(fiche.competence) : '';
            const competences = noeuds.filter((n) => n.type === 'competence');
            const lies = competences.filter((n) => n.metadata && n.metadata.lieFicheCours === true);
            r.dejaLies.competences += lies.length;
            const identitesLiees = new Set(lies.map((n) => n.cloneSourceId || n.id));
            const identitesARelier = new Set();
            competences.forEach((n) => {
                if (n.metadata && n.metadata.lieFicheCours === true) return;
                if (!enonce) {
                    if (fiche && fiche.nature !== 'service') r.blocsFicheSansCompetence++;
                    else r.blocsSansFiche++;
                    return;
                }
                const identite = n.cloneSourceId || n.id;
                if ([...identitesLiees].some((i) => i !== identite)) return;
                r.blocsRelierCompetence++;
                identitesARelier.add(identite);
                const differe = norm(n.titre).toLowerCase() !== enonce.toLowerCase();
                if (differe) r.dontDeuxTextesDifferents++;
                r.detail.push({ carteId, bloc: n.id, quoi: 'Relier à la fiche du cours', deuxTextes: differe });
            });
            r.competencesARelier += identitesARelier.size;
        });
        sortie.trimestres[prefixe] = r;
    });
    return sortie;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { releverStockDeuxLiens };
} else {
    (async () => {
        // `db.get` (asynchrone) d'abord : une liste lourde peut vivre dans IndexedDB sans être dans le
        // cache mémoire. On charge ce que le relevé lira, puis on le lui donne en lecture synchrone.
        const cles = db.keysSync();
        const utiles = cles.filter((k) => /planification_mindmap$|(^|_)productions$|^cours$/.test(k));
        const lu = new Map();
        for (const k of utiles) lu.set(k, await db.get(k, null));
        const resume = releverStockDeuxLiens((k) => (lu.has(k) ? lu.get(k) : null), cles);
        try { copy(JSON.stringify(resume, null, 2)); } catch (e) { /* hors console Chrome */ }
        const lignes = Object.entries(resume.trimestres).map(([t, r]) => {
            const l = Object.assign({ trimestre: t }, r);
            l.dejaLies = r.dejaLies.objectifs + r.dejaLies.competences;
            delete l.detail;
            return l;
        });
        console.table(lignes);
        const somme = (k) => lignes.reduce((s, l) => s + l[k], 0);
        return 'Copié : ' + somme('propositionsRelierObjectif') + ' proposition(s) « Relier » (objectifs), '
            + somme('blocsRelierCompetence') + ' bloc(s) Compétence à relier, dont '
            + somme('dontDeuxTextesDifferents') + ' avec deux textes différents.';
    })();
}
