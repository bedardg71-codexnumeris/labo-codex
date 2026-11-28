import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { tranche } from './_helpers/tranche.js';
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
/** Les sections « ## REPÈRE · fichier · où » d'un fichier validé : { repere, fichier, textes }. */
const sectionsDe = (texte) => texte.split(/^## /m).slice(1).filter((s) => /^[A-Z]\d+ · /.test(s)).map((s) => {
    const [repere, fichier] = s.split('\n')[0].split(' · ');
    return { repere, fichier, textes: s.split('\n').filter((l) => l.startsWith('> ')).map((l) => l.slice(2).trim()) };
});
const SECTIONS = sectionsDe(TEXTES);
// ↻ 21 nov. 2026, 7 h 44 (choix de Grégoire ; les sources ne tranchent pas) : la pratique n'est plus dite « PAN ». Le fichier
// du 21 nov. REMPLACE, pour A1, A2, A3, F3, F4, F10, P1 et P2 seulement, les citations du 20 nov., qui reste intact.
const SANS_PAN = sectionsDe(lire('plans de travail/TEXTES-2026-11-21-selection-sans-PAN.md'));
const REMPLACES = ['A1', 'A2', 'A3', 'F3', 'F4', 'F10', 'P1', 'P2'];
// ↻ 22 nov. 2026, 9 h 12 (textes acceptés par Grégoire) : « Par standards » trouvable en vue simple. Le fichier du 22 nov.
// REMPLACE, pour V1 seulement, la citation du 20 nov., qui reste intacte ; et, décision A du même jour, V2, V5 et V6.
const PORTE_STD = sectionsDe(lire('plans de travail/TEXTES-2026-11-22-vue-simple-porte-par-standards.md'));
const REMPLACES_22 = ['V1', 'V2', 'V5', 'V6'];
// ↻ 27 nov. 2026 (trois familles : « Par sélection de productions » s'appelle « Hybride ») : le fichier du 27 nov. REMPLACE,
// pour les repères qu'il porte et que liste REMPLACES_27, les citations des trois fichiers précédents, qui restent intacts.
const FAMILLES_27 = sectionsDe(lire('plans de travail/TEXTES-2026-11-27-familles-cum-hyb.md'));
const REMPLACES_27 = ['V1', 'V2', 'V3', 'V5', 'V6', 'T1', 'A1', 'A2', 'A3', 'A6', 'M1', 'F3', 'F4', 'F10', 'P1', 'P2', 'M5'];
// ↻ 28 nov. 2026 (familles par réglages, texte 11 accepté par Grégoire à 7 h 18) : le fichier du 28 nov. REMPLACE, pour A1
// seulement, la citation du 27 nov., qui reste intacte.
const REGLAGES_28 = sectionsDe(lire('plans de travail/TEXTES-2026-11-28-familles-par-reglages.md'));
const REMPLACES_28 = ['A1', 'V1', 'V2', 'V3', 'V5', 'V6'];   // ↻ 10 h 15 : V2, V5, V6 (les trois textes « par niveaux »)   // V1, V3 : le modèle de la vue simple, « Cumulative par niveaux » (8 h 40)
const section = (repere) => (REMPLACES_28.includes(repere) && REGLAGES_28.find((s) => s.repere === repere))
    || (REMPLACES_27.includes(repere) && FAMILLES_27.find((s) => s.repere === repere))
    || (REMPLACES_22.includes(repere) && PORTE_STD.find((s) => s.repere === repere))
    || (REMPLACES.includes(repere) && SANS_PAN.find((s) => s.repere === repere)) || SECTIONS.find((s) => s.repere === repere);
const source = (repere) => net(lire(section(repere).fichier));

describe('Renommage « Par sélection de productions » — les vingt textes acceptés le 20 nov. 2026', () => {
    it('le fichier validé du 20 nov. porte les vingt repères, vingt-trois textes ; celui du 21 nov. en remplace huit', () => {
        expect(REMPLACES.every((r) => SANS_PAN.some((s) => s.repere === r))).toBe(true);
        expect(REMPLACES_22.every((r) => PORTE_STD.some((s) => s.repere === r && s.textes.length === 1))).toBe(true);
        expect(REMPLACES_27.every((r) => FAMILLES_27.some((s) => s.repere === r && s.textes.length >= 1))).toBe(true);
        expect(REMPLACES.flatMap((r) => section(r).textes).join(' ')).not.toMatch(/\bPAN\b/);
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
        // ↻ 21 nov. 2026 (« le sigle suit le nom », décision de Grégoire) : le sigle affiché de cette pratique devient SEL,
        // et sa couleur au récapitulatif la sarcelle (classe `sel`) ; son nom et sa description ne changent pas.
        // ↻ 27 nov. 2026 : le sigle HYB ; la classe `sel` (la couleur) ne change pas.
        expect(assistant).toContain(`'standards': { code: 'HYB', classe: 'sel', label: '${section('A1').textes[0]}', description: '${net(section('A1').textes[1])}' }`);
        expect(assistant).toContain(`{ value: 'niveaux', label: '${section('A2').textes[0]}', description: '${section('A2').textes[1]}' }`);
        expect(assistant).toContain(`'<h4>${section('A3').textes[0]}</h4>'`);
        expect(source('F3')).toContain(`<option value="standards">${section('F3').textes[0]}</option>`);
        expect(source('F10')).toContain(`return "${section('F10').textes[0]}";`);
        expect(source('P1').split(`pratique: '${section('P1').textes[0]}',`)).toHaveLength(3);   // P1 et P2 : deux endroits
    });

    it('M5 : le calcul rend les deux phrases, selon qu\'il y a des artefacts', () => {
        const registre = source('M5');
        const [productions, artefacts] = section('M5').textes;
        const debut = 'Seule l\'évaluation terminale a une note. En pratique hybride, la note du cours s\'appuie aussi sur ';   // ↻ 27 nov. 2026
        expect(productions.startsWith(debut) && artefacts.startsWith(debut)).toBe(true);
        expect(registre).toContain(`return '${debut}'`);
        expect(registre).toContain('(avecArtefacts ? \'les artefacts du portfolio\' : \'les productions retenues\')');
    });

    it('les anciens libellés ont quitté ces endroits', () => {
        const vue = lire('js/vue-simple.js');
        for (const ancien of ['Choisir les standards', 'ni par standards ni', 'par standards ou par', 'par standards et par']) {
            expect(vue, ancien).not.toContain(ancien);
        }
        // Révisé le 21 nov. 2026 (mandat « Par standards » dans la vue simple) : le titre « Par standards » revient, mais à la
        // carte de la NOUVELLE famille (`cibles`, à l'essai), une seule fois ; la carte du modèle par sélection garde le sien.
        expect(vue.split('titre: \'Par standards\'').length - 1).toBe(1);
        expect(vue).toContain('{ famille: \'cibles\', modele: \'par-standards\', titre: \'Par standards\',');
        expect(vue).toContain(`{ famille: 'standards', modele: 'STD-n-meilleurs', titre: '${section('V3').textes[0]}',`);   // ↻ 27 nov. 2026 : « Hybride »
        expect(lire('js/tableau-notation.js')).not.toContain('par standards et par');
        const assistant = lire('js/wizard-pratique-v2.js');
        for (const ancien of ['PAN – Standards', 'Configuration PAN-Standards', 'cette pratique PAN-Standards', 'PAN – Sélection de productions']) expect(assistant, ancien).not.toContain(ancien);
        const registre = lire('js/pratiques/pratique-registre.js');
        for (const ancien of ['PAN-Standards s\\\'appuie', 'En PAN – Standards', 'En standards, la note du cours']) expect(registre, ancien).not.toContain(ancien);
        expect(lire('js/accompagnement-contenu-hover.js')).not.toContain('En standards, la note se construit');
        expect(lire('index.html')).not.toContain('<option value="standards">PAN-Standards</option>');
        expect(lire('js/pratiques/pratique-pan-standards.js')).not.toContain('return "PAN-Standards"');
        expect(lire('js/profil-etudiant-actions.js')).not.toContain('pratique: \'PAN-Standards\'');
        // 21 nov. 2026, 7 h 44 : le préfixe « PAN – » part aussi (F3, F4, F10, P1, P2).
        for (const f of ['index.html', 'js/pratiques/pratique-pan-standards.js', 'js/profil-etudiant-actions.js']) {
            expect(lire(f), f).not.toContain('PAN – Sélection de productions');
        }
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

    it('la ligne des Nouvelles est publiée à la 1.252, mot pour mot, avec la phrase du sigle (release du 21 nov. 2026)', () => {
        const ligne = TEXTES.split('\n').find(l => l.startsWith('La pratique « Standards » s\'appelle maintenant'));
        expect(ligne).toMatch(/Une pratique que tu avais nommée toi-même garde son nom\.$/);
        // La typographie du fichier des Nouvelles : apostrophe courbe, espaces insécables dans les guillemets et avant « : ».
        const typo = (t) => t.replace(/'/g, '’').replace(/« /g, '«&nbsp;').replace(/ »/g, '&nbsp;»').replace(/ :/g, '&nbsp;:');
        // 21 nov. 2026, 12 h 18 (accepté par Grégoire) : « en sarcelle » retiré, le badge est blanc à l'écran.
        const attendu = typo(ligne + ' Son badge dit maintenant « SEL ».');
        const journal = lire('js/changelog-data.js');
        const entree = tranche(journal, "version: '1.252'", "version: '1.251'");
        expect(entree).toContain("'" + attendu + "'");
        expect((entree.match(/^\s+'/gm) || []).length).toBe(1);        // une seule ligne dans cette entrée
        expect(entree).not.toMatch(/STD|Par standards|PAN/);            // rien de la nouvelle pratique, et SEL n'est pas dite PAN
        expect(entree, 'le badge est blanc à l\'écran : la phrase ne dit pas sa couleur').not.toMatch(/sarcelle/);
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
