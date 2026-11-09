import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';
import { TITRES_LONGS } from './_helpers/titres-longs.js';

// « L'en-tête épuré » (7 nov. 2026) — ce que la consigne RETIRE ne revient pas en silence, ce qu'elle
// ajoute garde sa forme, et le doublon de la session ne revient pas dans le libellé du groupe.
// Le rendu se juge sur capture (Grégoire) et dans tests/integration/en-tete-epure-2026-11-07.spec.js.
// Remplace sentinelle-nouvel-en-tete-2026-11-07.test.js (le lot qu'elle gardait est remplacé).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const html = lire('index.html');
const css = lire('styles.css');
const entete = tranche(html, '<header class="entete">', '</header>');
const bas = tranche(html, '<div class="entete-bas">', '<div class="conteneur">');
const config = lire('js/config.js');
const orchestre = lire('js/trimestre-v2-orchestre.js');

const labelsDe = (section) => [...config.match(new RegExp(`'${section}': \\[([\\s\\S]*?)\\]`))[1]
    .matchAll(/label: (["'])(.*?)\1/g)].map((m) => m[2]);

describe('en-tête épuré · ce qui disparaît', () => {
    it('le slogan : plus de logo à slogan dans l\'en-tête ni dans img/ (l\'original reste dans Logo/)', () => {
        expect(html).not.toContain('logo-slogan-cote');
        expect(existsSync(path.join(racine, 'img/labo-codex-logo-slogan-cote-blanc.svg'))).toBe(false);
        expect(existsSync(path.join(racine, 'Logo/labo-codex-logo-slogan-cote-blanc.svg'))).toBe(true);
    });
    it('le bloc de droite à trois rangées, son CSS et ses deux rangées d\'icônes', () => {
        expect(html).not.toMatch(/entete-bloc|entete-icones/);
        expect(css).not.toMatch(/\.entete-bloc|\.entete-icones/);
    });
    it('les tuiles et les icônes de la navigation principale, et leurs classes', () => {
        expect(html).not.toMatch(/class="nav-icon|nav-separateur-vertical/);
        expect(css).not.toMatch(/\.nav-icon\b|\.ico-(home|combo-chart|mind-map|calendar|profile|pulse|juggler|cop-aqpc)\b|\.nav-separateur-vertical/);
    });
    it('les deux selects mobiles (remplacés par la variante C), et leur code', () => {
        expect(html).not.toMatch(/select-nav-mobile|select-sous-nav-mobile/);
        expect(css).not.toMatch(/\.select-nav-mobile|\.select-sous-nav-mobile/);
        const js = readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js')).map((f) => lire('js/' + f)).join('\n');
        expect(js).not.toMatch(/select-nav-mobile|select-sous-nav-mobile|SelectMobile/);
    });
});

describe('en-tête épuré · la bande du haut', () => {
    it('le logo seul, en couleur sur sombre (lettres blanches, signes orange, 7 nov.)', () => {
        expect(tranche(entete, '<h1 class="entete-logo">', '</h1>')).toMatch(/^<h1 class="entete-logo">\s*<img src="img\/labo-codex-logo-couleur-sur-sombre\.svg" alt="Labo Codex" class="logo-entete"/);
        expect(lire('img/labo-codex-logo-couleur-sur-sombre.svg')).toBe(lire('Logo/labo-codex-logo-couleur-sur-sombre.svg'));
    });
    it('favicon et icône d\'accueil en couleur : sur-clair par défaut, sur-sombre pour les onglets sombres ; les copies de img/ = les originaux de Logo/', () => {
        const tete = tranche(html, '<head>', '</head>');
        const icones = [...tete.matchAll(/<link rel="(icon|apple-touch-icon)"[^>]*>/g)].map((m) => m[0]);
        expect(icones).toEqual([
            '<link rel="icon" type="image/png" sizes="32x32" href="img/labo-codex-icone-couleur-sur-clair-32.png">',
            '<link rel="icon" type="image/png" sizes="16x16" href="img/labo-codex-icone-couleur-sur-clair-16.png">',
            '<link rel="icon" type="image/png" sizes="32x32" href="img/labo-codex-icone-couleur-sur-sombre-32.png" media="(prefers-color-scheme: dark)">',
            '<link rel="icon" type="image/png" sizes="16x16" href="img/labo-codex-icone-couleur-sur-sombre-16.png" media="(prefers-color-scheme: dark)">',
            '<link rel="apple-touch-icon" sizes="180x180" href="img/labo-codex-icone-application-couleur-ios-180.png">',
        ]);
        for (const lien of icones) {
            const f = lien.match(/href="img\/([^"]+)"/)[1];
            expect(readFileSync(path.join(racine, 'img', f)).equals(readFileSync(path.join(racine, 'Logo', f))), f).toBe(true);
        }
    });
    it('l\'orange du logo sur sombre, inscrit en dur dans les SVG, est celui de --icone-aide-config : s\'il change, le signaler à Grégoire', () => {
        const variable = css.match(/--icone-aide-config:\s*(#[0-9a-fA-F]{6})/)[1].toUpperCase();
        for (const f of readdirSync(path.join(racine, 'Logo')).filter((n) => /couleur-sur-sombre(-16|-32)?\.svg$/.test(n))) {
            expect(lire('Logo/' + f), `${f} : --icone-aide-config vaut ${variable}`).toContain('#E8923A');
            expect(variable, `${f} : --icone-aide-config a changé, la couleur du logo est en dur`).toBe('#E8923A');
        }
    });
    it('la navigation principale : sept mots, sans icône, dans l\'en-tête', () => {
        const nav = tranche(entete, '<nav class="navigation-principale">', '</nav>');
        const mots = [...nav.matchAll(/<span class="nav-label">([^<]+)<\/span>/g)].map((m) => m[1]);
        expect(mots).toEqual(['Accueil', 'Cadre', 'Conception', '&Eacute;valuation', 'Suivi', 'Labo', 'CoP']);
        expect(nav).not.toMatch(/<img|header-icon|nav-icon/);
    });
    it('à droite, dans l\'ordre : Codex, le thème, le menu (aria-label « Menu », aria-expanded)', () => {
        const actions = tranche(entete, '<div class="entete-actions">');
        const iCodex = actions.indexOf('id="codex-controle"');
        const iTheme = actions.indexOf('id="btn-toggle-theme-nav"');
        const iMenu = actions.indexOf('id="entete-menu-bouton"');
        expect(iCodex).toBeGreaterThan(-1);
        expect(iCodex).toBeLessThan(iTheme);
        expect(iTheme).toBeLessThan(iMenu);
        expect(actions).toMatch(/id="entete-menu-bouton"[^>]*aria-label="Menu" aria-expanded="false" aria-controls="entete-menu-panneau"/);
    });
    it('le menu : cinq lignes dans l\'ordre de la consigne (Réglages en dernier), chacune avec son icône actuelle', () => {
        const menu = tranche(entete, '<div id="entete-menu-panneau"', '</div>');
        const lignes = [...menu.matchAll(/<span class="header-icon (ico-[a-z-]+)"[^>]*><\/span><span class="entete-menu-mot">([^<]+)<\/span>/g)]
            .map((m) => [m[2], m[1]]);
        // ↻ Correction de Grégoire du 7 nov. 2026 : Réglages en dernier.
        // ↻ Lot « Les deux parcours » (8 nov. 2026, esquisse 73) : « Visite guidée » et la ligne à interrupteur
        // deviennent une seule entrée « Assistance », qui ouvre le panneau et porte le rang du parcours.
        expect(lignes).toEqual([['Assistance', 'ico-assistance'], ['Aide', 'ico-aide-cercle'],
            ['Signaler', 'ico-bug'], ['Soutenir', 'ico-coeur'], ['R&eacute;glages', 'ico-tune']]);
        expect(menu).toMatch(/id="btn-assistance-menu"[^>]*data-action="ouvrirPanneauAssistance"[^>]*>.*<span id="assistance-menu-rang" class="entete-menu-rang"><\/span><\/button>/);
    });
    it('Aide et Réglages gardent .btn-action-header : navigation.js (zone protégée) s\'en sert pour les marquer « actif »', () => {
        expect(lire('js/navigation.js')).toContain('.btn-action-header[data-param="aide"]');
        expect((entete.match(/class="[^"]*\bbtn-action-header\b/g) || []).length).toBe(2);
        expect(entete).toMatch(/data-param="aide" class="entete-menu-item btn-action-header"/);
        expect(entete).toMatch(/data-param="reglages" class="entete-menu-item btn-action-header"/);
    });
});

describe('en-tête épuré · navigation secondaire et bande pâle', () => {
    it('les libellés courts des onglets, validés par Grégoire', () => {
        expect(labelsDe('calendrier')).toEqual(['Trimestre', 'Calendrier']);
        expect(labelsDe('conception')).toEqual(['Mon matériel', 'Alignement', 'Productions', 'Grilles', 'Échelles', 'Cartouches', 'Pratiques']);
        expect(labelsDe('evaluations')).toEqual(['Préparer', 'Liste', 'Annoter', 'Exporter']);
        expect(labelsDe('suivi')).toEqual(['Groupe', 'Étudiant·es', 'Présences', 'Profils', 'Interventions', 'Rencontres', 'Animation']);
        expect(labelsDe('labo')).toEqual(['Observation', 'Modélisation', 'Exploration', 'Rythme', 'Études', 'Bilan', 'Suivi longitudinal']);
        // le repli de bilan-reflexif.js (config.js en cache) dit le même mot
        expect(lire('js/bilan-reflexif.js')).toContain("_labo.push({ id: 'bilan', label: 'Bilan' });");
    });
    it('chaque titre long que gardent les pages existe encore dans l\'application (hors config.js)', () => {
        const js = readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js') && f !== 'config.js').map((f) => lire('js/' + f)).join('\n');
        const absents = Object.values(TITRES_LONGS).flatMap((s) => Object.values(s))
            .filter((t) => !html.includes(t) && !html.includes(t.replace("'", '&#39;')) && !js.includes(t));
        expect(absents).toEqual([]);
    });
    it('la sous-navigation et la variante C vivent sous la bande du haut ; la bande pâle porte le groupe et l\'anonymisation, rien d\'autre', () => {
        expect(bas).toContain('id="sous-navigation" class="sous-navigation"');
        expect(bas).toContain('id="entete-section-bouton"');
        const bande = tranche(bas, '<div id="bandeau-groupe-cours" class="bande-groupe">', '<!-- BANDEAU ARCHIVAGE');
        expect(bande).toMatch(/<div class="groupe-selecteur">[\s\S]*<select id="selectGroupeCoursHeader"[\s\S]*<\/div>\s*<button id="btn-toggle-anonymisation-nav" class="bande-groupe-anonymisation"[^>]*data-action="basculerModeAnonymisation" aria-pressed="false">/);
        expect((bande.match(/<button /g) || []).length).toBe(1);
    });
    it('le select natif reste, sous un affichage à deux tons masqué aux lecteurs d\'écran', () => {
        expect(bas).toMatch(/<span class="groupe-affichage" aria-hidden="true">/);
        expect(bas).toMatch(/<select id="selectGroupeCoursHeader"[^>]*aria-label="Groupe-cours actif"/);
    });
    it('les bulles : une bande en haut, une en bas ; les obstacles de main.js sont ceux du nouvel en-tête', () => {
        expect(entete).toContain('id="bulles-container"');
        expect(bas).toContain('id="bulles-container-nav"');
        const obstacles = tranche(lire('js/main.js'), 'const OBSTACLES_BULLES = {', '};');
        expect(obstacles).toContain("'.navigation-boutons', '.entete-actions'");
        expect(obstacles).toContain("'.sous-navigation', '.bande-groupe-centre', '.bande-groupe-anonymisation'");
    });
    it('les seuils : marges de 7 px à ≤ 1000 px, variante C à ≤ 779 px (mesuré)', () => {
        expect(css).toMatch(/@media \(max-width: 1000px\) \{\s*body \{\s*--nav-mot-marge: 7px;/);
        expect(tranche(css, '@media (max-width: 779px) {', '/* Le bouton de la section active')).toMatch(/\.entete-ligne1 \.navigation-principale \{\s*display: none;/);
    });
});

describe('en-tête épuré · la session une seule fois dans le libellé du groupe', () => {
    const code = tranche(orchestre, 'function horaireSansSession', 'async function peuplerDropdownGroupeCoursActif');
    const horaireSansSession = new Function(code + '; return horaireSansSession;')();

    it('le nom d\'horaire qui porte la session la perd à l\'affichage', () => {
        expect(horaireSansSession('Mar-Ven A26', 'A26')).toBe('Mar-Ven');
        expect(horaireSansSession('Mar-Ven · A26', 'A26')).toBe('Mar-Ven');
        expect(horaireSansSession('Mar-Ven (A26)', 'A26')).toBe('Mar-Ven');
        expect(horaireSansSession('A26 Mar-Ven', 'A26')).toBe('Mar-Ven');
        expect(horaireSansSession('Lun-Mer a26', 'A26')).toBe('Lun-Mer');
    });
    it('rien d\'autre ne change : un nom sans session, une session collée à un mot, pas de session', () => {
        expect(horaireSansSession('Lun-AM / Mer-PM', 'Démonstration')).toBe('Lun-AM / Mer-PM');
        expect(horaireSansSession('Sa26', 'A26')).toBe('Sa26');
        expect(horaireSansSession('Mar- VenA26', 'A26')).toBe('Mar- VenA26');
        expect(horaireSansSession('Mar-Ven A26', '')).toBe('Mar-Ven A26');
        expect(horaireSansSession('A26', 'A26')).toBe('');
    });
    it('le libellé du groupe s\'en sert, et n\'écrit rien', () => {
        const peupler = tranche(orchestre, 'async function peuplerDropdownGroupeCoursActif', 'function changerGroupeCoursDepuisHeader');
        expect(peupler).toContain("const secondaire = joindre(horaireSansSession(hor.nom, session), session);");
        expect(code).not.toMatch(/setSync|\.nom\s*=/);
    });
});
