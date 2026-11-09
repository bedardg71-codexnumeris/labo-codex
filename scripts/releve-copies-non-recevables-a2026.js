// Relevé LECTURE SEULE (9 nov. 2026) — lot « Écarter une copie plagiée, ou lui mettre 0 » (#1176), le STOCK.
//
// Question 5 du rapport `plans de travail/RAPPORT-2026-11-09-copie-non-recevable-choix.md`, à lancer AVANT la fusion du
// lot. Le lot ne réécrit rien : une pratique sans règle écrite se lit comme avant (sommative : 0 ; spécifications : un
// travail non satisfaisant ; standards : « l'écarter »). Une note peut pourtant bouger sans geste, en standards, par la
// TERMINALE (décision 4 : non remise ou écartée, elle laisse la note provisoire pendant le trimestre et vaut 0 une fois
// « Notes finalisées » cochée ; avant le lot, une terminale non recevable valait 0 tout de suite, et une terminale non
// remise laissait la note provisoire même aux notes finales). Ce relevé dit :
//   1. les copies d'A2026 marquées non recevables (plagiat, IA non autorisée), par pratique et par famille, et leur place ;
//   2. en standards, pour CHAQUE élève de chaque groupe, la note de terminale avant le lot et après (0, une note, ou
//      « provisoire »), et compte ce qui change : une terminale qui passerait de 0 à provisoire (une terminale non
//      recevable, ou une reprise accordée pas encore évaluée), une terminale qui passerait de provisoire à 0 (« Notes
//      finalisées » cochée, terminale non remise ou absente).
// Il dit aussi combien de copies le dépistage lit autrement (avant : leur note calculée ; après : 0, ou hors du calcul
// si elles sont écartées) : un niveau RàI peut bouger, une note non.
//
// LA RÈGLE, RECOPIÉE DU CODE (la version en ligne n'a pas le code du lot : le relevé n'appelle aucune de ses fonctions).
// Les prédicats d'une copie sont ceux du registre (`js/pratiques/pratique-registre.js`), identiques sur `main` et sur le
// lot : `_copieCompteParElleMeme`, `originaleEstRemplacee`, `evaluationEntreDansLaNote`, `evaluationNonRemise`. La note de
// terminale suit `_obtenirNoteTerminaleEtudiant` (`js/profil-etudiant-actions.js`) : celle de `main` pour « avant »,
// celle du lot pour « après » (`copieNonRecevableEcartee`, `terminaleManquante`). « Notes finalisées » : comme le profil,
// `!!configuration.notesFinales`.
//
// ⛔ N'écrit RIEN, ne répare RIEN. Lecture par `db.getSync` seul : au démarrage, db.js range tout IndexedDB en mémoire ou
// dans le localStorage ; `db.get`, lui, recopie dans IndexedDB une clé qu'il n'y trouve pas (relecture du 9 nov.).
// Aucun nom d'élève, aucun DA dans la sortie : des noms de pratiques, des numéros de groupe, des titres de productions et
// des comptes. À coller dans la console de Chrome, l'application ouverte (n'importe quelle section, n'importe quel cours
// actif : le relevé lit tout A2026). Le résultat est copié dans le presse-papier (JSON) et affiché en tableaux ; la
// console rend la phrase de synthèse.
(() => {
    const lire = (cle, defaut) => { const v = db.getSync(cle, defaut); return v == null ? defaut : v; };
    const NORMALISATION = { 'alternative': 'standards', 'pan-maitrise': 'standards', 'pan-maitrise-json': 'standards', 'pan-standards': 'standards',
        'pan-objectifs': 'standards', 'pan-specifications': 'specifications', 'pan-denotation': 'denotation' };
    const famille = (t) => (t ? (NORMALISATION[t] || t) : null);
    const groupeNorm = (g) => String(g || '').padStart(5, '0');   // normaliserNumeroGroupe (modes.js)
    const inactif = (et) => !!et && (et.statut === 'inactif' || et.statut === 'décrochage' || et.statut === 'abandon');   // main.js
    // Le registre, mot pour mot (identique sur main et sur le lot).
    const nonRecevable = (e) => !!e && (e.statutIntegrite === 'plagiat' || e.statutIntegrite === 'ia');
    const nonRemise = (e) => !!e && (e.statutRemise === 'non-remis' || e.statutRemise === 'non-recu');
    const compteParElleMeme = (e) => !(e.travailEnCours === true) && e.noteFinale !== null && e.noteFinale !== undefined
        && e.verrouillee !== false && e.ponderationCouverte !== 0;
    const SORTS = ['ecarter', 'zero'];
    const sortValide = (s) => (SORTS.includes(s) ? s : null);

    const trimestres = (lire('trimestres', []) || []).filter((t) => t && (
        /^a2026/i.test(String(t.id || '')) || (String(t.session || '').toUpperCase() === 'A' && Number(t.annee) === 2026)));
    if (!trimestres.length) return 'Aucun trimestre A2026 trouvé dans « trimestres ».';

    const parPratique = {};
    const terminales = {};   // une ligne par pratique, groupe et changement
    let copiesNonRecevables = 0;
    let copiesSansGroupeCours = 0;
    let evaluationsLues = 0;
    let elevesStandardsLus = 0;

    for (const t of trimestres) {
        const evaluations = (lire(t.id + '_evaluationsSauvegardees', []) || []).filter(Boolean);
        const productions = (lire(t.id + '_productions', []) || []).filter(Boolean);
        const etudiants = (lire(t.id + '_groupeEtudiants', []) || []).filter(Boolean);
        const groupesCours = (lire(t.id + '_groupesCours', []) || []).filter(Boolean);
        const bibliotheque = (lire(t.id + '_pratiquesConfigurables', []) || []).filter(Boolean);
        evaluationsLues += evaluations.length;
        const parId = new Map(evaluations.filter((e) => e.id).map((e) => [e.id, e]));
        // originaleEstRemplacee / evaluationEntreDansLaNote (registre), sur la liste du trimestre.
        const remplacee = (e) => {
            if (!e.remplaceeParId) return false;
            if (e.reconcilieParDoublon) return true;
            const reprise = parId.get(e.remplaceeParId);
            return !reprise || compteParElleMeme(reprise);
        };
        const entreDansLaNote = (e) => !(e.remplaceeParId && remplacee(e)) && compteParElleMeme(e);

        // La pratique d'un groupe-cours : `groupesCours[].pratiqueId`, trouvée en bibliothèque (trouverPratiqueEnBibliotheque).
        const pratiqueDu = (gc) => {
            const id = gc && gc.pratiqueId;
            if (!id) return null;
            const entree = bibliotheque.find((p) => p.id === id) || bibliotheque.find((p) => p.id === famille(id))
                || bibliotheque.find((p) => famille(p.id) === famille(id)) || null;
            const configuration = entree ? (entree.configuration || entree.config || {}) : {};
            const fam = famille((entree && ((entree.configuration && entree.configuration.type) || entree.type || (entree.config && entree.config.type))) || (entree ? null : id));
            const portfolio = configuration.portfolio || null;
            const hybride = !!(configuration.categories && configuration.categories.actif);
            const regleEcrite = sortValide(configuration.sortCopieNonRecevable);
            return {
                cle: t.id + ' · ' + ((entree && entree.nom) || id) + ' (' + ((entree && entree.id) || id) + ')',
                famille: fam || '(illisible)',
                regleEcrite,
                // sortCopieNonRecevableDeLaPratique (lot) : la règle écrite, sinon le comportement d'avant.
                regle: regleEcrite || (fam === 'denotation' ? null : (fam === 'standards' ? 'ecarter' : 'zero')),
                notesFinales: !!configuration.notesFinales,
                hybride,
                modeSelection: fam === 'standards' ? (hybride ? 'hybride' : ((portfolio && portfolio.methodeSelection) || 'meilleurs')) : null
            };
        };
        const ligneDe = (p) => parPratique[p.cle] || (parPratique[p.cle] = {
            pratique: p.cle, famille: p.famille, regle: p.regleEcrite ? p.regleEcrite + ' (écrite)' : (p.regle || '—') + ' (lue, sans règle écrite)',
            notesFinales: p.notesFinales, modeSelection: p.modeSelection || '', groupes: [],
            nonRecevables: 0, plagiat: 0, ia: 0, terminale: 0, obligatoire: 0, auPool: 0, autre: 0,
            avecRepriseAccordee: 0, choixDejaSurLaCopie: 0, verrouillees: 0 });
        const nomGroupe = (gc) => (gc.modeCours ? 'cours' : String(gc.groupeNum || '?'));

        // Le groupe-cours d'une copie : le sien s'il est écrit ; sinon celui de son cours, départagé par le groupe de l'élève.
        const groupeCoursDe = (e) => {
            if (e.groupeCoursId) { const gc = groupesCours.find((g) => g.id === e.groupeCoursId); if (gc) return gc; }
            const candidats = groupesCours.filter((g) => g.coursId && g.coursId === e.coursId);
            if (candidats.length === 1) return candidats[0];
            if (candidats.length > 1) {
                const et = etudiants.find((x) => x.da === e.etudiantDA && (!x.coursId || x.coursId === e.coursId));
                if (et && et.groupeCoursId) { const gc = candidats.find((g) => g.id === et.groupeCoursId); if (gc) return gc; }
                const groupe = e.groupe || (et && (et.groupe || et.groupeReel));
                if (groupe) { const gc = candidats.find((g) => g.groupeNum && groupeNorm(g.groupeNum) === groupeNorm(groupe)); if (gc) return gc; }
            }
            return null;
        };
        const productionDe = (id) => productions.find((p) => p.id === id) || null;

        // 1. — les copies non recevables, rangées sous la pratique de leur groupe-cours.
        evaluations.filter(nonRecevable).forEach((e) => {
            copiesNonRecevables++;
            const gc = groupeCoursDe(e);
            const p = gc ? pratiqueDu(gc) : null;
            if (!p) { copiesSansGroupeCours++; return; }
            const l = ligneDe(p);
            if (!l.groupes.includes(nomGroupe(gc))) l.groupes.push(nomGroupe(gc));
            l.nonRecevables++;
            l[e.statutIntegrite]++;
            if (e.remplaceeParId) l.avecRepriseAccordee++;
            if (e.sortCopieNonRecevable) l.choixDejaSurLaCopie++;
            if (e.verrouillee === true) l.verrouillees++;
            const prod = productionDe(e.productionId);
            l[!prod ? 'autre' : (prod.type === 'terminale' ? 'terminale'
                : ((p.hybride && prod.categorie === 'obligatoire') ? 'obligatoire' : (p.famille === 'standards' ? 'auPool' : 'autre')))]++;
        });

        // 2. — standards : la note de terminale de chaque élève, avant le lot et après.
        groupesCours.forEach((gc) => {
            const p = pratiqueDu(gc);
            if (!p || p.famille !== 'standards') return;
            const terminale = productions.find((x) => x.type === 'terminale' && (!x.coursId || x.coursId === gc.coursId)) || null;
            if (!terminale) return;
            const duGroupe = etudiants.filter((et) => et.da && (et.groupeCoursId ? et.groupeCoursId === gc.id
                : ((!et.coursId || et.coursId === gc.coursId) && (gc.modeCours || !gc.groupeNum || groupeNorm(et.groupe || et.groupeReel) === groupeNorm(gc.groupeNum)))));
            duGroupe.forEach((et) => {
                elevesStandardsLus++;
                const copies = evaluations.filter((e) => e.etudiantDA === et.da && e.productionId === terminale.id);
                const sortDe = (e) => sortValide(e.sortCopieNonRecevable) || sortValide(p.regle) || 'zero';
                const ecartee = (e) => nonRecevable(e) && sortDe(e) === 'ecarter';
                // Avant (main) : la première copie qui entre dans la note ; non recevable, 0 ; sinon provisoire.
                const avantCopie = copies.find(entreDansLaNote) || null;
                const avant = avantCopie ? (nonRecevable(avantCopie) ? 0 : avantCopie.noteFinale) : null;
                // Après (lot) : une copie écartée n'entre pas ; manquante (non remise ou écartée) aux notes finales : 0.
                const apresCopie = copies.find((e) => entreDansLaNote(e) && !ecartee(e)) || null;
                const manquante = copies.filter((e) => !(e.remplaceeParId && remplacee(e))).every((e) => nonRemise(e) || ecartee(e));
                const apres = apresCopie ? (nonRecevable(apresCopie) ? 0 : apresCopie.noteFinale) : ((p.notesFinales && manquante) ? 0 : null);
                if (avant === apres) return;
                const dit = (v) => (v === null ? 'provisoire' : (v === 0 ? '0' : 'une note'));
                const cause = !copies.length ? 'aucune copie'
                    : (copies.some((e) => nonRecevable(e) && e.remplaceeParId && !remplacee(e)) ? 'non recevable, reprise accordée pas encore évaluée'
                        : (copies.some(nonRecevable) ? 'non recevable' : (copies.every(nonRemise) ? 'non remise' : 'autre')));
                const cle = [p.cle, nomGroupe(gc), dit(avant) + ' → ' + dit(apres), cause].join('|');
                const l = terminales[cle] || (terminales[cle] = { pratique: p.cle, groupe: nomGroupe(gc), terminale: terminale.titre || terminale.nom || '?',
                    notesFinales: p.notesFinales, changement: dit(avant) + ' → ' + dit(apres), cause, eleves: 0, dontInactifs: 0 });
                l.eleves++;
                if (inactif(et)) l.dontInactifs++;
            });
        });
    }

    const lignes = Object.values(parPratique).map((l) => Object.assign({}, l, { groupes: l.groupes.join(', ') }));
    const parFamille = {};
    lignes.forEach((l) => {
        const f = parFamille[l.famille] || (parFamille[l.famille] = { famille: l.famille, pratiques: 0, nonRecevables: 0, terminale: 0, obligatoire: 0, auPool: 0, autre: 0 });
        f.pratiques++;
        ['nonRecevables', 'terminale', 'obligatoire', 'auPool', 'autre'].forEach((k) => { f[k] += l[k]; });
    });
    const changements = Object.values(terminales);
    const compte = (changement) => changements.filter((l) => l.changement === changement).reduce((s, l) => s + l.eleves, 0);
    const resume = {
        releve: '#1176 — copies non recevables et terminales des standards, A2026, lecture seule',
        date: new Date().toISOString(),
        version: (window.__VERSION__ && window.__VERSION__.beta) || null,
        trimestres: trimestres.map((t) => t.id),
        evaluationsLues,
        copiesNonRecevables,
        copiesSansGroupeCoursRetrouve: copiesSansGroupeCours,
        parFamille: Object.values(parFamille),
        parPratique: lignes,
        standardsElevesLus: elevesStandardsLus,
        standardsTerminalesQuiChangent: changements,
        ceQuiBouge: {
            terminalesDe0AProvisoire: compte('0 → provisoire'),
            terminalesDeProvisoireA0: compte('provisoire → 0'),
            autresChangements: changements.filter((l) => l.changement !== '0 → provisoire' && l.changement !== 'provisoire → 0').reduce((s, l) => s + l.eleves, 0),
            depistage: copiesNonRecevables + ' copie(s) non recevable(s) : le dépistage lisait leur note calculée ; il lira 0, '
                + 'ou les laissera de côté si elles sont écartées (un niveau RàI peut bouger, pas une note)'
        }
    };
    try { copy(JSON.stringify(resume, null, 2)); } catch (e) { /* hors console Chrome */ }
    console.table(Object.values(parFamille));
    console.table(lignes);
    if (changements.length) console.table(changements);
    return 'Copié : ' + copiesNonRecevables + ' copie(s) non recevable(s) sur ' + evaluationsLues + ' évaluation(s) d\'A2026, dans '
        + lignes.length + ' pratique(s)' + (copiesSansGroupeCours ? ' (' + copiesSansGroupeCours + ' sans groupe-cours retrouvé)' : '')
        + '. Standards, terminale (' + elevesStandardsLus + ' élève(s) lus) : ' + resume.ceQuiBouge.terminalesDe0AProvisoire + ' de 0 à provisoire ; '
        + resume.ceQuiBouge.terminalesDeProvisoireA0 + ' de provisoire à 0 ; ' + resume.ceQuiBouge.autresChangements + ' autre(s) changement(s).';
})();
