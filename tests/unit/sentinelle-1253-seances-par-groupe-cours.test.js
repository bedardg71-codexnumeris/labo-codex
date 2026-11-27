import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #1253 — LE COMPTE DE SÉANCES, PAR GROUPE-COURS (décisions de Grégoire, 27 nov. 2026, 12 h 10 et 12 h 13).
//
// Ce qu'il a vu : dans Cadre › Trimestre, « Trimestre : 15 semaines • 30 jours de cours » alors qu'aucun trimestre
// n'existait plus (après la sortie de la démo). Mesuré sous Chromium le 27 nov. : à la sortie de la démo sans trimestre
// à rendre, rien ne redessine la ligne, qui garde les chiffres de la démo ; « 15 • 30 » est exactement ce que donne
// l'horaire de la démo d'avant le troisième groupe (lundi et mercredi). Après un rechargement, elle dit « 0 semaines
// • 0 jours de cours ».
//
// Ses mots : « le nombre de jours de cours doit correspondre au nombre de séances. Pour chaque groupe. » Un jour de
// cours du calendrier n'est une séance que pour le groupe qui a cours ce jour-là : le calendrier marque « cours » la
// réunion des jours de TOUS les groupes. D'où :
//   1. le nombre de séances d'un groupe-cours se compte sur SON horaire posé sur le calendrier du trimestre, journées
//      sans cours retirées, reprises comptées (`seancesPrevuesDuGroupeCours`, js/horaire.js), par la même règle que
//      les séances complètes (`calculerSeancesCompletes`) ; ses semaines, sur ses séances (la mesure contraire est
//      dans la démo : voir 1 bis) ;
//   2. il paraît sur la fiche du groupe-cours (« 15 semaines • 30 séances »), rien sans horaire ni pour un service ;
//   3. la ligne du trimestre ne garde que les semaines, et ne paraît pas sans trimestre.
// Noms fictifs. Break-test : journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(RACINE, rel), 'utf8');
const clone = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));

// Deux semaines de cours, du lundi 24 août au vendredi 4 septembre 2026 : rien de spécial.
const CADRE = { dateDebut: '2026-08-24', finCours: '2026-09-04', finTrimestre: '2026-09-04' };
const H_DEUX = { id: 'H_DEUX', nom: 'Lun / Jeu', periodesParSeance: 2, seances: [
    { id: 'S1', lettre: 'A', jour: 'Lundi', heureDebut: '08:00', heureFin: '09:40' },
    { id: 'S2', lettre: 'B', jour: 'Jeudi', heureDebut: '08:00', heureFin: '09:40' }] };
const H_UNE = { id: 'H_UNE', nom: 'Mar', periodesParSeance: 3, seances: [
    { id: 'S3', lettre: 'A', jour: 'Mardi', heureDebut: '13:00', heureFin: '15:30' }] };
const GC_DEUX = { id: 'GC_DEUX', trimestreId: 'a2026', coursId: 'C1', groupeNum: '00001', horaireId: 'H_DEUX' };
const GC_UNE = { id: 'GC_UNE', trimestreId: 'a2026', coursId: 'C1', groupeNum: '00002', horaireId: 'H_UNE' };

const cle = (k) => 'a2026_' + k;

function classes() {
    const s = new Set();
    return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)),
        contains: (c) => s.has(c), toggle: (c, force) => { const on = force === undefined ? !s.has(c) : !!force; if (on) s.add(c); else s.delete(c); return on; } };
}
function elementDom(id) {
    return { id, _html: '', textContent: '', value: '', style: {}, dataset: {}, options: [],
        get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
        classList: classes(), querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {},
        appendChild(c) { return c; }, setAttribute() {}, getAttribute() { return null; }, closest() { return null; }, focus() {} };
}
function fauxDocument(elements) {
    return { getElementById: (id) => (elements[id] || (elements[id] = elementDom(id))), querySelector: () => null, querySelectorAll: () => [],
        createElement: (t) => elementDom(t), addEventListener() {}, body: elementDom('body'), documentElement: { addEventListener() {} }, readyState: 'complete' };
}

const pluriel = chargerScript('js/trimestre-v2-etudiants.js', {
    normaliserNumeroGroupe: (g) => String(g || '').padStart(5, '0'),
    db: { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} },
    document: { getElementById: () => null, addEventListener() {}, querySelectorAll: () => [] }
}, { addEventListener() {} }).pluriel;

/**
 * Un trimestre en mémoire, la VRAIE chaîne : la fusion des horaires (horaire-fusion.js), le calendrier
 * (trimestre.js), les séances (horaire.js), la ligne du trimestre (trimestre-v2.js), la fiche du groupe-cours
 * (trimestre-v2-groupes-cours.js). Rien n'est recopié ici.
 */
function trimestre({ cadre = CADRE, journees = [], horaires = [H_DEUX, H_UNE], groupesCours = [GC_DEUX, GC_UNE], cours, actif = 'a2026' } = {}) {
    const store = {
        trimestres: actif ? [{ id: actif, session: 'automne', annee: '2026', actif: true }] : [],
        cours: cours || [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }],
        [cle('cadreCalendrier')]: cadre, [cle('journeesSansCours')]: journees,
        [cle('horaires')]: horaires, [cle('groupesCours')]: groupesCours
    };
    const ecrits = [];
    const db = {
        getSync: (k, d) => (k in store ? clone(store[k]) : (d === undefined ? null : d)),
        setSync: (k, v) => { store[k] = clone(v); ecrits.push(k); return true; },
        removeSync: (k) => { delete store[k]; }
    };
    const elements = {};
    const document = fauxDocument(elements);
    const win = { addEventListener() {}, pluriel, obtenirTrimestreId: () => actif || '',
        obtenirTrimestres: () => store.trimestres, temoinEnregistrement: { nonEnregistre() {}, enregistre() {} },
        uiDialogues: { declarerFicheEnCreation() {}, quitterCreationSiConfirme: async () => true } };
    const fusion = chargerScript('js/horaire-fusion.js', {});
    const globaux = { db, cle, document, fusionnerSeancesHoraires: fusion.fusionnerSeancesHoraires,
        notifications: { succes() {}, erreur() {}, warning() {} },
        echapperHtml: (s) => String(s == null ? '' : s), echapperAttribut: (s) => String(s == null ? '' : s),
        obtenirTrimestreActif: () => store.trimestres[0] || null };
    chargerScript('js/trimestre.js', globaux, win);
    chargerScript('js/horaire.js', globaux, win);
    chargerScript('js/trimestre-v2.js', globaux, win);
    chargerScript('js/trimestre-v2-groupes-cours.js', globaux, win);
    win.genererCalendrierComplet();
    const ecritsAvant = ecrits.length;
    return { win, store, elements, document, ecritsDepuis: () => ecrits.slice(ecritsAvant) };
}

const prevu = (t, gc) => t.win.seancesPrevuesDuGroupeCours(gc);
const compte = (t, gc) => { const p = prevu(t, gc); return p === null ? null : p.seances; };

describe('#1253 — 1. le nombre de séances se compte par groupe-cours, sur son horaire', () => {
    it('deux groupes du même trimestre, l\'un vu deux fois par semaine, l\'autre une fois, n\'ont pas le même nombre de séances', () => {
        const t = trimestre();
        expect(compte(t, GC_DEUX)).toBe(4);   // lun. 24, jeu. 27, lun. 31, jeu. 3
        expect(compte(t, GC_UNE)).toBe(2);    // mar. 25, mar. 1er
        // Le compte du calendrier, tous groupes confondus, n'est ni l'un ni l'autre : la réunion des jours.
        expect(t.win.calculerStatistiquesCalendrier(t.store[cle('calendrierComplet')]).joursCours).toBe(6);
    });

    it('une journée sans cours retire une séance au seul groupe qui avait cours ce jour-là', () => {
        const t = trimestre({ journees: [{ id: 'E1', dateEvenement: '2026-09-01', description: 'Journée fictive', categorie: 'institutionnel' }] });
        expect(compte(t, GC_UNE)).toBe(1);    // le mardi 1er n'a pas lieu
        expect(compte(t, GC_DEUX)).toBe(4);   // il n'avait pas cours ce mardi
    });

    it('une reprise rend la séance au groupe dont l\'horaire est repris, et la prend à celui qui avait cours ce jour-là', () => {
        // Lundi 31 août sans cours, repris le jeudi 3 septembre à l'horaire du lundi.
        const evt = { id: 'E2', dateEvenement: '2026-08-31', description: 'Congé fictif', categorie: 'ferie', horaireReprise: 'Horaire du lundi', dateReprise: '2026-09-03' };
        const sansReprise = trimestre({ journees: [Object.assign({}, evt, { dateReprise: '', horaireReprise: '' })] });
        expect(compte(sansReprise, GC_DEUX)).toBe(3);
        const avecReprise = trimestre({ journees: [evt], horaires: [H_DEUX, H_UNE, { id: 'H_LUN', nom: 'Lun', seances: [{ id: 'S4', jour: 'Lundi', heureDebut: '10:00', heureFin: '11:40' }] }],
            groupesCours: [GC_DEUX, GC_UNE, { id: 'GC_LUN', coursId: 'C1', groupeNum: '00003', horaireId: 'H_LUN' }] });
        // Le jeudi 3 suit l'horaire du lundi : le groupe du lundi seul retrouve sa séance ; celui du lundi et du jeudi
        // a sa séance du lundi ce jeudi-là, et pas celle du jeudi.
        expect(compte(avecReprise, { id: 'GC_LUN', horaireId: 'H_LUN' })).toBe(2);
        expect(compte(avecReprise, GC_DEUX)).toBe(3);
        expect(compte(avecReprise, GC_UNE)).toBe(2);
    });

    it('un cours donné tous les jours de la semaine compte chaque jour ouvrable, pas les fins de semaine', () => {
        const tousLesJours = { id: 'H_ETE', nom: 'Été', seances: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
            .map((jour, i) => ({ id: 'E' + i, jour, heureDebut: '09:00', heureFin: '12:00' })) };
        const t = trimestre({ horaires: [tousLesJours], groupesCours: [{ id: 'GC_ETE', coursId: 'C1', groupeNum: '00009', horaireId: 'H_ETE' }] });
        expect(compte(t, { id: 'GC_ETE', horaireId: 'H_ETE' })).toBe(10);
    });

    it('rien à compter : pas de groupe, pas d\'horaire, un horaire sans séance, un horaire introuvable, pas de calendrier', () => {
        const t = trimestre();
        expect(compte(t, null)).toBeNull();
        expect(compte(t, { id: 'GC_X' })).toBeNull();
        expect(compte(t, { id: 'GC_X', horaireId: 'H_PARTI' })).toBeNull();
        const vide = trimestre({ horaires: [H_DEUX, { id: 'H_VIDE', nom: 'Vide', seances: [] }] });
        expect(compte(vide, { id: 'GC_X', horaireId: 'H_VIDE' })).toBeNull();
        delete t.store[cle('calendrierComplet')];
        expect(compte(t, GC_DEUX)).toBeNull();
    });

    it('1 bis. les semaines sont celles de SES séances, pas celles du trimestre (la réunion des jours de tous les groupes)', () => {
        // Mesuré dans la démo le 27 nov. : 16 semaines au trimestre parce qu'un groupe a cours le jeudi 11 déc., 16e
        // paquet de deux jours ; le groupe du lundi et du mercredi y aurait lu « 16 semaines • 30 séances ». Ici, le
        // même dessin : un dernier paquet d'un seul jour, le lundi 7 septembre.
        const t = trimestre({ cadre: { dateDebut: '2026-08-24', finCours: '2026-09-07', finTrimestre: '2026-09-07' } });
        expect(t.win.calculerStatistiquesCalendrier(t.store[cle('calendrierComplet')]).semaines).toBe(3);
        expect(prevu(t, GC_DEUX)).toEqual({ seances: 5, semaines: 3 });   // il a cours ce lundi-là
        expect(prevu(t, GC_UNE)).toEqual({ seances: 2, semaines: 2 });    // ses séances tiennent en deux semaines
    });

    it('le compte lit, il n\'écrit rien (ni les séances complètes, ni leur cache)', () => {
        const t = trimestre();
        compte(t, GC_DEUX); compte(t, GC_UNE);
        expect(t.ecritsDepuis()).toEqual([]);
    });

    it('les séances complètes sortent de la même règle (génération inchangée pour le groupe actif)', () => {
        const t = trimestre();
        t.store.groupeCoursActif = { id: 'GC_UNE', horaireId: 'H_UNE' };
        const seances = t.win.genererSeancesCompletes('C1');
        expect(Object.keys(seances).sort()).toEqual(['2026-08-25', '2026-09-01']);
        expect(seances['2026-08-25'][0]).toMatchObject({ id: 'SEANCE-2026-08-25-A', seanceHoraireId: 'S3', nom: 'A', date: '2026-08-25',
            jour: 'Mardi', jourRemplace: null, debut: '13:00', fin: '15:30', nombrePeriodes: 3, numeroSemaine: 1 });
        expect(t.store['seancesCompletes_gc_GC_UNE']).toEqual(seances);
    });
});

describe('#1253 — 2. la fiche du groupe-cours dit « N semaines • M séances »', () => {
    const ligne = (t, gc) => {
        t.win.mettreAJourCarteResumeGroupeCoursV2(gc);
        const el = t.document.getElementById('v2-seancesGroupeCours');
        return el.classList.contains('u-hide') ? null : el.textContent;
    };

    it('chaque groupe-cours, son nombre de séances et ses semaines', () => {
        const t = trimestre();
        expect(ligne(t, GC_DEUX)).toBe('2 semaines • 4 séances');
        expect(ligne(t, GC_UNE)).toBe('2 semaines • 2 séances');
        const stub = trimestre({ cadre: { dateDebut: '2026-08-24', finCours: '2026-09-07', finTrimestre: '2026-09-07' } });
        expect(ligne(stub, GC_UNE)).toBe('2 semaines • 2 séances');
        expect(ligne(stub, GC_DEUX)).toBe('3 semaines • 5 séances');
    });

    it('l\'accord : « 1 semaine », « 1 séance »', () => {
        const t = trimestre({ journees: [{ id: 'E1', dateEvenement: '2026-09-01', description: 'Journée fictive', categorie: 'institutionnel' }] });
        expect(ligne(t, GC_UNE)).toBe('1 semaine • 1 séance');
    });

    it('un groupe sans horaire n\'affiche aucun nombre de séances (pas de « 0 séance »)', () => {
        const t = trimestre();
        expect(ligne(t, { id: 'GC_X', coursId: 'C1', groupeNum: '00004' })).toBeNull();
        expect(t.document.getElementById('v2-seancesGroupeCours').textContent).toBe('');
    });

    it('un horaire dont aucune séance ne tombe au calendrier (le samedi) : pas de « 0 séance » non plus', () => {
        const samedi = { id: 'H_SAM', nom: 'Sam', seances: [{ id: 'S9', jour: 'Samedi', heureDebut: '09:00', heureFin: '12:00' }] };
        const t = trimestre({ horaires: [H_DEUX, samedi] });
        expect(prevu(t, { id: 'GC_SAM', horaireId: 'H_SAM' })).toEqual({ seances: 0, semaines: 0 });
        expect(ligne(t, { id: 'GC_SAM', coursId: 'C1', groupeNum: '00007', horaireId: 'H_SAM' })).toBeNull();
    });

    it('un service (orthopédagogie) n\'en affiche pas non plus, horaire ou pas', () => {
        const cours = [{ id: 'C1', codeCours: '601-101-MQ', nomCours: 'Cours fictif' }, { id: 'SRV', nature: 'service', nomCours: 'Orthopédagogie' }];
        const t = trimestre({ cours });
        expect(ligne(t, { id: 'GC_S', coursId: 'SRV', groupeNum: '00005' })).toBeNull();
        expect(ligne(t, { id: 'GC_S2', coursId: 'SRV', groupeNum: '00006', horaireId: 'H_UNE' })).toBeNull();
    });

    it('aucun groupe-cours choisi : la ligne se tait', () => {
        const t = trimestre();
        ligne(t, GC_DEUX);
        expect(ligne(t, null)).toBeNull();
    });

    it('le calendrier change (une journée sans cours) : la ligne du groupe-cours ouvert suit, avec la ligne du trimestre', () => {
        const t = trimestre();
        t.document.getElementById('v2-selectGroupeCours').value = 'GC_UNE';   // la fiche choisie au menu
        expect(ligne(t, GC_UNE)).toBe('2 semaines • 2 séances');
        t.store[cle('journeesSansCours')] = [{ id: 'E1', dateEvenement: '2026-09-01', description: 'Journée fictive', categorie: 'institutionnel' }];
        t.win.genererCalendrierComplet();
        t.win.afficherStatistiquesTrimestreV2();
        expect(t.document.getElementById('v2-seancesGroupeCours').textContent).toBe('1 semaine • 1 séance');
    });
});

describe('#1253 — 3. la ligne du trimestre : les semaines seulement, et rien sans trimestre', () => {
    const ligneTrimestre = (t) => {
        t.win.afficherStatistiquesTrimestreV2();
        const el = t.document.getElementById('v2-apercuTrimestreSidebar');
        return { cachee: el.classList.contains('u-hide'), semaines: t.document.getElementById('v2-nombreSemainesSidebar').textContent,
            note: t.document.getElementById('v2-statsCongesReprisesSidebar').textContent };
    };

    it('un trimestre : « 2 semaines », sans jours de cours ; la note des congés reste', () => {
        expect(ligneTrimestre(trimestre())).toEqual({ cachee: false, semaines: '2 semaines', note: '(aucun congé)' });
        const t = trimestre({ journees: [{ id: 'E1', dateEvenement: '2026-09-01', description: 'Journée fictive', categorie: 'institutionnel' }] });
        expect(ligneTrimestre(t).note).toBe('(1 congé non repris)');
    });

    it('aucun trimestre : la ligne ne paraît pas, même si l\'écran gardait les chiffres d\'avant (la démo quittée)', () => {
        const t = trimestre();
        expect(ligneTrimestre(t).cachee).toBe(false);
        t.win.obtenirTrimestreId = () => '';
        expect(ligneTrimestre(t).cachee).toBe(true);
    });

    it('l\'accord : « 1 semaine »', () => {
        const t = trimestre();
        t.store[cle('calendrierComplet')] = { '2026-08-24': { statut: 'cours', numeroSemaine: 1 } };
        expect(ligneTrimestre(t).semaines).toBe('1 semaine');
    });

    it('l\'arrivée sur Cadre › Trimestre sans cadre redessine la ligne (elle gardait les chiffres de la démo)', () => {
        const t = trimestre();
        ligneTrimestre(t);
        t.win.obtenirTrimestreId = () => '';
        delete t.store[cle('cadreCalendrier')];
        chargerScript('js/trimestre-v2-init.js', { db: { getSync: (k, d) => (k in t.store ? clone(t.store[k]) : (d === undefined ? null : d)), setSync() {}, removeSync() {} },
            cle, document: t.document, notifications: { succes() {}, erreur() {}, warning() {} } }, t.win);
        t.win.chargerCadreCalendrierV2();
        expect(t.document.getElementById('v2-apercuTrimestreSidebar').classList.contains('u-hide')).toBe(true);
    });

    it('index.html : la ligne ne dit plus « jours de cours », et elle est cachée avant que le code ne la remplisse', () => {
        const html = lire('index.html');
        const debut = html.indexOf('id="v2-apercuTrimestreSidebar"');
        const bloc = html.slice(html.lastIndexOf('<div', debut), html.indexOf('</div>', debut));
        expect(bloc).toMatch(/class="rangee-selection-resume u-hide"/);
        expect(bloc).not.toMatch(/jours de cours/);
        expect(html).not.toMatch(/v2-nombreJoursCours/);
        expect(html).toMatch(/<div class="rangee-selection-resume u-hide" id="v2-seancesGroupeCours"><\/div>/);
    });
});

// BREAK-TEST (27 nov. 2026) — journal. Avant le code : 17 rouges sur 18 (la fonction de compte n'existait pas, la ligne
// du groupe-cours ne disait rien, celle du trimestre disait « jours de cours ») ; le 18e, la génération des séances
// complètes, était vert et devait le rester après l'extraction de `calculerSeancesCompletes`. Sur le code final
// (20 essais), huit cassures, chacune rouge, puis le code remis (20 verts) :
//   1. séances et semaines prises sur le calendrier, tous groupes confondus       → 7 rouges ;
//   2. la ligne du trimestre jamais cachée                                        → 2 rouges ;
//   3. l'arrivée sur Cadre › Trimestre sans cadre ne redessine plus la ligne      → 1 rouge ;
//   4. un service compté comme un cours                                           → 1 rouge ;
//   5. la ligne du groupe-cours ne suit plus le calendrier                        → 1 rouge ;
//   6. chaque séance comptée deux fois                                            → 8 rouges ;
//   7. les semaines du groupe prises au trimestre                                 → 4 rouges ;
//   8. « 0 séance » permis (la garde `seances > 0` retirée)                       → 1 rouge, après l'ajout de l'essai
//      du samedi : sans lui, cette cassure restait verte.
