import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #18 — déploiement des info-bulles, zone « Boîte à outils / Animation ».
// On vérifie (1) que les 5 entrées sont enregistrées avec un contenu hover non
// vide (comportemental : on intercepte accompagnement.ajouterEntrees), et
// (2) que les éléments porteurs des data-tooltip sont bien câblés (statique).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const indexHtml = readFileSync(path.join(racine, 'index.html'), 'utf8');
const boiteOutils = readFileSync(path.join(racine, 'js/boite-outils.js'), 'utf8');

const CLES = [
    'outil-questions-flash',
    'outil-tirage',
    'outil-tirage-nombre',
    'outil-tirage-remise',
    'outil-tirage-exclusion'
];

const CLES_PRESENCES = [
    'presences-saisie',
    'presences-date',
    'presences-tri',
    'presences-presence-col',
    'presences-total-periodes',
    'presences-assiduite-col'
];

describe('#18 — info-bulles Boîte à outils : contenu enregistré', () => {
    let captured = null;
    const fauxWin = { accompagnement: { ajouterEntrees: (e) => { captured = e; } } };
    chargerScript('js/accompagnement-contenu-hover.js', {}, fauxWin);

    it('les 5 clés sont poussées au catalogue avec un hover non vide', () => {
        expect(captured, 'ajouterEntrees appelé').toBeTruthy();
        CLES.forEach((cle) => {
            expect(captured[cle], 'entrée ' + cle).toBeTruthy();
            expect(typeof captured[cle].hover).toBe('string');
            expect(captured[cle].hover.length).toBeGreaterThan(15);
        });
    });

    it('le hover « remise » explique bien avec ET sans remise', () => {
        expect(captured['outil-tirage-remise'].hover).toMatch(/sans remise/i);
        expect(captured['outil-tirage-remise'].hover).toMatch(/avec remise/i);
    });
});

describe('#18 — info-bulles Boîte à outils : câblage data-tooltip', () => {
    it('les titres de cartes (index.html) portent leur data-tooltip', () => {
        expect(indexHtml).toContain('data-tooltip="outil-questions-flash"');
        expect(indexHtml).toContain('data-tooltip="outil-tirage"');
    });

    it('les paramètres du tirage (boite-outils.js) portent leur data-tooltip', () => {
        expect(boiteOutils).toContain('data-tooltip="outil-tirage-nombre"');
        expect(boiteOutils).toContain('data-tooltip="outil-tirage-remise"');
        expect(boiteOutils).toContain('data-tooltip="outil-tirage-exclusion"');
    });
});

describe('#18 — info-bulles Présences', () => {
    let captured = null;
    const fauxWin = { accompagnement: { ajouterEntrees: (e) => { captured = e; } } };
    chargerScript('js/accompagnement-contenu-hover.js', {}, fauxWin);

    it('les 6 clés Présences sont poussées avec un hover non vide', () => {
        CLES_PRESENCES.forEach((cle) => {
            expect(captured[cle], 'entrée ' + cle).toBeTruthy();
            expect(captured[cle].hover.length).toBeGreaterThan(15);
        });
    });

    it('les cibles Présences (index.html) portent leur data-tooltip', () => {
        CLES_PRESENCES.forEach((cle) => {
            expect(indexHtml, cle).toContain('data-tooltip="' + cle + '"');
        });
    });
});
