import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #575 (lot 4 du plan SOLO) — la note globale se lit dans l'échelle
// de l'utilisateur, et la règle vit à UN seul endroit.
//
// CE QUI EXISTAIT AVANT. Le profil affichait la note globale à DEUX endroits, et
// les deux ne répondaient pas la même chose :
//
//   · `genererSectionPerformance` — corrigé au pas 3c-1 de #542 (27 août) :
//     la pratique de notation dit dans quoi la note se lit, sinon pas de code.
//   · `genererSectionPerformance` → bloc « Développement des habiletés » —
//     gardait `determinerLettreIDME = (P) => P >= 85 ? 'E' : P >= 75 ? 'M' :
//     P >= 65 ? 'D' : 'I'`, RENDU à l'écran (« E 87 % »). Les bornes de
//     l'échelle de Grégoire, écrites dans le code, sans passer par
//     `obtenirSeuil` — donc invisibles à une recherche sur `idme.`.
//
// Le même élève pouvait lire deux niveaux différents pour la même note, sur la
// même page. C'est le constat n° 3 du §3 de l'audit du 27 août 2026.
//
// ⮕ LE GESTE : extraire la version juste (`lireNiveauNoteGlobale`,
// `profil-etudiant-helpers.js`) et y faire converger les DEUX sites. Pas de
// seconde copie « corrigée » — c'est le patron que #529 a passé une session à
// défaire.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const affichage = readFileSync(path.join(racine, 'js/profil-etudiant-sections-affichage.js'), 'utf8');

const codeSeul = affichage
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
    .join('\n');

// Une échelle qui n'a rien d'IDME, et dont les plages ne sont PAS 65/75/85 :
// c'est ce décalage qui rend le test capable de distinguer les deux règles.
const ECHELLE_WXYZ = {
    id: 'ECH_WXYZ',
    nom: 'Cotation W-X-Y-Z',
    niveaux: [
        { code: 'W', nom: 'Amorce',    min: 0,  max: 49 },
        { code: 'X', nom: 'En chemin', min: 50, max: 69 },
        { code: 'Y', nom: 'Consolidé', min: 70, max: 89, niveauSOLO: 'relationnel' },
        { code: 'Z', nom: 'Transféré', min: 90, max: 100 }
    ]
};

function chargerHelpers(lectureRendue) {
    return chargerScript('js/profil-etudiant-helpers.js', {
        db: {
            getSync: (k, d) => (d !== undefined ? d : null),
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirPreference: () => null,
        obtenirDonneesSelonMode: () => [],
        obtenirTypePratiqueActive: () => 'standards',
        // Lot N7 (23 sept. 2026) : `lireEchelleNoteGlobale` part de la DÉSIGNATION de la pratique
        // active (une Standards assignée) et lit l'échelle commune de ses évaluations. Elle vit DANS
        // le fichier testé : on ne la stubbe pas, on stubbe ce qu'elle appelle.
        designerPratiqueActive: () => ({ etat: 'ok', idBrut: 'std-banc', id: 'std-banc', donnees: {}, famille: 'standards' }),
        obtenirEchelleCommuneDesEvaluations: () => lectureRendue,
        // La VRAIE table SOLO, telle que `echelles.js` la publie (#542 lot 2) :
        // `interpreterNiveauAtteint` la lit sur `window`, elle ne l'invente pas.
        NIVEAUX_SOLO_ECHELLE: [
            { valeur: 'relationnel', libelle: 'Relationnel',
              description: 'L\'étudiant·e lie et intègre plusieurs aspects en un tout cohérent.' }
        ]
    });
}

describe('#575 · la lettre du niveau global vient de l\'échelle, jamais d\'un ternaire', () => {

    it('une note de 75 % sur une échelle W/X/Y/Z rend « Y », pas « M »', () => {
        // Le cœur du défaut : 75 franchissait le seuil IDME de « Maîtrisé », et
        // l'écran affichait « M 75 % » à un enseignant qui n'a jamais de M.
        const win = chargerHelpers({ echelle: ECHELLE_WXYZ, raison: null, message: '' });
        const lu = win.lireNiveauNoteGlobale('111', 75);
        expect(lu.niveau.code).toBe('Y');
        expect(lu.raison).toBeNull();
    });

    it('les quatre bornes IDME ne décident plus de rien', () => {
        const win = chargerHelpers({ echelle: ECHELLE_WXYZ, raison: null, message: '' });
        // 85, 75 et 65 étaient les trois marches du ternaire. Sur cette échelle,
        // 85 et 75 tombent dans le MÊME niveau (70-89), et 65 dans « X ».
        expect(win.lireNiveauNoteGlobale('111', 85).niveau.code).toBe('Y');
        expect(win.lireNiveauNoteGlobale('111', 75).niveau.code).toBe('Y');
        expect(win.lireNiveauNoteGlobale('111', 65).niveau.code).toBe('X');
        expect(win.lireNiveauNoteGlobale('111', 95).niveau.code).toBe('Z');
    });

    it('sans échelle, il n\'y a PAS de code — et la cause est dite', () => {
        // Une sommative : sa note globale est un pourcentage pondéré, elle n'a
        // jamais prétendu être un niveau atteint. Le ternaire, lui, en fabriquait
        // un pour tout le monde.
        const win = chargerHelpers({
            echelle: null, raison: 'pratique-sans-echelle',
            message: 'Cette pratique établit une note chiffrée, sans niveau.'
        });
        const lu = win.lireNiveauNoteGlobale('111', 87);
        expect(lu.niveau).toBeNull();
        expect(lu.raison).toBe('pratique-sans-echelle');
        expect(lu.survol).toContain('sans niveau');
    });

    it('une note hors de toutes les plages ne se rabat sur aucun niveau', () => {
        const echelleTrouee = { id: 'E', niveaux: [{ code: 'A', nom: 'A', min: 0, max: 40 }] };
        const win = chargerHelpers({ echelle: echelleTrouee, raison: null, message: '' });
        const lu = win.lireNiveauNoteGlobale('111', 88);
        expect(lu.niveau).toBeNull();
        expect(lu.raison).toBe('hors-echelle');
    });

    it('SOLO explique le niveau au SURVOL, il ne le remplace pas', () => {
        const win = chargerHelpers({ echelle: ECHELLE_WXYZ, raison: null, message: '' });
        const lu = win.lireNiveauNoteGlobale('111', 75);
        expect(lu.niveau.code).toBe('Y');       // ce qu'on LIT
        expect(lu.survol).toContain('Relationnel'); // ce qui l'explique
    });
});

describe('#575 · une seule règle, consommée par les deux blocs du profil', () => {

    it('`determinerLettreIDME` et son ternaire ne reviennent pas', () => {
        expect(codeSeul).not.toMatch(/determinerLettreIDME/);
        // La forme exacte du ternaire retiré, quelles que soient les espaces.
        expect(codeSeul).not.toMatch(/>=\s*85\s*\)?\s*\?\s*'E'/);
        expect(codeSeul).not.toMatch(/>=\s*75\s*\)?\s*\?\s*'M'/);
    });

    it('les DEUX sites passent par le helper partagé', () => {
        // Deux appels : « note globale » et « Développement des habiletés ».
        // Un seul appel voudrait dire qu'un des deux blocs a repris sa copie.
        const appels = (codeSeul.match(/lireNiveauNoteGlobale\(da,/g) || []).length;
        expect(appels).toBe(2);
    });

    it('le site corrigé hier ne garde pas sa propre copie du raisonnement', () => {
        // `obtenirEchelleNoteGlobale` ne doit plus être appelée depuis l'affichage :
        // la règle vit dans `profil-etudiant-helpers.js`.
        expect(codeSeul).not.toMatch(/obtenirEchelleNoteGlobale/);
    });
});
