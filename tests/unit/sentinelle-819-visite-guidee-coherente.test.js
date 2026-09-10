import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

const ACC = lire('js/accompagnement.js');
const HTML = lire('index.html');

// SENTINELLE — lot C de l'audit de conformité de l'Aide (10 sept. 2026).
//
// La visite guidée s'orchestre par TROIS tableaux parallèles indexés par l'id
// d'étape : ETAPES_TOUR (le contenu), TOUR_NAV (où le « Suivant » emmène) et
// TOUR_TITRE_COURT (ce que le bouton annonce). Une septième étape (Labo) a été
// ajoutée au premier sans compléter les deux autres :
//   · le bouton de l'étape 5 lisait TOUR_TITRE_COURT[6] et affichait
//     « Suivant : undefined › » (reproduit avant correction) ;
//   · l'étape 6 n'avait aucune cible, donc le panneau changeait de texte sans
//     emmener dans le Labo — seule étape sur sept dans ce cas.
//
// Ce banc vérifie la COHÉRENCE ENTRE LES TROIS TABLEAUX plutôt que des libellés
// recopiés : ajouter une huitième étape sans compléter les deux autres rougit.

function nbEtapes() {
    const bloc = ACC.slice(ACC.indexOf('const ETAPES_TOUR = ['));
    const corps = bloc.slice(0, bloc.indexOf('\n];'));
    return (corps.match(/^\s+id:\s*\d+,$/gm) || []).length;
}
function titresCourts() {
    const m = ACC.match(/const TOUR_TITRE_COURT = \[([\s\S]*?)\];/);
    return [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => x[1]);
}
function clesNav() {
    const bloc = ACC.slice(ACC.indexOf('const TOUR_NAV = {'));
    const corps = bloc.slice(0, bloc.indexOf('\n};'));
    return (corps.match(/^\s{4}(\d+):/gm) || []).map(x => parseInt(x.trim(), 10));
}

describe('Visite guidée — les trois tableaux parallèles restent alignés', () => {

    it('chaque étape a un libellé court : le bouton n\'annonce jamais « undefined »', () => {
        const n = nbEtapes();
        expect(n).toBeGreaterThanOrEqual(7);
        // Le bouton de l'étape i lit TOUR_TITRE_COURT[i + 1] tant que i < dernier.
        expect(titresCourts().length).toBe(n);
    });

    it('chaque étape sauf l\'accueil emmène quelque part', () => {
        const n = nbEtapes();
        const attendues = Array.from({ length: n - 1 }, (_, i) => i + 1); // 1..n-1
        expect(clesNav().sort((a, b) => a - b)).toEqual(attendues);
    });

    it('les sections visées par TOUR_NAV existent dans la navigation', () => {
        const bloc = ACC.slice(ACC.indexOf('const TOUR_NAV = {'));
        const corps = bloc.slice(0, bloc.indexOf('\n};'));
        const sections = [...corps.matchAll(/section:\s*'([a-z-]+)'/g)].map(m => m[1]);
        const reelles = new Set([...HTML.matchAll(/data-onglet="([a-z-]+)"/g)].map(m => m[1]));
        for (const s of sections) expect(reelles.has(s), `section « ${s} »`).toBe(true);
    });

    it('les sous-sections que les étapes reconnaissent existent', () => {
        const reelles = new Set([...HTML.matchAll(/<div id="([a-z0-9-]+)" class="sous-section"/g)].map(m => m[1]));
        const bloc = ACC.slice(ACC.indexOf('const ETAPES_TOUR = ['));
        const corps = bloc.slice(0, bloc.indexOf('\n];'));
        // ids cités littéralement dans les fonctions correspond()
        const cites = [...corps.matchAll(/'((?:conception|calendrier|suivi|labo|evaluations)-[a-z-]+)'/g)].map(m => m[1]);
        expect(cites.length).toBeGreaterThan(4);
        for (const id of cites) expect(reelles.has(id), `sous-section « ${id} »`).toBe(true);
    });

    it('le tour nomme l\'onglet « Évaluation », comme la barre de navigation', () => {
        const nav = HTML.match(/data-onglet="evaluations"[\s\S]{0,200}?nav-label">([^<]+)</);
        const libelle = nav[1].replace('&Eacute;', 'É').replace('&eacute;', 'é');
        expect(titresCourts()).toContain(libelle);
        expect(titresCourts()).not.toContain(libelle + 's');
    });

    it('l\'étape 0 n\'envoie pas relancer la visite là où rien ne la relance', () => {
        // Aucune entrée dans Réglages › Préférences ; les deux points de relance
        // sont le bouton de l'en-tête et le menu (data-param="tour-guide").
        const i = HTML.indexOf('id="reglages-preferences"');
        const j = HTML.indexOf('class="sous-section"', i + 40);
        expect(/tour|visite guid/i.test(HTML.slice(i, j))).toBe(false);

        const bloc = ACC.slice(ACC.indexOf('const ETAPES_TOUR = ['));
        const etape0 = bloc.slice(0, bloc.indexOf('id: 1,'));
        expect(etape0).not.toMatch(/revenir depuis les Pr/);
        expect(HTML).toContain('data-param="tour-guide"');
    });
});
