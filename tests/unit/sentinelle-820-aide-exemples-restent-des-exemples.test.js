import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');

const DEB = html.indexOf('id="section-aide"');
const FIN = html.indexOf('fin section-aide');
const AIDE = html.slice(DEB, FIN);
const TXT = AIDE.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

// SENTINELLE — lot E de l'audit de conformité de l'Aide (10 sept. 2026).
//
// L'Aide décrit forcément la pratique de Grégoire quelque part : c'est elle qui
// a servi à concevoir l'application, et l'échelle IDME est SEEDÉE (règle du
// 26 août : « rien ne doit être codé en dur, mais l'échelle IDME peut être
// seedée »). Le lot E ne cherchait donc pas à la faire disparaître, mais à
// vérifier qu'elle reste présentée comme UN EXEMPLE et jamais comme LA règle.
//
// Verdict du lot : largement propre. 601-101 est marqué « Ex. », Gérald-Godin
// est une référence bibliographique, ELLAC est « inspiré de », et le glossaire
// dit lui-même que SRPNF est « une grille d'exemple […] et non une structure du
// logiciel ». Trois restes seulement, tous corrigés — ce banc les verrouille.

describe('Aide — la pratique de Grégoire reste un exemple, jamais la règle', () => {

    it('les cadrages qui désamorcent l\'exemple sont toujours là', () => {
        // Ces phrases sont ce qui empêche un lecteur de prendre SRPNF ou IDME
        // pour la structure de l'application. Les perdre serait la régression.
        expect(TXT).toMatch(/et non une structure du logiciel/);
        expect(TXT).toMatch(/Toute grille de critères fonctionne de la même façon/);
        expect(TXT).toMatch(/Autres échelles possibles/);
        expect(TXT).toMatch(/adaptable à ton contexte/);
    });

    it('le badge de niveau n\'est pas présenté comme un badge IDME', () => {
        // profil-etudiant-sections-affichage.js:724-725,743 rend `art.niveau`
        // coloré par `art.echelleId` : c'est le code de l'échelle de
        // l'utilisateur, pas I/D/M/E en dur.
        const affichage = readFileSync(
            path.join(racine, 'js/profil-etudiant-sections-affichage.js'), 'utf8');
        expect(affichage).toMatch(/couleurDuNiveau\(art\.niveau, art\.echelleId\)/);
        expect(AIDE).not.toContain('<strong>Niveau IDME</strong>');
    });

    it('l\'export d\'une échelle contient TON échelle, pas « les niveaux IDME »', () => {
        expect(TXT).not.toMatch(/Contient : niveaux IDME/);
    });

    it('les mentions de la discipline de Grégoire restent des exemples', () => {
        // Chaque occurrence de 601-101 doit rester marquée comme un exemple
        // (« Ex. » ou « etc. »), jamais posée comme le cours de l'application.
        // ⚠ Fenêtre COURTE, et le marqueur doit être collé à la mention. Une
        // fenêtre de 60 caractères passait même après ablation : elle attrapait
        // le « Ex. » de la ligne voisine (« Titre : Ex. Écriture et littérature »).
        const mentions = [...TXT.matchAll(/(.{14})601-101(.{14})/g)];
        expect(mentions.length).toBeGreaterThan(0);
        for (const m of mentions) {
            const colle = /(?:Ex\.|ex\.|exemple)\s*$/i.test(m[1])   // « Ex. » juste avant
                       || /^[^.]{0,6}(?:etc\.|,\s*etc)/i.test(m[2]); // « etc. » juste après
            expect(colle, `mention « …${m[1]}601-101${m[2]}… » non marquée`).toBe(true);
        }
        // « Bédard » ne doit apparaître qu'en bibliographie ou en exemple nommé.
        const bedard = [...TXT.matchAll(/.{80}Bédard.{60}/g)];
        expect(bedard.length).toBeGreaterThan(0);
        for (const m of bedard) {
            expect(m[0]).toMatch(/Exemple|Pédagogie collégiale|\(20\d\d\)/);
        }
    });
});
