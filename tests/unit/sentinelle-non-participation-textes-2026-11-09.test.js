import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE — LES TEXTES DE LA NON-PARTICIPATION NE DISENT PLUS « PRÉSENT·E » SEULEMENT
// (groupe 2, 9 nov. 2026 ; textes du rapport du septième parcours, validés par Grégoire, la carte RàI en deux phrases).
//
// Depuis la retouche de 13 h 44, une personne absente à toutes les séances passées, sans production, est lue en
// non-participation. Six textes disaient « présent·e » : faux pour elle.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

describe('Non-participation : les six textes validés le 9 nov.', () => {
    it('1 et 2 — l\'Aide « Repérer les patterns » et le guide pédagogique', () => {
        const phrase = 'aucune production évaluée après au moins une séance, présent·e ou absent·e, quand le groupe permet d\'en juger (un travail dû et au moins une copie du groupe évaluée).';
        expect(lire('index.html')).toContain('<li><strong>Non-participation</strong>&nbsp;: ' + phrase + '</li>');
        expect(lire('js/guides-pedagogiques.js')).toContain('Non-participation</span> — ' + phrase);
    });

    it('3 — la carte « Profils d\'apprentissage »', () => {
        const html = lire('index.html');
        expect(html).toContain('<li><strong>Non-participation</strong> : aucune production évaluée, présent·e ou absent·e</li>');
        expect(html).not.toContain('Présent·e en classe, aucune production évaluée');
    });

    it('4 — l\'infobulle du filtre des patterns', () => {
        expect(lire('js/accompagnement-contenu-hover.js')).toContain('non-participation (rien de remis, présent·e ou absent·e)');
    });

    it('5 — la carte RàI du profil : une phrase pour la personne venue, une autre pour l\'absente partout', () => {
        const src = lire('js/profil-etudiant-calculs.js');
        expect(src).toContain('return _niveauNonParticipation(fenetreAnalyse, indices.A === 0);');
        const corps = tranche(src, 'function _niveauNonParticipation(fenetreAnalyse, absentePartout) {', '\n}\n', { longueurMin: 200 });
        const niveau = new Function(corps + '\n}\nreturn _niveauNonParticipation;')();
        expect(niveau(3, true).description).toBe('Absent·e à toutes les séances passées, et aucune production remise. Profil prioritaire nécessitant une intervention immédiate.');
        expect(niveau(3, false).description).toBe('Étudiant·e présent·e en classe mais aucune production remise. Profil prioritaire nécessitant une intervention immédiate.');
        expect(niveau(3, true).niveau).toBe(3);
    });

    it('6 — l\'alerte de l\'Aperçu : « N étudiant·e sans aucun travail remis »', () => {
        const src = lire('js/tableau-bord-apercu.js');
        expect(src).toContain("${nbEleves} étudiant·e${nbEleves > 1 ? '·s' : ''} sans ${accordTermeProduction('aucun', 1)}");
        expect(src).not.toMatch(/présent·e\$\{nbEleves/);
    });
});
