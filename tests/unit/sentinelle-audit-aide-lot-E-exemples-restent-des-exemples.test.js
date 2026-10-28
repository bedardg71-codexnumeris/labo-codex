import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');

const DEB = html.indexOf('id="section-aide"');
const FIN = html.indexOf('fin section-aide');
const AIDE = html.slice(DEB, FIN);
const TXT = AIDE.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
// ↻ #1152, lot 3 (28 oct. 2026) : l'entrée SRPNF du glossaire statique est versée dans le seul glossaire
// (consigne CONSIGNE-LOT-2026-10-28-aide-lot-3-un-seul-glossaire.md, §2.3 et §2.5) ; ses deux cadrages l'y suivent.
const TERME = readFileSync(path.join(racine, 'js', 'accompagnement-contenu-terme.js'), 'utf8');
const SRPNF = tranche(TERME, "'srpnf': {", '},');

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
        expect(SRPNF).toMatch(/et non une structure du logiciel/);
        expect(SRPNF).toMatch(/Toute grille de critères fonctionne de la même façon/);
        expect(TXT).not.toMatch(/SRPNF \(Critères\)/);
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
        // ↻ #1152, lot 2a (27 oct. 2026) : les deux dernières mentions (« Ex. 601-101-MQ » de `cours`, « 601-101,
        // etc. » de `groupe-cours`) sont parties avec la correction de ces entrées (audit de l'Aide du 24 oct. ;
        // remesure du 27 oct. ; consigne du lot 2a, §3 : « aucun exemple propre à une discipline »). Le garde de
        // non-vide n'a plus d'objet ; la boucle reste, pour une mention qui reviendrait sans son marqueur.
        const mentions = [...TXT.matchAll(/(.{14})601-101(.{14})/g)];
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

    // #847 (13 sept. 2026, relecture croisée de Cowork) — GARDE DE NON-VIDE. Une assertion NÉGATIVE sur une
    // tranche vide est vraie par construction : sans ce garde, le cas 3 ci-dessus et le cas #847 des chaînes
    // retirées resteraient verts si la découpe ne trouvait plus ses bornes. Plancher mesuré le 13 sept. :
    // la tranche fait 337 577 caractères ; 100 000 laisse l'Aide grandir ou maigrir sans jamais passer une
    // découpe tronquée.
    it('la tranche AIDE est bien découpée : ses deux bornes existent, et elle n\'est pas vide', () => {
        expect(DEB, 'la borne de début id="section-aide" a disparu').not.toBe(-1);
        expect(FIN, 'la borne de fin « fin section-aide » a disparu').not.toBe(-1);
        expect(FIN, 'les bornes sont inversées').toBeGreaterThan(DEB);
        expect(AIDE.length, 'la tranche AIDE est vide ou tronquée').toBeGreaterThan(100000);
    });

    // #847 — l'exemple de titre d'une intervention ne nomme plus les critères de Grégoire. Texte approuvé par
    // lui (13 sept.), lu par les collègues de la communauté de pratique. Les deux autres sites de #847
    // (js/interventions.js) sont figés par sentinelle-rencontre-sans-criteres-cibles-lot-c.
    // ↻ #1152, lot 2c bis (28 oct. 2026) : la marche à suivre de « Interventions RàI avec absences motivées », où vivait la puce
    // « Titre (ex: … ) », part avec l'entrée, absorbée par `planifier-rai` (audit du 24 oct., verdict final de `rai-absences` ;
    // consigne CONSIGNE-LOT-2026-10-28-aide-lot-2c-bis-suivi.md, §2, entrée 9). L'exemple approuvé reste, dans l'entrée qui
    // l'absorbe, et il est LU à l'écran (le texte d'exemple du champ « Titre » des interventions), plus recopié ici.
    it('#847 — l\'Aide donne l\'exemple de titre approuvé, celui du champ « Titre » de l\'écran', () => {
        const m = readFileSync(path.join(racine, 'js/interventions.js'), 'utf8').match(/placeholderTitre: 'Ex\. ([^']+)'/);
        expect(m, 'l\'exemple du champ « Titre » a disparu de js/interventions.js').toBeTruthy();
        const planifier = tranche(AIDE, 'id="accordeon-aide-planifier-rai"', 'id="accordeon-aide-tirage-sort"');
        expect(planifier).toContain(`le titre (par exemple «&nbsp;${m[1]}&nbsp;»)`);
    });

    it('#847 — les deux exemples retirés ne reviennent pas dans l\'Aide', () => {
        expect(AIDE).not.toContain('Intervention Rigueur et Nuance');
        expect(AIDE).not.toContain('Amener Structure au seuil D');
    });
});
