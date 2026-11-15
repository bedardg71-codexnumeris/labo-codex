import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #880 (16 sept. 2026, 7 h 00) — « les documents ne sont pas rassemblés dans un
// seul pdf, ils sont dispersés comme des documents autonomes ».
//
// Un élève avait remis QUATRE PDF pour une même production. Depuis #873, ils
// partagent la clé de regroupement (DA + production) et la confirmation les
// encadrait sous « → 1 PDF ». Mais `assemblerGroupesPipeline` ne gardait que
// les IMAGES (`f.estImage`) : quatre PDF, quatre documents importés.
//
// Décision de Grégoire (16 sept.) : les PDF se fusionnent comme les photos.
// `assemblerPDFGroupe` rend chaque page d'un PDF (pdf.js) avant de l'ajouter.
//
// Le rendu réel (pdf.js, canvas, jsPDF) est hors de portée de Node : ici, des
// doublures qui ENREGISTRENT ce qui est ajouté. Le rendu réel a été vérifié
// sur banc navigateur avec les vraies bibliothèques du dossier libs.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceUI = readFileSync(path.resolve(__dirname, '..', '..', 'js', 'travaux-ui.js'), 'utf8');

const ETUDIANTS = [{ da: '9000058', nom: 'Exemple', prenom: 'Alma' }];

// Lettre US : 612 x 792 points.
const LETTRE = { width: 612, height: 792 };

let ajouts;   // addImage enregistrés, dans l'ordre
let pagesDoc; // formats de page enregistrés (constructeur + addPage)

function faireJsPDF() {
    return {
        jsPDF: function (opts) {
            pagesDoc.push(opts.format);
            this.addPage = (format) => { pagesDoc.push(format); };
            this.addImage = (data, type, x, y, w, h) => { ajouts.push({ data, w, h }); };
            this.output = () => new Blob(['%PDF-assemble'], { type: 'application/pdf' });
        }
    };
}

// Un « PDF » de doublure : son contenu dit son nom et son nombre de pages.
function fauxPdf(nom, nbPages) {
    const blob = new Blob([JSON.stringify({ nom, nbPages })], { type: 'application/pdf' });
    blob.name = nom;
    blob.lastModified = Date.UTC(2026, 8, 15, 13, 46, 45);
    return blob;
}

// pdf.js et canvas de doublure : `render` retient l'étiquette de la page rendue,
// `toDataURL` la rend. Chaque image ajoutée dit donc de quelle page elle vient.
function faireDoublures() {
    let derniere = '';
    return {
        pdfjsLib: {
            getDocument: ({ data }) => {
                const { nom, nbPages } = JSON.parse(Buffer.from(data).toString('utf8'));
                return {
                    promise: Promise.resolve({
                        numPages: nbPages,
                        getPage: async (n) => ({
                            getViewport: ({ scale }) => ({ width: LETTRE.width * scale, height: LETTRE.height * scale }),
                            render: () => { derniere = nom + '#' + n; return { promise: Promise.resolve() }; }
                        })
                    })
                };
            }
        },
        document: {
            createElement: () => ({
                getContext: () => ({}),
                toDataURL: () => 'data:image/jpeg;' + derniere
            })
        }
    };
}

let win;

beforeEach(() => {
    ajouts = [];
    pagesDoc = [];
    const doublures = faireDoublures();
    win = chargerScript('js/travaux-import.js', {
        obtenirDonneesSelonMode: (quoi) => (quoi === 'groupeEtudiants' ? ETUDIANTS : []),
        travauxStockage: {
            obtenirFichiersGroupeActif: () => [],
            genererMiniaturePDF: async () => ({ thumbnail: '', nombrePages: 1 })
        },
        db: { getSync: () => null, setSync: () => {} },
        notifications: { succes: () => {}, erreur: () => {}, info: () => {} },
        document: doublures.document,
        pdfjsLib: doublures.pdfjsLib
    });
    win.jspdf = faireJsPDF();
});

describe('#880 — les PDF d\'un même élève pour une production se fusionnent', () => {

    it('quatre PDF remis par le même élève tombent dans UN groupe', () => {
        const noms = [1, 2, 3, 4].map(i =>
            `Exemple_Alma_9000058_Artefact_1__Remis_le_2026-09-15_09h46m4${i}s.pdf`);
        win.travauxImport.ajouterFichiersEnAttente(noms.map(n => fauxPdf(n, 1)));
        const groupes = win.travauxImport.regrouperParDocument();
        expect(groupes.size).toBe(1);
        expect([...groupes.values()][0]).toHaveLength(4);
    });

    // 15 nov. 2026 — l'ordre des pages et leur taille physique étaient jugés ici sur des
    // doublures de pdf.js et du canevas. `pagesImagesDuFichier` reprend maintenant les octets
    // de la page ou la rend à sa pleine définition (`imagesDuPDF`) : ces deux essais vivent
    // au navigateur, sur les vraies bibliothèques, dans
    // tests/integration/editeur-pages-definition-2026-11-15.spec.js (« réunir à l'import »).

    it('l\'assemblage du pipeline admet les PDF, pas seulement les images', () => {
        const debut = sourceUI.indexOf('async function assemblerGroupesPipeline(');
        expect(debut).toBeGreaterThan(-1);
        const fin = sourceUI.indexOf('\n    function ', debut + 1);
        const corps = sourceUI.slice(debut, fin > -1 ? fin : undefined)
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '');
        const filtre = corps.match(/fichiers\.filter\(([^)]*)\)/);
        expect(filtre, 'filtre des fichiers à assembler introuvable').not.toBeNull();
        expect(filtre[1]).toMatch(/estPDF/);
        expect(filtre[1]).toMatch(/estImage/);
    });
});
