/**
 * SENTINELLE — REGISTRE LONGITUDINAL EN MODE ANONYMISATION (bogue signalé par Grégoire le 28 sept. 2026, 1.160.4).
 *
 * Symptôme vécu : bandeau « MODE ANONYMISATION » affiché, et Labo › Suivi longitudinal montrait « A., Benjamin »
 * dans le sélecteur de saisie et la liste des inscrit·es. Le module bâtissait ses noms depuis `nom`/`prenom`, sans
 * passer par aucune fonction d'anonymisation.
 *
 * Ce que la sentinelle tient :
 *   1. en anonymisation, AUCUN nom ni prénom réel dans le conteneur (recherche, choix, saisie, inscrit·es, dossier,
 *      en attente) ni dans les data-confirm, qui passent à confirm() ;
 *   2. chaque élève reçoit un pseudonyme DISTINCT et STABLE (« Élève R<rang> », rang = ordre des DA) — pas
 *      l'« Étudiant Inconnu » commun que rend `anonymiserNom` hors du trimestre actif ;
 *   3. la rétroaction copiée, qui nomme l'élève, est réécrite avec son pseudonyme ;
 *   4. hors anonymisation, rien ne change : « Nom, Prénom ».
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

const DA_A = '2000001';
const DA_B = '2000002';
const DA_C = '2000003';

// La VRAIE fonction de modes.js (#948), pas une copie : extraite du source, pour que le banc voie ce que l'app voit.
function vraieRemplacerPrenomEntier() {
    const src = readFileSync(path.join(RACINE, 'js/modes.js'), 'utf8');
    const debut = src.indexOf('function _remplacerPrenomEntier(');
    const fin = src.indexOf('\n}\n', debut) + 2;
    // eslint-disable-next-line no-new-func
    return new Function(src.slice(debut, fin) + '\nreturn _remplacerPrenomEntier;')();
}

function stock() {
    const s = storeBase();
    Object.keys(s).filter((k) => k.startsWith('test_')).forEach((k) => delete s[k]);
    Object.assign(s, {
        trimestres: [{ id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: true }],
        cours: [{ id: 'C101', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' }],
        h2026_groupeEtudiants: [
            { da: DA_B, nom: 'Zénon', prenom: 'Éloïse', groupe: '00001', coursId: 'C101' },
            { da: DA_A, nom: 'Aubin', prenom: 'Maxence', groupe: '00001', coursId: 'C101' },
            { da: DA_C, nom: 'Cordier', prenom: 'Lou', groupe: '00001', coursId: 'C101' }
        ],
        h2026_evaluationsSauvegardees: [
            { id: 'E1', etudiantDA: DA_A, coursId: 'C101', productionNom: 'Artefact 1', dateEvaluation: '2026-02-01T15:00:00.000Z',
                criteres: [], noteFinale: 70, retroactionFinale: 'Bonjour Maxence, ton texte est clair. Bravo Maxence Aubin !' }
        ],
        // Un résultat du Cadre (#913) pour un·e NON inscrit·e : la zone « en attente » le nomme.
        h2026_resultatsUlterieurs: { [DA_C]: [{ cours: '601-102-MQ', trimestre: 'A2026', note: 80 }] }
    });
    return s;
}

function banc(anonyme) {
    const store = stock();
    const b = monter(store, {
        modules: ['js/registre-longitudinal.js'],
        objetsExportes: ['registreLongitudinal'],
        globaux: {
            cle: (k) => 'h2026_' + k,
            cleSource: (k, t) => t + '_' + k,
            obtenirTrimestres: () => JSON.parse(JSON.stringify(store.trimestres)),
            estModeAnonymisation: () => anonyme.actif,
            _remplacerPrenomEntier: vraieRemplacerPrenomEntier(),
            calculerEtStockerIndicesCP: () => {},
            calculerTousLesIndices: () => ({})
        }
    });
    b.win.estModeAnonymisation = () => anonyme.actif;
    return Object.assign(b, { api: b.win.registreLongitudinal });
}

/** Tout le texte ET tous les attributs du conteneur (data-confirm compris). */
function toutLeRendu(b) {
    const morceaux = [];
    const parcourir = (el) => {
        if (el.textContent) morceaux.push(el.textContent);
        if (el.attributes) Object.values(el.attributes).forEach((v) => morceaux.push(String(v && v.value !== undefined ? v.value : v)));
        if (el.getAttribute) ['data-confirm', 'placeholder'].forEach((a) => { const v = el.getAttribute(a); if (v) morceaux.push(v); });
        (el.children || []).forEach(parcourir);
    };
    // Le faux DOM rend getElementById('rl-resultats' | 'rl-choix') hors de l'arbre du conteneur : on les lit aussi.
    ['registre-longitudinal-conteneur', 'rl-resultats', 'rl-choix'].forEach((id) => {
        expect(b.elements[id], id).toBeTruthy();
        parcourir(b.elements[id]);
    });
    return morceaux.join(' | ');
}

const NOMS_REELS = ['Zénon', 'Éloïse', 'Aubin', 'Maxence', 'Cordier', 'Lou'];

async function monterAvecInscrits(anonyme) {
    const b = banc(anonyme);
    await b.api.inscrire(DA_A);
    await b.api.inscrire(DA_B);
    b.win.initialiserRegistreLongitudinal();
    // La recherche et le choix, comme au doigt.
    b.win.rechercherEleveLongitudinal({ value: 'o' });
    b.win.choisirEleveLongitudinal({ dataset: { da: DA_A } });
    return b;
}

describe('Registre longitudinal — mode anonymisation', () => {
    it('aucun nom ni prénom réel à l\'écran, data-confirm compris', async () => {
        const b = await monterAvecInscrits({ actif: true });
        const rendu = toutLeRendu(b);
        for (const nom of NOMS_REELS) expect(rendu, nom).not.toMatch(new RegExp('(^|[^\\p{L}])' + nom + '(?![\\p{L}])', 'u'));
        expect(rendu).toContain('Élève R1');
    });

    it('un pseudonyme distinct et stable par élève, dans l\'ordre des DA', () => {
        const b = banc({ actif: true });
        const pseudos = b.api.pseudonymes();
        expect(pseudos.get(DA_A)).toBe('Élève R1');
        expect(pseudos.get(DA_B)).toBe('Élève R2');
        expect(pseudos.get(DA_C)).toBe('Élève R3');
        expect(b.api.pseudonymes().get(DA_B)).toBe('Élève R2');
    });

    it('la liste suit les pseudonymes, pas l\'alphabet des vrais noms (qui les trahirait)', async () => {
        // Cordier (DA_C) précède Zénon (DA_B) à l'alphabet ; Élève R2 (DA_B) précède Élève R3 (DA_C).
        const anonyme = { actif: true };
        const b = banc(anonyme);
        await b.api.inscrire(DA_C);
        await b.api.inscrire(DA_B);
        expect(b.api.inscrits().map((e) => e.da)).toEqual([DA_B, DA_C]);
        anonyme.actif = false;
        expect(b.api.inscrits().map((e) => e.da)).toEqual([DA_C, DA_B]);
    });

    it('la rétroaction copiée nomme l\'élève par son pseudonyme', async () => {
        const b = await monterAvecInscrits({ actif: true });
        const rendu = toutLeRendu(b);
        expect(rendu).toContain('Bonjour Élève R1, ton texte est clair. Bravo Élève R1 Élève R1 !');
    });

    it('hors anonymisation : « Nom, Prénom », comme avant', async () => {
        const b = await monterAvecInscrits({ actif: false });
        const rendu = toutLeRendu(b);
        expect(rendu).toContain('Aubin, Maxence');
        expect(rendu).toContain('Zénon, Éloïse');
        expect(rendu).toContain('Cordier, Lou');
        expect(rendu).toContain('Bonjour Maxence, ton texte est clair.');
        expect(rendu).not.toContain('Élève R');
        expect(b.api.pseudonymes()).toBeNull();
    });
});
