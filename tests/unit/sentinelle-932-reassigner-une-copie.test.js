import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #932 (22 sept. 2026) — UN SEUL GESTE RÉASSIGNE UNE COPIE, IL LA MONTRE,
// ET IL PASSE PAR LA PORTE.
//
// Audit du 22 sept. (`Rapports/AUDIT-reassocier-une-copie-2026-09-22.md`) et remesure
// de Cowork (consigne du jour, §1a-1b) : CINQ chemins écrivaient l'association d'une
// copie. Deux — Propriétés et la correction d'identité du panneau d'évaluation —
// changeaient aussi l'ÉLÈVE, l'un sans porte, l'autre derrière la porte muette
// d'avant #931 ; le menu Production du tableau n'attendait pas le verdict.
//
// Trois bords :
//   S — structure : hors `travaux-stockage.js`, `reassocierFichier(` ne vit que dans
//       `mesurerReassignation` et `ecrireReassignation` ; `reassocierFichiersBatch(`
//       que dans Transférer ; l'ancienne modale aveugle n'existe plus ; les quatre
//       points d'entrée passent par `reassignerCopie` ou par Propriétés. Gardes de
//       non-vide (règle 10) partout où une tranche est mesurée.
//   C — comportement de `reassignerCopie` (travaux-ui) : la porte nomme l'élève quand
//       il change ; refus ⇒ rien n'est écrit ; la correction d'identité et le menu
//       du tableau SUIVENT le verdict.
//   P — Propriétés (liste-evaluations) : montre la copie (vignette, nom de fichier) ;
//       écrit l'élève et la production par `travauxUI.reassignerCopie` ; sur refus,
//       reste ouverte et n'écrit rien ; le jeton de reprise (#561) vient après.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');
const sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

/** Le corps d'une fonction : de sa déclaration à la déclaration suivante de même indentation. */
function corpsDe(source, nom) {
    const re = new RegExp('(?:async )?function ' + nom + '\\(');
    const i = source.search(re);
    expect(i, 'fonction introuvable : ' + nom).toBeGreaterThan(-1);
    const indent = source.slice(source.lastIndexOf('\n', i) + 1, i).match(/^\s*/)[0];
    const suivante = source.indexOf('\n' + indent + 'function ', i + 10);
    const suivanteAsync = source.indexOf('\n' + indent + 'async function ', i + 10);
    const bornes = [suivante, suivanteAsync].filter(b => b > -1);
    const fin = bornes.length ? Math.min(...bornes) : source.length;
    return source.slice(i, fin);
}

/* ---------------------------------------------------------------- S — structure */

describe('#932 · S — un seul écrivain de l\'association d\'une copie', () => {
    const fichiersJs = readdirSync(path.join(racineProjet, 'js')).filter(f => f.endsWith('.js') && f !== 'travaux-stockage.js');
    const ui = sansCommentaires(lire('js/travaux-ui.js'));
    const liste = sansCommentaires(lire('js/liste-evaluations.js'));

    it('S.a hors travaux-stockage.js, `reassocierFichier(` ne vit que dans mesurer/ecrireReassignation', () => {
        const hors = [];
        let total = 0;
        for (const f of fichiersJs) {
            const src = sansCommentaires(lire('js/' + f));
            const n = (src.match(/\breassocierFichier\(/g) || []).length;
            total += n;
            if (n === 0) continue;
            if (f !== 'travaux-ui.js') { hors.push(f + ' ×' + n); continue; }
            const dedans = (corpsDe(src, 'mesurerReassignation').match(/\breassocierFichier\(/g) || []).length
                + (corpsDe(src, 'ecrireReassignation').match(/\breassocierFichier\(/g) || []).length;
            if (dedans !== n) hors.push(f + ' : ' + (n - dedans) + ' appel(s) hors du trio');
        }
        expect(total, 'garde de non-vide : le trio appelle bien le stockage').toBe(2);
        expect(hors).toEqual([]);
    });

    it('S.b `reassocierFichiersBatch(` n\'a qu\'un appelant : Transférer', () => {
        let total = 0;
        const hors = [];
        for (const f of fichiersJs) {
            const src = sansCommentaires(lire('js/' + f));
            const n = (src.match(/\breassocierFichiersBatch\(/g) || []).length;
            total += n;
            if (n && (f !== 'travaux-ui.js' || !corpsDe(src, 'executerTransfert').includes('reassocierFichiersBatch('))) hors.push(f);
        }
        expect(total).toBe(1);
        expect(hors).toEqual([]);
    });

    it('S.c `ecrireReassignation(` n\'est appelée que par le geste unique et la réassignation en masse', () => {
        const appelants = { 'travaux-ui.js': ['reassignerCopie'], 'liste-evaluations.js': ['reassignerSelectionEval'] };
        let total = 0;
        const hors = [];
        for (const f of fichiersJs) {
            const src = sansCommentaires(lire('js/' + f)).replace(/function ecrireReassignation\(/, '');
            const n = (src.match(/\becrireReassignation\(/g) || []).length;
            total += n;
            if (!n) continue;
            const dedans = (appelants[f] || []).reduce((acc, fn) => {
                return acc + ((corpsDe(src, fn).match(/\becrireReassignation\(/g) || []).length);
            }, 0);
            if (dedans !== n) hors.push(f + ' : ' + (n - dedans) + ' hors des appelants admis');
        }
        expect(total, 'garde de non-vide').toBeGreaterThanOrEqual(1);
        expect(hors).toEqual([]);
    });

    it('S.d dans reassignerCopie, la porte précède l\'écriture', () => {
        const corps = corpsDe(ui, 'reassignerCopie');
        const posPorte = corps.indexOf('confirm(');
        const posEcrit = corps.indexOf('ecrireReassignation(');
        expect(posPorte).toBeGreaterThan(-1);
        expect(posEcrit).toBeGreaterThan(posPorte);
    });

    it('S.e la correction d\'identité attend reassignerCopie et n\'a plus ni porte propre ni écrivain nu', () => {
        const corps = corpsDe(ui, 'appliquerCorrectionIdentite');
        expect(corps).toMatch(/await reassignerCopie\(fichier\.id, association\)/);
        expect(corps).not.toContain('confirm(');
        expect(corps).not.toContain('reassocierFichier(');
        expect(corps).not.toContain('deplacerEnCorbeille(');
    });

    it('S.f le menu Production du tableau attend le verdict et revient à l\'ancienne production sur refus', () => {
        const corps = corpsDe(ui, 'changerProductionFichierDepuisTableau');
        expect(corps).toMatch(/await reassignerCopie\(fichierId, \{ productionId: value \}\)/);
        expect(corps).toContain('el.value = ancienne');
    });

    it('S.g la Liste : « Réassigner » / « Assigner » ouvrent Propriétés ; la modale aveugle n\'existe plus', () => {
        const menu = corpsDe(liste, 'genererDropdownActions');
        expect(menu).toContain("'Réassigner' : 'Assigner'");
        expect(menu).not.toContain('Réassocier');
        const dispatch = corpsDe(liste, 'executerActionEval');
        expect(dispatch).toMatch(/case 'associer':\s*ouvrirProprieteFichier\(parts\[1\]\)/);
        for (const f of fichiersJs) {
            const src = lire('js/' + f);
            expect(src, f).not.toContain('associerProductionDepuisListe');
            expect(src, f).not.toContain('associer-prod-modal');
        }
        expect(lire('index.html')).not.toContain('associer-prod-modal');
    });

    it('S.h Propriétés : la vignette et le nom, puis l\'écriture par travauxUI.reassignerCopie, attendue, avant tout autre écrit', () => {
        const corps = corpsDe(liste, 'ouvrirProprieteFichier');
        expect(corps).toContain('obtenirThumbnailSync(fichierId)');
        expect(corps).toContain('prop-fichier-apercu-nom');
        expect(corps).not.toContain('reassocierFichier(');
        const posAwait = corps.search(/await travauxUI\.reassignerCopie\(fichierId, association\)/);
        const posGarde = corps.indexOf('if (!reassigne)');
        const posMaj = corps.indexOf('mettreAJourFichier(fichierId, miseAJour)');
        expect(posAwait).toBeGreaterThan(-1);
        expect(posGarde).toBeGreaterThan(posAwait);
        expect(posMaj).toBeGreaterThan(posGarde);
        expect(liste).not.toContain('reassocierFichier(');
    });
});

/* ---------------------------------------------- C — comportement (travaux-ui) */

const DA1 = '2000001', DA2 = '2000002';
const A2 = 'PROD_A2', A2R = 'PROD_A2R';
const PRODUCTIONS = [{ id: A2, titre: 'Artefact 2' }, { id: A2R, titre: 'Artefact 2 (rév)' }];
const ETUDIANTS = [{ da: DA1, nom: 'Allache', prenom: 'Sara' }, { da: DA2, nom: 'Roy', prenom: 'Camille' }];

function elementGenerique(extra) {
    return Object.assign({
        value: '', textContent: '', innerHTML: '', style: {}, dataset: {}, options: [],
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        addEventListener() {}, removeEventListener() {}, appendChild() {}, remove() {}, querySelectorAll: () => [], querySelector: () => null,
        setAttribute() {}, getAttribute: () => null, dispatchEvent() {}
    }, extra || {});
}

function monterUI({ fichiers, reponse = true, elements = {} } = {}) {
    const journal = { questions: [], corbeille: [], ecrits: [], notifs: [] };
    const win = chargerScript('js/travaux-ui.js', {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? PRODUCTIONS : []),
        confirm: (q) => { journal.questions.push(q); return reponse; },
        alert: () => {},
        setTimeout: () => 0, clearTimeout: () => {},
        notifications: { succes() {}, erreur() {}, warning() {}, info: (t, d) => journal.notifs.push([t, d]) },
        travauxImport: { trouverEtudiantParDA: (da) => ETUDIANTS.find(e => e.da === da) || null },
        travauxVisionneuse: { getFichierActuel: () => fichiers[0] },
        document: Object.assign({
            addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
            getElementById: (id) => elements[id] || elementGenerique(),
            createElement: () => elementGenerique(),
            body: elementGenerique(), documentElement: elementGenerique()
        }),
        travauxStockage: {
            obtenirFichiersTravaux: () => fichiers,
            obtenirFichiersGroupeActif: () => fichiers,
            obtenirFichierParId: (id) => fichiers.find(f => f.id === id) || null,
            reassocierFichier: (id, assoc, options) => {
                const f = fichiers.find(x => x.id === id);
                if (!f) return false;
                const da = assoc.etudiantDA !== undefined ? assoc.etudiantDA : f.etudiantDA;
                const prod = assoc.productionId !== undefined ? assoc.productionId : f.productionId;
                if (options && options.verificationSeule) {
                    const existant = fichiers.find(x => x.id !== id && x.etudiantDA === da && x.productionId === prod);
                    return { conflit: !!existant, fichierExistant: existant, evaluationOrpheline: false };
                }
                journal.ecrits.push([id, Object.assign({}, assoc)]);
                return true;
            },
            deplacerEnCorbeille: (id) => journal.corbeille.push(id)
        }
    }, { addEventListener() {}, removeEventListener() {} });
    return { win, journal };
}

// Sara a une copie sous Artefact 2 (rév) ; Camille a la sienne sous Artefact 2.
// Donner la copie de Camille à Sara SUR Artefact 2 (rév) : c'est un changement
// d'élève ET de production, en conflit avec la copie de Sara.
const FICHIERS = () => [
    { id: 'FT_camille', etudiantDA: DA2, productionId: A2, nomFichier: 'Roy_Artefact_2.pdf' },
    { id: 'FT_sara', etudiantDA: DA1, productionId: A2R, nomFichier: 'Allache_Artefact_2_rev.jpg' }
];

describe('#932 · C — reassignerCopie : la porte nomme l\'élève quand il change, et rien ne s\'écrit sans elle', () => {
    it('C.a changement d\'élève en conflit : la question nomme l\'élève cible, la production, l\'existant puis l\'arrivant', async () => {
        const { win, journal } = monterUI({ fichiers: FICHIERS(), reponse: false });
        const ok = await win.travauxUI.reassignerCopie('FT_camille', { etudiantDA: DA1, productionId: A2R });
        expect(ok).toBe(false);
        expect(journal.questions).toHaveLength(1);
        const q = journal.questions[0];
        expect(q).toContain('Sara Allache');
        expect(q).toContain('Artefact 2 (rév)');
        expect(q.indexOf('Allache_Artefact_2_rev.jpg')).toBeGreaterThan(-1);
        expect(q.indexOf('Roy_Artefact_2.pdf')).toBeGreaterThan(q.indexOf('Allache_Artefact_2_rev.jpg'));
        expect(q).toContain('corbeille');
        expect(journal.ecrits).toEqual([]);
        expect(journal.corbeille).toEqual([]);
    });

    it('C.b la même, acceptée : l\'existant part à la corbeille, l\'élève ET la production s\'écrivent', async () => {
        const { win, journal } = monterUI({ fichiers: FICHIERS(), reponse: true });
        expect(await win.travauxUI.reassignerCopie('FT_camille', { etudiantDA: DA1, productionId: A2R })).toBe(true);
        expect(journal.corbeille).toEqual(['FT_sara']);
        expect(journal.ecrits).toEqual([['FT_camille', { etudiantDA: DA1, productionId: A2R }]]);
    });

    it('C.c changement de production seule : la question ne nomme pas d\'élève (forme #931)', async () => {
        const fichiers = FICHIERS();
        fichiers[0].etudiantDA = DA1; // Sara a deux copies : Artefact 2 et Artefact 2 (rév)
        const { win, journal } = monterUI({ fichiers, reponse: false });
        await win.travauxUI.reassignerCopie('FT_camille', { productionId: A2R });
        expect(journal.questions[0]).toContain('cette production (Artefact 2 (rév))');
        expect(journal.questions[0]).not.toContain('Sara Allache');
    });

    it('C.d mesurer puis écrire : la mesure dit ce qui change et ce qui bloque ; l\'écriture sans conflit ne touche pas la corbeille', () => {
        const { win, journal } = monterUI({ fichiers: FICHIERS() });
        const m = win.travauxUI.mesurerReassignation('FT_camille', { etudiantDA: DA1, productionId: A2R });
        expect(m).toMatchObject({ changeEleve: true, changeProduction: true, conflit: true, nomEleve: 'Sara Allache', nomProduction: 'Artefact 2 (rév)', nomFichier: 'Roy_Artefact_2.pdf', nomExistant: 'Allache_Artefact_2_rev.jpg' });
        const m2 = win.travauxUI.mesurerReassignation('FT_camille', { productionId: A2R });
        expect(m2).toMatchObject({ changeEleve: false, changeProduction: true, conflit: false });
        expect(win.travauxUI.ecrireReassignation(m2)).toBe(true);
        expect(journal.corbeille).toEqual([]);
        expect(journal.ecrits).toEqual([['FT_camille', { productionId: A2R }]]);
        expect(win.travauxUI.mesurerReassignation('FT_inconnu', { productionId: A2R })).toBeNull();
    });

    it('C.e la correction d\'identité : refus à la porte ⇒ rien n\'est écrit, l\'objet en mémoire ne bouge pas, une notification le dit', async () => {
        const fichiers = FICHIERS();
        const elements = { selectEtudiantEval: elementGenerique({ value: DA1 }), selectProduction1: elementGenerique({ value: A2R }) };
        const { win, journal } = monterUI({ fichiers, reponse: false, elements });
        await win.travauxUI.appliquerCorrectionIdentite();
        expect(journal.questions).toHaveLength(1);
        expect(journal.ecrits).toEqual([]);
        expect(journal.corbeille).toEqual([]);
        expect(fichiers[0]).toMatchObject({ etudiantDA: DA2, productionId: A2 });
        expect(journal.notifs.map(n => n[0])).toEqual(['Réassignation annulée']);
    });

    it('C.f la correction d\'identité acceptée : écrit par le geste unique, puis met l\'objet à jour', async () => {
        const fichiers = FICHIERS();
        const elements = { selectEtudiantEval: elementGenerique({ value: DA1 }), selectProduction1: elementGenerique({ value: A2R }) };
        const { win, journal } = monterUI({ fichiers, reponse: true, elements });
        await win.travauxUI.appliquerCorrectionIdentite();
        expect(journal.corbeille).toEqual(['FT_sara']);
        expect(journal.ecrits).toEqual([['FT_camille', { etudiantDA: DA1, productionId: A2R }]]);
        expect(fichiers[0]).toMatchObject({ etudiantDA: DA1, productionId: A2R });
    });

    it('C.g le menu Production du tableau : refus ⇒ le menu revient à l\'ancienne production ; accord ⇒ la ligne suit', async () => {
        const fichiers = FICHIERS();
        fichiers[0].etudiantDA = DA1;
        const row = { dataset: { productionId: A2 } };
        const select = { dataset: { fichierId: 'FT_camille' }, value: A2R, closest: () => row };
        const { win, journal } = monterUI({ fichiers, reponse: false });
        await win.travauxUI.changerProductionFichierDepuisTableau(select);
        expect(select.value).toBe(A2);
        expect(row.dataset.productionId).toBe(A2);
        expect(journal.ecrits).toEqual([]);

        const accord = monterUI({ fichiers: FICHIERS(), reponse: true });
        const row2 = { dataset: { productionId: A2 } };
        const select2 = { dataset: { fichierId: 'FT_camille' }, value: A2R, closest: () => row2 };
        await accord.win.travauxUI.changerProductionFichierDepuisTableau(select2);
        expect(select2.value).toBe(A2R);
        expect(row2.dataset.productionId).toBe(A2R);
        expect(accord.journal.ecrits).toEqual([['FT_camille', { productionId: A2R }]]);
    });
});

/* ------------------------------------------- P — Propriétés (liste-evaluations) */

function echapperHtmlReel(texte) {
    if (texte == null) return '';
    return String(texte).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function monterProprietes({ fichier, vignette = '', verdict = true, jetonsActifs = true, champs = {} } = {}) {
    const journal = { reassignations: [], miseAJour: [], notifs: [], jetons: [], vignettesChargees: 0, filtres: 0 };
    const overlays = [];
    const registre = {
        'prop-fichier-nom': elementGenerique({ value: champs.nom !== undefined ? champs.nom : (fichier.nomFichier || '') }),
        'prop-fichier-etudiant': elementGenerique({ value: champs.etudiant !== undefined ? champs.etudiant : (fichier.etudiantDA || '') }),
        'prop-fichier-production': elementGenerique({ value: champs.production !== undefined ? champs.production : (fichier.productionId || '') }),
        'prop-fichier-evaluation': elementGenerique({ value: champs.evaluation !== undefined ? champs.evaluation : (fichier.evaluationId || '') }),
        'prop-fichier-jeton-reprise': elementGenerique({ checked: !!champs.jeton }),
        'prop-fichier-btn-sauver': elementGenerique(),
        'proprietes-fichier-overlay': null
    };
    const document = {
        addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [],
        getElementById: (id) => (id in registre ? registre[id] : elementGenerique()),
        createElement: () => {
            const o = elementGenerique({ retire: false });
            o.remove = () => { o.retire = true; };
            overlays.push(o);
            return o;
        },
        body: elementGenerique(), documentElement: elementGenerique()
    };
    const win = chargerScript('js/liste-evaluations.js', {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: echapperHtmlReel,
        obtenirLibelleStatut: (s) => s,
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? PRODUCTIONS : (k === 'evaluationsSauvegardees' ? [{ id: 'EVAL_SARA_A2R', etudiantDA: DA1, productionId: A2R }] : [])),
        obtenirEtudiantsCoursActif: () => ETUDIANTS.slice(),
        obtenirConfigJetons: () => ({ actif: jetonsActifs }),
        appliquerJetonReprise: (id) => { journal.jetons.push(id); return { id: 'EVAL_REPRISE_1' }; },
        setTimeout: () => 0,
        document,
        notifications: { succes() {}, erreur: (t) => journal.notifs.push(['erreur', t]), warning() {}, info: (t) => journal.notifs.push(['info', t]) },
        travauxUI: { reassignerCopie: async (id, assoc) => { journal.reassignations.push([id, Object.assign({}, assoc)]); return verdict; } },
        travauxStockage: {
            obtenirFichierParId: (id) => (id === fichier.id ? fichier : null),
            obtenirFichiersTravaux: () => [fichier], obtenirFichiersGroupeActif: () => [fichier],
            obtenirThumbnailSync: () => vignette,
            chargerThumbnailsConteneur: () => { journal.vignettesChargees++; },
            formaterTaille: (n) => n + ' o',
            mettreAJourFichier: (id, maj) => journal.miseAJour.push([id, Object.assign({}, maj)]),
            obtenirCorbeille: () => []
        }
    }, { addEventListener() {}, removeEventListener() {}, pluriel: (n, s, p) => (n > 1 ? p : s) });
    return { win, journal, overlays, registre };
}

const FICHIER_SARA = () => ({ id: 'FT_sara', etudiantDA: DA1, productionId: A2, nomFichier: 'Allache_<Artefact>_2.pdf', typeMIME: 'application/pdf', nombrePages: 3, tailleFichier: 1234, evaluationId: '' });

describe('#932 · P — Propriétés montre la copie, écrit par le geste unique et attend son verdict', () => {
    it('P.a la modale porte la vignette (du cache) et le nom de fichier, échappé', () => {
        const { win, overlays, journal } = monterProprietes({ fichier: FICHIER_SARA(), vignette: 'data:image/png;base64,AAAA' });
        win.ouvrirProprieteFichier('FT_sara');
        expect(overlays).toHaveLength(1);
        const html = overlays[0].innerHTML;
        expect(html).toContain('class="prop-fichier-vignette" src="data:image/png;base64,AAAA"');
        expect(html).toContain('Allache_&lt;Artefact&gt;_2.pdf');
        expect(html).not.toContain('<Artefact>');
        expect(html).toContain('3 pages');
        expect(journal.vignettesChargees).toBe(0);
    });

    it('P.b sans vignette en cache : un emplacement `data-thumbnail-id` et le chargeur IndexedDB est appelé', () => {
        const { win, overlays, journal } = monterProprietes({ fichier: FICHIER_SARA(), vignette: '' });
        win.ouvrirProprieteFichier('FT_sara');
        expect(overlays[0].innerHTML).toContain('data-thumbnail-id="FT_sara"');
        expect(overlays[0].innerHTML).toContain('>PDF<');
        expect(journal.vignettesChargees).toBe(1);
    });

    it('P.c changer l\'élève ET la production passe par travauxUI.reassignerCopie, avec les deux champs', async () => {
        const { win, journal, overlays, registre } = monterProprietes({ fichier: FICHIER_SARA(), champs: { etudiant: DA2, production: A2R } });
        win.ouvrirProprieteFichier('FT_sara');
        await registre['prop-fichier-btn-sauver'].onclick();
        expect(journal.reassignations).toEqual([['FT_sara', { etudiantDA: DA2, productionId: A2R }]]);
        expect(overlays[0].retire).toBe(true);
    });

    it('P.d verdict refusé : la modale reste ouverte, ni le nom ni l\'évaluation liée ne s\'écrivent, une notification le dit', async () => {
        const { win, journal, overlays, registre } = monterProprietes({ fichier: FICHIER_SARA(), verdict: false, champs: { etudiant: DA2, nom: 'Nouveau nom.pdf', evaluation: 'EVAL_X', jeton: true } });
        win.ouvrirProprieteFichier('FT_sara');
        await registre['prop-fichier-btn-sauver'].onclick();
        expect(journal.reassignations).toHaveLength(1);
        expect(journal.miseAJour).toEqual([]);
        expect(journal.jetons).toEqual([]);
        expect(overlays[0].retire).toBe(false);
        expect(journal.notifs).toEqual([['info', 'Réassignation annulée']]);
    });

    it('P.e verdict accepté : le nom s\'écrit ensuite, la modale se ferme', async () => {
        const { win, journal, overlays, registre } = monterProprietes({ fichier: FICHIER_SARA(), champs: { production: A2R, nom: 'Nouveau nom.pdf' } });
        win.ouvrirProprieteFichier('FT_sara');
        await registre['prop-fichier-btn-sauver'].onclick();
        expect(journal.reassignations).toEqual([['FT_sara', { productionId: A2R }]]);
        expect(journal.miseAJour).toEqual([['FT_sara', { nomFichier: 'Nouveau nom.pdf' }]]);
        expect(overlays[0].retire).toBe(true);
    });

    it('P.f jeton de reprise (#561) : après le verdict vrai, la copie est marquée reprise, le jeton s\'applique sur l\'évaluation active, et l\'évaluation liée suit', async () => {
        const { win, journal, overlays, registre } = monterProprietes({ fichier: FICHIER_SARA(), champs: { production: A2R, jeton: true } });
        win.ouvrirProprieteFichier('FT_sara');
        expect(overlays[0].innerHTML).toContain('id="prop-fichier-jeton-reprise"');
        await registre['prop-fichier-btn-sauver'].onclick();
        expect(journal.reassignations).toEqual([['FT_sara', { productionId: A2R }]]);
        expect(journal.miseAJour).toEqual([['FT_sara', { estReprise: true }], ['FT_sara', { evaluationId: 'EVAL_REPRISE_1' }]]);
        expect(journal.jetons).toEqual(['EVAL_SARA_A2R']);
    });

    it('P.g jetons inactifs : pas de case', () => {
        const { win, overlays } = monterProprietes({ fichier: FICHIER_SARA(), jetonsActifs: false });
        win.ouvrirProprieteFichier('FT_sara');
        expect(overlays[0].innerHTML).not.toContain('prop-fichier-jeton-reprise');
    });
});
