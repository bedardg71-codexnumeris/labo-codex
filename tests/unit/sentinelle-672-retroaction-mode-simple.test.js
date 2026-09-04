import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #672 — EN MODE SIMPLE, L'AMORCE DU GABARIT PART AU PDF À LA PLACE DE LA RÉTROACTION.
//
// CE QUE CETTE SENTINELLE JUGE, ET CE QU'ELLE NE PEUT PAS JUGER.
// Elle juge la CASCADE du PDF (`construireCriteres`, synthese-retroaction-data.js:389),
// qui est du calcul pur sur des données : un banc Node la mesure honnêtement.
// Elle NE juge PAS la cause amont — `champCommentaire.value = …` sur un `<div>`
// (evaluation-calcul.js:630). Cela demande un vrai DOM : le harnais d'ici fabrique ses
// éléments à la main, où `.value` et `textContent` sont indépendants PAR CONSTRUCTION.
// Un test écrit ici serait vrai sans rien mesurer. La cause amont est verrouillée sous
// WebKit par `tests/integration/retroaction-mode-simple-672.spec.js`.
//
// LE DÉFAUT. En mode simple, le div `comm_<critereId>` garde l'amorce que le gabarit y a
// posée — « Saisissez les erreurs et le nombre de mots ». Les trois collecteurs de
// sauvegarde lisent `commDiv.textContent` : c'est donc l'AMORCE qui est persistée sous
// `criteres[].retroaction`. La cascade du PDF, elle, dit :
//     (c.retroaction && c.retroaction.trim()) || retroAlgo || cartouche
// Son commentaire annonce que `retroAlgo` protège du placeholder. Il n'en protège pas :
// une amorce est une chaîne NON VIDE, donc truthy, donc `retroAlgo` n'est jamais atteint.
// L'élève reçoit « Saisissez les erreurs et le nombre de mots » à la place de son compte
// d'erreurs et de sa projection EUF.
//
// POURQUOI DURCIR LA CASCADE PLUTÔT QUE SEULEMENT L'ÉCRITURE : les évaluations DÉJÀ
// enregistrées portent l'amorce en base. Réparer l'écriture n'assainit que les
// prochaines ; la cascade est le seul point qui rattrape les copies déjà corrigées.
//
// BREAK-TESTS (obtenir le ROUGE avant de faire confiance à cette sentinelle) :
//   1. retirer la garde d'amorce de la cascade → « l'amorce ne l'emporte pas » rougit.
//   2. remplacer la liste d'amorces connues par une liste vide → même rouge.
//   3. inverser l'ordre `retroAlgo || c.retroaction` → « un texte personnalisé garde la
//      priorité » rougit SEUL : c'est le témoin qui interdit de « réparer » en écrasant
//      systématiquement ce que l'enseignant·e a écrit à la main.

const AMORCE_SIMPLE = 'Saisissez les erreurs et le nombre de mots';
const AMORCE_CATEGORIES = 'Saisissez les codes des sous-critères (ex: 1;4;6;1;4)';
const RETRO_VRAIE = 'Ta rédaction contient 7 erreurs de français pour 460 mots.';

function dbDepuisStore(store) {
    return {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; }
    };
}

const GRILLE = {
    id: 'G1',
    nom: 'Grille-1 FR-ALGO seul',
    criteres: [{
        id: 'CR_FR', nom: 'Français écrit', type: 'algorithmique',
        ponderation: 20, description: 'Respect des normes de la langue française écrite.'
    }]
};

// `retroactionCritere` est ce que les trois collecteurs ont lu dans le div et persisté.
function evaluationAvec(retroactionCritere) {
    return {
        id: 'ev-1', etudiantDA: 'A001', grilleId: 'G1', echelleId: '', cartoucheId: '',
        dateEvaluation: '2026-09-01T08:00:00', noteFinale: 15, niveauFinal: 'M',
        criteres: [{
            critereId: 'CR_FR', critereNom: 'Français écrit',
            niveauSelectionne: 'M', ponderation: 20,
            retroaction: retroactionCritere
        }],
        donneesAlgorithmiques: {
            CR_FR: {
                erreurs: 7, mots: 460, noteCalculee: 15.4, pourcentage: 77,
                niveau: 'M', retroaction: RETRO_VRAIE
            }
        }
    };
}

function critereDuPdf(evaluation) {
    const store = { grillesTemplates: [GRILLE], evaluationsSauvegardees: [evaluation] };
    const win = chargerScript('js/synthese-retroaction-data.js', {
        db: dbDepuisStore(store),
        cle: (k) => k,
        obtenirTrimestreActif: () => ({})
    });
    const fb = win.syntheseRetroactionData.construireFeedback(evaluation, null, null);
    return fb.criteria[0];
}

describe('#672 · la cascade du PDF ne laisse pas une amorce de saisie évincer la rétroaction', () => {

    // TÉMOIN. Sans lui, un vert des cas suivants ne distinguerait pas « la garde
    // fonctionne » de « le décor n'a jamais atteint la cascade ».
    it('TÉMOIN : le décor atteint bien la cascade — un texte personnalisé ressort tel quel', () => {
        const c = critereDuPdf(evaluationAvec('Ton texte gagne en clarté ; surveille les accords.'));
        expect(c.name).toBe('Français écrit');
        expect(c.comment).toBe('Ton texte gagne en clarté ; surveille les accords.');
    });

    it('l’amorce du MODE SIMPLE ne l’emporte pas sur la rétroaction calculée', () => {
        const c = critereDuPdf(evaluationAvec(AMORCE_SIMPLE));
        expect(c.comment, 'l’élève ne doit jamais lire une consigne de saisie dans son PDF')
            .not.toContain('Saisissez');
        expect(c.comment).toBe(RETRO_VRAIE);
    });

    it('l’amorce du MODE CATÉGORIES non plus — même famille, même remède', () => {
        const c = critereDuPdf(evaluationAvec(AMORCE_CATEGORIES));
        expect(c.comment).not.toContain('Saisissez');
        expect(c.comment).toBe(RETRO_VRAIE);
    });

    it('l’amorce entourée des blancs du gabarit est reconnue elle aussi', () => {
        // Le div est engendré par un gabarit multiligne : son textContent porte
        // l'indentation. Une comparaison stricte au texte nu passerait à côté.
        const c = critereDuPdf(evaluationAvec('\n                ' + AMORCE_SIMPLE + '\n            '));
        expect(c.comment).toBe(RETRO_VRAIE);
    });

    it('l’amorce « Sélectionne un niveau » du critère NON algorithmique reste, faute de mieux', () => {
        // Ce cas n'a pas de rétroaction algorithmique de repli : la garde ne doit pas
        // rendre une chaîne vide plus utile que le texte qui s'y trouvait.
        const ev = evaluationAvec('Sélectionne un niveau');
        delete ev.donneesAlgorithmiques;
        const store = { grillesTemplates: [GRILLE], evaluationsSauvegardees: [ev] };
        const win = chargerScript('js/synthese-retroaction-data.js', {
            db: dbDepuisStore(store), cle: (k) => k, obtenirTrimestreActif: () => ({})
        });
        const c = win.syntheseRetroactionData.construireFeedback(ev, null, null).criteria[0];
        expect(typeof c.comment).toBe('string');
    });

    it('un texte personnalisé garde la priorité sur la rétroaction calculée', () => {
        const c = critereDuPdf(evaluationAvec('Reprends la conclusion : elle répète l’introduction.'));
        expect(c.comment).toBe('Reprends la conclusion : elle répète l’introduction.');
    });
});


// ─────────────────────────────────────────────────────────────────────────────
// LA LISTE DE RECONNAISSANCE NE DOIT PAS PÉRIMER EN SILENCE.
//
// `estAmorceDeSaisie` reconnaît des phrases écrites AILLEURS. Si quelqu'un réécrit
// « Saisissez les erreurs et le nombre de mots » dans le gabarit sans toucher à la
// garde, celle-ci cesse d'agir — sans rouge, sans avertissement, et l'amorce repart
// au PDF. Ce bloc relie les deux : chaque phrase de la garde doit exister ENCORE
// dans le fichier qui la produit.
//
// ⚠ HORS COMMENTAIRES. Les commentaires de #672 citent ces phrases mot pour mot :
// une assertion qui les compterait serait vraie même après le retrait du code.

function sansCommentaires(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function lireSource(relatif) {
    return sansCommentaires(readFileSync(path.join(racineProjet, relatif), 'utf8'));
}

describe('#672 · la garde d’amorces reste reliée aux gabarits qui les produisent', () => {
    const amorcesAttendues = [
        { texte: 'Saisissez les erreurs et le nombre de mots',           source: 'js/evaluation-chargement.js' },
        { texte: 'Saisissez les codes des sous-critères (ex: 1;4;6;1;4)', source: 'js/evaluation-calcul.js' },
        { texte: 'Sélectionne un niveau',                                source: 'js/evaluation-chargement.js' },
        // Lot 3 (4 sept. 2026) — l'amorce du critère analytique, posée par le lot 2 dans les
        // deux chemins de rendu ; déclarée à la garde quand le critère analytique s'est mis à
        // entrer dans `criteres[]` avec sa `retroaction`. Attrapée par ce compte, comme prévu.
        { texte: 'Saisis les points',                                    source: 'js/evaluation-chargement.js' }
    ];

    it('TÉMOIN : le filtre de commentaires mord — une phrase qui n’existe QUE dans un commentaire n’est pas comptée', () => {
        const brut = readFileSync(path.join(racineProjet, 'js/synthese-retroaction-data.js'), 'utf8');
        const filtre = sansCommentaires(brut);
        expect(brut, 'la phrase-repère est bien dans le fichier').toContain("UNE AMORCE DE SAISIE N'EST PAS UNE RÉTROACTION");
        expect(filtre, 'et elle disparaît une fois les commentaires retirés').not.toContain("UNE AMORCE DE SAISIE N'EST PAS UNE RÉTROACTION");
    });

    for (const { texte, source } of amorcesAttendues) {
        it(`« ${texte.slice(0, 34)}… » existe encore dans ${source}`, () => {
            expect(lireSource(source)).toContain(texte);
        });
    }

    it('la garde du PDF connaît exactement ces quatre amorces, ni plus ni moins', () => {
        const src = lireSource('js/synthese-retroaction-data.js');
        for (const { texte } of amorcesAttendues) {
            expect(src, 'amorce absente de la garde').toContain(texte);
        }
        // Le compte ferme la porte à une cinquième entrée ajoutée sans témoin.
        const bloc = src.slice(src.indexOf('AMORCES_DE_SAISIE'), src.indexOf('function estAmorceDeSaisie'));
        const entrees = (bloc.match(/'[^']+'/g) || []).length;
        expect(entrees, 'quatre amorces déclarées').toBe(4);
    });
});
