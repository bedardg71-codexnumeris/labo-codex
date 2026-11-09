// Relevé LECTURE SEULE (9 nov. 2026) — lot « Écarter une copie plagiée, ou lui mettre 0 » (#1176), le STOCK.
//
// Question 5 du rapport `plans de travail/RAPPORT-2026-11-09-copie-non-recevable-choix.md`, à lancer AVANT la fusion du
// lot. Le lot ne réécrit rien : une pratique sans règle écrite se lit comme avant (sommative : 0 ; spécifications : un
// travail non satisfaisant ; standards : « l'écarter »). Trois choses peuvent pourtant bouger sans geste, en standards
// seulement, et ce relevé les compte :
//   1. les copies d'A2026 marquées non recevables (plagiat, IA non autorisée), par pratique et par famille ;
//   2. une pratique par standards avec « Notes finalisées » cochée et une terminale NON REMISE : elle passerait à 0
//      (avant le lot : la note restait provisoire) ;
//   3. une terminale NON RECEVABLE déjà marquée, dans une pratique par standards sans « Notes finalisées » : elle
//      passerait de 0 à provisoire (avant le lot : 0 tout de suite).
// Il dit aussi combien de ces copies le dépistage lit autrement (avant : leur note calculée ; après : 0, ou hors du
// calcul si elles sont écartées) : un niveau RàI peut bouger, une note non.
//
// ⛔ N'écrit RIEN, ne répare RIEN. Aucun nom d'élève, aucun DA dans la sortie : des noms de pratiques, des numéros de
// groupe, des titres de productions et des comptes. À coller dans la console de Chrome, l'application ouverte (n'importe
// quelle section, n'importe quel cours actif : le relevé lit tout A2026). Il tourne sur la version EN LIGNE, qui n'a pas
// encore le code du lot : il ne s'appuie sur aucune de ses fonctions. Le résultat est copié dans le presse-papier (JSON)
// et affiché en tableaux ; la console rend une promesse, dont la valeur est la phrase de synthèse.
(async () => {
    const lire = async (cle, defaut) => {
        try { if (typeof db.get === 'function') { const v = await db.get(cle, defaut); return v == null ? defaut : v; } } catch (e) { /* repli */ }
        const v = db.getSync(cle, defaut);
        return v == null ? defaut : v;
    };
    const NORMALISATION = { 'alternative': 'standards', 'pan-maitrise': 'standards', 'pan-maitrise-json': 'standards', 'pan-standards': 'standards',
        'pan-objectifs': 'standards', 'pan-specifications': 'specifications', 'pan-denotation': 'denotation' };
    const famille = (t) => (t ? (NORMALISATION[t] || t) : null);
    const groupeNorm = (g) => String(g || '').padStart(5, '0');   // normaliserNumeroGroupe (modes.js)
    const nonRecevable = (e) => !!e && (e.statutIntegrite === 'plagiat' || e.statutIntegrite === 'ia');
    const nonRemise = (e) => !!e && (e.statutRemise === 'non-remis' || e.statutRemise === 'non-recu');
    const inactif = (et) => !!et && (et.statut === 'inactif' || et.statut === 'décrochage' || et.statut === 'abandon');   // main.js

    const trimestres = (db.getSync('trimestres', []) || []).filter((t) => t && (
        /^a2026/i.test(String(t.id || '')) || (String(t.session || '').toUpperCase() === 'A' && Number(t.annee) === 2026)));
    if (!trimestres.length) return 'Aucun trimestre A2026 trouvé dans « trimestres ».';

    const parPratique = {};
    const terminalesNonRecevables = [];
    const terminalesNonRemisesAuxNotesFinales = [];
    const nonRattachees = { copies: 0 };
    let evaluationsLues = 0;
    let copiesNonRecevables = 0;

    for (const t of trimestres) {
        const evaluations = (await lire(t.id + '_evaluationsSauvegardees', [])) || [];
        const productions = (await lire(t.id + '_productions', [])) || [];
        const etudiants = (await lire(t.id + '_groupeEtudiants', [])) || [];
        const groupesCours = ((await lire(t.id + '_groupesCours', [])) || []).filter(Boolean);
        const bibliotheque = ((await lire(t.id + '_pratiquesConfigurables', [])) || []).filter(Boolean);
        evaluationsLues += evaluations.length;
        const parId = new Map(evaluations.filter((e) => e && e.id).map((e) => [e.id, e]));

        // La pratique d'un groupe-cours : `groupesCours[].pratiqueId`, trouvée en bibliothèque (trouverPratiqueEnBibliotheque).
        const pratiqueDu = (gc) => {
            const id = gc && gc.pratiqueId;
            if (!id) return null;
            const entree = bibliotheque.find((p) => p.id === id) || bibliotheque.find((p) => p.id === famille(id))
                || bibliotheque.find((p) => famille(p.id) === famille(id)) || null;
            const configuration = entree ? (entree.configuration || entree.config || {}) : {};
            const fam = famille((entree && ((entree.configuration && entree.configuration.type) || entree.type || (entree.config && entree.config.type))) || (entree ? null : id));
            const portfolio = configuration.portfolio || null;
            const hybride = !!((portfolio && portfolio.hybride) || (configuration.categories && configuration.categories.actif));
            return {
                cle: t.id + ' · ' + ((entree && entree.nom) || id) + ' (' + ((entree && entree.id) || id) + ')',
                famille: fam || '(illisible)',
                regleEcrite: configuration.sortCopieNonRecevable || null,
                notesFinales: configuration.notesFinales === true,
                hybride,
                modeSelection: fam === 'standards' ? (hybride ? 'hybride' : ((portfolio && portfolio.methodeSelection) || 'meilleurs')) : null
            };
        };
        // La règle que le lot lira, sans règle écrite : le comportement d'avant (sortCopieNonRecevableDeLaPratique).
        const regleLue = (p) => p.regleEcrite || (p.famille === 'denotation' ? null : (p.famille === 'standards' ? 'ecarter' : 'zero'));
        const ligneDe = (p) => parPratique[p.cle] || (parPratique[p.cle] = {
            pratique: p.cle, famille: p.famille, regle: p.regleEcrite ? p.regleEcrite + ' (écrite)' : (regleLue(p) || '—') + ' (lue, sans règle écrite)',
            notesFinales: p.notesFinales, modeSelection: p.modeSelection || '', groupes: [],
            nonRecevables: 0, plagiat: 0, ia: 0, terminale: 0, obligatoire: 0, auPool: 0, autre: 0,
            remplaceesParUneReprise: 0, choixDejaSurLaCopie: 0, verrouillees: 0 });

        // Le groupe-cours d'une copie : le sien s'il est écrit ; sinon celui de son cours, départagé par le groupe de l'élève.
        const groupeCoursDe = (e) => {
            if (e.groupeCoursId) { const gc = groupesCours.find((g) => g.id === e.groupeCoursId); if (gc) return gc; }
            const candidats = groupesCours.filter((g) => g.coursId && g.coursId === e.coursId);
            if (candidats.length === 1) return candidats[0];
            if (candidats.length > 1) {
                const et = etudiants.find((x) => x && x.da === e.etudiantDA && (!x.coursId || x.coursId === e.coursId));
                const groupe = e.groupe || (et && (et.groupe || et.groupeReel));
                if (et && et.groupeCoursId) { const gc = candidats.find((g) => g.id === et.groupeCoursId); if (gc) return gc; }
                if (groupe) { const gc = candidats.find((g) => g.groupeNum && groupeNorm(g.groupeNum) === groupeNorm(groupe)); if (gc) return gc; }
            }
            return null;
        };
        const productionDe = (id) => productions.find((p) => p && p.id === id) || null;
        const terminaleDuCours = (coursId) => productions.find((p) => p && p.type === 'terminale' && (!p.coursId || p.coursId === coursId)) || null;
        const remplacee = (e) => !!(e.remplaceeParId && (e.reconcilieParDoublon || parId.has(e.remplaceeParId)));

        // 1. et 3. — les copies non recevables, rangées sous la pratique de leur groupe-cours.
        evaluations.filter(nonRecevable).forEach((e) => {
            copiesNonRecevables++;
            const gc = groupeCoursDe(e);
            const p = gc ? pratiqueDu(gc) : null;
            if (!p) { nonRattachees.copies++; return; }
            const l = ligneDe(p);
            const groupe = gc.modeCours ? 'cours' : String(gc.groupeNum || '?');
            if (!l.groupes.includes(groupe)) l.groupes.push(groupe);
            l.nonRecevables++;
            l[e.statutIntegrite]++;
            if (e.remplaceeParId) l.remplaceesParUneReprise++;
            if (e.sortCopieNonRecevable) l.choixDejaSurLaCopie++;
            if (e.verrouillee === true) l.verrouillees++;
            const prod = productionDe(e.productionId);
            const place = !prod ? 'autre' : (prod.type === 'terminale' ? 'terminale'
                : ((p.hybride && prod.categorie === 'obligatoire') ? 'obligatoire' : (p.famille === 'standards' ? 'auPool' : 'autre')));
            l[place]++;
            if (p.famille === 'standards' && place === 'terminale') {
                const sort = e.sortCopieNonRecevable || regleLue(p);
                terminalesNonRecevables.push({
                    pratique: p.cle, groupe, production: (prod && (prod.titre || prod.nom)) || '?', statut: e.statutIntegrite,
                    regle: sort, notesFinales: p.notesFinales, remplaceeParUneReprise: remplacee(e),
                    avantLeLot: 0,
                    apresLeLot: sort === 'zero' ? 0 : (p.notesFinales ? 0 : 'provisoire'),
                    bouge: !remplacee(e) && sort === 'ecarter' && !p.notesFinales
                });
            }
        });

        // 2. — « Notes finalisées » cochée, terminale non remise (ou écartée), en standards : provisoire avant, 0 après.
        groupesCours.forEach((gc) => {
            const p = pratiqueDu(gc);
            if (!p || p.famille !== 'standards' || !p.notesFinales) return;
            const terminale = terminaleDuCours(gc.coursId);
            const groupe = gc.modeCours ? 'cours' : String(gc.groupeNum || '?');
            const ligne = { pratique: p.cle, groupe, terminale: terminale ? (terminale.titre || terminale.nom || '?') : '(aucune terminale)',
                etudiants: 0, inactifs: 0, aucuneCopie: 0, nonRemise: 0, nonRecevableEcartee: 0, passeraientA0: 0, dontInactifs: 0 };
            const duGroupe = etudiants.filter((et) => et && et.da && (et.groupeCoursId ? et.groupeCoursId === gc.id
                : ((!et.coursId || et.coursId === gc.coursId) && (gc.modeCours || !gc.groupeNum || groupeNorm(et.groupe || et.groupeReel) === groupeNorm(gc.groupeNum)))));
            duGroupe.forEach((et) => {
                ligne.etudiants++;
                if (inactif(et)) ligne.inactifs++;
                if (!terminale) return;
                const copies = evaluations.filter((e) => e && e.etudiantDA === et.da && e.productionId === terminale.id && !remplacee(e));
                const ecartee = (e) => nonRecevable(e) && (e.sortCopieNonRecevable || regleLue(p)) === 'ecarter';
                if (!copies.every((e) => nonRemise(e) || ecartee(e))) return;   // terminaleManquante (registre)
                if (!copies.length) ligne.aucuneCopie++;
                else if (copies.some(ecartee)) ligne.nonRecevableEcartee++;
                else ligne.nonRemise++;
                ligne.passeraientA0++;
                if (inactif(et)) ligne.dontInactifs++;
            });
            terminalesNonRemisesAuxNotesFinales.push(ligne);
        });
    }

    const lignes = Object.values(parPratique).map((l) => Object.assign({}, l, { groupes: l.groupes.join(', ') }));
    const parFamille = {};
    lignes.forEach((l) => {
        const f = parFamille[l.famille] || (parFamille[l.famille] = { famille: l.famille, pratiques: 0, nonRecevables: 0, terminale: 0, obligatoire: 0, auPool: 0, autre: 0 });
        f.pratiques++;
        ['nonRecevables', 'terminale', 'obligatoire', 'auPool', 'autre'].forEach((k) => { f[k] += l[k]; });
    });
    const bougent = terminalesNonRecevables.filter((x) => x.bouge).length;
    const passeraientA0 = terminalesNonRemisesAuxNotesFinales.reduce((s, l) => s + l.passeraientA0, 0);
    const resume = {
        releve: '#1176 — copies non recevables, A2026, lecture seule',
        date: new Date().toISOString(),
        version: (window.__VERSION__ && window.__VERSION__.beta) || null,
        trimestres: trimestres.map((t) => t.id),
        evaluationsLues,
        copiesNonRecevables,
        copiesSansGroupeCoursRetrouve: nonRattachees.copies,
        parFamille: Object.values(parFamille),
        parPratique: lignes,
        standardsTerminalesNonRecevables: terminalesNonRecevables,
        standardsTerminalesNonRemisesAvecNotesFinales: terminalesNonRemisesAuxNotesFinales,
        ceQuiBouge: {
            terminalesNonRecevablesDe0AProvisoire: bougent,
            terminalesManquantesDeProvisoireA0: passeraientA0,
            depistage: 'les ' + copiesNonRecevables + ' copies non recevables : le dépistage lisait leur note calculée ; il lira 0, '
                + 'ou les laissera de côté si elles sont écartées (un niveau RàI peut bouger, pas une note)'
        }
    };
    try { copy(JSON.stringify(resume, null, 2)); } catch (e) { /* hors console Chrome */ }
    console.table(Object.values(parFamille));
    console.table(lignes);
    if (terminalesNonRecevables.length) console.table(terminalesNonRecevables);
    if (terminalesNonRemisesAuxNotesFinales.length) console.table(terminalesNonRemisesAuxNotesFinales);
    return 'Copié : ' + copiesNonRecevables + ' copie(s) non recevable(s) sur ' + evaluationsLues + ' évaluation(s) d\'A2026, dans '
        + lignes.length + ' pratique(s)' + (nonRattachees.copies ? ' (' + nonRattachees.copies + ' sans groupe-cours retrouvé)' : '')
        + '. Standards : ' + bougent + ' terminale(s) non recevable(s) passeraient de 0 à provisoire ; '
        + passeraientA0 + ' terminale(s) manquante(s) passeraient de provisoire à 0 (« Notes finalisées » cochée).';
})();
