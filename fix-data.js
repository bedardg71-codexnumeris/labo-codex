// Script de correction des donnees — coller dans la console Chrome
// Puis supprimer ce fichier

var OLD = 'COURS1766455789356';
var NEW = 'h2026-601-101-MQ-00001';

// 1. Corriger les groupe-cours
var gcs = db.getSync(cle('groupesCours')) || [];
gcs.forEach(function(gc) {
  if (gc.id === 'GC_1774389463057') { gc.groupeNum = '00002'; gc.groupe = '00002'; gc.coursId = NEW; }
  if (gc.id === 'GC_1768051147936') { gc.coursId = NEW; }
});
db.setSync(cle('groupesCours'), gcs);

// 2. Corriger les etudiants
var etu = db.getSync(cle('groupeEtudiants')) || [];
var mapGC = {};
gcs.forEach(function(gc) { mapGC[gc.groupeNum || gc.groupe] = gc.id; });
etu.forEach(function(e) {
  if (e.coursId === OLD) e.coursId = NEW;
  if (!e.groupeCoursId && e.groupe && mapGC[e.groupe]) e.groupeCoursId = mapGC[e.groupe];
});
db.setSync(cle('groupeEtudiants'), etu);

// 3. Corriger productions, evaluations, presences
['productions', 'evaluationsSauvegardees', 'presences'].forEach(function(k) {
  var d = db.getSync(cle(k)) || [];
  d.forEach(function(item) { if (item.coursId === OLD) item.coursId = NEW; });
  db.setSync(cle(k), d);
});

// 4. Corriger groupeCoursId des evaluations
var evs = db.getSync(cle('evaluationsSauvegardees')) || [];
evs.forEach(function(e) {
  if (e.groupeCoursId === 'GC_1767872727492') e.groupeCoursId = 'GC_1774389463057';
});
db.setSync(cle('evaluationsSauvegardees'), evs);

// 5. Supprimer le cours XSS de test
var cours = db.getSync(cle('listeCours')) || [];
var xss = cours.filter(function(c) { return c.nom && c.nom.indexOf('XSS') !== -1; });
if (xss.length) {
  cours = cours.filter(function(c) { return !c.nom || c.nom.indexOf('XSS') === -1; });
  db.setSync(cle('listeCours'), cours);
}

// 6. Reconstruire les snapshots
if (typeof reconstruireSnapshotsHistoriques === 'function') reconstruireSnapshotsHistoriques();

console.log('=== CORRECTIONS TERMINEES ===');
console.log('Cours XSS supprimes:', xss.length);
console.log('Recharger la page (Cmd+R)');
