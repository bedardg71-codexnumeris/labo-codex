import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLES — #381 + #382 (audit qualité 5 août 2026, rapports B3 et B4) —
//
// #381 : les boutons « Activer » d'un groupe-cours (formulaire + bibliothèque)
// écrivaient groupeCoursActif SEUL, sans infoCours — violation de l'invariant
// d'atomicité du couple (Écart #6, en-tête trimestre-v2-orchestre.js) : en
// multi-cours, toute l'app restait sur l'ANCIEN cours pendant que l'en-tête
// affichait le nouveau. Verrou : les deux fonctions DÉLÈGUENT au chemin
// canonique changerGroupeCoursActifV2 et n'écrivent plus groupeCoursActif
// elles-mêmes.
//
// #382 : éditer un étudiant REMPLAÇAIT l'objet par les 7 champs du formulaire
// (statut abandon/inactif effacé → réintégré aux moyennes) et écrivait par
// index capturé à l'ouverture (mauvais étudiant si la liste avait changé).
// Verrou : fusion { ...existant, ...formulaire } + relocalisation par le DA
// d'origine + refus explicite si introuvable (patron #332).

function envGroupesCours(groupesCours) {
    const store = { groupesCours: JSON.parse(JSON.stringify(groupesCours)) };
    const setSyncSpy = vi.fn((k, v) => { store[k] = v; });
    const db = {
        getSync: (k, d) => (k in store ? store[k] : d),
        setSync: setSyncSpy
    };
    const win = chargerScript('js/trimestre-v2-groupes-cours.js', {
        db, cle: (k) => k, notifications: { succes: vi.fn(), erreur: vi.fn() },
        BibliothequeUI: { fermerModal: () => {}, creerModal: () => {}, renderCarteSelection: () => '' },
        genererIdUnique: (p) => p + 'X', estEnModeDemo: () => false, echapperHtml: (s) => s
    });
    win.changerGroupeCoursActifV2 = vi.fn(async () => {});
    return { win, store, setSyncSpy };
}

describe('#381 · les boutons Activer délèguent au chemin canonique (couple groupeCoursActif+infoCours)', () => {
    it('activerGroupeCoursDepuisBibliotheque délègue et n\'écrit PLUS groupeCoursActif directement', async () => {
        const { win, setSyncSpy } = envGroupesCours([{ id: 'GC_1', coursId: 'C1' }, { id: 'GC_2', coursId: 'C2' }]);
        await win.activerGroupeCoursDepuisBibliotheque('GC_2');
        expect(win.changerGroupeCoursActifV2).toHaveBeenCalledWith('GC_2');
        const clesEcrites = setSyncSpy.mock.calls.map(c => c[0]);
        expect(clesEcrites).not.toContain('groupeCoursActif'); // plus d'écriture directe du couple incomplet
    });

    it('activerGroupeCoursV2 (formulaire) délègue pour le GC en édition', async () => {
        const { win, setSyncSpy } = envGroupesCours([{ id: 'GC_1', coursId: 'C1' }]);
        // Passer le GC en édition via le chemin normal du formulaire
        win.changerGroupeCoursSelectionneV2('GC_1');
        await win.activerGroupeCoursV2();
        expect(win.changerGroupeCoursActifV2).toHaveBeenCalledWith('GC_1');
        expect(setSyncSpy.mock.calls.map(c => c[0])).not.toContain('groupeCoursActif');
    });
});

function envEtudiants(etudiants) {
    const store = { groupeEtudiants: JSON.parse(JSON.stringify(etudiants)) };
    const db = {
        get: async (k) => store[k],
        set: async (k, v) => { store[k] = v; },
        getSync: (k, d) => (k in store ? store[k] : d),
        setSync: (k, v) => { store[k] = v; },
        // #522 lot 5 : `soumettreEtudiantV2` écrit par la file, et le refus de
        // #382 (« la liste a changé depuis l'ouverture du formulaire ») vit
        // désormais DANS le mutateur. Le stub reproduit la file, refus compris —
        // un mutateur qui rend `undefined` n'écrit RIEN, ce qui est exactement
        // le chemin que ce fichier vérifie.
        modifier: async (k, mutateur, defaut = null) => {
            const lue = k in store ? store[k] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[k] = resultat;
            return resultat;
        }
    };
    const elements = {};
    ['v2-etudiantDA', 'v2-etudiantNom', 'v2-etudiantPrenom', 'v2-etudiantGroupe',
     'v2-etudiantProgramme', 'v2-etudiantSA', 'v2-formEtudiantTitre'].forEach(id => {
        elements[id] = { value: '', textContent: '', classList: { add: () => {}, remove: () => {} } };
    });
    const fauxDocument = {
        addEventListener: () => {},
        getElementById: (id) => elements[id] || null,
        querySelectorAll: () => []
    };
    const notifications = { succes: vi.fn(), erreur: vi.fn() };
    // Lot E2 (28 sept. 2026, D3) : un refus parle par le témoin commun.
    const temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    const win = chargerScript('js/trimestre-v2-etudiants.js', {
        db, cle: (k) => k, document: fauxDocument, notifications,
        estEnModeDemo: () => false, genererIdUnique: (p) => p + 'X',
        // #749 lot 2 : la normalisation du numéro de groupe vit dans modes.js (non chargé ici)
        normaliserNumeroGroupe: (g) => String(g || '').padStart(5, '0')
    }, { temoinEnregistrement: temoin, raisonPourTemoin: (r) => r });
    return { win, store, elements, notifications, temoin };
}

describe('#382 · éditer un étudiant préserve ses champs hors formulaire et vise le bon étudiant', () => {
    it('FUSIONNE : le statut (abandon) survit à une correction de nom', async () => {
        const { win, store, elements } = envEtudiants([
            { da: '111', nom: 'Untl', prenom: 'Ana', groupe: '00001', statut: 'abandon', coursId: 'C1' }
        ]);
        win.editerEtudiantV2('111');
        elements['v2-etudiantNom'].value = 'Untel'; // correction de la coquille
        await win.soumettreEtudiantV2();
        expect(store.groupeEtudiants[0].nom).toBe('Untel');
        expect(store.groupeEtudiants[0].statut).toBe('abandon'); // PRÉSERVÉ
    });

    it('INDEX PÉRIMÉ : écrit sur l\'étudiant au bon DA même si la liste a changé depuis l\'ouverture', async () => {
        const { win, store, elements } = envEtudiants([
            { da: '000', nom: 'Premier', prenom: 'P', groupe: '00001' },
            { da: '111', nom: 'Cible', prenom: 'C', groupe: '00001' }
        ]);
        win.editerEtudiantV2('111'); // index capturé = 1
        // La liste change entre-temps : l'étudiant '000' est retiré → '111' passe à l'index 0
        store.groupeEtudiants = [{ da: '111', nom: 'Cible', prenom: 'C', groupe: '00001' }];
        elements['v2-etudiantNom'].value = 'Cible-Corrigée';
        await win.soumettreEtudiantV2();
        expect(store.groupeEtudiants[0].da).toBe('111');
        expect(store.groupeEtudiants[0].nom).toBe('Cible-Corrigée');
    });

    it('REFUS EXPLICITE : étudiant disparu entre ouverture et save → erreur, pas de faux succès ni d\'écriture', async () => {
        const { win, store, elements, notifications, temoin } = envEtudiants([
            { da: '111', nom: 'Cible', prenom: 'C', groupe: '00001' }
        ]);
        win.editerEtudiantV2('111');
        store.groupeEtudiants = []; // disparu (purge, changement de trimestre…)
        elements['v2-etudiantNom'].value = 'Perdu';
        await win.soumettreEtudiantV2();
        expect(temoin.nonEnregistre).toHaveBeenCalledTimes(1);   // lot E2 : par le témoin
        expect(temoin.nonEnregistre.mock.calls[0][0]).toMatch(/^Étudiant·e introuvable : la liste a changé depuis l'ouverture du formulaire\. Resélectionne l'étudiant·e\.$/);
        expect(notifications.succes).not.toHaveBeenCalled();
        expect(store.groupeEtudiants).toHaveLength(0); // rien écrit
    });
});
