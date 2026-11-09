import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — lot « Un mot pour ton étudiant·e » (consigne du 9 nov. 2026, décidée avec Grégoire).
//
// LE CONSTAT. Une retouche tapée dans le cadre « Générale » (`retroactionFinale`) n'arrivait jamais au
// PDF de l'élève : la synthèse l'écarte et rebâtit chaque critère depuis la cartouche. Le mot qui doit
// arriver a désormais son champ (`motPourEtudiant`) et sa section, « Un mot pour toi », juste après le
// bandeau du niveau global et avant les tampons.
//
// ⛔ RÈGLE FERME DE GRÉGOIRE : champ vide → la section N'EXISTE PAS, ni titre ni case. Un champ de blancs
// seuls (espaces, retours à la ligne) compte comme vide. Son motif : un élève qui reçoit une case vide
// lirait que son enseignant·e n'a rien écrit pour lui, malgré la quantité de rétroaction.
//
// Le banc passe par les DEUX modules réels (données, puis rendu) : c'est le HTML qui part à html2canvas
// que l'on lit. Noms et textes fictifs.

const registre = chargerScript('js/pratiques/pratique-registre.js', {}, {});
const NIVEAUX = [{ code: 'I', nom: 'Incomplet', couleur: '#c33' }, { code: 'D', nom: 'en Développement', couleur: '#e93' },
    { code: 'M', nom: 'Maîtrisé', couleur: '#39c' }, { code: 'E', nom: 'Étendu', couleur: '#3a6' }];

const copie = (extra) => Object.assign({
    id: 'EV1', etudiantDA: '9990001', productionId: 'P1', grilleId: 'G1', echelleId: 'E1',
    statutRemise: 'evalue', statutIntegrite: 'recevable', dateEvaluation: '2026-11-05T08:00:00.000Z',
    noteFinale: 82, niveauFinal: 'M', verrouillee: true,
    criteres: [{ critereId: 'c1', critereNom: 'Analyse', niveauSelectionne: 'M', ponderation: 100, retroaction: 'Commentaire fictif.' }],
    retroactionFinale: 'Rétroaction générée fictive.'
}, extra);

// `echapper` : l'échappement réel est le contrat (règle de sécurité 1) ; le banc le remplace par un
// marqueur visible pour prouver que le rendu passe bien par lui.
function banc({ echapper = (s) => String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;'), anonymiser = null } = {}) {
    const db = { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} };
    const globaux = {
        db, cle: (k) => 'test_' + k,
        libelleCopieNonRecevable: registre.libelleCopieNonRecevable,
        obtenirEchelleResolue: () => ({ id: 'E1', niveaux: NIVEAUX }),
        niveauDuCodeDansEchelle: (code) => { const rang = ['I', 'D', 'M', 'E'].indexOf(code); return rang < 0 ? null : { rang }; },
        zoneDuNiveau: (code) => ({ I: 'priorite', D: 'priorite', M: 'signale', E: 'acquis' })[code] || null,
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? [{ id: 'P1', titre: 'Production fictive', type: 'artefact-portfolio' }]
            : k === 'grillesTemplates' ? [{ id: 'G1', nom: 'Grille témoin', criteres: [{ id: 'c1', nom: 'Analyse', ponderation: 100 }] }] : []),
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'A2026' }),
        obtenirEtudiantsCoursActif: () => [], obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null }, travauxOutils: { AUTOCOLLANTS: [] },
        obtenirPreference: () => null, obtenirConfigPratiqueActive: () => null, calculerDetailsNoteFinale: () => null
    };
    if (anonymiser) globaux.anonymiserTexteRetroaction = anonymiser;
    const data = chargerScript('js/synthese-retroaction-data.js', globaux).syntheseRetroactionData;
    const rendu = chargerScript('js/synthese-retroaction-rendu.js', { db, cle: (k) => 'test_' + k, echapperHtml: echapper }).syntheseRetroactionRendu;
    return {
        feedback: (ev) => data.construireFeedback(ev, { id: 'F1' }, null),
        html: (ev) => rendu.rendreSyntheseHTML(data.construireFeedback(ev, { id: 'F1' }, null))
    };
}

const TITRE = /Un mot pour toi/i;

describe('Le PDF de synthèse — « Un mot pour toi » : présente si le mot est écrit, absente sinon (règle de Grégoire)', () => {
    const b = banc();

    it('champ vide : ni titre ni case', () => {
        const html = b.html(copie({ motPourEtudiant: '' }));
        expect(html).not.toMatch(TITRE);
        expect(b.feedback(copie({ motPourEtudiant: '' })).motPourEtudiant).toBe('');
    });

    it('clé absente (copie d’avant ce lot, import) : vide, ni titre ni case', () => {
        expect(b.html(copie())).not.toMatch(TITRE);
    });

    it('espaces, tabulations et retours à la ligne seuls : vide, ni titre ni case', () => {
        for (const blancs of ['   ', '\n\n', ' \n \t \r\n ', ' \n']) {
            expect(b.html(copie({ motPourEtudiant: blancs })), JSON.stringify(blancs)).not.toMatch(TITRE);
        }
    });

    it('rempli : le titre et le texte, retours à la ligne gardés', () => {
        const mot = 'Bravo pour ta relecture.\nOn en reparle mardi.';
        const html = b.html(copie({ motPourEtudiant: '\n  ' + mot + '  \n' }));
        expect(html).toMatch(TITRE);
        expect(html).toContain(mot);   // le \n est dans le HTML, rendu par `white-space: pre-wrap`
        expect(html).toMatch(/white-space: pre-wrap[^>]*>Bravo pour ta relecture\.\nOn en reparle mardi\.<\/div>/);
    });

    it('placée après le bandeau du niveau global, avant les tampons et le bilan', () => {
        const html = b.html(copie({ motPourEtudiant: 'Un mot fictif.' }));
        const iNiveau = html.indexOf('Niveau général');
        const iMot = html.search(TITRE);
        const iBilan = html.indexOf('>Bilan<');
        expect(iNiveau).toBeGreaterThan(-1);
        expect(iMot).toBeGreaterThan(iNiveau);
        if (iBilan !== -1) expect(iMot).toBeLessThan(iBilan);
    });

    it('avant les tampons : sur une page qui en porte, la section vient avant « Commentaires ciblés »', () => {
        // Le montage des données n'a pas d'annotation (aucun tampon) : la place se lit donc sur le rendu
        // seul, avec un feedback qui porte une catégorie de tampons (relecture du 9 nov. : sans elle,
        // déplacer la section après les tampons restait vert).
        const rendu = chargerScript('js/synthese-retroaction-rendu.js', { echapperHtml: (x) => String(x) }).syntheseRetroactionRendu;
        const feedback = Object.assign({}, b.feedback(copie({ motPourEtudiant: 'Un mot fictif.' })), {
            stamps: [{ id: 'action', nom: 'Action', couleur: '#27b9e0', items: [{ nom: 'Tampon fictif', count: 2, comment: 'Commentaire fictif.' }] }]
        });
        const html = rendu.rendreSyntheseHTML(feedback);
        const iTampons = html.indexOf('Commentaires ciblés');
        expect(iTampons).toBeGreaterThan(-1);
        expect(html.search(TITRE)).toBeGreaterThan(html.indexOf('Niveau général'));
        expect(html.search(TITRE)).toBeLessThan(iTampons);
    });

    it('le texte est échappé (règle de sécurité 1)', () => {
        const html = b.html(copie({ motPourEtudiant: '<img src=x onerror=alert(1)>' }));
        expect(html).not.toContain('<img src=x');
        expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('une copie non recevable garde son mot, comme sa rétroaction écrite', () => {
        const html = b.html(copie({ statutIntegrite: 'plagiat', motPourEtudiant: 'Viens me voir.' }));
        expect(html).toContain('Non recevable (Plagiat)');   // le montage est bien celui d'une copie non recevable
        expect(html).toMatch(TITRE);
        expect(html).toContain('Viens me voir.');
    });

    it('en anonymisation, le mot passe par le même outil que la rétroaction écrite', () => {
        const anon = banc({ anonymiser: (t) => t.replace(/Zoé/g, 'Élève 1') });
        const html = anon.html(copie({ motPourEtudiant: 'Bravo Zoé.' }));
        expect(html).toContain('Bravo Élève 1.');
        expect(html).not.toContain('Zoé');
    });
});
