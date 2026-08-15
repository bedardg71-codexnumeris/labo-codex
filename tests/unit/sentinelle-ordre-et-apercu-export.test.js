import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monterExportSandbox } from './_helpers/carte-essai-exports.js';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

/**
 * Ajoute une leçon de semaine `sem` EN TÊTE de enfants[] — donc « créée tôt ».
 *
 * ⚠ `x`/`y` SONT UN PARAMÈTRE, et ce n'est pas du zèle. Première version : tout
 * était posé en (900, 900). Le break-test « rang de séance ignoré » restait
 * VERT — la position mettait la leçon en dernier de toute façon, donc le cas
 * ne pouvait pas distinguer un tri par rang d'un tri par position. Une valeur
 * qui répond pareil avec ou sans le code testé ne teste rien.
 */
function poserLeconEnTete(carte, id, sem, rang, pos) {
    const seq = carte.etat.noeuds.get('seq-1');
    const p = pos || { x: 0, y: 0 };
    carte.etat.noeuds.set(id, {
        id, type: 'lecon', titre: 'Leçon ' + sem, x: p.x, y: p.y,
        parent: 'seq-1', enfants: [], cloneSourceId: null,
        metadata: { semaine: sem, rangSeance: rang }
    });
    seq.enfants = [id].concat(seq.enfants);
}

function semainesDe(tsv) {
    return tsv.split('\n').slice(1)
        .map((l) => l.split('\t')[0])
        .filter((s) => s !== '' && s != null);
}

describe('A · les leçons sortent dans l’ORDRE DES SEMAINES', () => {
    it('une leçon planifiée tard mais créée tôt ne remonte plus en tête', () => {
        // ⚠ RETOUR TERRAIN DU 15 AOÛT : « la leçon 11 se range bizarrement
        // après la rangée 1 plutôt que 10 ». Ça se lit comme un tri
        // alphabétique cassé. Ce n'en était pas un : il n'y avait AUCUN tri.
        // Les leçons sortaient dans l'ordre brut de `seq.enfants`, c'est-à-dire
        // l'ordre de CRÉATION des blocs — des mois plus tôt, sans rapport avec
        // le calendrier. Mesuré avant correction : ["11","3","3","5","6","8"].
        const { exporteur, carte } = monterExportSandbox();
        poserLeconEnTete(carte, 'lecon-11', 11, 1);

        const semaines = semainesDe(exporteur.genererExport('calendrier', 'tsv'));
        const dansSeq1 = semaines.slice(0, 3);
        expect(dansSeq1).toEqual(['3', '3', '11']);
    });

    it('le rang de séance départage deux leçons de la MÊME semaine', () => {
        const { exporteur, carte } = monterExportSandbox();
        // Rang 1 inséré APRÈS le rang 2 existant de la semaine 3.
        poserLeconEnTete(carte, 'lecon-3-rang-3', 3, 3);
        const semaines = semainesDe(exporteur.genererExport('calendrier', 'tsv'));
        // Les trois leçons de semaine 3 restent groupées, la nouvelle en
        // dernier (rang 3) et non en tête comme son insertion le voudrait.
        expect(semaines.slice(0, 3)).toEqual(['3', '3', '3']);
        // Et elles sortent dans l'ordre des RANGS : A, B, puis la nouvelle (C).
        // Le gabarit Calendrier rend le rang en lettre, colonne « Séance ».
        const rangs = exporteur.genererExport('calendrier', 'tsv')
            .split('\n').slice(1, 4).map((l) => l.split('\t')[1]);
        expect(rangs).toEqual(['A', 'B', 'C']);
    });

    it('une leçon SANS semaine va en fin, jamais en tête', () => {
        // Sans cette règle, l'absence de semaine se lirait comme « semaine 0 »
        // et le non-planifié ouvrirait le document.
        const { exporteur, carte } = monterExportSandbox();
        // Un titre, sinon la ligne entièrement vide est retirée par le
        // générateur et le cas ne porterait sur rien.
        poserLeconEnTete(carte, 'lecon-nulle', null, null);
        carte.etat.noeuds.get('lecon-nulle').titre = 'Pas encore planifiée';

        // ⚠ ON LIT LES CELLULES BRUTES, pas la liste filtrée. Première version :
        // l'assertion passait par un helper qui ÉCARTE les semaines vides —
        // c'est-à-dire exactement la ligne sous test. Le break-test restait
        // vert parce que l'oracle jetait la preuve.
        //
        // ⚠ ET LE GABARIT COMPTE. Sur « Calendrier », ce cas est IMPOSSIBLE à
        // observer : ses six colonnes (semaine, séance, date, contenu…) ne
        // portent pas le titre, donc une leçon non planifiée y sort en six
        // cellules vides et le générateur la retire — à raison. On l'observe
        // donc sur « En classe », qui a une colonne Titre.
        const lignes = exporteur.genererExport('deroulement', 'tsv')
            .split('\n').slice(1).filter((l) => l.trim() !== '');
        // ⚠ « En fin » veut dire en fin de SA SÉQUENCE, pas en fin de document :
        // les autres séquences ont leurs propres sections après. Une assertion
        // « dernière ligne du fichier » serait fausse pour une bonne raison —
        // et c'est le message d'échec qui me l'a appris, pas la relecture.
        const rangDeLaNulle = lignes.findIndex((l) => l.includes('Pas encore planifiée'));
        expect(rangDeLaNulle, 'la leçon non planifiée est absente du document').toBeGreaterThan(-1);
        ['L’incipit', 'La description'].forEach((titre) => {
            const rang = lignes.findIndex((l) => l.includes(titre));
            expect(rang, `« ${titre} » introuvable`).toBeGreaterThan(-1);
            expect(rangDeLaNulle, `la non planifiée est passée devant « ${titre} »`)
                .toBeGreaterThan(rang);
        });
    });
});

describe('B · l’aperçu s’aligne SANS toucher au document', () => {
    let api;
    function monter() {
        const win = chargerScript('js/planification-carte.js', {
            db: { getSync: () => null, setSync: () => {}, get: async () => null, set: async () => {} },
            cle: (k) => k,
            echapperHtml: (t) => String(t == null ? '' : t),
            requestAnimationFrame: (f) => { f(); return 0; }
        });
        return win.planificationCarte;
    }

    it('met les colonnes en colonnes', () => {
        api = monter();
        const tsv = 'Semaine\tTitre\tÉval\n1\tIntroduction\t\n11\tUne leçon au titre long\tArtefact 7\n';
        const lignes = api.alignerApercuTSV(tsv).split('\n');
        // Le début de la 2e colonne est au MÊME rang sur toutes les lignes :
        // c'est très exactement ce que « ne se chevauche pas » veut dire.
        const debuts = lignes.map((l) => l.indexOf(l.trim().split(/\s{2,}/)[1]));
        expect(new Set(debuts).size).toBe(1);
        expect(lignes[0]).not.toContain('\t');
    });

    it('⚠ le DOCUMENT reste un vrai TSV — c’est le risque de ce chantier', () => {
        // Un TSV rembourré d'espaces n'est plus un TSV : collé dans Numbers,
        // chaque cellule traînerait son remplissage. L'alignement ne doit donc
        // JAMAIS remonter dans le générateur.
        const { exporteur } = monterExportSandbox();
        const doc = exporteur.genererExport('calendrier', 'tsv');
        expect(doc).toContain('\t');
        // Aucune cellule ne se termine par une espace de remplissage.
        doc.split('\n').forEach((ligne) => {
            ligne.split('\t').forEach((cellule) => {
                expect(cellule).toBe(cellule.replace(/\s+$/, ''));
            });
        });
    });

    it('l’alignement vit dans la MODALE, pas dans le générateur', () => {
        // Couplage silencieux : déplacer `alignerApercuTSV` dans
        // planification-export.js casserait les exports sans faire rougir la
        // moindre assertion de la modale.
        const exportSrc = readFileSync(path.join(racine, 'js', 'planification-export.js'), 'utf8');
        expect(exportSrc).not.toContain('alignerApercuTSV');
        const carteSrc = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
        expect(carteSrc).toContain('function alignerApercuTSV');
        // Et seul l'aperçu l'appelle — jamais le chemin Copier/Télécharger,
        // qui passe par `documentCourant()`.
        expect(carteSrc).toMatch(/apercu\.textContent = exportPersoFormatApercu === 'tsv'/);
    });
});
