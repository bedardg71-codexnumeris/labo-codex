/**
 * LOT E3 DE L'ENREGISTREMENT — LE VOLET CONFIDENTIEL DU PROFIL (D3, D0, D5 ; 28 sept. 2026)
 *
 * Les champs s'enregistrent tout seuls, par le témoin commun (`sauvegarderConfidentiel`, par
 * `sauvegarderDonneesSelonMode`) ; une note de présence s'écrit à son propre changement
 * (`enregistrerNotePresenceConfidentiel` → `modifierNotesPresence`). « Annuler » et × deviennent
 * « Fermer » ; « Enregistrer » est parti. En anonymisation (lot A) : le volet est masqué, et RIEN ne
 * s'écrit depuis lui. Harnais : `bac-suivi.js` (modes.js RÉEL). Noms fictifs.
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, elementDom, RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const DA = '2000001';

function banc({ anonymisation = false, note = true } = {}) {
    const store = storeBase();
    store.test_confidentielEtudiants = { [DA]: { notes: 'Note fictive', defiFLS: true }, '2000002': { notes: 'Autre' } };
    const profils = []; const notes = [];
    const b = monter(store, { modules: ['js/profil-etudiant-confidentiel.js'],
        globaux: { toggleDisplay() {}, afficherProfilComplet: (da) => profils.push(da), estModeAnonymisation: () => anonymisation,
            modifierNotesPresence: (da, date, texte) => { notes.push({ da, date, texte }); return note; } } });
    b.win.estModeAnonymisation = () => anonymisation;
    b.win.afficherProfilComplet = (da) => profils.push(da);
    b.win.modifierNotesPresence = (da, date, texte) => { notes.push({ da, date, texte }); return note; };
    b.win.MENTION_MASQUE_ANONYMISATION = 'Masqué en anonymisation';
    b.temoin = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
    b.win.temoinEnregistrement = b.temoin;
    b.winModes.temoinEnregistrement = b.temoin;
    b.profils = profils; b.notes = notes;
    b.champ = (id) => b.document.getElementById(id);
    // Un champ du volet : `closest('#confidentiel-champs')` le situe.
    b.dansLeVolet = (el) => Object.assign(el, { closest: (s) => (s === '#confidentiel-champs' ? {} : null) });
    b.changer = async (champ) => { const p = b.win.surChangementConfidentiel(champ); b.avancer(1); return p; };
    b.ecritures = () => b.journal.filter(j => j.k === 'test_confidentielEtudiants').length;
    return b;
}

describe('lot E3 · volet confidentiel — champ par champ, par le témoin', () => {
    it('un champ changé s\'écrit tout seul, par le témoin ; la fenêtre reste ouverte ; les autres DA intacts', async () => {
        const b = banc();
        b.win.ouvrirModalConfidentiel(DA);
        b.champ('confidentiel-notes').value = 'Plan d\'aide fictif';
        expect(await b.changer(b.dansLeVolet(b.champ('confidentiel-notes')))).toBe(true);
        expect(b.store.test_confidentielEtudiants[DA].notes).toBe('Plan d\'aide fictif');
        expect(b.store.test_confidentielEtudiants['2000002']).toEqual({ notes: 'Autre' });
        expect(b.temoin.enregistre).toHaveBeenCalledWith('test_confidentielEtudiants');
        expect(b.champ('modalConfidentiel').classList.contains('actif')).toBe(true);
    });

    it('« Fermer » après une écriture rafraîchit le profil de CE DA (#867, la pastille) ; sans écriture, rien', async () => {
        const b = banc();
        b.win.ouvrirModalConfidentiel(DA);
        b.win.fermerModalConfidentiel();
        expect(b.profils).toEqual([]);
        b.win.ouvrirModalConfidentiel(DA);
        b.champ('confidentiel-notes').value = 'Autre note fictive';
        await b.changer(b.dansLeVolet(b.champ('confidentiel-notes')));
        b.win.fermerModalConfidentiel();
        expect(b.profils).toEqual([DA]);
        expect(b.champ('modalConfidentiel').classList.contains('actif')).toBe(false);
    });

    it('une note de présence s\'écrit à son propre changement ; une présence disparue le dit par le témoin', async () => {
        const b = banc();
        b.win.ouvrirModalConfidentiel(DA);
        const ta = elementDom({ value: ' Retard fictif ', dataset: { da: DA, date: '2026-09-02' } });
        ta.classList.add('note-presence-editable');
        expect(await b.changer(ta)).toBe(true);
        expect(b.notes).toEqual([{ da: DA, date: '2026-09-02', texte: 'Retard fictif' }]);

        const c = banc({ note: null });
        c.win.ouvrirModalConfidentiel(DA);
        expect(await c.changer(ta)).toBe(false);
        expect(c.temoin.nonEnregistre).toHaveBeenCalledWith('la présence de cette date n\'existe plus ; ferme et rouvre le volet.', 'Note de présence', 'test_presences');
    });

    it('un échec d\'écriture : rien n\'est dit réussi, « Fermer » ne rafraîchit pas', async () => {
        const b = banc();
        b.win.ouvrirModalConfidentiel(DA);
        b.db.setSync = () => false;   // la garde #340 refuse
        b.champ('confidentiel-notes').value = 'Ne doit pas s\'écrire';
        expect(await b.changer(b.dansLeVolet(b.champ('confidentiel-notes')))).toBe(false);
        expect(b.temoin.enregistre).not.toHaveBeenCalled();
        b.win.fermerModalConfidentiel();
        expect(b.profils).toEqual([]);
    });
});

describe('lot E3 · volet masqué en anonymisation (lot A) : RIEN ne s\'écrit depuis lui', () => {
    it('un changement, une note, l\'écrivain appelé directement : aucune écriture', async () => {
        const b = banc({ anonymisation: true });
        b.win.ouvrirModalConfidentiel(DA);
        expect(b.champ('confidentiel-champs').classList.contains('u-hide')).toBe(true);
        b.champ('confidentiel-notes').value = 'écrit depuis un volet masqué';
        expect(await b.changer(b.dansLeVolet(b.champ('confidentiel-notes')))).toBe(false);
        const ta = elementDom({ value: 'x', dataset: { da: DA, date: '2026-09-02' } });
        ta.classList.add('note-presence-editable');
        expect(await b.changer(ta)).toBe(false);
        expect(b.win.sauvegarderConfidentiel()).toBe(false);
        expect(b.ecritures()).toBe(0);
        expect(b.notes).toEqual([]);
        expect(b.store.test_confidentielEtudiants[DA].notes).toBe('Note fictive');
    });
});

describe('lot E3 · l\'écran du volet', () => {
    const html = readFileSync(path.join(RACINE, 'index.html'), 'utf8');
    const modal = tranche(html, '<div id="modalConfidentiel"', 'MODAL ARCHIVES');

    it('« Fermer » seul ; plus d\'« Enregistrer » ni d\'« Annuler » ; × dit « Fermer »', () => {
        expect(modal).not.toContain('confidentiel-btn-enregistrer');
        expect(modal).not.toMatch(/>\s*(Enregistrer|Annuler)\s*</);
        expect(modal).toMatch(/data-action="fermerModalConfidentiel" class="btn btn-annuler u-texte-petit" style="padding: 6px 12px">\s*Fermer\s*<\/button>/);
        expect(modal).toContain('data-action="fermerModalConfidentiel" class="modal-fermer" aria-label="Fermer" title="Fermer"');
    });
});
