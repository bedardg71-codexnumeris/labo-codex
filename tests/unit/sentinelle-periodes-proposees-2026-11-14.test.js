import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// ESSAI NOVICE DU 14 NOV. 2026, LOT 1c — LES PÉRIODES D'UNE SÉANCE SE PROPOSENT
//
// Vécu par Grégoire : il entre le début et la fin, et doit encore taper le nombre de périodes ;
// changer les heures ne change rien. Faits donnés : une période dure 50 ou 55 minutes selon le
// collège, la pause varie, mais une période AVEC sa pause occupe environ une heure à l'horaire.
//
// Décidé : le champ « pér. » se PROPOSE d'après le début et la fin, durée arrondie à l'heure près ;
// il se recalcule quand début ou fin change, tant qu'on n'y a pas tapé ; il reste modifiable et
// fait foi ; le résumé suit. Rien ne se déduit de la pondération.
//
// ⚠ STOCK : le chiffre d'un horaire ENREGISTRÉ fait foi ; changer ses heures ne le recalcule pas
// (c'est le dénominateur de l'assiduité). Noms fictifs.

function element(valeur = '') {
    const set = new Set();
    return { value: valeur, textContent: '', innerHTML: '', options: [], focus() {}, scrollIntoView() {},
        classList: { add: (c) => set.add(c), remove: (c) => set.delete(c), contains: (c) => set.has(c), toggle() {} } };
}

const EXISTANT = { id: 'HOR_1', groupeAssocie: '00001', nom: 'Lun-Mer fictif', seances: [{ jour: 'Lundi', heureDebut: '08:00', heureFin: '10:00', nombrePeriodes: 3, local: 'A-101' }] };

function monter({ horaires = [EXISTANT], nbSeances = '1' } = {}) {
    const ids = {
        'v2-btnSupprimerHoraire': element(), 'v2-selectHoraire': element(), 'v2-titreFormHoraire': element(),
        'v2-btnCreerHoraire': element(), 'v2-carteResumeHoraire': element(), 'v2-horaireEtatVide': element(),
        'v2-formulaireHoraire': element(), 'v2-hor-seances': element(), 'v2-hor-formatResume': element(),
        'v2-hor-groupeAssocie': element(), 'v2-hor-nom': element(), 'v2-hor-nbSeances': element(nbSeances)
    };
    for (let i = 0; i < Number(nbSeances); i++) {
        for (const s of ['jour', 'debut', 'fin', 'periodes', 'local']) ids[`v2-hor-seance-${i}-${s}`] = element();
    }
    ids['v2-hor-groupeAssocie'].options = [{ value: '' }, { value: '00001' }];
    const stores = { a2026_horaires: JSON.parse(JSON.stringify(horaires)), a2026_horaireHebdo: [], a2026_groupeEtudiants: [] };
    const sauvegarder = vi.fn((k, v) => { stores['a2026_' + k] = JSON.parse(JSON.stringify(v)); return true; });
    const fiches = {};
    const win = chargerScript('js/trimestre-v2-horaires.js', {
        document: { getElementById: (id) => ids[id] || null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], createElement: () => element() },
        db: { getSync: (k, d) => (k in stores ? stores[k] : d), setSync: (k, v) => { stores[k] = v; } },
        cle: (n) => 'a2026_' + n,
        sauvegarderDonneesSelonMode: sauvegarder,
        echapperHtml: (s) => String(s == null ? '' : s), echapperAttribut: (s) => String(s == null ? '' : s),
        genererIdUnique: (p) => p + 'NEUF',
        fusionnerSeancesHoraires: (hs) => (hs || []).flatMap(h => (h && h.seances) || []),
        notifications: { succes() {}, erreur() {} },
        estEnModeDemo: () => false
    }, { temoinEnregistrement: { nonEnregistre: vi.fn(), enregistre: vi.fn() }, raisonPourTemoin: (r) => r,
        uiDialogues: { declarerFicheEnCreation: (g, p) => { fiches[g] = p; }, quitterCreationSiConfirme: async () => true } });
    win.populerDropdownsAssemblageV2 = () => {};
    const champ = (i, s) => ids[`v2-hor-seance-${i}-${s}`];
    return { win, ids, stores, sauvegarder, fiches, champ };
}

describe('1c · la proposition : la durée à l\'horaire, arrondie à l\'heure près', () => {
    const { win } = monter();
    it.each([
        ['08:00', '10:00', 2],   // l'exemple de la consigne
        ['08:00', '09:50', 2],   // l'autre : deux périodes de 55 min, la dernière sans pause
        ['08:00', '11:00', 3],   // le bloc que la division du lot C comptait quatre
        ['08:00', '12:00', 4],
        ['13:00', '13:50', 1],
        ['08:00', '08:20', 1],   // jamais zéro pour une séance qui existe
        ['08:00', '20:00', 8]    // borné au maximum du champ
    ])('%s à %s : %i', (debut, fin, attendu) => {
        expect(win.periodesProposees(debut, fin)).toBe(attendu);
    });

    it.each([['', '10:00'], ['08:00', ''], ['10:00', '08:00'], ['08:00', '08:00'], ['abc', '10:00']])(
        '%s à %s : les heures ne disent rien, rien n\'est proposé', (debut, fin) => {
            expect(win.periodesProposees(debut, fin)).toBe(0);
        });
});

describe('1c · nouvel horaire — le champ « pér. » naît proposé et suit les heures', () => {
    it('à l\'ouverture : 8 h à 10 h, 2 périodes proposées ; le résumé les compte', async () => {
        const e = monter({ nbSeances: '2' });
        await e.win.nouveauHoraireV2();
        expect(e.champ(0, 'periodes').value).toBe('2');
        expect(e.champ(1, 'periodes').value).toBe('2');
        expect(e.ids['v2-hor-formatResume'].textContent).toBe('2 séances · 4 périodes/semaine');
    });

    it('la fin change : la proposition se recalcule, le résumé suit, rien n\'est écrit', async () => {
        const e = monter();
        await e.win.nouveauHoraireV2();
        e.champ(0, 'fin').value = '12:00';
        expect(e.win.changerHeuresSeanceHoraireV2(0)).toBe(false);   // création : rien avant « Créer l'horaire »
        expect(e.champ(0, 'periodes').value).toBe('4');
        expect(e.ids['v2-hor-formatResume'].textContent).toBe('1 séance · 4 périodes/semaine');
        expect(e.sauvegarder).not.toHaveBeenCalled();
    });

    it('un chiffre TAPÉ fait foi : changer les heures ne l\'écrase plus', async () => {
        const e = monter();
        await e.win.nouveauHoraireV2();
        e.champ(0, 'periodes').value = '3';
        e.win.saisirPeriodesSeanceHoraireV2(0);
        e.champ(0, 'fin').value = '12:00';
        e.win.changerHeuresSeanceHoraireV2(0);
        expect(e.champ(0, 'periodes').value).toBe('3');
    });

    it('le champ vidé à la main redevient proposable', async () => {
        const e = monter();
        await e.win.nouveauHoraireV2();
        e.champ(0, 'periodes').value = '';
        e.win.saisirPeriodesSeanceHoraireV2(0);
        e.champ(0, 'fin').value = '11:00';
        e.win.changerHeuresSeanceHoraireV2(0);
        expect(e.champ(0, 'periodes').value).toBe('3');
    });

    it('une proposition n\'est pas une saisie : la fiche vierge ne retient pas le rechargement', async () => {
        const e = monter();
        await e.win.nouveauHoraireV2();
        expect(e.fiches.horaire()).toBe(false);
        e.champ(0, 'periodes').value = '3';
        e.win.saisirPeriodesSeanceHoraireV2(0);
        expect(e.fiches.horaire()).toBe(true);
    });

    it('changer le nombre de séances garde le chiffre tapé ET sa qualité de chiffre tapé', async () => {
        const e = monter({ nbSeances: '2' });
        await e.win.nouveauHoraireV2();
        e.ids['v2-hor-nbSeances'].value = '2';
        e.champ(0, 'periodes').value = '3';
        e.win.saisirPeriodesSeanceHoraireV2(0);
        e.win.changerFormatSeancesHoraireV2();
        expect(e.champ(0, 'periodes').value).toBe('3');
        e.champ(0, 'fin').value = '12:00';
        e.win.changerHeuresSeanceHoraireV2(0);
        expect(e.champ(0, 'periodes').value).toBe('3');     // tapé : fait foi
        e.champ(1, 'fin').value = '12:00';
        e.win.changerHeuresSeanceHoraireV2(1);
        expect(e.champ(1, 'periodes').value).toBe('4');     // resté proposé : suit
    });
});

describe('1c · STOCK — le chiffre d\'un horaire enregistré fait foi', () => {
    it('à l\'ouverture : les 3 périodes du stock, pas les 2 que 8 h à 10 h proposerait', () => {
        const e = monter();
        e.win.changerHoraireSelectionneV2('HOR_1');
        expect(e.champ(0, 'periodes').value).toBe('3');
    });

    it('changer ses heures enregistre les heures, et laisse ses périodes', () => {
        const e = monter();
        e.win.changerHoraireSelectionneV2('HOR_1');
        e.champ(0, 'fin').value = '12:00';
        expect(e.win.changerHeuresSeanceHoraireV2(0)).toBe(true);
        expect(e.champ(0, 'periodes').value).toBe('3');
        expect(e.stores.a2026_horaires[0].seances[0]).toMatchObject({ heureFin: '12:00', nombrePeriodes: 3 });
    });

    it('rouvrir l\'horaire n\'écrit rien', () => {
        const e = monter();
        e.win.changerHoraireSelectionneV2('HOR_1');
        expect(e.sauvegarder).not.toHaveBeenCalled();
    });
});
