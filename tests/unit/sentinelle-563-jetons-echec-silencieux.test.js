import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #563 (28 août 2026) — deux défauts, dont un seul était corrigeable aujourd'hui.
//
// LES ÉCHECS SILENCIEUX (traité). Les six écritures d'`evaluation-jetons.js`
// n'examinaient jamais le retour de `sauvegarderDonneesSelonMode`, qui rend
// `false` en mode anonymisation comme sur erreur de stockage. Le jeton n'était
// pas enregistré, mais l'interface se mettait à jour comme si tout allait bien :
// badges, notification de succès, rafraîchissement de la liste. Au rechargement,
// le jeton avait disparu sans que personne n'ait rien vu passer.
//
// LA CASE QUI MENT (garde-fou seulement). Décocher « Reprise ciblée » tombait
// dans un TODO vide : la case se décochait, le jeton restait. Le retrait n'est
// PAS implémenté — `retirerJetonRepriseCiblee` n'existe nulle part, et défaire
// une reprise ciblée suppose de supprimer l'évaluation qu'elle a créée. Le
// pendant pour la reprise normale est une opération à confirmations multiples
// avec risque de perte de note (#141, #360) : décision de conception, pas
// correctif. En attendant, la case revient à l'état RÉEL des données et le dit.
//
// Break-tests (à faire rougir AVANT de faire confiance à cette sentinelle) :
//   1. rendre son appel nu à un des six sites → « aucune écriture nue » rougit.
//   2. faire rendre `true` au helper quoi qu'il arrive → « l'échec est propagé »
//      et « l'échec est dit » rougissent.
//   3. remettre `checkbox.checked = false` dans la branche de décochage
//      → « la case revient à l'état réel » rougit.

function sansCommentaires(txt) {
    return txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

const srcJetons = readFileSync(path.join(racineProjet, 'js', 'evaluation-jetons.js'), 'utf8');
const srcSauvegarde = readFileSync(path.join(racineProjet, 'js', 'evaluation-sauvegarde.js'), 'utf8');

function monter({ ecritureRefusee }) {
    const erreurs = [];
    const gestes = [];
    const evaluations = [
        { id: 'E1', etudiantDA: '111', productionId: 'P1', jetonDelaiApplique: true, delaiAccorde: true }
    ];
    const stubs = {
        db: { get: async () => null, getSync: () => evaluations, set: async () => {}, setSync: () => {} },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => evaluations,
        // Le cœur du test : l'écriture est REFUSÉE. Lot B de l'enregistrement (27 sept. 2026) :
        // la fonction rend `false` sur tout refus (plus de chaîne), et c'est ELLE qui dit
        // l'échec par le témoin commun, avec le geste reçu en option.
        sauvegarderDonneesSelonMode: (cle, donnees, options) => {
            gestes.push(options && options.geste);
            return !ecritureRefusee;
        },
        obtenirPreference: () => null,
        notifications: {
            erreur: (titre, msg) => erreurs.push(titre + ' | ' + msg),
            succes: () => {}, info: () => {}
        }
    };
    const win = chargerScript('js/evaluation-jetons.js', stubs, {
        addEventListener: () => {}, removeEventListener: () => {}
    });
    return { win, erreurs, gestes, evaluations };
}

describe('#563 · une écriture de jeton refusée ne passe plus pour un succès', () => {
    it('l’échec est PROPAGÉ à l’appelant (retour false)', () => {
        const { win } = monter({ ecritureRefusee: true });
        expect(win.retirerJetonDelai('E1')).toBe(false);
    });

    it('l’échec est DIT une fois, par le témoin commun : le geste lui est passé, aucun toast propre', () => {
        const { win, erreurs, gestes } = monter({ ecritureRefusee: true });
        win.retirerJetonDelai('E1');
        expect(gestes).toEqual(['Retrait du jeton de délai']);
        expect(erreurs).toHaveLength(0);
    });

    it('contrôle : écriture acceptée → succès, aucune alarme (garde ciblée)', () => {
        const { win, erreurs } = monter({ ecritureRefusee: false });
        expect(win.retirerJetonDelai('E1')).toBe(true);
        expect(erreurs).toHaveLength(0);
    });

    it('aucune écriture nue ne subsiste dans le module', () => {
        const nu = sansCommentaires(srcJetons);
        // Toute persistance doit passer par le point unique, qui examine le retour.
        expect(nu).not.toMatch(/^\s*sauvegarderDonneesSelonMode\('evaluationsSauvegardees'/m);
        // Et le point unique doit bien exister et examiner ce retour.
        expect(nu).toContain('function _persisterEvaluationsJetons');
        const corps = nu.slice(nu.indexOf('function _persisterEvaluationsJetons'));
        expect(corps.slice(0, 600)).toContain('{ geste }) === true');
    });
});

describe('#563 · la case « Reprise ciblée » est RETIRÉE (option C, 29 août 2026) — et aucun chemin ne l\'applique plus', () => {
    it('ni la case, ni son handler, ni la fonction d\'application, hors commentaires', () => {
        const nuS = sansCommentaires(srcSauvegarde);
        const nuJ = sansCommentaires(srcJetons);
        expect(nuS).not.toContain('checkboxJetonRepriseCiblee');
        expect(nuS).not.toContain('gererChangementCheckboxJetonRepriseCiblee');
        expect(nuJ).not.toContain('function appliquerJetonRepriseCiblee');
        expect(nuJ).not.toContain('window.appliquerJetonRepriseCiblee');
    });

    it('le tampon d\'annotation ne route plus vers une case absente', () => {
        const nuA = sansCommentaires(readFileSync(path.join(racineProjet, 'js', 'travaux-annotation.js'), 'utf8'));
        const nuO = sansCommentaires(readFileSync(path.join(racineProjet, 'js', 'travaux-outils.js'), 'utf8'));
        expect(nuA).not.toContain('checkboxJetonRepriseCiblee');
        expect(nuO).not.toContain("jetonType: 'repriseCiblee'");
    });

    it('le type non pris en charge est nommé au lieu de tomber dans le vide (retirerJetonDepuisSidebar)', () => {
        const nu = sansCommentaires(srcSauvegarde);
        const pos = nu.indexOf('function retirerJetonDepuisSidebar');
        expect(pos, 'la fonction doit exister').toBeGreaterThan(-1);
        const corps = nu.slice(pos, nu.indexOf('\n}', pos));
        expect(corps).toContain('notifications.info');
    });

    it('les reprises ciblées DÉJÀ faites restent lisibles : le bilan et le filtre de la liste les nomment encore', () => {
        const retro = readFileSync(path.join(racineProjet, 'js', 'evaluation-retroaction.js'), 'utf8');
        expect(retro).toContain('jetonRepriseCibleeApplique');
        const html = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
        expect(html).toContain('value="jeton-reprise-ciblee"');
    });
});
