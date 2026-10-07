/**
 * Grace's birthday wish wall — Google Apps Script backend.
 * Stores wishes in the sheet tab named "Wishes" and serves them back as JSON.
 */
var SHEET_NAME = 'Wishes';
var MAX_SHOWN = 100;

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Time', 'Name', 'Message']);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Returns the latest wishes for the page to display.
function doGet() {
  var rows = getSheet_().getDataRange().getValues().slice(1);
  var wishes = rows
    .filter(function (r) { return r[1] && r[2]; })
    .slice(-MAX_SHOWN)
    .map(function (r) {
      return { t: new Date(r[0]).getTime(), name: String(r[1]), message: String(r[2]) };
    });
  return json_({ ok: true, wishes: wishes });
}

// Saves one new wish.
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ ok: true });            // honeypot: bots fill this in
    var name = String(d.name || '').trim().slice(0, 40);
    var msg = String(d.message || '').trim().slice(0, 240);
    if (!name || !msg) return json_({ ok: false, error: 'empty' });
    // Stop spreadsheet formulas from running if someone types "=..."
    name = /^[=+\-@]/.test(name) ? "'" + name : name;
    msg = /^[=+\-@]/.test(msg) ? "'" + msg : msg;
    getSheet_().appendRow([new Date(), name, msg]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}
