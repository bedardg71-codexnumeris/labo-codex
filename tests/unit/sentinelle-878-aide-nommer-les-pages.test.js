import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #878 (20 septembre 2026) — L'AIDE DIT COMMENT NOMMER LES PAGES D'UNE
// REMISE EN PLUSIEURS FICHIERS, ET ELLE NE MENT PAS.
//
// Cas vécu par Grégoire le 15 septembre : trois fichiers « 1a », « 1b », « 1c »
// ont donné trois productions et des doublons à la confirmation ; renommés
// « -p1 », « -p2 », « -p3 », ils se sont assemblés. Rien ne le disait nulle part.
// Le texte a été validé par lui le 17 septembre (DECISIONS-2026-09-17-apres-midi).
//
// Deux verrous :
//  1. le paragraphe existe SOUS « 1. Déposer les fichiers » et cite les six formes ;
//  2. chaque forme citée est JOUÉE contre l'import réel (`parserNomFichierLea`,
//     puis un vrai dépôt) : ce que l'Aide promet d'assembler s'assemble, et la lettre
//     finale qu'elle déconseille fabrique bien une autre production. Resserrer
//     `SUFFIXE_PAGE` sans retoucher l'Aide rougit ; reconnaître un jour la lettre
//     finale (reporté par Grégoire) rougit aussi, pour que le texte suive.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const index = readFileSync(path.join(racine, 'index.html'), 'utf8');

// Ce que l'Aide DIT : l'accordéon, puis sa seule section 1 (du titre 1 au titre 2).
const aide = tranche(index, 'id="accordeon-aide-preparer-importer"', '<!-- Carte:', { longueurMin: 1500 });
const section1 = tranche(aide, '<p><strong>1. Déposer les fichiers :</strong></p>', '<p><strong>2. ', { longueurMin: 600 });
const paragraphe = tranche(section1, '<p><strong>Une remise en plusieurs fichiers</strong>', '</p>', { longueurMin: 300 });

// Le paragraphe se lit en deux moitiés : ce qui s'assemble, puis ce qui ne s'assemble pas.
const moitieFormes = tranche(paragraphe, '<p>', 'Une lettre', { longueurMin: 150 });
const moitieLettres = tranche(paragraphe, 'Une lettre', undefined, { longueurMin: 80 });
const codes = (html) => [...html.matchAll(/<code>([^<]+)<\/code>/g)].map(m => m[1]);
const formes = codes(moitieFormes);
const lettres = codes(moitieLettres);

// Un vrai PDF minimal : `validerMagicBytes` lit les quatre premiers octets.
const OCTETS_PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
function faireFichier(nom) {
    const blob = new Blob([OCTETS_PDF], { type: 'application/pdf' });
    blob.name = nom;
    blob.lastModified = Date.UTC(2026, 8, 15, 13, 46, 45);
    return blob;
}

// Même banc que #603 : l'import réel, sans stockage derrière.
function monter() {
    return chargerScript('js/travaux-import.js', {
        obtenirDonneesSelonMode: (quoi) => (quoi === 'groupeEtudiants' ? [{ da: '9000058', nom: 'Bourdages', prenom: 'Alma' }] : []),
        travauxStockage: {
            obtenirFichiersGroupeActif: () => [],
            genererMiniaturePDF: async () => ({ thumbnail: '', nombrePages: 1 }),
            genererMiniatureImage: async () => '',
            stockerThumbnail: () => {}
        },
        db: { getSync: () => null, setSync: () => {} },
        notifications: { succes: () => {}, erreur: () => {}, info: () => {} }
    });
}

// Le nom Léa d'une page, tel que Grégoire le renomme après le dézippage.
const nomLea = (production, secondes) => 'Bourdages_9000058_' + production + '__Remis_le_2026-09-15_09h46m' + secondes + 's.pdf';
// « -p2 » et « _p 2 » se collent au nom ; « page 2 », « (2) »… en sont séparés par une espace.
const nommer = (forme) => 'Artefact_1' + (/^[-_]/.test(forme) ? '' : ' ') + forme;
// L'Aide abrège le second exemple (« Artefact_1a, 1b ») : le nom entier se reconstitue.
const nomLettre = (code) => (code.startsWith('Artefact_') ? code : 'Artefact_' + code);

describe('#878 · le paragraphe est là où Grégoire l\'a placé, avec ses mots', () => {
    it('sous « 1. Déposer les fichiers », il cite les six formes et les deux lettres', () => {
        expect(formes).toEqual(['-p1', '-p2', '_p 2', 'page 2', 'partie 2', 'part2', '(2)']);
        expect(lettres).toEqual(['Artefact_1a', '1b']);
        // Toute balise code du paragraphe est jouée plus bas : aucune n'échappe aux deux moitiés.
        expect(codes(paragraphe).length).toBe(formes.length + lettres.length);
    });
    it('le texte validé le 17 septembre est posé tel quel', () => {
        const texte = paragraphe.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        expect(texte).toBe('Une remise en plusieurs fichiers : pour que les pages s\'assemblent en un seul document, '
            + 'numérote-les à la fin du nom — -p1, -p2… (ou _p 2, page 2, partie 2, part2, (2)). '
            + 'Une lettre — Artefact_1a, 1b — crée une AUTRE production : tu obtiens plusieurs documents '
            + 'et des doublons à la confirmation.');
    });
    it('il n\'est écrit qu\'une fois dans l\'Aide', () => {
        expect(index.split('Une remise en plusieurs fichiers').length - 1).toBe(1);
    });
});

describe('#878 · l\'Aide ne ment pas : chaque forme citée est jouée contre l\'import', () => {
    let win;
    beforeEach(() => { win = monter(); });

    it('chaque forme citée détache la page : même production que le nom sans suffixe', () => {
        const temoin = win.travauxImport.parserNomFichierLea(nomLea('Artefact_1', '45'));
        expect(temoin.nomProduction).toBe('Artefact 1');
        expect(temoin.page).toBe(null);
        expect(formes.length).toBeGreaterThan(0);
        for (const forme of formes) {
            const r = win.travauxImport.parserNomFichierLea(nomLea(nommer(forme), '45'));
            expect(r.nomProduction, forme).toBe('Artefact 1');
            expect(r.page, forme).toBe(parseInt(forme.match(/\d+/)[0], 10));
        }
    });

    it('déposées ensemble, toutes les formes citées s\'assemblent en UN document, sans doublon', () => {
        win.travauxImport.setProductionGlobale('prod_artefact_1');
        win.travauxImport.ajouterFichiersEnAttente(formes.map((f, i) => faireFichier(nomLea(nommer(f), String(10 + i)))));
        const groupes = win.travauxImport.regrouperParDocument();
        expect(groupes.size).toBe(1);
        expect([...groupes.values()][0]).toHaveLength(formes.length);
        expect(win.travauxImport.detecterDoublonsStockage()).toEqual([]);
    });

    it('une lettre finale crée une AUTRE production : plusieurs documents, et des doublons à la confirmation', () => {
        expect(lettres.length).toBeGreaterThan(1);
        for (const code of lettres) {
            const r = win.travauxImport.parserNomFichierLea(nomLea(nomLettre(code), '45'));
            expect(r.page, code).toBe(null);
            expect(r.nomProduction, code).not.toBe('Artefact 1');
        }
        win.travauxImport.setProductionGlobale('prod_artefact_1');
        win.travauxImport.ajouterFichiersEnAttente(lettres.map((c, i) => faireFichier(nomLea(nomLettre(c), String(10 + i)))));
        expect(win.travauxImport.regrouperParDocument().size).toBe(lettres.length);
        expect(win.travauxImport.detecterDoublonsStockage().length).toBeGreaterThan(0);
    });
});
