import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racineProjet = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Les deux fichiers des appelants ne se chargent pas dans le harnais (écouteurs posés au
// chargement) : on prend le TEXTE de la fonction, borné à la déclaration suivante, et on
// l'exécute avec les mêmes faux.
function fonctionDuFichier(fichier, nom, globaux) {
    const source = readFileSync(path.join(racineProjet, fichier), 'utf8');
    const debut = source.indexOf('function ' + nom + '(');
    if (debut === -1) throw new Error(nom + ' introuvable dans ' + fichier);
    const suite = source.slice(debut + 1).search(/\n(?:async )?function |\n\/\*\*/);
    const texte = source.slice(debut, suite === -1 ? undefined : debut + 1 + suite);
    const noms = Object.keys(globaux);
    // eslint-disable-next-line no-new-func
    return new Function(...noms, texte + '\nreturn ' + nom + ';')(...noms.map((n) => globaux[n]));
}

// T5 — CHANTIER DU DÉMO (audit du 5 oct. 2026 ; M2 mesuré par Grégoire le 6 oct.,
// BUG_grégoire_2026-10-06_15-34-54). En démo, « Verrouiller l'évaluation » sur l'Évaluation
// terminale du pack répondait « Référence démo non autorisée — Le production « Évaluation
// terminale » est un exemple fourni par Labo Codex… ». La garde C (`verifierReferencesPasDemo`)
// empêche une entité RÉELLE de désigner un modèle du pack ; une écriture DANS la démo le peut.
//
// Trois verrous :
//   · la garde se lève quand la cible est le namespace démo, et seulement alors ;
//   · les deux appelants de l'évaluation lui donnent la cible, et la collection en nom nu
//     (`getCleProductions()` la rendait déjà préfixée : « demo_productions » repassait par cle()) ;
//   · l'article suit le genre du type et s'élide (« La production », « L'échelle »).

const PRODUCTION_PACK = { id: 'PROD_PACK', titre: 'Évaluation terminale', isDemo: true };
const GRILLE_PACK = { id: 'G_PACK', nom: 'Grille du pack', isDemo: true };

function monter(trimestre) {
    const magasin = {
        [trimestre + '_productions']: [PRODUCTION_PACK],
        [trimestre + '_grillesTemplates']: [GRILLE_PACK]
    };
    const lus = [];
    const appelsCle = [];
    // Comme le vrai cle() (trimestres.js), une clé déjà préfixée ressort telle quelle : le
    // double préfixe ne se voit donc qu'aux APPELS, consignés ici.
    const cle = (nom) => { appelsCle.push(nom); return /^[a-z]\d{4}_|^demo_/.test(nom) ? nom : trimestre + '_' + nom; };
    const db = { getSync: (k, defaut) => { lus.push(k); return k in magasin ? magasin[k] : defaut; }, setSync: () => {} };
    const erreurs = [];
    const notifications = { erreur: (titre, msg) => erreurs.push(titre + ' — ' + msg), succes: () => {}, info: () => {} };
    const win = chargerScript('js/bibliotheque-ui.js', { db, cle, notifications });
    return { win, db, cle, notifications, erreurs, lus, appelsCle };
}

describe('T5 — la garde se lève pour une écriture dans la démo', () => {

    it('cible demo_… : aucune violation, même sur le matériel du pack', () => {
        const { win } = monter('demo');
        const v = win.BibliothequeUI.verifierReferencesPasDemo([
            { id: 'PROD_PACK', collection: 'productions', labelType: 'production' },
            { id: 'G_PACK', collection: 'grillesTemplates', labelType: 'grille' }
        ], { cible: 'demo_evaluationsSauvegardees' });
        expect(v).toBe(null);
    });

    it('hors démo, une entité réelle qui désigne un modèle du pack est toujours refusée', () => {
        const { win } = monter('a2026');
        const v = win.BibliothequeUI.verifierReferencesPasDemo([
            { id: 'PROD_PACK', collection: 'productions', labelType: 'production' }
        ], { cible: 'a2026_evaluationsSauvegardees' });
        expect(v).not.toBe(null);
        expect(v.message).toBe('La production « Évaluation terminale » est un exemple fourni par Labo Codex. '
            + 'Clique sur « Dupliquer » dans sa bibliothèque pour en créer ta propre version avant de l\'utiliser.');
    });

    it('sans cible, la garde agit comme avant', () => {
        const { win } = monter('demo');
        const v = win.BibliothequeUI.verifierReferencesPasDemo([
            { id: 'G_PACK', collection: 'grillesTemplates', labelType: 'grille' }
        ]);
        expect(v && v.message).toMatch(/^La grille « Grille du pack » est un exemple/);
    });

    it('l\'article suit le genre, préfixe demo- compris', () => {
        const { win } = monter('a2026');
        const msg = (labelType) => win.BibliothequeUI.verifierReferencesPasDemo([{ id: 'demo-x', labelType }]).message;
        expect(msg('échelle')).toMatch(/^L'échelle sélectionnée /);
        expect(msg('pratique')).toMatch(/^La pratique sélectionnée /);
        expect(msg('cours')).toMatch(/^Le cours sélectionné /);
        expect(msg('horaire')).toMatch(/^L'horaire sélectionné /);
        expect(msg('enseignant')).toMatch(/^L'enseignant sélectionné /);
        expect(msg(undefined)).toMatch(/^L'élément sélectionné /);
    });
});

describe('T5 — les deux appelants de l\'évaluation', () => {

    for (const [fichier, fonction] of [
        ['js/evaluation-sauvegarde.js', '_validerReferencesNonDemoSauv'],
        ['js/evaluation.js', '_validerReferencesNonDemoMod']
    ]) {
        it(`${fonction} : en démo, production et grille du pack passent`, () => {
            const m = monter('demo');
            const valider = fonctionDuFichier(fichier, fonction, { db: m.db, cle: m.cle, notifications: m.notifications, BibliothequeUI: m.win.BibliothequeUI });
            expect(valider('PROD_PACK', 'G_PACK')).toBe(true);
            expect(m.erreurs).toEqual([]);
        });

        it(`${fonction} : hors démo, refusé, et la collection lue est « a2026_productions » (pas de double préfixe)`, () => {
            const m = monter('a2026');
            const valider = fonctionDuFichier(fichier, fonction, { db: m.db, cle: m.cle, notifications: m.notifications, BibliothequeUI: m.win.BibliothequeUI });
            expect(valider('PROD_PACK', 'G_PACK')).toBe(false);
            expect(m.erreurs[0]).toMatch(/^Référence démo non autorisée — La production « Évaluation terminale »/);
            expect(m.lus).toContain('a2026_productions');
            expect(m.appelsCle.filter((n) => /^(a2026|demo)_/.test(n)), 'aucune clé passée deux fois par cle()').toEqual([]);
        });
    }
});
