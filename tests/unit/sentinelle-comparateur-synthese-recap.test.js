import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { magasinBanc, CAS_RECAP, monterAssistant, recapDuCas } from './_helpers/recap-familles.js';

// lot/comparateur-synthese (21 nov. 2026, décision de Grégoire, 21 h 26) — « CE QUE RÈGLE CETTE PRATIQUE ».
//
// Labo › Comparateur montre, sous le menu de chaque colonne, la section « Configuration – <type> » du récapitulatif de
// l'assistant, MOT POUR MOT. Une seule source de texte : `genererSectionConfiguration` (wizard-pratique-v2.js), que le
// récapitulatif appelle avec les réponses de l'assistant, et le comparateur avec celles d'une pratique enregistrée
// (`syntheseConfigurationDePratique` = `reponsesDepuisPratique`, le geste de « Modifier », puis la même section).
//
// Trois gardes :
//   A. l'extraction ne change RIEN au récapitulatif : pour chaque famille, le HTML rendu est celui qu'a rendu le code
//      d'avant (fixtures/recap-familles-avant.json, généré sur origin/main à 16360f43c, AVANT toute modification) ;
//   B. ce que le comparateur montre d'une pratique enregistrée est la section que l'assistant montre en la rouvrant ;
//   C. le comparateur lit cette source, n'en garde aucune copie, et ne montre pas « Informations de base ».

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const AVANT = JSON.parse(readFileSync(path.join(__dirname, 'fixtures', 'recap-familles-avant.json'), 'utf8'));
const srcComparateur = readFileSync(path.join(RACINE, 'js', 'comparateur-pratiques.js'), 'utf8');

describe('A · le récapitulatif de l\'assistant rend exactement le HTML d\'avant, famille par famille', () => {
    const win = monterAssistant(magasinBanc());
    it('les cas du banc et ceux de la référence sont les mêmes', () => {
        expect(Object.keys(CAS_RECAP).sort()).toEqual(Object.keys(AVANT).sort());
    });
    for (const nom of Object.keys(CAS_RECAP)) {
        it(nom, () => {
            expect(recapDuCas(win, CAS_RECAP[nom])).toBe(AVANT[nom]);
        });
    }
    it('la section extraite est, telle quelle, dans le récapitulatif ; et elle seule y dit « Configuration »', () => {
        for (const nom of Object.keys(CAS_RECAP)) {
            const recap = recapDuCas(win, CAS_RECAP[nom]);
            const section = win.genererSectionConfiguration(CAS_RECAP[nom].reponses);
            expect(recap).toContain(section);
            expect(recap.replace(section, '')).not.toMatch(/<h4>Configuration/);
        }
    });
});

/* ---------------------------------------------------------------- Des pratiques enregistrées, une par famille */
const ENREGISTREES = [
    { id: 'p-sel', nom: 'SEL <banc>', type: 'standards', auteur: 'Auteur Fictif', etablissement: 'Cégep Imaginaire',
        configuration: { approcheEvaluation: 'par-artefacts', echelleId: 'E0', grilleId: 'G1',
            portfolio: { nombreARetenir: 4, methodeSelection: 'recents', minimumCompletion: 3 } } },
    { id: 'p-sel-hybride', nom: 'SEL hybride', type: 'standards',
        configuration: { echelleId: 'E0', portfolio: { nombreARetenir: 6, methodeSelection: 'meilleurs' },
            categories: { actif: true, selection: { nombreARetenir: 3, ponderation: 60 }, obligatoires: { nombre: 2, ponderation: 40 } } } },
    { id: 'p-spe', nom: 'SPE banc', type: 'specifications',
        configuration: { seuilAcceptable: 80, jetons: { activer: true, delai: { nombre: 2, dureeJours: 4 }, reprise: { nombre: 3 } } } },
    { id: 'p-den', nom: 'DEN banc', type: 'denotation',
        configuration: { type: 'denotation', modeDEN: 'eliminee', objectifs: [{ id: 'o1', nom: 'Lire' }], suggestion: { methode: 'moyenne' }, echelleId: 'E0', grilleId: null } },
    { id: 'p-cib', nom: 'Par standards banc', type: 'cibles',
        configuration: { type: 'cibles', ensembleCiblesId: 'ENSC_FICT', echelleId: 'ECH_DEPART', niveauSansDonnee: '0' } },
    { id: 'p-som', nom: 'SOM banc', type: 'sommative', reglesSpeciales: ['double_verrou'],
        configuration: { conditions_speciales: [{ type: 'double_verrou', condition: { evaluation: 'Examen', seuil: 50 }, consequence: { note_max: 55 } }] } }
];

describe('B · le comparateur montre d\'une pratique enregistrée ce que l\'assistant montre en la rouvrant', () => {
    const magasin = magasinBanc();
    magasin.pratiquesConfigurables = JSON.parse(JSON.stringify(ENREGISTREES));
    const win = monterAssistant(magasin);

    for (const p of ENREGISTREES) {
        it(p.id + ' : la synthèse est la section « Configuration » du récapitulatif rouvert, au caractère près', () => {
            const synthese = win.syntheseConfigurationDePratique(p);
            win.wizardState.modeEdition = true;
            win.wizardState.pratiqueId = p.id;
            win.chargerPratiqueExistante(p.id);
            const recap = win.genererRecapitulatif();
            if (p.type === 'sommative') {
                // La sommative n'a pas de section « Configuration » (#900) : rien, et le comparateur prend son repli.
                expect(synthese).toBe('');
                expect(recap).not.toMatch(/<h4>Configuration/);
            } else {
                expect(synthese).toMatch(/^<div class="wizard-v2-recap-section"><h4>Configuration/);
                expect(recap).toContain(synthese);
            }
        });
    }

    it('« Par standards » : le cours, chaque cible avec sa part, « cible terminale », les critères, l\'échelle, le niveau « sans donnée », la phrase sur la note', () => {
        const s = win.syntheseConfigurationDePratique(ENREGISTREES.find(p => p.id === 'p-cib'));
        expect(s).toContain('<h4>Configuration – Par standards</h4>');
        expect(s).toContain('999-FIC-XX - Cours &lt;fictif&gt;');
        // (la part s'écrit avec une espace insécable avant « % » : `EnsemblesCibles.formaterPart`)
        expect(s).toMatch(/<strong>Lire un récit &lt;inventé&gt;<\/strong> · 50\s%\s· 2 critères, dont 1 essentiel/u);
        expect(s).toMatch(/<strong>Rédiger &amp; réviser<\/strong> · 25\s%\s· cible terminale/u);
        expect(s).toContain('Échelle de départ – Par standards');
        expect(s).toContain('0 – Données insuffisantes');
        expect(s).toContain('La note est la moyenne pondérée des niveaux retenus');
        expect(s).not.toContain('CIB');
    });

    it('une pratique de la démo, dont la famille n\'est que sous configuration.type, montre la section de SA famille', () => {
        const demo = { id: 'p-demo', nom: 'Démo SEL', configuration: { type: 'standards',
            portfolio: { nombreARetenir: 6, minimumCompletion: 7, methodeSelection: 'meilleurs' } } };
        const avant = JSON.stringify(demo);
        const s = win.syntheseConfigurationDePratique(demo);
        expect(s).toContain('<h4>Configuration – Par sélection de productions</h4>');
        expect(s).toContain('<strong>Artefacts retenus\u00a0:</strong> 6');
        expect(JSON.stringify(demo)).toBe(avant);   // la pratique lue n'est pas modifiée
    });

    it('une pratique importée qui porte du HTML dans ses réglages ne l\'injecte pas : tout est échappé', () => {
        const piege = '<img src=x data-piege>';
        const pieges = [
            { id: 'x1', type: 'standards', configuration: { approcheEvaluation: piege, portfolio: { nombreARetenir: piege, methodeSelection: piege } } },
            { id: 'x2', type: 'specifications', configuration: { seuilAcceptable: piege, jetons: { activer: true, delai: { nombre: piege, dureeJours: piege }, reprise: { nombre: piege } } } },
            { id: 'x3', type: 'denotation', configuration: { objectifs: [], suggestion: { methode: piege } } }
        ];
        for (const p of pieges) {
            const s = win.syntheseConfigurationDePratique(p);
            expect(s).not.toContain('<img');
        }
    });

    it('pas d\'« Informations de base » : ni auteur, ni établissement, ni discipline', () => {
        for (const p of ENREGISTREES) {
            const s = win.syntheseConfigurationDePratique(p);
            expect(s).not.toMatch(/Informations de base|Auteur|Établissement|Discipline/);
        }
    });

    it('lecture seule : la synthèse n\'écrit rien (le banc lève à toute écriture) et ne touche pas l\'état de l\'assistant', () => {
        win.wizardState.reponses = { marque: 'intacte' };
        for (const p of ENREGISTREES) win.syntheseConfigurationDePratique(p);
        expect(win.wizardState.reponses).toEqual({ marque: 'intacte' });
        expect(win.syntheseConfigurationDePratique(null)).toBe('');
    });
});

describe('C · le comparateur lit la source unique, et n\'en garde aucune copie', () => {
    it('la colonne appelle syntheseConfigurationDePratique, puis la description courte pour une famille de base', () => {
        const i = srcComparateur.indexOf('function _syntheseColonne(');
        expect(i).toBeGreaterThan(-1);
        const corps = srcComparateur.slice(i, srcComparateur.indexOf('\n    }\n', i));
        expect(corps).toMatch(/syntheseConfigurationDePratique\(env\)/);
        expect(corps).toMatch(/obtenirDescriptionCourtePratique\(env \|\| \{ type: id \}\)/);
        expect(corps).toMatch(/_esc\(desc\)/);
    });
    it('aucun texte du récapitulatif recopié dans le comparateur (dans une chaîne ; les commentaires peuvent le nommer)', () => {
        expect(srcComparateur).not.toMatch(/['"`][^'"`\n]*(Configuration –|Configuration PAN-|Niveau «|moyenne pondérée des niveaux retenus)/);
    });
    it('le volet est un <details> natif, replié d\'office (aucun attribut open dans le rendu), libellé « Ce que règle cette pratique »', () => {
        expect(srcComparateur).toMatch(/<details class="comparateur-synthese" data-slot="' \+ slot \+ '"><summary>Ce que règle cette pratique<\/summary>/);
        expect(srcComparateur).not.toMatch(/<details[^>]*\bopen\b/);
    });
});

// ── Journal ─────────────────────────────────────────────────────────────
// 2026-11-21 : création (lot/comparateur-synthese). Référence A générée par le banc sur le code d'origin/main
//   (16360f43c), avant l'extraction. Break-tests joués : (1) « Par standards</h4> » → « Par standard</h4> » dans
//   genererSectionConfiguration → A (cib-complete, cib-vide) et B (« Par standards ») rougissent ; (2) la synthèse du
//   comparateur qui relit autrement que l'assistant (nbArtefactsRetenus forcé à 7) → B (p-sel, p-sel-hybride) rougit ;
//   (3) le comparateur qui écrit « Configuration – » lui-même → C rougit. Fichiers restaurés après chaque essai.
