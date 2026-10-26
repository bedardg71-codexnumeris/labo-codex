import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';
import { chargerScript } from './_helpers/charger-script.js';

// #1037 (11 oct. 2026) — la bibliothèque des trimestres parle par les fenêtres et notifications de
// l'application. Le parcours « Supprimer… » est jugé par sentinelle-suppression-trimestre-361 et par
// la spec 1007 (X1).
//
// 14 oct. 2026 (consigne de Cowork : préparer la clôture de l'hiver 2026, levée du moratoire #622
// pour ce trimestre) — les trois gestes gardés au moratoire suivent :
//   « Clore » et « Rouvrir » parlent par `uiDialogues.confirmerAction` et `notifications`, AVEC LES
//   MOTS D'AVANT (un mot changé remonterait à Grégoire) ; le bouton de confirmation porte le nom du
//   geste du menu ; la bibliothèque ouverte se redessine après le geste ;
//   « Rouvrir » passe de nouveau par sa confirmation (le bouton menait à `desarchiverTrimestre`
//   sans rien demander ni rien dire) ;
//   `archiverTrimestreActif` est retiré (aucun appelant ; clore l'actif est toujours refusé, #1018).
//
// BREAK-TESTS VÉRIFIÉS le 14 oct. 2026 — journal en fin de fichier.
const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = readFileSync(path.join(racine, 'js', 'trimestre-v2-liste.js'), 'utf8');
const natifs = (t) => (t.match(/(?<![\w.])(alert|confirm|prompt)\(/g) || []).length;

describe('#1037 · aucun dialogue natif dans la bibliothèque des trimestres', () => {
    it('le fichier n\'en a plus aucun, archivage compris', () => {
        expect(natifs(src)).toBe(0);
    });
    it('« Supprimer… » et la bibliothèque vide n\'en ont plus', () => {
        expect(natifs(tranche(src, 'async function confirmerSuppressionTrimestre(', 'function changerTrimestreActifV2('))).toBe(0);
        expect(natifs(tranche(src, 'function ouvrirBibliothequeTrimestreV2(', 'function fermerModalBibliothequeTrimestres('))).toBe(0);
    });
    it('archiverTrimestreActif est retiré, et « Rouvrir » mène à sa confirmation', () => {
        expect(src).not.toMatch(/function archiverTrimestreActif\(|window\.archiverTrimestreActif/);
        expect(src).toContain("passage = { label: 'Rouvrir', action: 'confirmerDesarchivage', param: t.id,");   // #1159 : le bouton de la rangée
        expect(src).not.toContain("action: 'desarchiverTrimestre'");
    });
});

describe('#1037 · les mots de Grégoire (11 oct., 18 h 02)', () => {
    it('bibliothèque vide : le titre et le détail, tutoyés, guillemets français', () => {
        expect(src).toContain("notifications.info('Aucun trimestre dans la bibliothèque.', 'Clique sur « + Nouveau trimestre » pour en créer un.');");
        expect(src).not.toContain('Cliquez sur');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// « Clore » et « Rouvrir », joués : ce que la fenêtre demande, ce que le geste fait, ce que l'écran dit.
function banc({ repondre = true, archiver, desarchiver, modaleOuverte = true } = {}) {
    const journal = { dialogues: [], notes: [], appels: [] };
    const win = chargerScript('js/trimestre-v2-liste.js', {
        obtenirTrimestres: () => [{ id: 'h2099', nom: 'Hiver fictif 2099' }],
        archiverTrimestre: (id) => { journal.appels.push(['archiver', id]); return archiver || { success: true }; },
        desarchiverTrimestre: (id) => { journal.appels.push(['desarchiver', id]); return desarchiver || { success: true }; },
        uiDialogues: { confirmerAction: async (o) => { journal.dialogues.push(o); return repondre; } },
        notifications: {
            succes: (m) => journal.notes.push(['succes', m]), erreur: (m) => journal.notes.push(['erreur', m]),
            info() {}, warning() {}
        },
        BibliothequeUI: { creerFenetreListe: () => journal.appels.push(['redessiner']), fermerModal() {} },   // #1159 : la fenêtre à une seule liste
        document: { getElementById: (id) => (id === 'modalBibliothequeTrimestres' && modaleOuverte ? { querySelectorAll: () => [] } : null), querySelectorAll: () => [] },
        echapperHtml: (s) => String(s)
    });
    win.populerDropdownTrimestreV2 = () => {};
    return { win, journal };
}

describe('14 oct. 2026 · « Clore » par la fenêtre de l\'application, mots d\'avant', () => {
    it('la fenêtre dit les mots d\'avant ; le bouton dit « Clore »', async () => {
        const { win, journal } = banc();
        await win.confirmerArchivage('h2099');
        expect(journal.dialogues).toHaveLength(1);
        const d = journal.dialogues[0];
        expect(d.titre).toBe('Clore le trimestre "Hiver fictif 2099" ?');
        expect(d.message).toBe('Un trimestre clos passe en lecture seule et ne peut plus être modifié.\n' +
            'Cette action est réversible par le bouton « Rouvrir ».');
        expect(d.preformate).toBe(true);
        expect(d.texteConfirmer).toBe('Clore');
        expect(d.variante).toBeUndefined();
    });
    it('confirmé : le trimestre est clos, la notification le dit, la bibliothèque se redessine', async () => {
        const { win, journal } = banc();
        await win.confirmerArchivage('h2099');
        expect(journal.appels).toEqual([['archiver', 'h2099'], ['redessiner']]);
        expect(journal.notes).toEqual([['succes', 'Trimestre "Hiver fictif 2099" clos.']]);
    });
    it('annulé : rien n\'est clos, rien n\'est dit', async () => {
        const { win, journal } = banc({ repondre: false });
        await win.confirmerArchivage('h2099');
        expect(journal.appels).toEqual([]);
        expect(journal.notes).toEqual([]);
    });
    it('refusé : le motif est dit, la bibliothèque ne bouge pas', async () => {
        const { win, journal } = banc({ archiver: { success: false, error: 'Impossible de clore le trimestre actif. Change de trimestre d\'abord.' } });
        await win.confirmerArchivage('h2099');
        expect(journal.appels).toEqual([['archiver', 'h2099']]);
        expect(journal.notes).toEqual([['erreur', 'Erreur: Impossible de clore le trimestre actif. Change de trimestre d\'abord.']]);
    });
    it('trimestre introuvable : « Trimestre non trouvé », sans fenêtre', async () => {
        const { win, journal } = banc();
        await win.confirmerArchivage('a1900');
        expect(journal.dialogues).toEqual([]);
        expect(journal.notes).toEqual([['erreur', 'Trimestre non trouvé']]);
    });
});

describe('14 oct. 2026 · « Rouvrir » par la fenêtre de l\'application, mots d\'avant', () => {
    it('la fenêtre dit les mots d\'avant ; le bouton dit « Rouvrir »', async () => {
        const { win, journal } = banc();
        await win.confirmerDesarchivage('h2099');
        const d = journal.dialogues[0];
        expect(d.titre).toBe('Rouvrir le trimestre "Hiver fictif 2099" ?');
        expect(d.message).toBe('Cela permettra de modifier à nouveau les données de ce trimestre.');
        expect(d.texteConfirmer).toBe('Rouvrir');
    });
    it('confirmé : rouvert, dit, la bibliothèque se redessine ; annulé : rien', async () => {
        const oui = banc();
        await oui.win.confirmerDesarchivage('h2099');
        expect(oui.journal.appels).toEqual([['desarchiver', 'h2099'], ['redessiner']]);
        expect(oui.journal.notes).toEqual([['succes', 'Trimestre "Hiver fictif 2099" rouvert.']]);
        const non = banc({ repondre: false });
        await non.win.confirmerDesarchivage('h2099');
        expect(non.journal.appels).toEqual([]);
        expect(non.journal.notes).toEqual([]);
    });
    it('refusé : le motif est dit', async () => {
        const { win, journal } = banc({ desarchiver: { success: false, error: 'Trimestre non clos' } });
        await win.confirmerDesarchivage('h2099');
        expect(journal.notes).toEqual([['erreur', 'Erreur: Trimestre non clos']]);
    });
    it('bibliothèque fermée : le geste ne l\'ouvre pas', async () => {
        const { win, journal } = banc({ modaleOuverte: false });
        await win.confirmerDesarchivage('h2099');
        expect(journal.appels).toEqual([['desarchiver', 'h2099']]);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS (14 octobre 2026) — copie de référence, mutation, restauration (empreinte identique).
//   M1 « Rouvrir » remis sur desarchiverTrimestre (sans confirmation)                                   → 1 rouge
//   M2 un mot de la fenêtre de « Clore » changé (« modifié. » → « modifié ! »)                            → 1 rouge
//   M3 « Clore » ne redessine plus la bibliothèque                                                       → 1 rouge
//   M4 le refus de « Rouvrir » remis en alert()                                                          → 2 rouges
//   M5 le bouton de la fenêtre de « Clore » perd son nom (« Confirmer » par défaut)                       → 1 rouge
//   M6 « Rouvrir » rouvre même annulé                                                                    → 1 rouge
