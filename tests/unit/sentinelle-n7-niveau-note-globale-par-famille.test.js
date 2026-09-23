import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE DU LOT N7 (23 sept. 2026) — LE NIVEAU DE LA NOTE GLOBALE SE LIT DANS UNE SEULE RÈGLE.
//
// LA DÉCISION DE GRÉGOIRE (22 sept. 2026, soir). Pour une pratique Standards, le niveau de la note
// globale se lit dans l'échelle des ÉVALUATIONS de l'élève (règle A, #575, sa règle du 27 août), pas
// dans l'échelle rangée dans la pratique (règle B, `config.echelle`). Et le principe posé en répondant :
// « L'échelle IDME est ma pratique personnelle. On ne peut l'imposer à aucun utilisateur. Il faut
// toujours prendre les grilles, échelles, cartouches, etc. créés par l'utilisateur. »
//
// CE QUI EXISTAIT AVANT. Deux réponses dans le code : l'instance du REGISTRE (PratiquePANStandards,
// règle A), que rendait `obtenirPratiqueActuelle`, et la PratiqueConfigurable (règle B), dormante pour
// une Standards — sauf quand la pratique était rangée sous l'id « standards » (#711 : la bibliothèque
// passe avant le registre), où B répondait à l'écran. `obtenirPratiqueActuelle` n'avait plus que ce
// niveau pour raison d'être (N2 avait retiré le P historique).
//
// ⮕ LE GESTE : `lireEchelleNoteGlobale` (profil-etudiant-helpers.js) route sur la FAMILLE de la
// pratique désignée, à UN endroit. `obtenirPratiqueActuelle` et les méthodes du registre partent.
// Ce banc tient le routage (A) et l'absence de toute seconde règle ou échelle écrite en dur (B).
// Les mesures sur le vrai moteur (échelle d'essai, échelle B différente, deux échelles, SOM/SPE/DEN
// inchangées) sont au bloc « N7 » de `audit-pratique-de-notation-2026-09-05.test.js`.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const ECHELLE_A = { id: 'ECH_A', nom: 'Échelle des évaluations', niveaux: [
    { code: 'P', nom: 'Partiel', min: 0, max: 59 },
    { code: 'R', nom: 'Réussi', min: 60, max: 100 }
] };

const designation = (etat, famille) => () => ({ etat, idBrut: etat === 'aucune' ? null : 'p1', id: etat === 'ok' ? 'p1' : null, donnees: etat === 'ok' ? {} : null, famille: famille || null });
const interdit = (nom) => () => { throw new Error(nom + ' ne doit pas être interrogé ici'); };

function charger(surcharges) {
    return chargerScript('js/profil-etudiant-helpers.js', {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: () => [],
        obtenirPreference: () => null,
        ...surcharges
    });
}

describe('N7 · A — la famille de la pratique désignée route, et une seule fois', () => {

    it('A1. rien d\'assigné, ou un id qui ne mène à rien : aucun niveau, et rien n\'est interrogé (pas de repli)', () => {
        for (const etat of ['aucune', 'introuvable']) {
            const win = charger({ designerPratiqueActive: designation(etat), obtenirEchelleCommuneDesEvaluations: interdit('l\'échelle commune'),
                resoudrePratiqueActive: interdit('la résolution') });
            const lu = win.lireNiveauNoteGlobale('1234567', 80);
            expect(lu.niveau, etat).toBeNull();
            expect(lu.raison, etat).toBe('pratique-sans-methode');
        }
    });

    it('A2. rien de défini du tout (registre absent) : aucun niveau, sans lever', () => {
        const win = charger({});
        let leve = null, lu;
        try { lu = win.lireNiveauNoteGlobale('1234567', 80); } catch (e) { leve = e; }
        expect(leve, leve ? `${leve.constructor.name} : ${leve.message}` : '').toBeNull();
        expect(lu.niveau).toBeNull();
    });

    it('A3. STANDARDS : l\'échelle commune des évaluations, avec le DA — la pratique assignée n\'est jamais interrogée (règle B inatteignable)', () => {
        const appels = [];
        const win = charger({
            designerPratiqueActive: designation('ok', 'standards'),
            obtenirEchelleCommuneDesEvaluations: (da) => { appels.push(da); return { echelle: ECHELLE_A, raison: null, message: null }; },
            // Si la branche Standards passait par l'instance assignée, c'est ici qu'elle lirait `config.echelle`.
            resoudrePratiqueActive: interdit('la pratique assignée'),
            obtenirPratiqueParId: interdit('le registre')
        });
        const lu = win.lireNiveauNoteGlobale('1234567', 72);
        expect(appels).toEqual(['1234567']);
        expect(lu.niveau.code).toBe('R');
        expect(lu.raison).toBeNull();
    });

    it('A4. STANDARDS dont les évaluations ne s\'accordent pas : aucun niveau, la cause de l\'échelle commune remonte telle quelle', () => {
        const win = charger({
            designerPratiqueActive: designation('ok', 'standards'),
            obtenirEchelleCommuneDesEvaluations: () => ({ echelle: null, raison: 'echelles-divergentes', message: 'Deux échelles.' }),
            resoudrePratiqueActive: interdit('la pratique assignée')
        });
        expect(win.lireNiveauNoteGlobale('1234567', 72)).toEqual({ niveau: null, survol: 'Deux échelles.', raison: 'echelles-divergentes' });
    });

    it('A5. SOMMATIVE : « note-chiffree », sans rien interroger ; SPÉCIFICATIONS : « pratique-sans-methode » (comme avant N7)', () => {
        const bouchons = { obtenirEchelleCommuneDesEvaluations: interdit('l\'échelle commune'), resoudrePratiqueActive: interdit('la pratique assignée') };
        const som = charger({ ...bouchons, designerPratiqueActive: designation('ok', 'sommative') }).lireNiveauNoteGlobale('1234567', 87);
        expect(som.niveau).toBeNull();
        expect(som.raison).toBe('note-chiffree');
        expect(som.survol).toContain('pourcentage');
        const spe = charger({ ...bouchons, designerPratiqueActive: designation('ok', 'specifications') }).lireNiveauNoteGlobale('1234567', 87);
        expect(spe).toEqual({ niveau: null, survol: '', raison: 'pratique-sans-methode' });
    });

    it('A6. DÉNOTATION (et toute autre famille) : la pratique ASSIGNÉE répond, avec le DA', () => {
        const recus = [];
        const assignee = { obtenirEchelleNoteGlobale: (da) => { recus.push(da); return { echelle: ECHELLE_A, raison: null, message: null }; } };
        const win = charger({ designerPratiqueActive: designation('ok', 'denotation'), resoudrePratiqueActive: () => ({ etat: 'ok', pratique: assignee }),
            obtenirEchelleCommuneDesEvaluations: interdit('l\'échelle commune') });
        expect(win.lireNiveauNoteGlobale('1234567', 40).niveau.code).toBe('P');
        expect(recus).toEqual(['1234567']);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// B · Aucune seconde règle, aucune échelle écrite en dur
// ─────────────────────────────────────────────────────────────────────────────
const sansCommentaires = (code) => code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');

const helpers = readFileSync(path.join(RACINE, 'js/profil-etudiant-helpers.js'), 'utf8');
// Les deux fonctions du chemin de lecture, bornées à la fonction qui les suit dans le fichier.
const debut = helpers.indexOf('function lireNiveauNoteGlobale(');
const fin = helpers.indexOf('function diagnostiquerGrilleReferenceDepistage(');
const cheminDeLecture = sansCommentaires(helpers.slice(debut, fin));

describe('N7 · B — le chemin de lecture ne porte ni règle B, ni IDME', () => {

    it('B0. le découpage mesure quelque chose (les deux fonctions sont bien dans la tranche)', () => {
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
        expect(cheminDeLecture).toContain('function lireEchelleNoteGlobale(');
        expect(cheminDeLecture).toContain('obtenirEchelleCommuneDesEvaluations(da)');
    });

    it('B1. aucun accès à `config.echelle` ni au registre par famille dans le chemin de lecture', () => {
        expect(cheminDeLecture).not.toMatch(/config\s*\.\s*echelle/);
        expect(cheminDeLecture).not.toMatch(/obtenirPratiqueParId/);
    });

    it('B2. aucun code de niveau ni borne IDME écrits en dur (« I », « D », « M », « E », 40 / 65 / 75 / 85 / 100)', () => {
        expect(cheminDeLecture).not.toMatch(/['"`][IDME]['"`]/);
        expect(cheminDeLecture).not.toMatch(/\b(40|65|75|85|100)\b/);
    });

    it('B3. `obtenirPratiqueActuelle` ne revient nulle part dans le code de js/ (commentaires exclus)', () => {
        const fautifs = [];
        const parcourir = (dossier) => {
            for (const e of readdirSync(path.join(RACINE, dossier), { withFileTypes: true })) {
                const rel = path.join(dossier, e.name);
                if (e.isDirectory()) parcourir(rel);
                else if (e.name.endsWith('.js') && /obtenirPratiqueActuelle/.test(sansCommentaires(readFileSync(path.join(RACINE, rel), 'utf8')))) fautifs.push(rel);
            }
        };
        parcourir('js');
        expect(fautifs).toEqual([]);
    });
});
