import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Sentinelle — les CINQ bibliothèques reposent l'état de leur section d'import
// (24 août 2026).
//
// Retour de Grégoire : « la section se referme aussitôt que je clique pour importer
// une cartouche ». Le défaut était identique partout : l'import reconstruit le modal.
//
// La preuve d'intégration jumelle (integration/bibliotheques-import-persistance.spec.js)
// éprouve la MÉCANIQUE au navigateur, mais sur deux modules seulement — cartouches et
// grilles. Ce fichier-ci garde les cinq, et les deux chemins de chacun : un câblage
// oublié dans « Tout importer » des pratiques ne se verrait nulle part ailleurs.

const MODULES = [
    { fichier: 'js/cartouches.js', etat: 'etatImportCartouches', apercu: 'afficherCartouchesTrimestreModal',
      handlers: ['importerUneCartoucheTrimestre', 'importerToutCartouchesTrimestreModal'] },
    { fichier: 'js/grilles.js', etat: 'etatImportGrilles', apercu: 'afficherGrillesTrimestreModal',
      handlers: ['importerUneGrilleTrimestre', 'importerToutGrillesTrimestreModal'] },
    { fichier: 'js/echelles.js', etat: 'etatImportEchelles', apercu: 'afficherEchellesTrimestreModal',
      handlers: ['importerUneEchelleTrimestre', 'importerToutEchellesTrimestreModal'] },
    { fichier: 'js/pratiques-gestion.js', etat: 'etatImportPratiques', apercu: 'afficherPratiquesTrimestreModal',
      handlers: ['importerUnePratiqueTrimestre', 'importerToutPratiquesTrimestreModal'] },
    { fichier: 'js/productions-bibliotheque-ui.js', etat: 'etatImportProductions', apercu: 'afficherProductionsTrimestreModal',
      handlers: ['importerUneProductionTrimestre', 'importerToutTrimestreModal'] }
];

function lire(fichier) {
    return fs.readFileSync(path.join(racineProjet, fichier), 'utf8');
}

/** Corps d'une fonction, de sa déclaration à la première `}` en colonne 0. */
function corpsDe(contenu, nomFonction) {
    const motif = new RegExp('(?:async\\s+)?function\\s+' + nomFonction + '\\s*\\(');
    const m = contenu.match(motif);
    if (!m) return null;
    const debut = m.index;
    const fin = contenu.slice(debut).search(/\n\}/);
    return contenu.slice(debut, debut + (fin > -1 ? fin : 6000));
}

describe('Bibliothèques · la section d\'import survit à la reconstruction du modal', () => {
    it('le helper partagé existe et expose ses deux moitiés', () => {
        const ui = lire('js/bibliotheque-ui.js');
        expect(ui).toContain('BibliothequeUI.capturerImportTrimestre');
        expect(ui).toContain('BibliothequeUI.restaurerImportTrimestre');
    });

    it('chaque module déclare son état d\'import', () => {
        for (const { fichier, etat } of MODULES) {
            const contenu = lire(fichier);
            expect(corpsDe(contenu, etat), `${fichier} · ${etat} introuvable`).toBeTruthy();
            expect(corpsDe(contenu, etat)).toContain('BibliothequeUI.capturerImportTrimestre');
        }
    });

    it('les DIX handlers d\'import capturent puis restaurent', () => {
        const manquants = [];
        for (const { fichier, apercu, handlers } of MODULES) {
            const contenu = lire(fichier);
            for (const handler of handlers) {
                const corps = corpsDe(contenu, handler);
                if (!corps) { manquants.push(`${fichier} · ${handler} INTROUVABLE`); continue; }
                if (!/const etatSection = etatImport/.test(corps)) {
                    manquants.push(`${fichier} · ${handler} ne capture pas l'état`);
                }
                if (!corps.includes('BibliothequeUI.restaurerImportTrimestre')) {
                    manquants.push(`${fichier} · ${handler} ne restaure pas l'état`);
                }
                if (!corps.includes(apercu)) {
                    manquants.push(`${fichier} · ${handler} ne repasse pas ${apercu} comme rouvreur d'aperçu`);
                }
            }
        }
        expect(manquants, 'Section d\'import non restaurée :\n  ' + manquants.join('\n  ')).toEqual([]);
    });

    it('la capture précède TOUJOURS la reconstruction du modal', () => {
        // Capturer après `afficherBibliothequeX()` lirait le DOM neuf : on
        // restaurerait l'état vide qu'on vient de créer, et le test ci-dessus
        // passerait quand même.
        const fautifs = [];
        for (const { fichier, handlers } of MODULES) {
            const contenu = lire(fichier);
            for (const handler of handlers) {
                const corps = corpsDe(contenu, handler);
                if (!corps) continue;
                const capture = corps.indexOf('const etatSection = etatImport');
                const reconstruction = corps.search(/await afficherBibliotheque/);
                if (capture === -1 || reconstruction === -1) continue;
                if (capture > reconstruction) {
                    fautifs.push(`${fichier} · ${handler} capture APRÈS la reconstruction`);
                }
            }
        }
        expect(fautifs, fautifs.join('\n')).toEqual([]);
    });
});
