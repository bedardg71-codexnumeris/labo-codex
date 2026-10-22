/**
 * SENTINELLE #871 (volet complétion) — LA FRACTION DE COMPLÉTION COMPTE CE QUE COMPTE L'INDICE C.
 *
 * Mesuré le 17 sept. 2026 sur le pack démo (WebKit, 1.142.21) : 4 élèves sur 10 lisaient « 80% » à côté de
 * « 7 / 9 ». Deux règles, pas deux lecteurs : l'indice C de la pratique compte l'évaluation terminale, les
 * fractions du rapport et du profil ne comptaient que les artefacts du portfolio
 * (`obtenirIdsProductionsEvaluables`, l'ensemble de la note P). Tranché par Grégoire : « le pourcentage doit
 * suivre la fraction » (15 sept.) ; « l'évaluation terminale est une remise que la complétion suit » (17 sept.).
 *
 * Le correctif : chaque pratique expose `calculerDetailsCompletion(da)` → { remis, total } ; son
 * `calculerCompletion` en DÉCOULE ; `obtenirDetailsCompletion` (portfolio.js) le rend pour la pratique qui a
 * calculé C ; le rapport et les deux sites du profil le lisent et ne comptent plus rien eux-mêmes.
 *
 * Ce banc monte les modules RÉELS (bac du Suivi) sur neuf artefacts et une évaluation terminale :
 * Assidu a remis huit artefacts et pas la terminale (8 / 10, 80 %) ; le témoin a tout remis (10 / 10).
 * Les valeurs de C sont celles de `ae7ad6f7` (avant le lot), figées ici : l'indice ne bouge pour personne.
 *
 * Break-tests attendus : un site qui recompte à part ; la terminale retirée du dénominateur ; C calculé
 * hors du détail ; une famille sans la méthode (registre). Voir le relais du 17 sept. pour le compte joué.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, clone, RACINE } from './_helpers/bac-suivi.js';

const source = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const DA = { ASSIDU: '2000001', TEMOIN: '2000002' };
const ARTEFACTS = Array.from({ length: 9 }, (_, i) => ({
    id: 'A' + (i + 1), titre: 'Artefact ' + (i + 1), description: 'Artefact ' + (i + 1), type: 'artefact-portfolio',
    ponderation: 0, dateEcheance: '2026-02-' + String(i + 1).padStart(2, '0'), coursId: 'GC1'
}));
const PRODUCTIONS = [{ id: 'PF', titre: 'Portfolio', type: 'portfolio', ponderation: 70, coursId: 'GC1' }]
    .concat(ARTEFACTS, [{ id: 'T1', titre: 'Évaluation terminale', type: 'terminale', ponderation: 30, dateEcheance: '2026-05-01', coursId: 'GC1' }]);

const E0 = { id: 'E0', nom: 'IDME0 banc', seuilMaitrise: 'M', niveaux: [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64, valeurCalcul: 40, couleur: '#aa0000' }, { code: 'D', nom: 'En développement', min: 65, max: 74, valeurCalcul: 65, couleur: '#aa8800' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84, valeurCalcul: 75, couleur: '#00aa00' }, { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100, couleur: '#0000aa' }
] };

const ev = (da, prodId, extra) => Object.assign({
    id: 'E-' + da + '-' + prodId, etudiantDA: da, productionId: prodId, noteFinale: 80, niveauFinal: 'M', echelleId: 'E0', ponderationCouverte: 100,
    verrouillee: true, coursId: 'GC1', groupe: '01', dateEvaluation: '2026-03-01T12:00:00.000Z', statutIntegrite: 'recevable', statutRemise: 'evalue', criteres: []
}, extra || {});

/** Assidu : A1 à A8 remis, A9 et la terminale manquent. Le témoin : tout. */
function copies() {
    const l = [];
    ARTEFACTS.slice(0, 8).forEach(a => l.push(ev(DA.ASSIDU, a.id)));
    ARTEFACTS.forEach(a => l.push(ev(DA.TEMOIN, a.id)));
    l.push(ev(DA.TEMOIN, 'T1'));
    return l;
}

const MODULES = ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/pratiques/pratique-configurable.js',
    'js/pratiques/pratique-registre.js', 'js/pratiques/pratique-manager.js', 'js/pratiques/pratique-sommative.js',
    'js/pratiques/pratique-pan-standards.js', 'js/pratiques/pratique-pan-specifications.js',
    'js/pratiques/denotation-jugements.js', 'js/portfolio.js', 'js/indices.js', { chemin: 'js/saisie-presences.js', internes: [] },
    'js/profil-etudiant-actions.js', 'js/profil-etudiant-calculs.js', 'js/profil-etudiant-helpers.js', 'js/profil-etudiant-rapport.js',
    { chemin: 'js/profil-etudiant-sections-affichage.js', internes: ['genererSectionMobilisationEngagement'] }];
const OBJETS_EXPORTES = ['PratiqueManager', 'denotationJugements', 'modalitesEvaluation', 'profilActuelDA', 'etudiantsListeCache', 'PRATIQUE_DEFAUT', 'SEUILS_PAR_DEFAUT', '__audit'];

function banc(evaluations, productions = PRODUCTIONS, pratiqueActive = 'std-banc') {
    const store = storeBase();
    store.test_groupeEtudiants = store.test_groupeEtudiants.filter(e => e.da === DA.ASSIDU || e.da === DA.TEMOIN);
    // La pratique ACTIVE est une configurable de type « standards », comme `demo-std-litt` sur le pack démo :
    // c'est sous ce type que l'ancien compteur ne gardait que les artefacts du portfolio.
    store.test_groupesCours[0].pratiqueId = pratiqueActive;
    store.test_pratiquesConfigurables = [{ id: 'std-banc', nom: 'STD banc', type: 'standards', calcul_note: { methode: 'conversion_niveaux' }, dansBibliotheque: true,
        configuration: { type: 'standards', approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: 'G1',
            portfolio: { utiliser: true, nombreARetenir: 3, minimumCompletion: 1, methodeSelection: 'meilleurs', reglesConformite: { actif: false } }, notesFinales: false } }];
    store.test_echellesTemplates = [clone(E0)];
    store.test_productions = clone(productions);
    store.test_evaluationsSauvegardees = clone(evaluations);
    let win = null;
    const classe = (nom) => function (config) { return new win[nom](config); };
    const b = monter(store, {
        modules: MODULES, objetsExportes: OBJETS_EXPORTES, aujourdhui: '2026-05-15',
        globaux: {
            PratiqueConfigurable: classe('PratiqueConfigurable'), PratiqueSommative: classe('PratiqueSommative'), PratiquePANStandards: classe('PratiquePANStandards'),
            // Copie de productions.js:152 (pure), comme au banc du lot A.
            obtenirEcheanceEffective: (production, gcId) => {
                if (production.echeancesParGroupe && gcId) { const e = production.echeancesParGroupe[gcId]; if (e) return { date: e.date || null, assignee: e.assignee !== false }; }
                return { date: production.dateEcheance || null, assignee: true };
            },
            resoudreModeleParId: (type, id) => { const l = store['test_' + (type === 'echelle' ? 'echellesTemplates' : 'grillesTemplates')] || []; return clone(l.find(m => m && m.id === id) || null); },
            obtenirInterventionsEtudiant: () => [], aDesInfosConfidentielles: () => false,
            obtenirTermeProduction: (c, maj) => { const t = c === 'pluriel' ? 'artefacts' : 'artefact'; return maj ? t[0].toUpperCase() + t.slice(1) : t; }, accordTermeProduction: (m) => m
        }
    });
    win = b.win;
    win.calculerEtSauvegarderIndicesAssiduite();
    win.calculerEtStockerIndicesCP();
    return b;
}

const compte = (d) => (d ? { remis: d.remis, total: d.total } : d);
const texte = (html) => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
function sites(win, da) {
    const rapport = String(win.genererRapportAPI(da, { completion: true })).split('\n').find(l => l.startsWith('Complétion')) || null;
    const html = win.__audit['profil-etudiant-sections-affichage.js'].genererSectionMobilisationEngagement(da);
    const profil = texte(html);
    return {
        C: win.calculerTousLesIndices(da).C, rapport,
        methodo: (profil.match(/Indice C = \d+ % — \d+ productions? remises? \/ \d+ productions? au total/) || [null])[0],   // #1137 : texte() ramène l'insécable à une espace
        carte: (profil.match(/• Productions remises : \d+\/\d+/) || [null])[0],
        intitule: (profil.match(/\d+ productions? non remises? ou non recevables?/) || [null])[0],
        remis: (profil.match(/\d+ artefacts? remis(?! :)/) || [null])[0],
        message: /Toutes les productions sont remises !/.test(profil),
        ancienMessage: /Tous les artefacts remis/.test(profil),
        nonRemises: [...String(html).matchAll(/class="badge-completion-non-(?:remis|recevable)"[\s\S]*?<span class="badge-completion-titre">\s*([^<]*?)\s*<\/span>/g)].map(m => m[1]),
        pastillesRemises: [...String(html).matchAll(/class="badge-completion-remis"[\s\S]*?<span class="badge-completion-titre">\s*([^<]*?)\s*<\/span>/g)].map(m => m[1])
    };
}
/** Le texte de la SEULE carte Complétion (la carte Assiduité écrit aussi « En attente de données »). */
function carteCompletion(win, da) {
    const t = texte(win.__audit['profil-etudiant-sections-affichage.js'].genererSectionMobilisationEngagement(da));
    const i = t.indexOf('• Productions remises'), j = t.indexOf('Performance', i);
    expect(i).toBeGreaterThan(-1); expect(j).toBeGreaterThan(i);
    return t.slice(i, j);
}
function spe(win) {
    const p = new win.PratiquePanSpecifications();
    p.config.typesTravaux = [{ id: 'artefact-portfolio', nom: 'Artefact', seuilAcceptable: 60 }, { id: 'terminale', nom: 'Terminale', seuilAcceptable: 60 }];
    return p;
}

describe('#871 · complétion : la fraction compte ce que compte l\'indice C', () => {
    it('(a) la terminale manque : « 80% » et « 8 / 10 » au rapport, à la Méthodologie et à la carte du profil — C inchangé (80, valeur de ae7ad6f7)', () => {
        const { win } = banc(copies());
        expect(win.obtenirDetailsCompletion(DA.ASSIDU)).toMatchObject({ remis: 8, total: 10 });
        const s = sites(win, DA.ASSIDU);
        expect(s.C).toBe(80);
        expect(s.rapport).toBe('Complétion : 80\u00A0% (8 remises / 10 productions)');
        expect(s.methodo).toBe('Indice C = 80 % — 8 productions remises / 10 productions au total');
        expect(s.carte).toBe('• Productions remises : 8/10');
    });

    it('(b) tout est remis : « 100% » et « 10 / 10 » aux trois sites', () => {
        const { win } = banc(copies());
        const s = sites(win, DA.TEMOIN);
        expect(s.C).toBe(100);
        expect(s.rapport).toBe('Complétion : 100\u00A0% (10 remises / 10 productions)');
        expect(s.methodo).toBe('Indice C = 100 % — 10 productions remises / 10 productions au total');
        expect(s.carte).toBe('• Productions remises : 10/10');
    });

    it('(c) aucune production évaluée : le détail est null, l\'écriture reste « 0% (0 remises / 0 productions) »', () => {
        const { win } = banc([]);
        expect(win.obtenirDetailsCompletion(DA.ASSIDU)).toBe(null);
        const s = sites(win, DA.ASSIDU);
        expect(s.C).toBe(0);
        expect(s.rapport).toBe('Complétion : 0\u00A0% (0 remises / 0 productions)');
        expect(s.methodo).toBe('Indice C = 0 % — 0 production remise / 0 production au total');
        expect(s.carte).toBe('• Productions remises : 0/0');
    });

    it('(d) les quatre familles et la pratique de test : l\'indice EST le quotient du détail, et vaut ce qu\'il valait à ae7ad6f7', () => {
        const { win } = banc(copies());
        const speHaut = spe(win);      // palier le plus haut : 9 artefacts + 1 terminale
        speHaut.config.tableBundles = [{ noteFixe: 100, label: 'A', requis: { 'artefact-portfolio': 9, terminale: 1 } }, { noteFixe: 60, label: 'C', requis: { 'artefact-portfolio': 5 } }];
        const familles = {
            configurable: win.obtenirPratiqueParId('std-banc'), sommative: new win.PratiqueSommative(),
            standards: new win.PratiquePANStandards(), specifications: speHaut
        };
        // Valeurs de ae7ad6f7, mesurées avant le lot sur ce même banc (harnais HEAD contre disque, 17 sept.).
        const AVANT = { configurable: [0.8, 1], sommative: [0.8, 1], standards: [0.8, 1], specifications: [0.8, 1] };
        Object.keys(familles).forEach(nom => {
            const p = familles[nom];
            const d1 = p.calculerDetailsCompletion(DA.ASSIDU), d2 = p.calculerDetailsCompletion(DA.TEMOIN);
            expect([nom, compte(d1), compte(d2)]).toEqual([nom, { remis: 8, total: 10 }, { remis: 10, total: 10 }]);
            // Lot 30 : le détail dit LESQUELLES, sauf les spécifications (des travaux acceptables par type, plafonnés).
            if (nom === 'specifications') expect([nom, d1.productions]).toEqual([nom, undefined]);
            else {
                expect([nom, d1.productions.length, d1.productions.filter(p => p.remis).length]).toEqual([nom, d1.total, d1.remis]);
                expect([nom, d1.productions.filter(p => !p.remis).map(p => p.id).sort()]).toEqual([nom, ['A9', 'T1']]);
            }
            expect([nom, p.calculerCompletion(DA.ASSIDU), p.calculerCompletion(DA.TEMOIN)]).toEqual([nom].concat(AVANT[nom]));
            expect(p.calculerCompletion(DA.ASSIDU)).toBe(d1.remis / d1.total);
        });
        // #469 (lot 12, 11 oct. 2026) : la pratique factice « test » (`pratique-test.js`) est retirée, ses trois essais avec elle.
    });

    it('(e) la fraction SUIT la règle de chaque famille, elle ne la corrige pas : un artefact dû plus tard entre au dénominateur des standards (8 / 11), pas à celui des autres ; le surplus des spécifications est plafonné (7 / 7)', () => {
        const futur = { id: 'A10', titre: 'Artefact 10', type: 'artefact-portfolio', ponderation: 0, dateEcheance: '2027-01-15', coursId: 'GC1' };
        const { win } = banc(copies(), PRODUCTIONS.concat([futur]));
        const std = new win.PratiquePANStandards();
        expect(compte(std.calculerDetailsCompletion(DA.ASSIDU))).toEqual({ remis: 8, total: 11 });
        expect(std.calculerCompletion(DA.ASSIDU)).toBe(8 / 11);                       // valeur de ae7ad6f7 : 0,7272…
        expect(compte(new win.PratiqueSommative().calculerDetailsCompletion(DA.ASSIDU))).toEqual({ remis: 8, total: 10 });
        expect(compte(win.obtenirDetailsCompletion(DA.ASSIDU))).toEqual({ remis: 8, total: 10 });   // la pratique active (configurable)
        const speBas = spe(win);       // palier le plus haut : 6 artefacts + 1 terminale — le témoin en a 9 + 1
        speBas.config.tableBundles = [{ noteFixe: 100, label: 'A', requis: { 'artefact-portfolio': 6, terminale: 1 } }];
        expect(speBas.calculerDetailsCompletion(DA.TEMOIN)).toEqual({ remis: 7, total: 7 });
        expect(speBas.calculerCompletion(DA.TEMOIN)).toBe(1);                         // valeur de ae7ad6f7 : plafonnée à 1
        expect(speBas.calculerCompletion(DA.ASSIDU)).toBe(1);                         // 8 acceptables pour 7 attendus : plafonné aussi
    });

    it('(f) le registre exige la méthode : une pratique sans `calculerDetailsCompletion` est refusée, nommément', () => {
        const { win } = banc(copies());
        const complete = { obtenirNom: () => 'X', obtenirId: () => 'x-871', obtenirDescription: () => '', calculerPerformance: () => null, calculerCompletion: () => null,
            calculerDetailsCompletion: () => null, detecterDefis: () => [], identifierPattern: () => null, genererCibleIntervention: () => null };
        expect(() => win.enregistrerPratique('x-871', complete)).not.toThrow();
        const sans = Object.assign({}, complete, { obtenirId: () => 'y-871' }); delete sans.calculerDetailsCompletion;
        expect(() => win.enregistrerPratique('y-871', sans)).toThrow(/calculerDetailsCompletion/);
    });

    it('(h) lot 30 · la terminale SEULE manque : « 9/10 », « 1 production non remise ou non recevable », la terminale DANS la liste, aucun message', () => {
        const l = copies(); l.push(ev(DA.ASSIDU, 'A9'));                                  // Assidu : ses neuf artefacts, pas la terminale
        const { win } = banc(l);
        const s = sites(win, DA.ASSIDU);
        expect(s.C).toBe(90);
        expect(s.carte).toBe('• Productions remises : 9/10');
        expect(s.methodo).toBe('Indice C = 90 % — 9 productions remises / 10 productions au total');
        expect(s.intitule).toBe('1 production non remise ou non recevable');
        expect(s.nonRemises).toEqual(['Évaluation terminale']);
        expect(s.remis).toBe('9 artefacts remis');                                        // les pastilles des remis restent des artefacts
        expect([s.message, s.ancienMessage]).toEqual([false, false]);
        expect(s.rapport).toBe('Complétion : 90\u00A0% (9 remises / 10 productions)');         // le rapport ne change pas
    });

    it('(i) lot 30 · deux manquent : accord au pluriel, les deux dans la liste ; tout remis : « Toutes les productions sont remises ! » et « 10/10 »', () => {
        const { win } = banc(copies());
        const s = sites(win, DA.ASSIDU);
        expect(s.intitule).toBe('2 productions non remises ou non recevables');
        expect(s.nonRemises.sort()).toEqual(['Artefact 9', 'Évaluation terminale']);
        expect(s.message).toBe(false);
        const t = sites(win, DA.TEMOIN);
        expect([t.carte, t.intitule, t.nonRemises, t.message, t.ancienMessage]).toEqual(['• Productions remises : 10/10', '0 production non remise ou non recevable', [], true, false]);
    });

    it('(j) lot 30 · un BROUILLON n\'est pas une remise, nulle part sur la carte : hors des pastilles des remis, dans les non-remises (DEMO004, Artefact 7)', () => {
        const l = copies(); l.push(ev(DA.ASSIDU, 'A9', { verrouillee: false })); l.push(ev(DA.ASSIDU, 'T1'));
        const { win } = banc(l);
        const s = sites(win, DA.ASSIDU);
        expect(s.carte).toBe('• Productions remises : 9/10');
        expect(s.nonRemises).toEqual(['Artefact 9']);
        expect(s.pastillesRemises).not.toContain('Artefact 9');
        expect(s.remis).toBe('8 artefacts remis');
    });

    it('(k) lot 30 · aucune production évaluée : l\'affichage d\'avant, inchangé (« En attente de données », aucune liste)', () => {
        const { win } = banc([]);
        const html = carteCompletion(win, DA.ASSIDU);
        expect(html).toContain('0 production non remise ou non recevable');
        expect(html).toContain('En attente de données');
        expect(html).not.toContain('Toutes les productions sont remises');
    });

    it('(m) lot 30 · seule la terminale est évaluée, et remise : « 1/1 » et « Toutes les productions sont remises ! », pas « En attente de données »', () => {
        // Aucun artefact évalué : l'ancien test (« zéro artefact listé ») aurait écrit « En attente de données » sous « 1/1 ».
        const { win } = banc([ev(DA.TEMOIN, 'T1')]);
        const t = sites(win, DA.TEMOIN);
        expect([t.carte, t.message]).toEqual(['• Productions remises : 1/1', true]);
        expect(carteCompletion(win, DA.TEMOIN)).not.toContain('En attente de données');
        const a = sites(win, DA.ASSIDU);                                                  // lui ne l'a pas remise
        expect([a.carte, a.nonRemises, a.message]).toEqual(['• Productions remises : 0/1', ['Évaluation terminale'], false]);
    });

    it('(o) lot 30 · une copie NON RECEVABLE n\'est pas une remise (tranché par Grégoire, 17 sept.) : « 9/10 », la copie dans les non-remises AVEC sa pastille d\'alerte, hors des remis', () => {
        const l = copies(); l.push(ev(DA.ASSIDU, 'A9', { noteFinale: 0, statutIntegrite: 'plagiat' })); l.push(ev(DA.ASSIDU, 'T1'));
        const { win } = banc(l);
        const s = sites(win, DA.ASSIDU);
        expect([s.C, s.carte, s.intitule]).toEqual([90, '• Productions remises : 9/10', '1 production non remise ou non recevable']);
        expect(s.nonRemises).toEqual(['Artefact 9']);
        expect(s.pastillesRemises).not.toContain('Artefact 9');
        const html = String(win.__audit['profil-etudiant-sections-affichage.js'].genererSectionMobilisationEngagement(DA.ASSIDU));
        expect((html.match(/class="badge-completion-non-recevable"/g) || []).length).toBe(1);
        expect(html).toContain('title="Plagiat détecté"');
        expect(s.rapport).toBe('Complétion : 90\u00A0% (9 remises / 10 productions)');
    });

    it('(n) lot 30 · seulement un BROUILLON : « 0/0 » et « En attente de données », jamais « Toutes les productions sont remises ! »', () => {
        const { win } = banc([ev(DA.ASSIDU, 'A1', { verrouillee: false })]);
        const c = carteCompletion(win, DA.ASSIDU);
        expect(c).toContain('• Productions remises : 0/0');
        expect(c).toContain('En attente de données');
        expect(c).not.toContain('Toutes les productions sont remises');
    });

    it('(l) relecture du lot 27 (L1) · `obtenirDetailsCompletion` rend le détail de la pratique ACTIVE, pas celui de la sommative : standards d\'origine, un travail dû plus tard → 8 / 11', () => {
        // À LA MAIN : sous les standards d'origine, un travail assigné entre au dénominateur dès qu'il a une échéance,
        // noté ou non : 9 artefacts + A10 (dû en 2027) + la terminale = 11. La sommative, elle, ne compte que les
        // productions déjà évaluées : 10. Un `obtenirDetailsCompletion` qui résoudrait TOUJOURS la sommative rendrait 8 / 10.
        const futur = { id: 'A10', titre: 'Artefact 10', description: 'Artefact 10', type: 'artefact-portfolio', ponderation: 0, dateEcheance: '2027-01-15', coursId: 'GC1' };
        const { win } = banc(copies(), PRODUCTIONS.concat([futur]));
        // ↻ Lot N1a (21 sept. 2026) : un pointeur « standards » nu ne mène plus à aucune pratique (aucun repli, #711).
        // Le témoin reste l'instance Standards du registre — la seule dont la règle de complétion diffère de la
        // sommative —, posée comme pratique RÉSOLUE : ce que l'essai verrouille, c'est que le détail suit la
        // pratique que rend LA résolution, pas une sommative câblée en dur.
        const standardsDuRegistre = win.obtenirPratiqueParId('standards');
        win.resoudrePratiqueActive = () => ({ etat: 'ok', idBrut: 'standards', id: 'standards', donnees: null, configuration: null, pratique: standardsDuRegistre });
        expect(compte(win.obtenirDetailsCompletion(DA.ASSIDU))).toEqual({ remis: 8, total: 11 });
        expect(compte(new win.PratiqueSommative().calculerDetailsCompletion(DA.ASSIDU))).toEqual({ remis: 8, total: 10 });   // le témoin : les deux règles diffèrent bien
        const s = sites(win, DA.ASSIDU);
        expect(s.carte).toBe('• Productions remises : 8/11');
        expect(s.nonRemises.sort()).toEqual(['Artefact 10', 'Artefact 9', 'Évaluation terminale']);
    });

    it('(g) verrou structurel : aucun site d\'affichage ne recompte, et chaque `calculerCompletion` découle du détail', () => {
        const rapport = source('js/profil-etudiant-rapport.js');
        expect((rapport.match(/obtenirDetailsCompletion\(da\)/g) || []).length).toBe(1);
        expect(/obtenirIdsProductionsEvaluables\s*\(/.test(rapport)).toBe(false);
        expect(/evaluationNonRemise\s*\(/.test(rapport)).toBe(false);
        expect(rapport).toContain('(${detailsC.remis} remises / ${detailsC.total} productions)');
        const sections = source('js/profil-etudiant-sections-affichage.js');
        const debut = sections.indexOf('function genererSectionMobilisationEngagement(da)');
        const corps = sections.slice(debut, sections.indexOf('\nfunction ', debut + 10));
        expect(corps.length).toBeGreaterThan(5000);                                   // la tranche n'est pas vide
        // ↻ Lot N1b (21 sept. 2026) : une complétion inconnue (sans pratique assignée) s'écrit d'un tiret — la fraction reste celle du détail.
        expect((corps.match(/Indice C = \$\{indices\.C === null \? '—' : formaterPourcentage\(indices\.C\)\} — \$\{detailsC\.remis\}/g) || []).length).toBe(1);
        expect((corps.match(/\$\{detailsC\.remis\}\/\$\{detailsC\.total\}/g) || []).length).toBe(1);
        expect(/\$\{nbRemis\}\s*\/\s*\$\{nbTotal\}/.test(corps)).toBe(false);
        ['configurable', 'sommative', 'pan-standards', 'pan-specifications'].forEach(f => {
            const src = source('js/pratiques/pratique-' + f + '.js');
            const i = src.indexOf('    calculerCompletion(da) {');
            const methode = src.slice(i, src.indexOf('\n    }\n', i));
            expect([f, (src.match(/^    calculerDetailsCompletion\(da\) \{/gm) || []).length]).toEqual([f, 1]);
            expect([f, /const details = this\.calculerDetailsCompletion\(da\);\s*return details \? details\.remis \/ details\.total : null;/.test(methode)]).toEqual([f, true]);
            expect([f, methode.split('\n').length <= 4]).toEqual([f, true]);              // elle divise, elle ne compte pas
        });
    });
});
