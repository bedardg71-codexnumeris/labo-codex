import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — LOT F : LES GESTES QUI ÉCRIVENT HORS DU TÉMOIN COMMUN LE DISENT AU CODEX.
//
// Relecture de Cowork (29 sept. 2026) : un geste qui écrit en `db` direct laissait le codex dire
// « Ton codex est à jour » à tort. Inventaire des 531 écritures directes (dans la demande de
// relecture finale du lot F) : les gestes de l'usager sont raccordés par
// `window.signalerEcritureUsager(cle)`, qui émet l'événement que le codex écoute.
//
// Cliquet : le nombre de raccords par fichier. Un raccord retiré en silence fait rougir ; un
// raccord AJOUTÉ (nouveau geste hors témoin) se déclare ici, en montant le compte.
// Le banc WebKit `lot-f-gestes-hors-temoin.spec.js` éprouve un geste par famille atteignable ;
// cette sentinelle tient aussi celles que le banc n'atteint pas sans l'écran (élèves suivis,
// questions du tirage, verrou d'une date de présences, outils d'annotation).
//
// ⛔ Moratoire #622 : l'archivage d'un trimestre (`trimestres.js`, `trimestre-v2-liste.js`)
// n'est pas raccordé — ses fichiers ne changent pas. Créer un trimestre depuis la liste et
// l'export « format recherche » restent donc sans signal, assumé.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

const RACCORDS = {
    'js/bibliotheque-ui.js': 2,
    'js/bilan-reflexif-core.js': 2,
    'js/bilan-reflexif-csv.js': 1,
    'js/bilan-reflexif-rapport.js': 1,
    'js/boite-outils.js': 6,
    'js/cartouches-bibliotheque.js': 2,
    'js/cartouches.js': 5,
    'js/cc-license.js': 1,
    'js/cours.js': 5,
    'js/donnees-v2.js': 4,
    'js/echelles-bibliotheque.js': 2,
    'js/echelles.js': 3,
    'js/grilles-bibliotheque.js': 2,
    'js/grilles.js': 3,
    'js/interpretation-config.js': 1,
    'js/main.js': 1,
    'js/modelisation.js': 1,
    'js/objectifs.js': 1,
    'js/partage-import.js': 1,
    'js/partage-section.js': 1,
    'js/planification-bibliotheque.js': 1,
    'js/planification-donnees.js': 1,
    'js/portfolio.js': 1,
    'js/pratiques-bibliotheque.js': 2,
    'js/pratiques-gestion.js': 5,
    'js/pratiques.js': 5,
    'js/pratiques/denotation-jugements.js': 1,
    'js/pratiques/modalites-evaluation.js': 1,
    'js/pratiques/pratique-manager.js': 3,
    'js/productions-bibliotheque-ui.js': 3,
    'js/productions-bibliotheque.js': 2,
    'js/productions-import-export.js': 1,
    'js/productions-liste.js': 2,
    'js/productions.js': 4,
    'js/profil-etudiant-rapport.js': 1,
    'js/registre-longitudinal.js': 4,
    'js/rencontres.js': 1,
    'js/repertoires-bibliotheque.js': 1,
    'js/saisie-presences.js': 1,
    'js/tableau-bord-apercu.js': 1,
    'js/tampons-bibliotheque.js': 2,
    'js/travaux-doublons-ui.js': 1,
    'js/travaux-outils.js': 7,
    'js/travaux-stockage.js': 1,
    'js/trimestre-v2-groupes-cours.js': 2,
    'js/trimestre-v2-horaires.js': 2
};

const compter = (f) => (readFileSync(path.join(racineProjet, f), 'utf8').match(/signalerEcritureUsager\(/g) || []).length;

describe('Lot F : raccords des gestes hors témoin', () => {
    for (const [fichier, attendu] of Object.entries(RACCORDS)) {
        it(`${fichier} porte ${attendu} raccord(s)`, () => {
            expect(compter(fichier)).toBe(attendu);
        });
    }

    it('le moratoire #622 tient : aucun raccord dans les fichiers de l\'archivage d\'un trimestre', () => {
        expect(compter('js/trimestres.js')).toBe(0);
        expect(compter('js/trimestre-v2-liste.js')).toBe(0);
    });

    it('le point d\'accroche émet l\'événement du codex, sans rien afficher', () => {
        const temoin = readFileSync(path.join(racineProjet, 'js/temoin-enregistrement.js'), 'utf8');
        expect(temoin).toContain('window.signalerEcritureUsager = function (cle) { annoncerEcriture(cle); };');
        expect(temoin).toContain("window.dispatchEvent(new CustomEvent('donnees-enregistrees', { detail: { cle: cle } }));");
    });
});
