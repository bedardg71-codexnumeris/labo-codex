import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

// SENTINELLE — lot « Un mot pour ton étudiant·e » (9 nov. 2026) : CE QUE LES ÉCRIVAINS ÉCRIVENT.
//
// Le champ `#motPourEtudiant1` porte l'identité de la copie à qui son texte appartient (`data-mot-pour`),
// comme la marque #961 et les champs #671. Un écrivain n'écrit le mot que pour CETTE copie : une écriture
// qui partirait après un changement d'élève n'emporte jamais le mot du voisin. La spec WebKit
// (`un-mot-pour-ton-etudiant.spec.js`) éprouve les trajets ; ce banc éprouve la garde elle-même, qu'aucun
// trajet actuel n'exerce seul (l'instantané lit le mot au moment de la frappe) : c'est la défense en
// profondeur, et sans ce banc elle pourrait tomber sans qu'aucun test ne rougisse.
//   · masqué en anonymisation (comme les notes d'intégrité) : rien à écrire, la base garde le sien ;
//   · un mot vide sur une évaluation qui n'a jamais eu la clé ne la crée pas (absent vaut vide).
// Le code est prélevé tel quel dans les modules (aucune copie de logique dans le banc).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const retro = readFileSync(path.join(racine, 'js', 'evaluation-retroaction.js'), 'utf8');
const modes = readFileSync(path.join(racine, 'js', 'modes.js'), 'utf8');
function prelever(source, depuis, jusqua) {
    const i = source.indexOf(depuis);
    const j = source.indexOf(jusqua, i);
    if (i === -1 || j === -1) throw new Error('bornes introuvables : ' + depuis);
    return source.slice(i, j);
}
const bloc = prelever(retro, 'function _cleCopieRetroaction', '/** La rétroaction de la copie ouverte')
    + prelever(retro, 'function _champMotPourEtudiant', 'let _questionStockEnCours')
    + prelever(modes, 'function poserChampTexteLibre', '// Le titre d\'une intervention');

function monter({ anonymisation = false, copieOuverte = { etudiantDA: 'DA1', productionId: 'P1' } } = {}) {
    const dom = new JSDOM('<textarea id="motPourEtudiant1"></textarea>');
    const window = { evaluationEnCours: copieOuverte, MENTION_MASQUE_ANONYMISATION: 'Masqué' };
    const MODES = { NORMAL: 'normal', ANONYMISATION: 'anonymisation' };
    const api = new Function('document', 'window', 'modeActuel', 'MODES',
        bloc + '\nreturn { poserMotPourEtudiant, lierMotPourEtudiantALaCopie, motPourEtudiantAEcrire, ecrireMotPourEtudiant, enregistrerMotDeLaCopie };')(
        dom.window.document, window, anonymisation ? MODES.ANONYMISATION : MODES.NORMAL, MODES);
    return { api, champ: dom.window.document.getElementById('motPourEtudiant1'), window };
}

const A = { etudiantDA: 'DA1', productionId: 'P1' };
const B = { etudiantDA: 'DA2', productionId: 'P1' };

describe('Un mot pour ton étudiant·e — les écrivains n\'écrivent que le mot de la copie à qui il appartient', () => {
    it('chargé pour A : écrit pour A, jamais pour B', () => {
        const { api } = monter();
        api.poserMotPourEtudiant(Object.assign({ motPourEtudiant: 'Mot de A' }, A));
        expect(api.motPourEtudiantAEcrire(A)).toBe('Mot de A');
        expect(api.motPourEtudiantAEcrire(B)).toBeUndefined();
    });

    it('vidé au changement de copie (aucune copie) : rien à écrire pour personne', () => {
        const { api } = monter();
        api.poserMotPourEtudiant(Object.assign({ motPourEtudiant: 'Mot de A' }, A));
        api.poserMotPourEtudiant(null);
        expect(api.motPourEtudiantAEcrire(A)).toBeUndefined();
        expect(api.motPourEtudiantAEcrire(B)).toBeUndefined();
    });

    it('une frappe lie le texte à la copie ouverte', () => {
        const { api, champ, window } = monter({ copieOuverte: B });
        api.poserMotPourEtudiant(null);
        champ.value = 'Tapé pour B';
        api.lierMotPourEtudiantALaCopie();
        expect(api.motPourEtudiantAEcrire(B)).toBe('Tapé pour B');
        expect(api.motPourEtudiantAEcrire(A)).toBeUndefined();
        window.evaluationEnCours = A;   // l'écran passe à A sans recharger le champ
        expect(api.motPourEtudiantAEcrire()).toBeUndefined();
    });

    it('masqué en anonymisation : vide, désactivé, rien à écrire (la base garde le sien)', () => {
        const { api, champ } = monter({ anonymisation: true });
        api.poserMotPourEtudiant(Object.assign({ motPourEtudiant: 'Mot de A' }, A));
        expect(champ.value).toBe('');
        expect(champ.disabled).toBe(true);
        expect(api.motPourEtudiantAEcrire(A)).toBeUndefined();
        const ev = Object.assign({ motPourEtudiant: 'Mot de A' }, A);
        api.enregistrerMotDeLaCopie(ev, A);
        expect(ev.motPourEtudiant).toBe('Mot de A');
    });

    it('verrouillée : le champ se lit, il ne se touche pas', () => {
        const { api, champ } = monter();
        api.poserMotPourEtudiant(Object.assign({ motPourEtudiant: 'Mot de A', verrouillee: true }, A));
        expect(champ.value).toBe('Mot de A');
        expect(champ.disabled).toBe(true);
    });

    it('l\'écriture : un mot vide ne crée pas la clé ; il vide celle qui existe ; rien à écrire ne touche rien', () => {
        const { api } = monter();
        const sansCle = {};
        api.ecrireMotPourEtudiant(sansCle, '');
        expect(Object.prototype.hasOwnProperty.call(sansCle, 'motPourEtudiant')).toBe(false);
        const avecCle = { motPourEtudiant: 'Ancien' };
        api.ecrireMotPourEtudiant(avecCle, '');
        expect(avecCle.motPourEtudiant).toBe('');
        const intacte = { motPourEtudiant: 'Ancien' };
        api.ecrireMotPourEtudiant(intacte, undefined);
        expect(intacte.motPourEtudiant).toBe('Ancien');
        api.ecrireMotPourEtudiant(sansCle, 'Neuf');
        expect(sansCle.motPourEtudiant).toBe('Neuf');
    });
});
