import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// SENTINELLE — la pratique « Standards » se nomme « Par sélection de productions » (20 nov. 2026).
// Consigne : plans de travail/CONSIGNE-LOT-2026-11-20-renommer-selection-productions.md.
// Les vingt textes acceptés par Grégoire (20 h 44) sont lus dans le fichier de textes validés, jamais recopiés ici :
// plans de travail/TEXTES-2026-11-20-selection-de-productions.md. Chacun se cherche là où il vit.
// Ce que le lot NE change PAS est épinglé aussi : le code « STD », l'identifiant, la phrase lue par les étudiant·es.

const racine = resolve(import.meta.dirname, '..', '..');
const lire = (f) => readFileSync(join(racine, f), 'utf8');
/** Un texte ramené à ses mots : apostrophes échappées ou typographiques, insécables, entités et gras retirés. */
const net = (t) => t.replace(/\\'/g, '\'').replace(/’/g, '\'').replace(/&nbsp;/g, ' ').replace(/ /g, ' ')
    .replace(/<\/?strong>/g, '').replace(/\s+/g, ' ');
const TEXTES = lire('plans de travail/TEXTES-2026-11-20-selection-de-productions.md');
/** Les sections « ## REPÈRE · fichier · où » du fichier validé : { repere, fichier, textes }. */
const SECTIONS = TEXTES.split(/^## /m).slice(1).filter((s) => /^[A-Z]\d+ · /.test(s)).map((s) => {
    const [repere, fichier] = s.split('\n')[0].split(' · ');
    return { repere, fichier, textes: s.split('\n').filter((l) => l.startsWith('> ')).map((l) => l.slice(2).trim()) };
});
const section = (repere) => SECTIONS.find((s) => s.repere === repere);
const source = (repere) => net(lire(section(repere).fichier));

describe('Renommage « Par sélection de productions » — les vingt textes acceptés le 20 nov. 2026', () => {
    it('le fichier validé porte les vingt repères, vingt-trois textes', () => {
        expect(SECTIONS.map((s) => s.repere)).toEqual(['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'T1', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'M1',
            'F3', 'F4', 'F10', 'P1', 'P2', 'M5']);
        expect(SECTIONS.flatMap((s) => s.textes)).toHaveLength(23);
    });

    it('les phrases entières se lisent à leur source, mot pour mot', () => {
        for (const repere of ['V1', 'V2', 'V5', 'V6', 'T1', 'A4', 'A5', 'A6', 'M1', 'F4']) {
            for (const t of section(repere).textes) expect(source(repere), repere + ' : ' + t).toContain(net(t));
        }
    });

    it('les noms et les libellés courts se lisent dans leur champ, pas ailleurs par hasard', () => {
        const vue = source('V3');
        expect(vue).toContain(`modele: 'STD-n-meilleurs', titre: '${section('V3').textes[0]}',`);
        expect(vue).toMatch(new RegExp(`modele: 'STD-n-meilleurs'[^}]*lien: '${section('V4').textes[0]}' }`));
        const assistant = source('A1');
        expect(assistant).toContain(`'standards': { code: 'STD', classe: 'std', label: '${section('A1').textes[0]}', description: '${net(section('A1').textes[1])}' }`);
        expect(assistant).toContain(`{ value: 'niveaux', label: '${section('A2').textes[0]}', description: '${section('A2').textes[1]}' }`);
        expect(assistant).toContain(`'<h4>${section('A3').textes[0]}</h4>'`);
        expect(source('F3')).toContain(`<option value="standards">${section('F3').textes[0]}</option>`);
        expect(source('F10')).toContain(`return "${section('F10').textes[0]}";`);
        expect(source('P1').split(`pratique: '${section('P1').textes[0]}',`)).toHaveLength(3);   // P1 et P2 : deux endroits
    });

    it('M5 : le calcul rend les deux phrases, selon qu\'il y a des artefacts', () => {
        const registre = source('M5');
        const [productions, artefacts] = section('M5').textes;
        const debut = 'Seule l\'évaluation terminale a une note. Par sélection de productions, la note du cours s\'appuie aussi sur ';
        expect(productions.startsWith(debut) && artefacts.startsWith(debut)).toBe(true);
        expect(registre).toContain(`return '${debut}'`);
        expect(registre).toContain('(avecArtefacts ? \'les artefacts du portfolio\' : \'les productions retenues\')');
    });

    it('les anciens libellés ont quitté ces endroits', () => {
        const vue = lire('js/vue-simple.js');
        for (const ancien of ['titre: \'Par standards\'', 'Choisir les standards', 'ni par standards ni', 'par standards ou par', 'par standards et par']) {
            expect(vue, ancien).not.toContain(ancien);
        }
        expect(lire('js/tableau-notation.js')).not.toContain('par standards et par');
        const assistant = lire('js/wizard-pratique-v2.js');
        for (const ancien of ['PAN – Standards', 'Configuration PAN-Standards', 'cette pratique PAN-Standards']) expect(assistant, ancien).not.toContain(ancien);
        const registre = lire('js/pratiques/pratique-registre.js');
        for (const ancien of ['PAN-Standards s\\\'appuie', 'En PAN – Standards', 'En standards, la note du cours']) expect(registre, ancien).not.toContain(ancien);
        expect(lire('js/accompagnement-contenu-hover.js')).not.toContain('En standards, la note se construit');
        expect(lire('index.html')).not.toContain('<option value="standards">PAN-Standards</option>');
        expect(lire('js/pratiques/pratique-pan-standards.js')).not.toContain('return "PAN-Standards"');
        expect(lire('js/profil-etudiant-actions.js')).not.toContain('pratique: \'PAN-Standards\'');
    });

    it('rien d\'autre ne bouge : le code STD, l\'identifiant, la famille du modèle, et la phrase lue par les étudiant·es', () => {
        const registre = lire('js/pratiques/pratique-registre.js');
        expect(registre).toMatch(/standards:\s*\{[^}]*code:\s*'STD'/);
        expect(lire('js/vue-simple.js')).toContain('{ famille: \'standards\', modele: \'STD-n-meilleurs\',');
        expect(lire('index.html')).toContain('<option value="standards">');
        for (const f of ['js/synthese-retroaction-data.js', 'js/evaluation-retroaction.js']) {
            expect(lire(f), f).toContain('Mes standards sont très élevés à ton égard');
        }
        expect(lire('js/export-resultats-finaux.js')).toContain('pratique.obtenirNom()');   // E1 suit F10, sans texte à lui
    });

    it('la ligne des Nouvelles est gardée pour la release, pas encore publiée', () => {
        expect(TEXTES).toContain('La pratique « Standards » s\'appelle maintenant « Par sélection de productions ».');
        expect(lire('js/changelog-data.js')).not.toContain('Par sélection de productions');
    });
});

// JOURNAL DES BREAK-TESTS (20 nov. 2026) — copie de référence, mutation, cinq fichiers de bancs rejoués (126 essais), restauration
// (empreinte sha256 identique à chaque fois). Avant la mise à jour des bancs, les vingt textes posés avaient rendu 12 rouges dans
// 4 fichiers (sentinelle-standards-sans-portfolio 8, tableau-notation-1 2, textes-relus-15-oct 1, canonisation-production 1).
//   B1 vue-simple.js — le titre du modèle redevient « Par standards »                 → 2 rouges (ici)
//   B2 pratique-registre.js — M5 redit « En standards »                                → 7 rouges (ici 2, standards-sans-portfolio 4, tableau-notation-1 1)
//   B3 index.html — l'encadré F4 redit « PAN-Standards »                               → 2 rouges (ici 1, standards-sans-portfolio 1)
//   B4 wizard-pratique-v2.js — le code « (STD) » revient dans le nom A2                → 1 rouge (ici)
//   B5 TEXTES-2026-11-20-selection-de-productions.md — A5 altéré d'un mot              → 3 rouges (ici 1, standards-sans-portfolio 2)
//   B6 accompagnement-contenu-hover.js — la bulle A6 redit « En standards »            → 3 rouges (ici 2, textes-relus-15-oct 1)
