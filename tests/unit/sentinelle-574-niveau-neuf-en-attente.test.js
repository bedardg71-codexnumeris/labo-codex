import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #574 — UN NIVEAU NEUF EST TENU EN ATTENTE, IL N'EST PAS INVENTÉ.
//
// Avant (mesuré le 11 oct. 2026 sur main) : « + Ajouter un niveau » écrivait EN BASE un
// niveau `code: 'N'`, plage 0-100, valeur ponctuelle 50 (`echelles.js`, ajouterNiveauEchelle) ;
// les deux ajouts de l'échelle NEUVE posaient la même plage et la même valeur dans le tampon,
// et l'enregistrement ne vérifiait pas qu'un niveau soit complet. Option B de Grégoire
// (28 août) : n'offrir que des échelles que l'utilisateur complète.
//
// Ce que le banc tient : (A) l'ajout n'écrit rien ; (B) un niveau incomplet reste au tampon ;
// (C) complet, il part avec SES valeurs ; (D) on le retire sans trace ; (E) il ne survit pas
// au changement d'échelle ; (F) les ajouts de l'échelle neuve naissent vides ; (G) une
// échelle neuve au niveau incomplet n'est pas enregistrée.
// Harnais : celui de `sentinelle-555-e-reperes-echelle-neuve` (même DOM persistant).

/** Le VRAI `ordonnerNiveauxParPlage` (#575) et le VRAI `zoneDuCodeDansNiveaux` (#555 lot 2 (b)). */
function vraisLecteurs() {
    const w = chargerScript('js/profil-etudiant-calculs.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), get: async () => null, set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null, obtenirSeuil: () => null,
        obtenirPratiqueParId: () => null, obtenirTypePratiqueActive: () => 'standards'
    });
    return { ordonnerNiveauxParPlage: w.ordonnerNiveauxParPlage, zoneDuCodeDansNiveaux: w.zoneDuCodeDansNiveaux };
}

const NIVEAUX = () => [
    { code: 'Y', nom: 'Consolidé', min: 70, max: 89, valeurCalcul: 80, couleur: '#333333' },
    { code: 'W', nom: 'Amorce',    min: 0,  max: 49, valeurCalcul: 30, couleur: '#111111' },
    { code: 'Z', nom: 'Transféré', min: 90, max: 100, valeurCalcul: 95, couleur: '#444444' },
    { code: 'X', nom: 'En chemin', min: 50, max: 69, valeurCalcul: 60, couleur: '#222222' }
];

function monter() {
    const store = { 'a2026_echellesTemplates': [] };
    // Un DOM minimal mais PERSISTANT : chaque id rend toujours le même objet,
    // pour lire ensuite ce que le rendu y a écrit.
    const elements = {};
    const element = (id) => {
        if (!elements[id]) elements[id] = { id, value: '', innerHTML: '', classList: { add() {}, remove() {}, contains: () => false } };   // contains : #1147, le menu lit si la fiche est ouverte
        return elements[id];
    };
    const lecteurs = vraisLecteurs();
    const globaux = {
        db: {
            get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
            getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; },
            modifier: async (k, mutateur, defaut) => {
                const valeur = (k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
                const resultat = await mutateur(valeur);
                if (resultat === undefined) return undefined;
                store[k] = resultat;
                return resultat;
            }
        },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        alert: (m) => { globaux.alertes.push(m); }, confirm: () => true,
        alertes: [],
        prompt: (_q, defaut) => defaut || 'Copie',
        genererIdUnique: (p) => p + 'NEUVE',
        nommerCopie: (nom) => nom + ' (copie)',
        obtenirIdentiteCCUtilisateur: () => 'test',
        // #1147 : les filtres rendent la liste (le menu la parcourt) ; le reste, du vide.
        BibliothequeUI: new Proxy({}, { get: (_, nom) => (String(nom).startsWith('filtrer') ? (l) => l : () => '') }),
        notifications: { succes: () => {}, info: () => {}, avertissement: () => {}, erreur: () => {} },
        echelleTemplateActuelle: null,
        travauxOutils: { renderPickerCouleur: () => '' },
        document: {
            getElementById: element,
            querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        },
        ordonnerNiveauxParPlage: lecteurs.ordonnerNiveauxParPlage,
        zoneDuCodeDansNiveaux: lecteurs.zoneDuCodeDansNiveaux
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    win.travauxOutils = { renderPickerCouleur: () => '' };
    win.ordonnerNiveauxParPlage = globaux.ordonnerNiveauxParPlage;
    win.zoneDuCodeDansNiveaux = globaux.zoneDuCodeDansNiveaux;
    chargerScript('js/echelles.js', globaux, win);

    win._niveauxNouvelleEchelle = NIVEAUX();
    win._reperesNouvelleEchelle = {};
    return { win, store, element, alertes: globaux.alertes };
}


const CLE = 'a2026_echellesTemplates';
const ECH = () => ({ id: 'ECH_A', nom: 'Échelle A', niveaux: NIVEAUX() });

function monterAvecEchelle() {
    const m = monter();
    m.store[CLE] = [ECH()];
    m.win.echelleTemplateActuelle = null;
    return m;
}

async function remplir(win, valeurs) {
    for (const [champ, v] of valeurs) await win.modifierNiveauEnAttente('ECH_A', champ, v);
}
const QUATRE = [['code', 'V'], ['nom', 'Avancé'], ['min', 96], ['max', 100]];

describe('#574 · le niveau neuf d\'une échelle enregistrée', () => {
    it('A · « + Ajouter un niveau » n\'écrit rien et ouvre un niveau VIDE en attente', async () => {
        const { win, store } = monterAvecEchelle();
        await win.ajouterNiveauEchelle('ECH_A');
        expect(store[CLE][0].niveaux).toHaveLength(4);
        expect(win._niveauEnAttente.echelleId).toBe('ECH_A');
        const n = win._niveauEnAttente.niveau;
        expect([n.code, n.nom, n.min, n.max, n.valeurCalcul]).toEqual(['', '', '', '', '']);
    });

    it('A bis · le niveau en attente est rendu sous les niveaux, avec ses mots et son handler', async () => {
        const { win, element } = monterAvecEchelle();
        await win.ajouterNiveauEchelle('ECH_A');
        win.afficherNiveauxEchelle(ECH());
        const html = element('tableauNiveauxEchelle').innerHTML;
        expect(html).toContain('Niveau en attente');
        expect(html).toContain('data-on-change="modifierNiveauEnAttenteHandler"');
        expect(html.indexOf('Niveau en attente')).toBeGreaterThan(html.lastIndexOf('data-niveau-index="3"'));
    });

    it('B · quatre champs sur cinq : toujours rien en base', async () => {
        const { win, store } = monterAvecEchelle();
        await win.ajouterNiveauEchelle('ECH_A');
        await remplir(win, QUATRE);
        expect(store[CLE][0].niveaux).toHaveLength(4);
        expect(win._niveauEnAttente.niveau.max).toBe(100);
    });

    it('B bis · un champ obligatoire vidé est refusé, et n\'achève pas le niveau', async () => {
        const { win, store } = monterAvecEchelle();
        await win.ajouterNiveauEchelle('ECH_A');
        await remplir(win, QUATRE);
        const r = await win.modifierNiveauEnAttente('ECH_A', 'valeurCalcul', NaN);
        expect(r.refuse).toMatch(/valeur ponctuelle/);
        expect(store[CLE][0].niveaux).toHaveLength(4);
    });

    it('C · le cinquième champ l\'envoie en base, avec les valeurs de l\'utilisateur, et vide le tampon', async () => {
        const { win, store } = monterAvecEchelle();
        await win.ajouterNiveauEchelle('ECH_A');
        await remplir(win, [...QUATRE, ['valeurCalcul', 98]]);
        const niveaux = store[CLE][0].niveaux;
        expect(niveaux).toHaveLength(5);
        expect(niveaux[4]).toMatchObject({ code: 'V', nom: 'Avancé', min: 96, max: 100, valeurCalcul: 98 });
        expect(win._niveauEnAttente).toBeNull();
    });

    it('D · retirer le niveau en attente ne laisse aucune trace', async () => {
        const { win, store } = monterAvecEchelle();
        await win.ajouterNiveauEchelle('ECH_A');
        await remplir(win, QUATRE);
        win.retirerNiveauEnAttente('ECH_A');
        expect(win._niveauEnAttente).toBeNull();
        expect(store[CLE][0].niveaux).toHaveLength(4);
    });

    it('E · il ne suit pas l\'utilisateur dans une autre échelle', async () => {
        const { win, store } = monterAvecEchelle();
        store[CLE].push({ id: 'ECH_B', nom: 'Échelle B', niveaux: NIVEAUX() });
        await win.ajouterNiveauEchelle('ECH_A');
        await win.chargerEchellePourModif('ECH_B').catch(() => {});
        expect(win._niveauEnAttente).toBeNull();
    });
});

describe('#574 · l\'échelle NEUVE', () => {
    it('F · les deux ajouts du tampon naissent sans plage ni valeur', () => {
        const { win } = monter();
        const vide = (n) => [n.code, n.nom, n.min, n.max, n.valeurCalcul];
        // Lus SÉPARÉMENT : `ajouterPremierNiveau` remplace le tableau, il effacerait l'autre.
        win._niveauxNouvelleEchelle = [];
        win.ajouterNiveauTemp();
        expect(win._niveauxNouvelleEchelle).toHaveLength(1);
        expect(vide(win._niveauxNouvelleEchelle[0]), 'ajouterNiveauTemp').toEqual(['', '', '', '', '']);
        win.ajouterPremierNiveau();
        expect(win._niveauxNouvelleEchelle).toHaveLength(1);
        expect(vide(win._niveauxNouvelleEchelle[0]), 'ajouterPremierNiveau').toEqual(['', '', '', '', '']);
    });

    it('G · un niveau incomplet empêche l\'enregistrement, et le refus nomme le niveau', async () => {
        const { win, store, element, alertes } = monter();
        element('nomEchelleTemplate').value = 'Incomplète';
        win.ajouterNiveauTemp();
        await win.sauvegarderEchelleComplete();
        expect(store[CLE]).toEqual([]);
        expect(alertes.some((m) => /^Niveau 5 — Le code du niveau est obligatoire/.test(m))).toBe(true);
    });

    it('G bis · témoin : les quatre niveaux complets s\'enregistrent', async () => {
        const { win, store, element } = monter();
        element('nomEchelleTemplate').value = 'Complète';
        await win.sauvegarderEchelleComplete();
        expect(store[CLE]).toHaveLength(1);
    });
});
