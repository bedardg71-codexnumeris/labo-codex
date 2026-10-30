import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE — #1152, lot 3 de la refonte de l'Aide (28 oct. 2026) : un seul glossaire.
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-28-aide-lot-3-un-seul-glossaire.md (§2, §4). Dossier :
// plans de travail/audit-aide-2026-10-24/lot-6-reference.md (`glossaire`, `glossaire-statique`, la comparaison terme par
// terme) ; remesure du 27 oct. (Référence).
//
// Ce que le banc confronte, calculé des deux côtés :
//   · le glossaire statique de l'Aide ⟷ absent ; ce qu'il avait d'unique ⟷ présent dans js/accompagnement-contenu-terme.js ;
//   · le nombre de termes que dit l'en-tête du fichier ⟷ le compte, en exécutant le fichier ;
//   · chaque chemin « Voir : » ⟷ les libellés des onglets (index.html) et des sous-onglets (js/config.js) ;
//   · la Progression par défaut ⟷ interpretation-config.js ; les niveaux de l'échelle de départ ⟷ echelles.js ;
//     les trois dates du trimestre ⟷ les champs obligatoires d'index.html ;
//   · les valeurs que le dossier a dites fausses ⟷ absentes de toute définition.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');
const html = lire('index.html');
const SOURCE = lire('js', 'accompagnement-contenu-terme.js');

const CATALOGUE = {};
vm.runInNewContext(SOURCE, { window: { accompagnement: { ajouterEntrees: (e) => Object.assign(CATALOGUE, e) } } });
const TERMES = Object.values(CATALOGUE).map((e) => e.terme);
const terme = (cle) => CATALOGUE['terme-' + cle].terme;

const decoder = (s) => new JSDOM(`<p>${s}</p>`).window.document.querySelector('p').textContent.trim();

// Les onglets : la barre de navigation d'index.html, et les deux boutons de l'en-tête (Aide, Réglages).
const ONGLETS = {};
for (const m of html.matchAll(/<button data-onglet="([a-z]+)"[^>]*>\s*<span[^>]*><\/span><span class="nav-label">([^<]+)<\/span>/g)) ONGLETS[decoder(m[2])] = m[1];
for (const m of html.matchAll(/data-action="afficherSection" data-param="(aide|reglages)" class="btn-action-header[^>]*title="([^"]+)"/g)) ONGLETS[decoder(m[2])] = m[1];
// Les sous-onglets : js/config.js, section par section.
const CONFIG = lire('js', 'config.js');
const sousOnglets = (section) => {
    const bloc = CONFIG.match(new RegExp(`'${section}': \\[([\\s\\S]*?)\\]`));
    return bloc ? [...bloc[1].matchAll(/label: (["'])(.*?)\1/g)].map((m) => m[2]) : [];
};

describe('#1152 lot 3 · un seul glossaire', () => {
    it('le glossaire statique a quitté l\'Aide ; le glossaire rendu reste sous Référence', () => {
        expect(html).not.toContain('accordeon-aide-glossaire-statique');
        expect(html).not.toContain('Glossaire des termes</h3>');
        const reference = tranche(html, '<div id="aide-reference" class="sous-section">', '<!-- Carte: FAQ');
        expect(reference).toContain('id="glossaire-rendu"');
    });

    it('l\'en-tête de terme.js dit le nombre réel de termes, compté en exécutant le fichier', () => {
        const dit = Number(SOURCE.match(/\(glossaire — (\d+) termes\)/)[1]);
        expect(TERMES.length).toBeGreaterThan(59);
        expect(dit).toBe(TERMES.length);
    });

    it('ce que le statique avait d\'unique et les mots tranchés ont leur entrée', () => {
        const attendus = ['codex', 'anonymisation', 'donnees-demo', 'stockage-local', 'journee-sans-cours', 'verrouillage',
            'srpnf', 'notes-finalisees', 'sous-critere', 'trimestre-clos', 'archive', 'faire-revenir', 'reassigner',
            'observation-sous-critere'];
        for (const cle of attendus) expect(CATALOGUE['terme-' + cle], cle).toBeTruthy();
        // La formule de A et les méthodes du portfolio vont dans les entrées existantes.
        expect(terme('indice-a-assiduite').definition).toContain('divisées par les périodes offertes, sur les seules séances saisies');
        expect(terme('indice-a-assiduite').definition).toContain('Ce n\'est pas un jugement sur la qualité de sa participation');
        // Lot 5 des standards sans portfolio : `index.html` laisse les trois modes vides, le registre les pose (ici, la variante « artefacts »).
        const registre = lire('js', 'pratiques', 'pratique-registre.js');
        const modes = [...tranche(registre, 'artefacts: {', 'productions: {').matchAll(/mode[A-Z][a-z]+: '([^']+)'/g)].map((m) => m[1])
            .concat([...tranche(html, '<select id="mat-portfolio-selection"', '</select>').matchAll(/<option value="[a-z]+">([^<]+)<\/option>/g)].map((m) => m[1]));
        expect(modes).toHaveLength(4);
        for (const mode of modes) expect(terme('portfolio').definition).toContain(`« ${mode} »`);
    });

    it('aucune définition ne redit une valeur que le dossier a trouvée fausse', () => {
        const interdits = /meilleurs sont retenus|N meilleures démonstrations|15 semaines|\b5 points \(%\), Sensibilité|Progression 5 points|📍|idéalement|Reprise ciblée|engagement cognitif de l|quatre niveaux alignés sur IDME/;
        const fautifs = TERMES.filter((t) => interdits.test(t.terme + ' ' + t.definition)).map((t) => `${t.cle} : ${(t.terme + ' ' + t.definition).match(interdits)[0]}`);
        expect(fautifs).toEqual([]);
    });

    it('chaque chemin « Voir : » commence par un onglet, et chaque sous-onglet nommé est un libellé de js/config.js', () => {
        expect(Object.keys(ONGLETS)).toEqual(expect.arrayContaining(['Accueil', 'Cadre', 'Conception', 'Évaluation', 'Suivi', 'Labo', 'Aide', 'Réglages']));
        const fautifs = [];
        for (const t of TERMES) {
            expect(t.voir, t.cle).toBeTruthy();
            for (const chemin of t.voir.split(' · ')) {
                const [onglet, sous] = chemin.split(' › ');
                // L'en-tête n'a pas d'onglet dans config.js : ses boutons se nomment tels quels.
                if (onglet === 'En-tête') { if (!sous) fautifs.push(`${t.cle} : « En-tête » sans bouton`); continue; }
                if (!ONGLETS[onglet]) { fautifs.push(`${t.cle} : « ${onglet} » n'est pas un onglet`); continue; }
                if (sous === undefined) continue;
                const libelles = sousOnglets(ONGLETS[onglet]);
                for (const s of sous.split(', ')) if (!libelles.includes(s)) fautifs.push(`${t.cle} : « ${s} » n'est pas un sous-onglet de ${onglet}`);
            }
        }
        expect(fautifs).toEqual([]);
    });

    it('les valeurs dites sont lues au code : la Progression, l\'échelle de départ, les trois dates du trimestre', () => {
        const progression = Number(lire('js', 'interpretation-config.js').match(/progressionArtefacts: ([\d.]+)/)[1]);
        expect(terme('seuils-de-depistage').definition).toContain(`Progression ${Math.round(progression * 100)} points`);

        const niveaux = [...tranche(lire('js', 'echelles.js'), 'const niveauxDefaut = [', '];').matchAll(/code: '([A-Z]+)',\s*nom: '([^']+)'/g)];
        const echelle = terme('echelle-de-performance').definition;
        const nombres = ['', '', '', '', 'quatre', 'cinq', 'six'];
        expect(echelle).toContain(`a ${nombres[niveaux.length]} niveaux`);
        expect(echelle).toContain(`« ${niveaux[0][1]} – ${niveaux[0][2]} » en tête`);
        expect(echelle, 'les bornes se lisent dans l\'échelle de chacun').not.toMatch(/%/);

        const dates = [...tranche(html, 'id="calendrier-trimestre"', 'Journées sans cours').matchAll(/<label class="u-texte-medium">([^<]+) <span class="champ-requis"/g)].map((m) => m[1]);
        expect(dates).toHaveLength(3);
        for (const d of dates) expect(terme('trimestre').definition).toContain(`« ${d} »`);
    });

    it('le mode assistance nomme les deux commandes que l\'écran porte', () => {
        expect(html).toMatch(/id="btn-assistance-nav"[^>]*title="Assistance"/);
        expect(lire('js', 'accueil.js')).toContain('<div class="accueil-aide-titre">Assistance</div>');
        expect(terme('mode-assistance-icones').definition).toContain('le bouton « Assistance » de l’en-tête, ou par la case « Assistance » de la page d’accueil');
    });

    it('la retouche du verdict (28 oct., 14 h 15) : le menu Codex sans côté ; SRPNF mot pour mot, sa validation notée', () => {
        // Verdict : plans de travail/VERDICT-RELECTURE-2026-10-28-aide-lot-3.md. Le côté dépend de la largeur de l'écran.
        expect(terme('codex').definition).toContain('dans le menu Codex, en haut de l’écran.');
        expect(TERMES.filter((t) => /en haut à (gauche|droite)/.test(t.definition)).map((t) => t.cle)).toEqual([]);
        expect(terme('srpnf').definition).toBe('Les initiales des critères des grilles de la démonstration : Structure, Rigueur, Plausibilité, Nuance et Français écrit. Une grille d’exemple, et non une structure du logiciel. Toute grille de critères fonctionne de la même façon, quel que soit ton nombre de critères et ta discipline.');
        expect(tranche(SOURCE, "'srpnf': {", "terme: 'SRPNF'")).toContain('Validé par Grégoire le 28 oct. 2026, 14 h 15');
    });

    it('les contradictions sont levées : une seule définition de chaque terme', () => {
        // PAN : le choix de Grégoire du 17 sept. ; Sous-critère (D5), Pondération, Assiduité : réunis.
        const noms = TERMES.map((t) => t.terme.toLowerCase());
        expect(noms.length).toBe(new Set(noms).size);
        expect(terme('pan-pratique-alternative-de-notation').definition).toContain('La Dénotation (DEN) est une PRÉN');
        expect(terme('ponderation').definition.startsWith('Le poids d’un critère dans la grille. Pour une production')).toBe(true);
        expect(terme('sous-critere').definition.startsWith('Un élément observable')).toBe(true);
        expect(terme('den-denotation').definition).toMatch(/réduction ou d.élimination de la notation \(PRÉN\)/);
        expect(terme('den-denotation').definition).toContain('Règlement sur le régime des études collégiales, RREC');
    });
});
