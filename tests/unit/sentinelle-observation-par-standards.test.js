/**
 * SENTINELLE (22 nov. 2026) — L'ÉCRAN D'OBSERVATION DE « PAR STANDARDS », première version réduite (« à l'essai »).
 *
 * Décisions de Grégoire du 22 nov. 2026. Rapport : plans de travail/RAPPORT-2026-11-22-observation-par-standards.md.
 *
 * VERROUILLÉ ICI, sur les modules RÉELS (inscriptions-cibles.js, tableau-cibles.js, observation-cibles.js, equipes.js) :
 *   A. La règle d'acceptation : un niveau, un texte OU un critère renseigné ; vide des trois, refusée.
 *   B. L'origine : trois valeurs ; une inscription d'avant (sans origine) se lit « production » si elle désigne une
 *      production, « observation » sinon, et n'est pas réécrite.
 *   C. Le parcours complet : cinq étudiant·es fictifs, une cible ; une touche de critère et « Inscrire et passer au
 *      suivant » par étudiant·e ; cinq observations sans niveau ni production ; « vu aujourd'hui » au carrousel.
 *   D. La sélection d'un petit groupe : seuls les gardé·es défilent et reçoivent quelque chose.
 *   E. Le carrousel ne porte jamais le niveau retenu ; l'écran ne pose pas de niveau.
 *   F. « absent aujourd'hui » d'après les présences du groupe ; sans fiche du jour, rien.
 *   G. Une cible sans critère : le texte seul, et l'écran le dit.
 *   H. La fenêtre d'une case offre les trois origines ; l'historique (et le profil) dit l'origine.
 *   I. Les mots : ni « dépistage » ni « RàI » ; les noms sont échappés.
 *
 * Données fictives seulement (Zoé Fictive, Yan Inventé…). BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';
import { dbBanc } from './_helpers/bac-suivi.js';
import { fonctionsDeLEchelle } from './_helpers/moteur-cibles.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const echapperHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const CLE = 'test_inscriptionsCibles';
const attendre = () => new Promise(r => setTimeout(r, 0));

const CINQ = [
    { da: '2200001', prenom: 'Zoé', nom: 'Fictive' }, { da: '2200002', prenom: 'Yan', nom: 'Inventé' },
    { da: '2200003', prenom: 'Lou', nom: 'Imaginaire' }, { da: '2200004', prenom: 'Max', nom: 'Supposé' },
    { da: '2200005', prenom: 'Noa', nom: 'Fabulé' }];
const CIBLE = { id: 'cib-lire', etiquette: 'Lire un texte', enonce: 'Dégager le sens.', poids: 1, terminale: false,
    criteres: [{ id: 'crit-a', texte: 'Repère les idées', essentiel: true }, { id: 'crit-b', texte: 'Cite le texte', essentiel: false }] };
const CIBLE_NUE = { id: 'cib-ecrire', etiquette: 'Rédiger une analyse', enonce: '', poids: 1, terminale: true, criteres: [] };
const ECHELLE = { id: 'ECH-banc', nom: 'Échelle du banc', niveaux: [
    { code: '0', nom: 'Données insuffisantes', min: 0, max: 12.49, valeurCalcul: 0 }, { code: '1', nom: 'En apprentissage', min: 12.5, max: 37.49, valeurCalcul: 25 },
    { code: '2', nom: 'Ça y est presque', min: 37.5, max: 62.49, valeurCalcul: 50 }, { code: '3', nom: 'Acquis', min: 62.5, max: 87.49, valeurCalcul: 75 },
    { code: '4', nom: 'Avancé', min: 87.5, max: 100, valeurCalcul: 100 }] };

function monter({ store = {}, etudiants = CINQ, cibles, presences = [], productions = [], coursId = 'GC-banc' } = {}) {
    const dom = new JSDOM('<!doctype html><body><div id="hote"></div></body>');
    const doc = dom.window.document;
    const journal = [];
    const base = Object.assign({
        test_ensemblesCibles: [{ id: 'ENS1', coursId: 'COURS-ZZZ', cibles: cibles || [clone(CIBLE), clone(CIBLE_NUE)] }],
        test_echellesTemplates: [clone(ECHELLE)]
    }, store);
    const db = dbBanc(base, journal);
    const win = { echapperHtml };
    const globaux = {
        document: doc, Event: dom.window.Event, echapperHtml, db, cle: (k) => 'test_' + k,
        CSS: { escape: (s) => String(s).replace(/["\\]/g, '\\$&') },
        obtenirEchelleResolue: (id) => (base.test_echellesTemplates || []).find(e => e.id === id) || null,
        genererBadgePratiqueHTML: () => '<span class="badge-type-pratique">STD</span>',
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? productions : (k === 'presences' ? presences : [])),
        obtenirCoursActifId: () => coursId,
        ...fonctionsDeLEchelle()
    };
    let n = 0;
    chargerScript('js/pratiques/ensembles-cibles.js', globaux, win);
    chargerScript('js/pratiques/inscriptions-cibles.js', globaux, win);
    chargerScript('js/pratiques/note-cibles.js', globaux, win);
    chargerScript('js/equipes.js', globaux, win);
    win.genererIdUnique = (p) => p + 'OBS' + (++n);
    win.TableauNotation = { MOTS: { reglages: 'Réglages de la pratique', aucunEleve: 'Aucun·e étudiant·e.', exporter: 'Exporter' },
        couleurSure: (c) => (c || 'var(--accent-primaire)'), rafraichirSiAffiche() {} };
    win.obtenirPratiqueParId = () => ({ expliquerNoteNonConstructible: () => 'Pas encore de note.' });
    chargerScript('js/tableau-cibles.js', globaux, win);
    chargerScript('js/observation-cibles.js', globaux, win);
    const ctx = { etat: 'cibles', pratiqueId: 'cib-banc', pratiqueNom: 'Par standards du banc',
        donnees: { id: 'cib-banc', configuration: { type: 'cibles', ensembleCiblesId: 'ENS1', echelleId: ECHELLE.id, niveauSansDonnee: '0' } },
        etudiants, productions };
    const hote = doc.getElementById('hote');
    hote.innerHTML = win.TableauCibles.construireHTML(ctx);
    win.TableauCibles.apresRendu(hote, ctx);
    const touches = { n: 0 };
    const toucher = (el) => { if (!el) throw new Error('élément absent'); touches.n++; el.click(); };
    return { win, doc, hote, ctx, store: base, journal, IC: win.InscriptionsCibles, OC: win.ObservationCibles, TC: win.TableauCibles, toucher, touches };
}

const fenetre = (e) => e.doc.querySelector('.oc-fenetre');
const pastilles = (e) => [...e.doc.querySelectorAll('.oc-pastille')];
const stock = (e) => e.store[CLE] || [];
const AUJ = (e) => e.IC.dateDuJour();

/** Ouvre l'écran par le bandeau, choisit la cible, et commence. */
function ouvrirEtCommencer(e, cibleId = CIBLE.id) {
    e.toucher(e.hote.querySelector('[data-tc="observer"]'));
    e.toucher(fenetre(e).querySelector(`.oc-tuile[data-cible="${cibleId}"]`));
    e.toucher(fenetre(e).querySelector('[data-oc="commencer"]'));
}

describe('A · la règle d\'acceptation : un niveau, un texte ou un critère renseigné', () => {
    const s = (IC, quoi) => Object.assign({ da: '2200001', ensembleId: 'ENS1', cibleId: CIBLE.id, niveau: null, echelleId: null,
        date: '2026-11-22', productionId: null, noteBreve: '', criteres: IC.etatDesCriteres(CIBLE, {}) }, quoi);
    it('un critère respecté seul, un critère NON respecté seul, un texte seul, un niveau seul : acceptés', () => {
        const { IC } = monter();
        expect(IC.motifsRefus(s(IC, { criteres: IC.etatDesCriteres(CIBLE, { 'crit-a': true }) }), ECHELLE)).toEqual([]);
        expect(IC.motifsRefus(s(IC, { criteres: IC.etatDesCriteres(CIBLE, { 'crit-b': false }) }), ECHELLE)).toEqual([]);
        expect(IC.motifsRefus(s(IC, { noteBreve: 'Lit à voix haute.' }), ECHELLE)).toEqual([]);
        expect(IC.motifsRefus(s(IC, { niveau: '2', echelleId: ECHELLE.id }), ECHELLE)).toEqual([]);
    });
    it('vide des trois (critères tous non renseignés, texte blanc) : refusée, en mots', () => {
        const { IC } = monter();
        expect(IC.motifsRefus(s(IC, { noteBreve: '   ' }), ECHELLE)).toEqual([IC.MOTIFS.VIDE]);
        expect(IC.motifsRefus(s(IC, { criteres: [] }), ECHELLE)).toEqual([IC.MOTIFS.VIDE]);
        expect(IC.aUnCritereRenseigne([{ id: 'x', respecte: null }, { id: 'y', respecte: 'oui' }]), 'une valeur étrangère n\'est pas renseignée').toBe(false);
    });
});

describe('B · l\'origine : trois valeurs ; les inscriptions d\'avant se lisent sans être réécrites', () => {
    it('sans origine enregistrée : « production » si elle désigne une production, « observation » sinon ; enregistrée : telle quelle', () => {
        const { IC } = monter();
        expect(IC.lireOrigine({ productionId: 'P1' })).toBe('production');
        expect(IC.lireOrigine({ productionId: null })).toBe('observation');
        expect(IC.lireOrigine({ productionId: null, origine: 'conversation' })).toBe('conversation');
        expect(IC.lireOrigine({ productionId: null, origine: 'inconnue' })).toBe('observation');
    });
    it('écrire une observation ne réécrit pas les anciennes : elles restent sans champ d\'origine, à l\'identique', async () => {
        const VIEILLES = [
            { id: 'V1', type: 'inscription', da: '2200001', ensembleId: 'ENS1', cibleId: CIBLE.id, niveau: '3', echelleId: 'ECH-banc', date: '2026-10-01', horodatage: '2026-10-01T12:00:00.000Z', productionId: 'P1', noteBreve: '', criteres: [] },
            { id: 'V2', type: 'inscription', da: '2200002', ensembleId: 'ENS1', cibleId: CIBLE.id, niveau: null, echelleId: null, date: '2026-10-02', horodatage: '2026-10-02T12:00:00.000Z', productionId: null, noteBreve: 'note', criteres: [] }];
        const e = monter({ store: { [CLE]: clone(VIEILLES) } });
        ouvrirEtCommencer(e);
        e.toucher(fenetre(e).querySelector('.tc-coche--oui'));
        e.toucher(fenetre(e).querySelector('[data-oc="inscrire"]'));
        await attendre();
        expect(stock(e)).toHaveLength(3);
        expect(stock(e).slice(0, 2), 'les anciennes, intactes et sans `origine`').toEqual(VIEILLES);
        expect(e.IC.lireOrigine(stock(e)[0])).toBe('production');
        expect(e.IC.lireOrigine(stock(e)[1])).toBe('observation');
    });
    it('la forme rangée : une production désignée impose « production » ; sinon « conversation » si demandée, « observation » d\'office', () => {
        const { IC } = monter();
        expect(IC.construireInscription({ productionId: 'P1', origine: 'conversation' }).origine).toBe('production');
        expect(IC.construireInscription({ productionId: null, origine: 'conversation' }).origine).toBe('conversation');
        expect(IC.construireInscription({ productionId: null }).origine).toBe('observation');
    });
});

describe('C · le parcours complet : cinq étudiant·es fictifs, une cible', () => {
    it('une touche de critère et « Inscrire et passer au suivant » par étudiant·e ; cinq observations sans niveau ; tous « vu aujourd\'hui »', async () => {
        const e = monter();
        ouvrirEtCommencer(e);
        expect(e.touches.n, 'ouvrir, choisir la cible, commencer').toBe(3);
        expect(pastilles(e)).toHaveLength(5);
        const avant = e.touches.n;
        for (let i = 0; i < 5; i++) {
            expect(fenetre(e).querySelector('.oc-nom').textContent).toBe(`${CINQ[i].prenom} ${CINQ[i].nom}`);
            expect(fenetre(e).querySelector('.oc-pastille[aria-current="true"]').dataset.index).toBe(String(i));
            e.toucher(fenetre(e).querySelector(i % 2 ? '.tc-coche--non' : '.tc-coche--oui'));
            e.toucher(fenetre(e).querySelector('[data-oc="inscrire"]'));
            await attendre();
        }
        expect(e.touches.n - avant, 'deux touches par étudiant·e').toBe(10);
        const liste = stock(e);
        expect(liste).toHaveLength(5);
        expect(liste.map(x => x.da)).toEqual(CINQ.map(x => x.da));
        liste.forEach(x => {
            expect(x).toMatchObject({ type: 'inscription', ensembleId: 'ENS1', cibleId: CIBLE.id, niveau: null, echelleId: null,
                productionId: null, origine: 'observation', date: AUJ(e) });
        });
        expect(liste.map(x => x.criteres[0].respecte)).toEqual([true, false, true, false, true]);
        expect(liste.every(x => x.criteres[1].respecte === null), 'le critère non touché reste non renseigné').toBe(true);
        // La fin de la liste, et les cinq pastilles marquées.
        expect(fenetre(e).querySelector('#oc-fin-titre')).not.toBeNull();
        expect(pastilles(e).every(p => p.textContent.includes(e.OC.MOTS.vu))).toBe(true);
        // Une observation n'entre pas au niveau retenu : la case reste « sans donnée ».
        const ligne = e.TC.eleveDuContexte(e.TC.completerContexte(e.ctx), CINQ[0].da).parCible.get(CIBLE.id);
        expect(ligne.retenu).toBeNull();
    });

    it('« Conversation » d\'une touche ; le carrousel mène à n\'importe qui ; « Passer » n\'écrit rien ; une observation vide est refusée', async () => {
        const e = monter();
        ouvrirEtCommencer(e);
        e.toucher(fenetre(e).querySelector('.oc-pastille[data-index="3"]'));
        expect(fenetre(e).querySelector('.oc-nom').textContent).toBe('Max Supposé');
        e.toucher(fenetre(e).querySelector('[data-oc="inscrire"]'));
        await attendre();
        expect(fenetre(e).querySelector('.tc-alerte').textContent).toBe(e.IC.MOTIFS.OBSERVATION_VIDE);
        expect(stock(e)).toHaveLength(0);
        e.toucher(fenetre(e).querySelector('[data-oc="passer"]'));
        expect(fenetre(e).querySelector('.oc-nom').textContent).toBe('Noa Fabulé');
        expect(stock(e)).toHaveLength(0);
        e.toucher(fenetre(e).querySelector('[data-oc="origine"][data-valeur="conversation"]'));
        e.toucher(fenetre(e).querySelector('.tc-coche--oui'));
        fenetre(e).querySelector('.oc-note').value = 'Au bureau : explique sa démarche.';
        e.toucher(fenetre(e).querySelector('[data-oc="inscrire"]'));
        await attendre();
        expect(stock(e)).toHaveLength(1);
        expect(stock(e)[0]).toMatchObject({ da: '2200005', origine: 'conversation', noteBreve: 'Au bureau : explique sa démarche.', niveau: null });
    });
});

describe('D · la sélection d\'un petit groupe', () => {
    it('« Quelques étudiant·es », deux gardé·es : deux pastilles, et seules elles reçoivent une observation', async () => {
        const e = monter();
        e.toucher(e.hote.querySelector('[data-tc="observer"]'));
        e.toucher(fenetre(e).querySelector(`.oc-tuile[data-cible="${CIBLE.id}"]`));
        e.toucher(fenetre(e).querySelector('[data-oc="quelques"]'));
        e.toucher(fenetre(e).querySelector('[data-oc="commencer"]'));
        expect(fenetre(e).querySelector('.tc-alerte').textContent, 'personne de gardé : refus en mots').toBe(e.OC.MOTS.choisisQuelquun);
        e.toucher(fenetre(e).querySelector('.oc-nom-choix[data-da="2200002"]'));
        e.toucher(fenetre(e).querySelector('.oc-nom-choix[data-da="2200004"]'));
        e.toucher(fenetre(e).querySelector('[data-oc="commencer"]'));
        expect(pastilles(e).map(p => p.querySelector('.oc-pastille-nom').textContent)).toEqual(['Yan Inventé', 'Max Supposé']);
        for (let i = 0; i < 2; i++) {
            e.toucher(fenetre(e).querySelector('.tc-coche--oui'));
            e.toucher(fenetre(e).querySelector('[data-oc="inscrire"]'));
            await attendre();
        }
        expect(stock(e).map(x => x.da)).toEqual(['2200002', '2200004']);
        expect(e.OC.quiDefile(CINQ, true, new Set(['2200002']))).toHaveLength(5);
    });
});

describe('E · le carrousel ne porte jamais le niveau retenu ; l\'écran ne pose pas de niveau', () => {
    it('une étudiante au niveau retenu « Avancé » : ni son nom de niveau, ni son code, ni sa couleur à l\'écran d\'observation', () => {
        const AVANCE = { id: 'N1', type: 'inscription', da: '2200001', ensembleId: 'ENS1', cibleId: CIBLE.id, niveau: '4', echelleId: 'ECH-banc',
            date: '2026-11-01', horodatage: '2026-11-01T12:00:00.000Z', productionId: null, noteBreve: '', criteres: [] };
        const e = monter({ store: { [CLE]: [AVANCE] } });
        expect(e.TC.eleveDuContexte(e.TC.completerContexte(e.ctx), '2200001').parCible.get(CIBLE.id).retenu.niveau, 'le niveau est bien retenu').toBe('4');
        ouvrirEtCommencer(e);
        const html = fenetre(e).innerHTML;
        const carrousel = fenetre(e).querySelector('.oc-carrousel').outerHTML;
        for (const n of ECHELLE.niveaux) expect(html.includes(n.nom), `« ${n.nom} »`).toBe(false);
        expect(carrousel).not.toMatch(/--tn-couleur|tc-case|niveau/i);
        expect(fenetre(e).querySelectorAll('.tc-niveaux, .tc-niveau, input[type="radio"]'), 'aucune tuile de niveau').toHaveLength(0);
        expect(Object.keys(e.OC.etatDuCarrousel(CINQ, [AVANCE], { ensembleId: 'ENS1', cibleId: CIBLE.id, date: '2026-11-01' })[0]).sort())
            .toEqual(['absent', 'da', 'nom', 'vu']);
    });
    it('« vu aujourd\'hui » : une observation ou une conversation du jour, non annulée ; ni une production, ni un autre jour, ni une autre cible', () => {
        const { IC } = monter();
        const jour = '2026-11-22';
        const i = (id, quoi) => Object.assign({ id, type: 'inscription', da: id, ensembleId: 'ENS1', cibleId: CIBLE.id, date: jour, productionId: null, niveau: null }, quoi);
        const liste = [i('a'), i('b', { origine: 'conversation' }), i('c', { productionId: 'P1' }), i('d', { date: '2026-11-21' }),
            i('e', { cibleId: 'autre' }), i('f'), { id: 'X', type: 'annulation', inscriptionId: 'f' }];
        expect([...IC.vusALaDate(liste, 'ENS1', CIBLE.id, jour)].sort()).toEqual(['a', 'b']);
    });
});

describe('F · « absent aujourd\'hui » d\'après les présences du groupe', () => {
    it('une fiche du jour à 0 période : absent ; un retard : présent ; sans fiche : rien ; une fiche d\'un autre groupe : ignorée', () => {
        const presences = [
            { da: '2200001', date: '__AUJ__', periodesPresentes: 0, coursId: 'GC-banc' },
            { da: '2200002', date: '__AUJ__', periodesPresentes: 1, coursId: 'GC-banc' },
            { da: '2200003', date: '__AUJ__', periodesPresentes: 0, coursId: 'GC-autre' }];
        const sonde = monter();
        presences.forEach(p => { p.date = AUJ(sonde); });
        const e = monter({ presences });
        ouvrirEtCommencer(e);
        const marques = pastilles(e).map(p => p.textContent.includes(e.OC.MOTS.absent));
        expect(marques).toEqual([true, false, false, false, false]);
        expect(fenetre(e).querySelector('.oc-qui').textContent).toContain(e.OC.MOTS.absent);
    });
});

describe('G · une cible sans critère : le texte seul, et l\'écran le dit', () => {
    it('aucune coche ; la phrase sobre ; un texte s\'inscrit, rien ne s\'inscrit sans texte', async () => {
        const e = monter();
        ouvrirEtCommencer(e, CIBLE_NUE.id);
        expect(fenetre(e).querySelectorAll('.tc-coche')).toHaveLength(0);
        expect(fenetre(e).querySelector('[data-oc-bloc] .oc-section .tc-aide').textContent).toBe(e.OC.MOTS.sansCritere);
        e.toucher(fenetre(e).querySelector('[data-oc="inscrire"]'));
        await attendre();
        expect(stock(e)).toHaveLength(0);
        fenetre(e).querySelector('.oc-note').value = 'Plan au tableau, bien amorcé.';
        e.toucher(fenetre(e).querySelector('[data-oc="inscrire"]'));
        await attendre();
        expect(stock(e)).toHaveLength(1);
        expect(stock(e)[0]).toMatchObject({ cibleId: CIBLE_NUE.id, criteres: [], noteBreve: 'Plan au tableau, bien amorcé.' });
    });
});

describe('H · la fenêtre d\'une case offre les trois origines ; l\'historique dit l\'origine', () => {
    it('« Observation en classe » d\'office, « Conversation », puis les productions ; chacune s\'écrit avec son origine', async () => {
        const e = monter({ productions: [{ id: 'P1', titre: 'Analyse 1' }] });
        const ecrire = async (valeur, texte) => {
            e.TC.ouvrirInscription('2200001', CIBLE.id, null);
            const f = e.doc.querySelector('.tc-fenetre');
            const sel = f.querySelector('.tc-origine');
            expect([...sel.options].map(o => o.textContent)).toEqual([e.TC.MOTS.origineObservation, e.TC.MOTS.origineConversation, 'Analyse 1']);
            expect(sel.value, 'l\'observation d\'office').toBe('');
            sel.value = valeur;
            f.querySelector('.tc-retroaction').value = texte;
            f.querySelector('[data-tc="inscrire"]').click();
            await attendre();
        };
        await ecrire('', 'vu en atelier');
        await ecrire('__conversation', 'au bureau');
        await ecrire('P1', 'dans la copie');
        expect(stock(e).map(x => [x.origine, x.productionId])).toEqual([['observation', null], ['conversation', null], ['production', 'P1']]);
        const ctx = e.TC.completerContexte(e.ctx);
        const profil = e.TC.historiqueHTML(ctx, '2200001', CIBLE.id, { lectureSeule: true });
        expect(profil).toContain(`>${e.TC.MOTS.lueObservation}<`);
        expect(profil).toContain(`>${e.TC.MOTS.lueConversation}<`);
        expect(profil).toContain('Production : Analyse 1');
        expect(profil).not.toContain('data-tc="annuler"');
    });
});

describe('I · les mots, et l\'échappement', () => {
    it('ni « dépistage » ni « RàI » à l\'écran ; la mention « À l\'essai » est là', () => {
        const e = monter();
        ouvrirEtCommencer(e);
        const tout = JSON.stringify(Object.values(e.OC.MOTS).map(m => (typeof m === 'function' ? m(2, 5) : m))) + fenetre(e).textContent;
        expect(tout).not.toMatch(/dépistage|RàI|RAI\b/i);
        expect(fenetre(e).querySelector('.etiquette-essai')).not.toBeNull();
    });
    it('un nom piégé s\'affiche en texte, au carrousel, au grand nom et au choix du petit groupe', () => {
        const PIEGE = '<img src=x onerror=alert(1)>';
        const e = monter({ etudiants: [{ da: '2200009', prenom: PIEGE, nom: 'Fictif' }] });
        e.toucher(e.hote.querySelector('[data-tc="observer"]'));
        e.toucher(fenetre(e).querySelector('[data-oc="quelques"]'));
        expect(fenetre(e).querySelectorAll('img:not(.modal-close-icon)')).toHaveLength(0);
        e.toucher(fenetre(e).querySelector('.oc-nom-choix'));
        e.toucher(fenetre(e).querySelector(`.oc-tuile[data-cible="${CIBLE.id}"]`));
        e.toucher(fenetre(e).querySelector('[data-oc="commencer"]'));
        expect(fenetre(e).querySelectorAll('img:not(.modal-close-icon)')).toHaveLength(0);
        expect(fenetre(e).querySelector('.oc-nom').textContent).toBe(`${PIEGE} Fictif`);
    });
});

/*
 * BREAK-TESTS (22 nov. 2026), joués puis annulés ; ce qui a échoué :
 *   - `motifsRefus` sans `aUnCritereRenseigne` (la règle d'avant) : A, B (deuxième), C (premier), D.
 *   - `lireOrigine` qui rend toujours « observation » : B (deux premiers), E (« vu aujourd'hui »), H.
 *   - `etatDuCarrousel` qui ajoute un niveau à la pastille : E (premier) ; le même niveau dessiné dans la pastille : E (premier).
 *   - `quiDefile` qui ignore les gardé·es : D.
 *   - `absentsDuJour` sans le filtre du groupe : F.
 */
