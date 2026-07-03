import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle — #306 Lot 2 (3 juillet 2026, vague 3) : bascule du Trimestre en
// SAVE EXPLICITE (décision Grégoire n°1 du 29 mai 2026).
//
// Avant : 11 champs auto-sauvaient au data-on-change (3 identification via
// sauvegarderIdentificationTrimestreV2, 8 cadre via sauvegarderCadreCalendrierV2)
// et le bouton « Enregistrer » ne sauvait QUE le cadre. Après : zéro
// data-on-change de persistance ; le bouton appelle
// sauvegarderTrimestreCompletV2 = identification PUIS cadre (l'identification
// fixe l'id du trimestre dont dépend cle('cadreCalendrier')).
//
// Garde-fou anti-retour de l'auto-save : le dispatcher de main.js ne déclenche
// que les handlers déclarés en data-on-change — leur ABSENCE dans la section
// (cas statiques) est ce qui garantit « modifier sans cliquer ne persiste rien ».

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function creerFauxDom(valeurs = {}) {
    const noeud = (v = '') => ({ value: v, textContent: '', focus() {}, classList: { add() {}, remove() {}, contains: () => false } });
    const ids = [
        'v2-nomTrimestre', 'v2-sessionTrimestre', 'v2-anneeTrimestre',
        'v2-debutTrimestre', 'v2-finCours', 'v2-finTrimestre', 'v2-remiseNotes',
        'v2-semainePlanificationDebut', 'v2-semainePlanificationFin',
        'v2-semaineExamensDebut', 'v2-semaineExamensFin',
    ];
    const elements = {};
    ids.forEach(id => { elements[id] = noeud(valeurs[id] || ''); });
    return {
        elements,
        document: { getElementById: (id) => elements[id] || null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] },
    };
}

describe('sentinelle · save explicite du Trimestre (#306 Lot 2)', () => {
    let dom, fenetre, dbStub;

    beforeEach(() => {
        dom = creerFauxDom({
            'v2-nomTrimestre': 'Hiver 2026',
            'v2-sessionTrimestre': 'hiver',
            'v2-anneeTrimestre': '2026',
            'v2-debutTrimestre': '2026-01-19',
            'v2-finCours': '2026-05-08',
            'v2-finTrimestre': '2026-05-22',
        });
        dbStub = {
            _donnees: {},
            getSync(cle, defaut) { return this._donnees[cle] !== undefined ? this._donnees[cle] : defaut; },
            setSync(cle, valeur) { this._donnees[cle] = valeur; },
        };
        const fauxWindow = { afficherStatistiquesTrimestreV2() {} };
        fenetre = chargerScript('js/trimestre-v2-init.js', {
            document: dom.document,
            db: dbStub,
            cle: (k) => 'h2026_' + k,
            notifications: { succes() {}, erreur() {} },
        }, fauxWindow);
    });

    it('le bouton unique sauvegarde l\'identification ET le cadre', () => {
        expect(typeof fenetre.sauvegarderTrimestreCompletV2).toBe('function');
        fenetre.sauvegarderTrimestreCompletV2();
        // Identification → registre des trimestres + trimestre actif
        const trimestres = dbStub._donnees['trimestres'];
        expect(trimestres).toHaveLength(1);
        expect(trimestres[0]).toMatchObject({ id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: true });
        expect(dbStub._donnees['trimestreActif']).toBe('h2026');
        // Cadre → clé namespacée, dans la même action utilisateur
        expect(dbStub._donnees['h2026_cadreCalendrier']).toMatchObject({
            dateDebut: '2026-01-19', finCours: '2026-05-08', finTrimestre: '2026-05-22',
        });
    });

    it('ordre : identification d\'abord (le cadre atterrit dans le namespace du trimestre saisi)', () => {
        const ecritures = [];
        const setSyncOriginal = dbStub.setSync.bind(dbStub);
        dbStub.setSync = (cle, valeur) => { ecritures.push(cle); setSyncOriginal(cle, valeur); };
        fenetre.sauvegarderTrimestreCompletV2();
        expect(ecritures.indexOf('trimestres')).toBeGreaterThanOrEqual(0);
        expect(ecritures.indexOf('h2026_cadreCalendrier')).toBeGreaterThan(ecritures.indexOf('trimestres'));
    });

    it('cadre incomplet → erreur bloquante, rien d\'écrit pour le cadre (validation #215 préservée)', () => {
        dom.elements['v2-finTrimestre'].value = '';
        fenetre.sauvegarderTrimestreCompletV2();
        expect(dbStub._donnees['h2026_cadreCalendrier']).toBeUndefined();
        // L'identification, elle, a été sauvée (unités indépendantes, comme avant)
        expect(dbStub._donnees['trimestreActif']).toBe('h2026');
    });

    it('statique — plus AUCUN data-on-change de persistance dans index.html (anti-retour auto-save)', () => {
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(html).not.toContain('data-on-change="sauvegarderIdentificationTrimestreV2"');
        expect(html).not.toContain('data-on-change="sauvegarderCadreCalendrierV2"');
        // Les data-on-change d'AFFICHAGE (non persistants) restent en place
        expect(html).toContain('data-on-change="majAffichageRepriseV2Prevu"');
    });

    it('statique — le bouton de la section est câblé sur le point de persistance unique', () => {
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(html).toContain('data-action="sauvegarderTrimestreCompletV2"');
        // et l'ancien câblage bouton→cadre-seul a disparu
        expect(html).not.toContain('data-action="sauvegarderCadreCalendrierV2"');
    });
});
