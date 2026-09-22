import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #931 (22 sept. 2026) — « RÉASSOCIER » NE DEVINE PLUS LE FICHIER.
//
// Rapport de Grégoire, 1.153.0, 10 h 35 : « L'artefact 2 (rév) que je dois
// annoter me renvoie l'artefact 1 qui est déjà annoté et évalué. » Mesuré en
// lecture seule dans son Chrome : à 10 h 18, sur la ligne Allache × Artefact 2
// (rév) — SANS fichier, le sien vivait sous « Artefact 2 » —, le menu offrait
// « Réassocier » et a pris le PREMIER fichier de l'élève sous une autre
// production : son vieux « Portrait de lecteur ». Trois élèves, trois Portraits
// annotés déplacés puis supprimés. À 10 h 21, même geste, son Artefact 1 annoté
// et évalué a pris la place du fichier importé le matin, parti à la corbeille par
// la porte « Remplacer l'existant ? », qui ne nommait aucun des deux.
//
// Deux bords :
//   R — sur une ligne sans fichier, AUCUNE option « associer|… » : un fichier qui
//       vit sur une autre production se réassocie depuis SA ligne. Le fichier
//       sans production d'un élève reste rattrapé par le match souple (un seul).
//   P — la porte de remplacement nomme le fichier qui part et celui qui arrive.

const DA = '9000195';
const A1 = 'PROD_A1', A2 = 'PROD_A2', A2R = 'PROD_A2R';
const PORTRAIT = 'PROD_PORTRAIT';
const PRODUCTIONS = [{ id: PORTRAIT, titre: 'Portrait de lecteur/lectrice' }, { id: A1, titre: 'Artefact 1' }, { id: A2, titre: 'Artefact 2' }, { id: A2R, titre: 'Artefact 2 (rév)' }];

function chargerListe(fichiers) {
    return chargerScript('js/liste-evaluations.js', {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        obtenirLibelleStatut: (s) => s,
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? PRODUCTIONS : []),
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        travauxStockage: {
            obtenirFichiersTravaux: () => fichiers,
            obtenirFichiersGroupeActif: () => fichiers
        }
    });
}

function menu(win, ligne) {
    const html = win._genererLigneHTML({
        nom: 'N', prenom: 'P', productionNom: 'Prod', statut: 'non-evalue', statutRemise: 'non-remis',
        statutWorkflow: 'non-evalue', niveauFinal: '-', noteChiffree: null, evaluationId: null, ...ligne
    });
    return [...html.matchAll(/<option value="([^"]*)"/g)].map(m => m[1]).filter(Boolean);
}

/* ------------------------------------------ R — pas de repli sur une autre ligne */

describe('#931 · R — une ligne sans fichier ne propose rien à réassocier', () => {
    // Le cas d'Allache à 10 h 18 : Portrait, Artefact 1, et le revise sous « Artefact 2 ».
    const FICHIERS_ALLACHE = [
        { id: 'FT_portrait', etudiantDA: DA, productionId: PORTRAIT, nomFichier: 'Allache_Portrait.pdf' },
        { id: 'FT_a1', etudiantDA: DA, productionId: A1, nomFichier: 'Allache_Artefact_1.pdf' },
        { id: 'FT_revise', etudiantDA: DA, productionId: A2, nomFichier: 'Allache_Artefact_2_revise.jpg' }
    ];

    it('R.a Ligne Allache × Artefact 2 (rév), sans fichier : aucune option « associer », ni Annoter ni Supprimer', () => {
        const win = chargerListe(FICHIERS_ALLACHE);
        const options = menu(win, { da: DA, productionId: A2R });
        expect(options.filter(o => o.startsWith('associer|'))).toEqual([]);
        expect(options.filter(o => o.startsWith('annoter|') || o.startsWith('supprimer|'))).toEqual([]);
        expect(options).toContain(`evaluer|${DA}|${A2R}`);   // la ligne vit, elle n'a juste pas de fichier
    });

    it('R.b Le fichier se réassocie depuis SA ligne : Allache × Artefact 2 nomme le revise, et lui seul', () => {
        const win = chargerListe(FICHIERS_ALLACHE);
        const options = menu(win, { da: DA, productionId: A2 });
        expect(options.filter(o => o.startsWith('associer|'))).toEqual([`associer|FT_revise|${DA}`]);
    });

    it('R.c Un fichier SANS production reste rattrapé (match souple, un seul) : « Associer » le nomme', () => {
        const win = chargerListe([
            { id: 'FT_a1', etudiantDA: DA, productionId: A1, nomFichier: 'a1.pdf' },
            { id: 'FT_orphelin', etudiantDA: DA, productionId: '', nomFichier: 'orphelin.pdf' }
        ]);
        const options = menu(win, { da: DA, productionId: A2R });
        expect(options.filter(o => o.startsWith('associer|'))).toEqual([`associer|FT_orphelin|${DA}`]);
    });

    it('R.d Deux fichiers sans production : ambigu, le menu ne choisit pas', () => {
        const win = chargerListe([
            { id: 'FT_o1', etudiantDA: DA, productionId: '', nomFichier: 'o1.pdf' },
            { id: 'FT_o2', etudiantDA: DA, productionId: '', nomFichier: 'o2.pdf' }
        ]);
        const options = menu(win, { da: DA, productionId: A2R });
        expect(options.filter(o => o.startsWith('associer|'))).toEqual([]);
    });
});

/* ----------------------------------------------- P — la porte nomme les fichiers */

describe('#931 · P — « Remplacer l\'existant ? » nomme le fichier qui part et celui qui arrive', () => {
    function chargerUI(fichiers, reponse) {
        const questions = [];
        const corbeille = [];
        const reassocies = [];
        const win = chargerScript('js/travaux-ui.js', {
            db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
            cle: (k) => 'test_' + k,
            echapperHtml: (t) => String(t == null ? '' : t),
            obtenirDonneesSelonMode: (k) => (k === 'productions' ? PRODUCTIONS : []),
            confirm: (q) => { questions.push(q); return reponse; },
            travauxStockage: {
                obtenirFichiersTravaux: () => fichiers,
                obtenirFichiersGroupeActif: () => fichiers,
                reassocierFichier: (id, assoc, options) => {
                    if (options && options.verificationSeule) {
                        const f = fichiers.find(x => x.id === id);
                        const existant = fichiers.find(x => x.id !== id && x.etudiantDA === f.etudiantDA && x.productionId === assoc.productionId);
                        return { conflit: !!existant, fichierExistant: existant, evaluationOrpheline: false };
                    }
                    reassocies.push([id, assoc.productionId]);
                    return true;
                },
                deplacerEnCorbeille: (id) => corbeille.push(id)
            }
        }, { addEventListener: () => {}, removeEventListener: () => {} });
        return { win, questions, corbeille, reassocies };
    }

    const FICHIERS = [
        { id: 'FT_a1', etudiantDA: DA, productionId: A2R, nomFichier: 'Allache_Artefact_1.pdf' },
        { id: 'FT_revise', etudiantDA: DA, productionId: A2, nomFichier: 'Allache_Artefact_2_revise.jpg' }
    ];

    it('P.a La question nomme l\'existant (qui part) et l\'arrivant, dans cet ordre', async () => {
        const { win, questions } = chargerUI(FICHIERS, false);
        await win.travauxUI.changerProductionFichier('FT_revise', A2R);
        expect(questions).toHaveLength(1);
        const q = questions[0];
        expect(q).toContain('Artefact 2 (rév)');
        expect(q.indexOf('Allache_Artefact_1.pdf')).toBeGreaterThan(-1);
        expect(q.indexOf('Allache_Artefact_2_revise.jpg')).toBeGreaterThan(q.indexOf('Allache_Artefact_1.pdf'));
        expect(q).toContain('corbeille');
    });

    it('P.b Refusée : rien ne bouge, rien ne part', async () => {
        const { win, corbeille, reassocies } = chargerUI(FICHIERS, false);
        const ok = await win.travauxUI.changerProductionFichier('FT_revise', A2R);
        expect(ok).toBe(false);
        expect(corbeille).toEqual([]);
        expect(reassocies).toEqual([]);
    });

    it('P.c Acceptée : l\'existant part à la corbeille, l\'arrivant est réassocié', async () => {
        const { win, corbeille, reassocies } = chargerUI(FICHIERS, true);
        const ok = await win.travauxUI.changerProductionFichier('FT_revise', A2R);
        expect(ok).toBe(true);
        expect(corbeille).toEqual(['FT_a1']);
        expect(reassocies).toEqual([['FT_revise', A2R]]);
    });
});
