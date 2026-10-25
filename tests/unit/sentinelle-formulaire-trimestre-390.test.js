import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #390 (audit qualité 5 août 2026, rapports B5+B6+B7, 🟡) —
// Lot petits correctifs du formulaire Trimestre :
// B5 : « Réinitialiser les bornes » laissait calendrierComplet intact et ne
//      rafraîchissait ni stats ni avertissements — la sidebar gardait
//      « 15 sem. · 75 jours ». La réinitialisation PURGE le calendrier (pas de
//      régénération : le générateur a des dates de repli en dur qui
//      fabriqueraient un calendrier fantôme) ; les semaines spéciales, elles,
//      RÉGÉNÈRENT (bornes présentes).
// B6 : supprimerGroupeCoursV2 comparait l'OBJET groupeCoursActif à un id
//      (jamais vrai) — supprimer le GC actif laissait groupeCoursActif et
//      infoCours pointer un GC effacé.
// B7 : sauvegarderIdentificationTrimestreV2 retournait en SILENCE sans
//      session/année — suivi de « Cadre sauvegardé », faux succès.
//      ↻ Lot E2 (28 sept. 2026, D3) : l'invariant reste « jamais un succès après un
//      refus ». Sur un trimestre existant, session et année s'écrivent au changement :
//      un état intermédiaire n'écrit rien et ne dit rien. « Créer le trimestre »
//      incomplet parle par le témoin commun.

function envInit({ store = {}, champs = {} } = {}) {
    const donnees = { ...store };
    const db = {
        getSync: (k, d = null) => (k in donnees ? donnees[k] : d),
        setSync: (k, v) => { donnees[k] = v; },
        removeSync: vi.fn((k) => { delete donnees[k]; }),
        memoryCache: new Map()
    };
    const elements = {};
    for (const [id, value] of Object.entries(champs)) elements[id] = { value };
    const fauxDocument = {
        addEventListener: () => {},
        getElementById: (id) => elements[id] || null,
        querySelectorAll: () => []
    };
    const notifications = { erreur: vi.fn(), succes: vi.fn() };
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const genererCalendrierComplet = vi.fn();
    const win = chargerScript('js/trimestre-v2-init.js', {
        db, document: fauxDocument, notifications, cle: (k) => k,
        localStorage: { get length() { return 0; }, key: () => null, getItem: () => null, setItem: () => {}, removeItem: () => {} },
        setValue: () => {}, genererIdUnique: (p) => p + 'X', confirm: () => true,
        genererCalendrierComplet
    }, { temoinEnregistrement: temoin, raisonPourTemoin: (r) => r });
    win.afficherStatistiquesTrimestreV2 = vi.fn();
    return { win, donnees, db, notifications, temoin, genererCalendrierComplet };
}

describe('#390 B5 · réinitialisations : calendrier purgé/régénéré + stats rafraîchies', () => {
    it('réinitialiser les BORNES purge calendrierComplet et rafraîchit les stats', () => {
        const { win, donnees, db } = envInit({
            store: { cadreCalendrier: { dateDebut: '2026-08-24' }, calendrierComplet: { '2026-08-24': { statut: 'cours' } } }
        });
        win.reinitialiserBornesTrimestreV2();
        expect(db.removeSync).toHaveBeenCalledWith('calendrierComplet');
        expect('calendrierComplet' in donnees).toBe(false);
        expect(win.afficherStatistiquesTrimestreV2).toHaveBeenCalled();
    });

    it('réinitialiser les SEMAINES SPÉCIALES régénère le calendrier et rafraîchit les stats', () => {
        const { win, genererCalendrierComplet } = envInit({
            store: { cadreCalendrier: { dateDebut: '2026-08-24', semainePlanificationDebut: '2026-10-12' } }
        });
        win.reinitialiserSemainesSpecialesV2();
        expect(genererCalendrierComplet).toHaveBeenCalled();
        expect(win.afficherStatistiquesTrimestreV2).toHaveBeenCalled();
    });
});

describe('#390 B7 · identification incomplète : jamais un succès après un refus (lot E2)', () => {
    it('« Créer le trimestre » sans session ni année : « Non enregistré », rien d\'écrit, aucun succès', () => {
        const { win, donnees, notifications, temoin } = envInit({
            champs: { 'v2-nomTrimestre': '', 'v2-sessionTrimestre': '', 'v2-anneeTrimestre': '' }
        });
        expect(win.creerTrimestreV2()).toBe(false);
        expect(temoin.nonEnregistre).toHaveBeenCalledTimes(1);
        expect(temoin.nonEnregistre.mock.calls[0][1]).toBe('Créer le trimestre');
        expect(notifications.succes).not.toHaveBeenCalled();
        expect(donnees.trimestres).toBeUndefined();
    });
    it('trimestre existant, session changée sans année : état intermédiaire — rien d\'écrit, rien de dit', () => {
        const registre = [{ id: 'a2026', nom: 'Automne 2026', session: 'A', annee: 2026, actif: true }];
        const { win, donnees, notifications, temoin } = envInit({
            store: { trimestres: JSON.parse(JSON.stringify(registre)) },
            champs: { 'v2-nomTrimestre': 'Automne 2026', 'v2-sessionTrimestre': 'hiver', 'v2-anneeTrimestre': '' }
        });
        expect(win.sauvegarderIdentificationTrimestreV2()).toBe(false);
        expect(temoin.nonEnregistre).not.toHaveBeenCalled();
        expect(notifications.erreur).not.toHaveBeenCalled();
        expect(notifications.succes).not.toHaveBeenCalled();
        expect(donnees.trimestres).toEqual(registre);
    });
});

describe('#390 B6 · supprimer le groupe-cours ACTIF purge le couple groupeCoursActif+infoCours', () => {
    it('la garde compare gcActif.id (plus jamais objet === id) et purge les deux clés', async () => {
        const donnees = {
            groupesCours: [{ id: 'GC_1', coursId: 'C1' }],
            groupeCoursActif: { id: 'GC_1', coursId: 'C1' },
            infoCours: { id: 'C1', groupe: '00001' }
        };
        const db = {
            getSync: (k, d = null) => (k in donnees ? donnees[k] : d),
            setSync: (k, v) => { donnees[k] = v; },
            memoryCache: new Map()
        };
        const win = chargerScript('js/trimestre-v2-groupes-cours.js', {
            db, cle: (k) => k, confirm: () => true, echapperHtml: (s) => s,
            notifications: { succes: vi.fn(), erreur: vi.fn() },
            BibliothequeUI: { fermerModal: () => {}, creerFenetreListe: () => {} },   // #1159
            estEnModeDemo: () => false, genererIdUnique: (p) => p + 'X',
            // #1007 : le codex à part précède la suppression (doublure : « écrit »).
            Codex: { ecrireAPartAvantSuppression: async () => true }
        });
        win.changerGroupeCoursSelectionneV2('GC_1'); // passe GC_1 en édition
        await win.supprimerGroupeCoursV2();
        expect(donnees.groupeCoursActif).toBeNull();
        expect(donnees.infoCours).toBeNull();
        expect(donnees.groupesCours).toHaveLength(0);
    });
});
