/**
 * ══════════════════════════════════════════════════════════════
 *  Ajeesh & Varsha · Akheesh & Aiswarya — RSVP Google Apps Script
 *  Paste this entire file into Google Apps Script editor
 *  (script.google.com) and deploy as a Web App.
 * ══════════════════════════════════════════════════════════════
 *
 *  SETUP STEPS:
 *  1. Go to https://script.google.com → New Project
 *  2. Paste this entire code (replacing any existing code)
 *  3. Click "Save" (Ctrl+S)
 *  4. Click "Deploy" → "New deployment"
 *     - Type: Web App
 *     - Execute as: Me
 *     - Who has access: Anyone  ← important for form to work
 *  5. Click "Deploy" → Copy the Web App URL
 *  6. Paste that URL into your wedding website's RSVP form
 *  7. The Google Sheet will be auto-created + formatted on first submission
 *
 * ══════════════════════════════════════════════════════════════
 */

// ── CONFIG ────────────────────────────────────────────────────
// Leave SHEET_ID blank on first run — the script will create
// a new Sheet and log its ID. After first run, paste the ID here
// so it always uses the same sheet.
var SHEET_ID = '';  // e.g. '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms'
var SHEET_NAME = 'RSVPs';

// ── CORS HEADERS ──────────────────────────────────────────────
function corsHeaders() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

// ── HANDLE OPTIONS (preflight) ────────────────────────────────
function doOptions(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── HANDLE GET (health check) ─────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'RSVP endpoint is live', wedding: 'Ajeesh & Varsha · Akheesh & Aiswarya' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── HANDLE POST (form submission) ─────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var sheet = getOrCreateSheet();
    var now   = new Date();

    // Append the row
    sheet.appendRow([
      now,                                    // A: Timestamp
      data.name     || '',                    // B: Name
      data.guests   || '1',                   // C: No. of Guests
      data.attending || '',                   // D: Attending
      data.message  || '',                    // E: Message / Wishes
    ]);

    // Format the newly added row
    var lastRow = sheet.getLastRow();
    formatDataRow(sheet, lastRow);

    // Update the guest count summary
    updateSummary(sheet);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── GET OR CREATE SHEET ───────────────────────────────────────
function getOrCreateSheet() {
  var ss;

  if (SHEET_ID) {
    ss = SpreadsheetApp.openById(SHEET_ID);
  } else {
    // Create a new spreadsheet
    ss = SpreadsheetApp.create('Ajeesh & Varsha · Akheesh & Aiswarya — Wedding RSVPs 💍');
    Logger.log('Created new sheet: ' + ss.getId());
    // ← After first run, copy this ID into SHEET_ID above
    PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getActiveSheet();
    sheet.setName(SHEET_NAME);
    setupSheetHeader(sheet);
  }

  return sheet;
}

// ── SETUP HEADER ──────────────────────────────────────────────
function setupSheetHeader(sheet) {
  var ss = sheet.getParent();

  // ─ Row 1: Wedding Title (merged across all columns)
  sheet.getRange('A1:E1').merge();
  sheet.getRange('A1').setValue('💍  Ajeesh & Varsha · Akheesh & Aiswarya — Guest RSVPs')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontFamily('Georgia')
    .setFontSize(15)
    .setFontWeight('bold')
    .setFontColor('#FFF5EA')
    .setBackground('#5B0018');
  sheet.setRowHeight(1, 52);

  // ─ Row 2: Event Info (merged)
  sheet.getRange('A2:E2').merge();
  sheet.getRange('A2').setValue('Wedding Celebrations · Shanmughan Family')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontFamily('Georgia')
    .setFontSize(11)
    .setFontStyle('italic')
    .setFontColor('#E8C488')
    .setBackground('#800020');
  sheet.setRowHeight(2, 32);

  // ─ Row 3: blank spacer
  sheet.getRange('A3:E3').merge();
  sheet.getRange('A3').setBackground('#800020');
  sheet.setRowHeight(3, 8);

  // ─ Row 4: Summary Stats
  sheet.getRange('A4').setValue('Total RSVPs').setFontWeight('bold').setFontColor('#5A4A3C').setFontSize(10).setHorizontalAlignment('center');
  sheet.getRange('B4').setValue('Attending').setFontWeight('bold').setFontColor('#2D6A4F').setFontSize(10).setHorizontalAlignment('center');
  sheet.getRange('C4').setValue('Not Attending').setFontWeight('bold').setFontColor('#9B2226').setFontSize(10).setHorizontalAlignment('center');
  sheet.getRange('D4').setValue('Total Guests').setFontWeight('bold').setFontColor('#5A4A3C').setFontSize(10).setHorizontalAlignment('center');
  sheet.getRange('E4').setValue('Last Updated').setFontWeight('bold').setFontColor('#8C7B6B').setFontSize(10).setHorizontalAlignment('center');

  sheet.getRange('A4:E4')
    .setBackground('#F0EAE0')
    .setBorder(true, true, true, true, false, false, '#D8CFC4', SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(4, 36);

  // ─ Row 5: Summary Values (formulas)
  sheet.getRange('A5').setFormula('=COUNTA(B8:B10000)').setFontSize(13).setFontWeight('bold').setFontColor('#2A2420').setHorizontalAlignment('center');
  sheet.getRange('B5').setFormula('=COUNTIF(D8:D10000,"Will Attend")').setFontSize(13).setFontWeight('bold').setFontColor('#2D6A4F').setHorizontalAlignment('center');
  sheet.getRange('C5').setFormula('=COUNTIF(D8:D10000,"Cannot Attend")').setFontSize(13).setFontWeight('bold').setFontColor('#9B2226').setHorizontalAlignment('center');
  sheet.getRange('D5').setFormula('=SUMIF(D8:D10000,"Will Attend",C8:C10000)').setFontSize(13).setFontWeight('bold').setFontColor('#2A2420').setHorizontalAlignment('center');
  sheet.getRange('E5').setValue('—').setFontColor('#8C7B6B').setHorizontalAlignment('center');
  sheet.getRange('A5:E5')
    .setBackground('#FDFAF5')
    .setBorder(false, true, true, true, false, false, '#D8CFC4', SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(5, 40);

  // ─ Row 6: blank spacer
  sheet.getRange('A6:E6').merge().setBackground('#F8F3EB');
  sheet.setRowHeight(6, 10);

  // ─ Row 7: Column headers
  var headers = ['Submitted At', 'Guest Name', 'No. of Guests', 'Attending?', 'Message / Wishes'];
  sheet.getRange('A7:E7').setValues([headers])
    .setFontFamily('Arial')
    .setFontSize(9)
    .setFontWeight('bold')
    .setFontColor('#F8F3EB')
    .setBackground('#B8975A')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, false, '#8C6B38', SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(7, 34);

  // ─ Column widths
  sheet.setColumnWidth(1, 160); // Timestamp
  sheet.setColumnWidth(2, 180); // Name
  sheet.setColumnWidth(3, 100); // Guests
  sheet.setColumnWidth(4, 130); // Attending
  sheet.setColumnWidth(5, 320); // Message

  // Freeze header rows
  sheet.setFrozenRows(7);

  // Set sheet tab color
  sheet.setTabColor('#B8975A');
}

// ── FORMAT A DATA ROW ─────────────────────────────────────────
function formatDataRow(sheet, row) {
  var isEven = (row % 2 === 0);
  var bg     = isEven ? '#FDFAF5' : '#F8F3EB';

  var range = sheet.getRange(row, 1, 1, 5);
  range
    .setBackground(bg)
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle')
    .setBorder(false, true, true, true, false, false, '#E8E0D8', SpreadsheetApp.BorderStyle.SOLID);

  sheet.setRowHeight(row, 32);

  // Timestamp: format nicely
  sheet.getRange(row, 1)
    .setNumberFormat('d MMM yyyy  h:mm am/pm')
    .setFontColor('#8C7B6B')
    .setFontSize(9);

  // Name: bold
  sheet.getRange(row, 2)
    .setFontWeight('bold')
    .setFontColor('#2A2420');

  // Guests: center
  sheet.getRange(row, 3)
    .setHorizontalAlignment('center')
    .setFontColor('#5A4A3C');

  // Attending: color coded
  var attending = sheet.getRange(row, 4).getValue();
  var attendColor = (attending === 'Will Attend') ? '#2D6A4F' : '#9B2226';
  sheet.getRange(row, 4)
    .setHorizontalAlignment('center')
    .setFontWeight('bold')
    .setFontColor(attendColor);

  // Message: wrap text
  sheet.getRange(row, 5)
    .setWrap(true)
    .setFontColor('#5A4A3C')
    .setFontStyle('italic');
}

// ── UPDATE SUMMARY ─────────────────────────────────────────── 
function updateSummary(sheet) {
  sheet.getRange('E5').setValue(new Date())
    .setNumberFormat('d MMM yyyy  h:mm am/pm')
    .setFontColor('#8C7B6B')
    .setFontSize(9)
    .setHorizontalAlignment('center');
}

// ── MANUAL TRIGGER: Reformat entire sheet ────────────────────
// Run this from the Apps Script editor if you want to reformat all rows
function reformatAll() {
  var sheet = getOrCreateSheet();
  var lastRow = sheet.getLastRow();
  for (var r = 8; r <= lastRow; r++) {
    formatDataRow(sheet, r);
  }
  updateSummary(sheet);
  Logger.log('Reformatted ' + (lastRow - 7) + ' rows.');
}
