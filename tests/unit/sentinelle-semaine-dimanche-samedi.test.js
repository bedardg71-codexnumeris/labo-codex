import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Retour testeur (Grégoire, 6 août 2026) — deux corrections liées au Cadre :
//
// 1. FORMAT DES VUES CALENDAIRES. Le calendrier scolaire affiche la semaine
//    du DIMANCHE au SAMEDI (format du calendrier de la direction des études),
//    mais les vues du module Rythme la déroulaient du lundi au dimanche.
//    Décision : dimanche→samedi PARTOUT. Le point délicat n'est pas l'ordre
//    des colonnes, c'est l'APPARTENANCE du dimanche : il OUVRE la semaine
//    qui vient, il ne ferme pas celle qui finit.
//
// 2. CONGÉS DISPARUS (#374-bis). La fusion `migrerJourneesSansCours` tourne
//    à DOMContentLoaded, AVANT la fin de l'hydratation IndexedDB→memoryCache :
//    une clé d'événements vivant uniquement en IDB (cas réel des 2 congés
//    A2026) n'est pas vue par le scan, et l'écran — qui ne lit plus que la
//    nouvelle clé — montre des congés « disparus ». Correctif : re-scan à
//    db-ready + dédoublonnage par CONTENU (même jour + même libellé), car
//    l'utilisateur a pu recréer le congé à la main avec un id neuf avant que
//    la fusion tardive ne rapporte l'original.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceRythme = readFileSync(path.join(racineProjet, 'js', 'rythme.js'), 'utf8');
const sourceMain = readFileSync(path.join(racineProjet, 'js', 'main.js'), 'utf8');
const sourceOrganisateur = readFileSync(path.join(racineProjet, 'js', 'organisateur.js'), 'utf8');

// --- Sandbox Rythme -----------------------------------------------------
function monterRythme(store) {
    const db = {
        getSync: (k, d) => (k in store ? store[k] : d),
        setSync: (k, v) => { store[k] = v; },
        removeSync: (k) => { delete store[k]; }
    };
    const win = chargerScript('js/rythme.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        MutationObserver: class { observe() {} disconnect() {} },
        document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {}, body: {} }
    });
    win.dateLocaleYMD = () => '2026-09-01';
    return win.Rythme;
}

// Un calendrier minimal : 2 semaines scolaires (paquet de 5) autour d'un weekend.
// Sem. 2 : lun 31 août → ven 4 sept ; Sem. 3 : lun 7 → ven 11 sept.
function calendrierDeuxSemaines() {
    const cal = {};
    const poser = (date, statut, num) => { cal[date] = { statut, numeroSemaine: num }; };
    poser('2026-08-31', 'cours', 2); poser('2026-09-01', 'cours', 2); poser('2026-09-02', 'cours', 2);
    poser('2026-09-03', 'cours', 2); poser('2026-09-04', 'cours', 2);
    cal['2026-09-05'] = { statut: 'weekend' }; cal['2026-09-06'] = { statut: 'weekend' };
    poser('2026-09-07', 'cours', 3); poser('2026-09-08', 'cours', 3); poser('2026-09-09', 'cours', 3);
    poser('2026-09-10', 'cours', 3); poser('2026-09-11', 'cours', 3);
    return cal;
}

describe('semaine dimanche→samedi · Rythme (fonctionnel)', () => {
    it('la plage élargie commence un DIMANCHE et finit un SAMEDI (weekends actifs)', () => {
        const store = {
            a2026_calendrierComplet: calendrierDeuxSemaines(),
            preferencesRythme: { weekends: true }
        };
        const jours = monterRythme(store).obtenirJoursCalendrier('2026-09-01', '2026-09-09', { weekends: true });

        expect(jours.length).toBeGreaterThan(0);
        expect(jours[0].jourSemaine).toBe('Dimanche');
        expect(jours[jours.length - 1].jourSemaine).toBe('Samedi');
    });

    it('le dimanche appartient à la semaine QUI COMMENCE, le samedi à celle qui finit', () => {
        const store = {
            a2026_calendrierComplet: calendrierDeuxSemaines(),
            preferencesRythme: { weekends: true }
        };
        const jours = monterRythme(store).obtenirJoursCalendrier('2026-09-01', '2026-09-09', { weekends: true });
        const parDate = {};
        jours.forEach((j) => { parDate[j.date] = j; });

        // Samedi 5 sept ferme la semaine 2 ; dimanche 6 sept ouvre la semaine 3.
        expect(parDate['2026-09-05'].numeroSemaine).toBe(2);
        expect(parDate['2026-09-06'].numeroSemaine).toBe(3);
    });

    it('sans weekends, rien ne change : plage lundi→vendredi', () => {
        const store = {
            a2026_calendrierComplet: calendrierDeuxSemaines(),
            preferencesRythme: { weekends: false }
        };
        const jours = monterRythme(store).obtenirJoursCalendrier('2026-09-01', '2026-09-09', { weekends: false });

        expect(jours[0].jourSemaine).toBe('Lundi');
        expect(jours[jours.length - 1].jourSemaine).toBe('Vendredi');
        expect(jours.some((j) => j.estWeekend)).toBe(false);
    });
});

describe('semaine dimanche→samedi · invariants statiques', () => {
    it('le portrait temporel (heatmap) itère NOMS_JOURS_JS, dimanche en tête', () => {
        // Une seule liste ordonnée : mapping getDay() ET ordre d'affichage.
        expect(sourceRythme).toMatch(/var NOMS_JOURS_JS = \['Dimanche', 'Lundi'/);
        expect(sourceRythme).not.toMatch(/var JOURS_COMPLETS =/);
        // Plus aucune itération lundi-d'abord dans le rendu.
        expect(sourceRythme).not.toMatch(/\['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'\]/);
    });

    it('les ancres d’élargissement sont Dimanche (début) et Samedi (fin, weekends)', () => {
        expect(sourceRythme).toMatch(/!== 'Dimanche'\) \{\s*\n\s*dDebut\.setDate/);
        expect(sourceRythme).toMatch(/prefs\.weekends \? 'Samedi' : 'Vendredi'/);
    });

    it('l’Organisateur ordonne les séances du dimanche au samedi (dimanche présent)', () => {
        expect(sourceOrganisateur).toMatch(/ordreJours = \['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'\]/);
    });
});

// --- Sandbox Migrations -------------------------------------------------
function monterMigrations(store, clesLocalStorage) {
    const db = {
        getSync: (k, d) => (k in store ? store[k] : d),
        setSync: (k, v) => { store[k] = v; },
        removeSync: (k) => { delete store[k]; },
        memoryCache: new Map(Object.keys(store).map((k) => [k, store[k]]))
    };
    const fauxLocalStorage = {
        get length() { return clesLocalStorage.length; },
        key: (i) => clesLocalStorage[i]
    };
    const win = chargerScript('js/migrations.js', {
        db,
        cle: (k) => `a2026_${k}`,
        localStorage: fauxLocalStorage,
        document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} }
    });
    return { win, store };
}

describe('#374-bis · fusion des journées sans cours (dédoublonnage par contenu)', () => {
    it('un congé RECRÉÉ à la main (id neuf, même jour + libellé) ne se duplique pas à la fusion tardive', () => {
        const { win, store } = monterMigrations({
            // L'utilisateur a recréé son congé : id neuf dans la nouvelle clé.
            a2026_journeesSansCours: [
                { id: 'evt_neuf', dateEvenement: '2026-09-07', description: 'Fête du travail', categorie: 'ferie' }
            ],
            // L'original, vu tardivement (clé IDB-only enfin hydratée).
            a2026_evenementsPrevus: [
                { id: 'evt_ancien', dateEvenement: '2026-09-07', description: 'Fête du travail', categorie: 'ferie' }
            ]
        }, []);

        const nb = win.migrerJourneesSansCours();

        expect(nb).toBe(0);
        expect(store.a2026_journeesSansCours).toHaveLength(1);
        expect(store.a2026_journeesSansCours[0].id).toBe('evt_neuf');
        // L'ancienne clé est bien retirée (zéro-dette).
        expect('a2026_evenementsPrevus' in store).toBe(false);
    });

    it('un événement réellement distinct (autre date) est fusionné, lui', () => {
        const { win, store } = monterMigrations({
            a2026_journeesSansCours: [
                { id: 'evt_neuf', dateEvenement: '2026-09-07', description: 'Fête du travail' }
            ],
            a2026_evenementsImprevus: [
                { id: 'evt_greve', dateEvenement: '2026-11-09', description: 'Journée Carrière' }
            ]
        }, []);

        expect(win.migrerJourneesSansCours()).toBe(1);
        expect(store.a2026_journeesSansCours).toHaveLength(2);
    });

    it('la clé peut vivre UNIQUEMENT en memoryCache (le cas des congés disparus)', () => {
        // localStorage ne connaît AUCUNE clé : tout vient de memoryCache.
        const { win, store } = monterMigrations({
            a2026_evenementsPrevus: [
                { id: 'evt_a', dateEvenement: '2026-09-07', description: 'Fête du travail' }
            ]
        }, []);

        expect(win.migrerJourneesSansCours()).toBe(1);
        expect(store.a2026_journeesSansCours).toHaveLength(1);
    });

    it('main.js re-scanne à db-ready (#374-bis) et régénère le calendrier si besoin', () => {
        const handler = sourceMain.slice(
            sourceMain.indexOf("addEventListener('db-ready'"),
            sourceMain.indexOf("addEventListener('db-ready'") + 2000
        );
        expect(handler).toMatch(/migrerJourneesSansCours\(\) > 0/);
        expect(handler).toMatch(/genererCalendrierComplet\(\)/);
    });
});
