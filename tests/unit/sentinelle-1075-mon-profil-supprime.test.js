/**
 * #1075, POINT 8 — « MON PROFIL » SUPPRIMÉ NE REVIENT PAS (22 oct. 2026).
 *
 * Constat (audit 2.116) : `supprimerProfilEnseignantV2` retirait le profil de `enseignants` mais laissait
 * la copie `profilEnseignant` ; au chargement suivant, `chargerProfilEnseignantV2` la réinjectait, faute
 * de profil au même courriel. Intention de Grégoire : « supprimer le profil marqué “mon profil” efface
 * aussi cette marque ; il ne revient pas au chargement suivant ».
 *
 * Ce banc charge `trimestre-v2-enseignants.js` RÉEL (montage de sentinelle-474) et verrouille :
 *   A — supprimer mon profil (copie marquée, ou copie d'avant #474 au même courriel) retire la copie, et
 *       le chargement suivant ne le ramène pas ;
 *   B — supprimer le profil d'un·e collègue ne touche pas la copie.
 *
 * Break-test (22 oct.) : sans la ligne `db.removeSync('profilEnseignant')`, A1 et A2 rougissent.
 *
 * Noms FICTIFS.
 */
import { describe, it, expect, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const MOI = { id: 'ENS_1', prenom: 'Ada', nom: 'Lovelace', courriel: 'ada@exemple.qc.ca', institution: 'Cégep fictif', departement: '', discipline: '', siteWeb: '' };
const COLLEGUE = { id: 'ENS_2', prenom: 'Alan', nom: 'Turing', courriel: 'alan@exemple.qc.ca', institution: 'Cégep fictif', departement: '', discipline: '', siteWeb: '' };

function monter(copie) {
    const store = { enseignants: JSON.parse(JSON.stringify([MOI, COLLEGUE])), profilEnseignant: JSON.parse(JSON.stringify(copie)) };
    const el = () => ({ value: '', textContent: '', innerHTML: '', focus() {}, appendChild() {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} } });
    const ids = {};
    const document = { getElementById: (id) => (ids[id] = ids[id] || el()), addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], createElement: el };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : d),
        setSync: (k, v) => { store[k] = v; },
        removeSync: (k) => { delete store[k]; }
    };
    let n = 0;
    const win = chargerScript('js/trimestre-v2-enseignants.js', {
        db, document, cle: (k) => k,
        notifications: { succes: vi.fn(), erreur: vi.fn() },
        sauvegarderDonneesSelonMode: (k, v) => { store[k] = v; return true; },
        confirm: () => true,
        genererIdUnique: (p) => p + 'NEUF' + (++n),
        trouverDoublonNaturel: (liste, obj) => liste.find((e) => e.courriel === obj.courriel) || null,
        cleNaturelleEnseignant: (e) => e.courriel,
        motsNatureContexteActif: () => ({ choisirPersonne: '—' }),
        echapperHtml: (t) => String(t), echapperAttribut: (t) => String(t)
    }, {
        temoinEnregistrement: { nonEnregistre: vi.fn(), enregistre: vi.fn() },
        raisonPourTemoin: (r) => r,
        uiDialogues: { quitterCreationSiConfirme: async () => true, declarerFicheEnCreation() {} }
    });
    const supprimer = async (id) => {
        document.getElementById('v2-selectEnseignant').value = id;
        await win.chargerEnseignantSelectionneV2();
        await win.supprimerProfilEnseignantV2();
    };
    return { win, store, supprimer };
}

describe('#1075, point 8 — « mon profil » supprimé ne revient pas', () => {
    it('A1 — copie marquée : elle part avec mon profil, et le chargement suivant ne le ramène pas', async () => {
        const e = monter({ ...MOI, enseignantId: 'ENS_1' });
        await e.supprimer('ENS_1');
        expect(e.store.enseignants.map((x) => x.id)).toEqual(['ENS_2']);
        expect('profilEnseignant' in e.store).toBe(false);
        e.win.chargerProfilEnseignantV2();
        expect(e.store.enseignants.map((x) => x.courriel)).not.toContain('ada@exemple.qc.ca');
    });

    it('A2 — copie d\'avant #474 (sans marque), au même courriel : elle part aussi', async () => {
        const e = monter({ prenom: 'Ada', nom: 'Lovelace', courriel: 'ada@exemple.qc.ca' });
        await e.supprimer('ENS_1');
        expect('profilEnseignant' in e.store).toBe(false);
    });

    it('B — supprimer un·e collègue ne touche pas ma copie', async () => {
        const copie = { ...MOI, enseignantId: 'ENS_1' };
        const e = monter(copie);
        await e.supprimer('ENS_2');
        expect(e.store.enseignants.map((x) => x.id)).toEqual(['ENS_1']);
        expect(e.store.profilEnseignant).toEqual(copie);
    });
});
