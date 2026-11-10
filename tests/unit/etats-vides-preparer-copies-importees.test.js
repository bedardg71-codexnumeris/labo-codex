import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// « Aucun travail importé » sur Évaluation › Préparer, alors que l'import a marché
// =======================================================================
//
// Rapport iPad de Grégoire, BUG_grégoire_2026-11-10_15-20-18 (1.241.0, 11 productions,
// 196 évaluations) : « Je reçois le message que je n'ai fait aucune importation alors que
// l'importation a fonctionné. »
//
// Cause mesurée : `etats-vides.js` jugeait la page par son DOM. Or Préparer ne montre
// jamais les copies déjà importées (elles sont dans Annoter) : file vide, il ne reste que
// l'étape 1, et la page paraissait vide après CHAQUE import. Second chemin : le bandeau posé
// avant un import restait affiché après lui, la page se redessinant sans changer de
// sous-section.
//
// Ce qui est verrouillé ici :
//   A. des copies dans le groupe actif, file vide : AUCUN bandeau (le rapport) ;
//   B. aucune copie, file vide : le bandeau s'affiche (le vrai état vide reste dit) ;
//   C. des fichiers en file, aucune copie : aucun bandeau (import en cours) ;
//   D. sans le module des copies, ou s'il lève : aucun bandeau (on ne prétend pas « vide ») ;
//   E. `retirerSiPeuplee` retire le bandeau posé avant l'import, et seulement celui-là ;
//   F. les autres sous-sections restent jugées par le DOM (aucune régression) ;
//   G. `afficherImport` (travaux-ui.js) appelle `retirerSiPeuplee` en fin de rendu.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const SOURCE = readFileSync(path.join(racine, 'js', 'etats-vides.js'), 'utf8');

// La page Préparer telle que `afficherImport` la dessine quand la file est vide :
// l'en-tête et l'étape 1, rien d'autre (aucune liste des copies importées).
const PREPARER_FILE_VIDE = `
<div id="evaluations-importer" class="sous-section active"><div id="evaluations-contenu-import">
  <div class="pipeline-page">
    <div class="travaux-import-header"><h3 class="titre-page-controles"><span class="titre-page-texte-masque">Préparer et importer</span></h3><div class="pipeline-stats"></div></div>
    <div class="pipeline-etapes-groupe" id="pipeline-etapes-groupe"><div class="pipeline-etapes-contenu">
      <div class="pipeline-etape"><div class="pipeline-etape-header"><span class="pipeline-etape-numero">1</span><span class="pipeline-etape-titre">Sélection des fichiers</span></div>
        <div id="travaux-drop-zone" class="travaux-drop-zone"><div class="travaux-drop-zone-contenu"><p>Glisse tes fichiers ici</p></div></div>
      </div>
    </div></div>
  </div>
</div></div>
<div id="conception-productions" class="sous-section"><div id="conception-productions-contenu"></div></div>`;

function monter({ copies = [], file = [], sansStockage = false, stockageLeve = false } = {}) {
    const dom = new JSDOM(`<!doctype html><html><body>${PREPARER_FILE_VIDE}</body></html>`,
        { runScripts: 'outside-only' });
    const w = dom.window;
    if (!sansStockage) {
        w.travauxStockage = {
            obtenirFichiersGroupeActif: () => {
                if (stockageLeve) throw new Error('lecture impossible (banc)');
                return copies;
            }
        };
    }
    w.travauxImport = { obtenirFileDAttente: () => file };
    w.console.warn = () => {};   // la lecture qui lève est annoncée ; le banc n'en veut pas le bruit
    w.eval(SOURCE);
    const bandeau = (id) => w.document.querySelector('#' + id + ' .etat-vide-banniere');
    return { w, doc: w.document, bandeau };
}

const UNE_COPIE = [{ id: 'f1', etudiantDA: '1234567', productionId: 'p1', groupeCoursId: 'gc1' }];

describe('Évaluation › Préparer : le bandeau suit les copies, pas l’écran', () => {
    it('A. des copies dans le groupe actif, file vide : aucun bandeau', () => {
        const { w, bandeau } = monter({ copies: UNE_COPIE });
        w.etatsVides.afficherPourSousSection('evaluations-importer');
        expect(bandeau('evaluations-importer')).toBeNull();
    });

    it('B. aucune copie, file vide : le bandeau dit l’état vide', () => {
        const { w, bandeau } = monter({ copies: [] });
        w.etatsVides.afficherPourSousSection('evaluations-importer');
        const b = bandeau('evaluations-importer');
        expect(b).not.toBeNull();
        expect(b.textContent.startsWith('Aucun travail importé.')).toBe(true);
    });

    it('C. des fichiers en file, aucune copie encore : aucun bandeau', () => {
        const { w, bandeau } = monter({ copies: [], file: [{ id: 'q1' }] });
        w.etatsVides.afficherPourSousSection('evaluations-importer');
        expect(bandeau('evaluations-importer')).toBeNull();
    });

    it('D. sans le module des copies, ou s’il lève : aucun bandeau', () => {
        const absent = monter({ sansStockage: true });
        absent.w.etatsVides.afficherPourSousSection('evaluations-importer');
        expect(absent.bandeau('evaluations-importer')).toBeNull();

        const leve = monter({ stockageLeve: true });
        leve.w.etatsVides.afficherPourSousSection('evaluations-importer');
        expect(leve.bandeau('evaluations-importer')).toBeNull();
    });

    it('E. après l’import, retirerSiPeuplee retire le bandeau posé avant, et ne pose rien', () => {
        const copies = [];
        const { w, bandeau } = monter({ copies });
        w.etatsVides.afficherPourSousSection('evaluations-importer');
        expect(bandeau('evaluations-importer')).not.toBeNull();   // premier import du groupe : vrai

        w.etatsVides.retirerSiPeuplee('evaluations-importer');      // encore vide : il reste
        expect(bandeau('evaluations-importer')).not.toBeNull();

        copies.push(...UNE_COPIE);                                  // l'import a marché
        w.etatsVides.retirerSiPeuplee('evaluations-importer');
        expect(bandeau('evaluations-importer')).toBeNull();

        copies.length = 0;                                          // ne pose jamais de bandeau
        w.etatsVides.retirerSiPeuplee('evaluations-importer');
        expect(bandeau('evaluations-importer')).toBeNull();
    });

    it('F. les autres sous-sections restent jugées par le DOM', () => {
        const { w, doc, bandeau } = monter({ copies: UNE_COPIE });
        w.etatsVides.afficherPourSousSection('conception-productions');
        expect(bandeau('conception-productions')).not.toBeNull();   // vide à l'écran : bandeau

        doc.getElementById('conception-productions-contenu').innerHTML = '<div class="production-item">P1</div>';
        w.etatsVides.afficherPourSousSection('conception-productions');
        expect(bandeau('conception-productions')).toBeNull();       // une carte à l'écran : rien
    });

    it('G. afficherImport (travaux-ui.js) appelle retirerSiPeuplee en fin de rendu', () => {
        const src = readFileSync(path.join(racine, 'js', 'travaux-ui.js'), 'utf8');
        const debut = src.indexOf('function afficherImport()');
        const fin = src.indexOf('function afficherFichiers()', debut);
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
        expect(src.slice(debut, fin)).toContain("window.etatsVides.retirerSiPeuplee('evaluations-importer')");
    });
});
