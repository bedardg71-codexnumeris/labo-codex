import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #562 (29 août 2026) — LA LISTE DES ÉVALUATIONS N'INJECTE RIEN.
//
// Constat B7 de l'audit du 25 août : `${ligne.da}`, `${daAffiche}`,
// `${ligne.niveauFinal}` — et, mesuré le 28, `${ligne.evaluationId}`,
// `${ligne.productionId}`, `${ligne.fichierId}` dans des attributs — étaient
// interpolés sans `echapperHtml`. Le DA est nettoyé à l'import CSV, pas garanti
// sur les autres chemins ; la règle 1 du projet est « sans exception ».
// Débloqué le 28 août : `echapperHtml` échappe désormais les guillemets (#572),
// sans quoi l'échappement dans un attribut n'aurait rien fermé.
//
// Deux bords :
//   A — comportement : une ligne aux valeurs hostiles rend un HTML où aucune
//       valeur ne sort de son texte ni de son attribut ;
//   B — cliquet statique : dans `genererLigneHTML` et `genererDropdownActions`,
//       toute interpolation est soit `echapperHtml(...)`, soit un local HTML de
//       la liste fermée ci-dessous. Une interpolation neuve non échappée rougit.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// echapperHtml réel (config.js), pour ne pas prouver l'échappement avec un stub.
function echapperHtmlReel(texte) {
    if (texte == null) return '';
    return String(texte).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function charger() {
    return chargerScript('js/liste-evaluations.js', {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: echapperHtmlReel,
        obtenirLibelleStatut: (s) => 'Statut ' + s,
        obtenirDonneesSelonMode: () => [],
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        // 21 oct. 2026 : la vraie fonction d'affichage de la note (js/note-pourcentage.js).
        formaterNotePourcentage: chargerScript('js/note-pourcentage.js').formaterNotePourcentage
    });
}

const HOSTILE = '"><img src=x onerror=alert(1)>';

describe('#562 · A — une ligne hostile ne sort ni de son texte ni de son attribut', () => {
    it('DA, identifiants, niveau, note, statut : tout est échappé', () => {
        const win = charger();
        const html = win._genererLigneHTML({
            da: HOSTILE, daAffichage: null, nom: 'N', prenom: 'P', productionNom: 'Prod',
            evaluationId: 'EV' + HOSTILE, productionId: 'PR' + HOSTILE, fichierId: 'F' + HOSTILE,
            statut: 'evalue', statutRemise: 'remis', statutWorkflow: 'x' + HOSTILE,
            niveauFinal: '<b>M</b>', noteChiffree: '<i>80</i>',
            badgeType: 'nouvelle-reprise', scoresOriginaux: { niveauFinal: '<u>I</u>', noteFinale: 50 },
            associationManquante: true, estDoublon: false
        });
        // (le mot « onerror » subsiste, ÉCHAPPÉ, dans le texte : ce qui compte est
        // qu'aucune balise ni aucun attribut ne s'ouvre)
        expect(html).not.toContain('<img');
        expect(html).not.toMatch(/[^&;]>\s*<img/);
        expect(html).not.toContain('<b>M</b>');
        expect(html).not.toContain('<i>80</i>');
        expect(html).not.toContain('<u>I</u>');
        // Les attributs restent fermés par LEUR guillemet : la valeur porte &quot;.
        expect(html).toMatch(/data-da="&quot;&gt;&lt;img[^"]*"/);
        expect(html).toMatch(/data-evaluation-id="EV&quot;&gt;/);
        expect(html).toMatch(/data-param="F&quot;&gt;/);
        // Et le contenu légitime est bien là, échappé.
        expect(html).toContain('&lt;b&gt;M&lt;/b&gt;');
    });

    it('les identifiants du menu d\'actions sont échappés dans value="…|…"', () => {
        const win = charger();
        const html = win._genererLigneHTML({
            da: 'D' + HOSTILE, nom: 'N', prenom: 'P', productionNom: 'Prod', productionId: 'PR"x',
            evaluationId: 'EV"y', statut: 'non-evalue', statutRemise: 'remis', statutWorkflow: 'non-evalue', niveauFinal: '-', noteChiffree: null
        });
        expect(html).not.toContain('<img');
        expect(html).toMatch(/value="evaluer\|D&quot;&gt;[^"]*\|PR&quot;x"/);
        expect(html).toMatch(/value="consulter\|EV&quot;y"/);
    });
});

describe('#562 · B — cliquet : aucune interpolation non échappée hors liste fermée', () => {
    const LOCAUX_HTML = new Set([
        // construits dans la fonction à partir de constantes ou de valeurs déjà échappées
        'classeRemplacee', 'badgeJeton', 'affichageNiveau', 'affichageNoteChiffree', 'boutons',
        'labelAssoc', 'label', "options.join('')",
        // #1055 : la marque « Diagnostique », constante de l'entité (`ProductionDiagnostique.marqueHTML`),
        // posée par le constructeur de la ligne ; aucune donnée d'utilisateur n'y entre.
        'ligne.marque'
    ]);
    function corps(src, nom) {
        const i = src.indexOf('function ' + nom + '(');
        expect(i, nom + ' doit exister').toBeGreaterThan(-1);
        let j = i, prof = 0, vu = false;
        for (; j < src.length; j++) {
            if (src[j] === '{') { prof++; vu = true; }
            else if (src[j] === '}') { prof--; if (vu && prof === 0) break; }
        }
        return src.slice(i, j + 1);
    }
    function interpolations(txt) {
        const out = [];
        let i = 0;
        while ((i = txt.indexOf('${', i)) !== -1) {
            let k = i + 2, prof = 1;
            for (; k < txt.length && prof > 0; k++) { if (txt[k] === '{') prof++; else if (txt[k] === '}') prof--; }
            out.push(txt.slice(i + 2, k - 1).trim()); i = k;
        }
        return out;
    }
    it('genererLigneHTML et genererDropdownActions', () => {
        const src = readFileSync(path.join(racineProjet, 'js', 'liste-evaluations.js'), 'utf8');
        // Récursif : un ternaire imbriqué est sûr si CHAQUE sous-interpolation, à toute
        // profondeur, est échappée ou dans la liste. Les morceaux de gabarit entre les
        // interpolations sont du texte constant, pas des données.
        // Un ternaire dont les DEUX branches sont une chaîne littérale ou un
        // echapperHtml(...) ne porte aucune donnée brute (title constant, repli constant).
        const TERNAIRE_SUR = /^[\w.]+\s*\?\s*(echapperHtml\([^)]*\)|'[^']*')\s*:\s*(echapperHtml\([^)]*\)|'[^']*')$/;
        const ok = (expr) => {
            if (expr.startsWith('echapperHtml(')) return true;
            if (LOCAUX_HTML.has(expr)) return true;
            if (TERNAIRE_SUR.test(expr)) return true;
            const sous = interpolations(expr);
            return sous.length > 0 && sous.every(ok);
        };
        const suspects = [];
        for (const nom of ['genererLigneHTML', 'genererDropdownActions']) {
            for (const expr of interpolations(corps(src, nom))) {
                if (!ok(expr)) suspects.push(nom + ' : ${' + expr.slice(0, 80) + '}');
            }
        }
        expect(suspects, 'interpolation(s) non échappée(s) hors liste fermée').toEqual([]);
    });
});
