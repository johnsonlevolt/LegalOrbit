/**
 * Legal Orbit coupon validator.
 *
 * Deploy as a Google Apps Script Web App:
 * - Execute as: Me
 * - Who has access: Anyone with the link
 *
 * Script properties:
 * - COUPON_GAS_SECRET: same value as Vercel COUPON_GAS_SECRET
 * - SPREADSHEET_ID: optional. If empty, the bound spreadsheet is used.
 */

const COUPON_SHEET_NAME = 'クーポン管理';
const HISTORY_SHEET_NAME = '使用履歴';

function doPost(e) {
  try {
    const request = parseRequest_(e);
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('COUPON_GAS_SECRET');
    if (!expectedSecret || request.secret !== expectedSecret) {
      return json_({ ok: false, error: '認証に失敗しました。' }, 401);
    }

    const code = normalizeCode_(request.code);
    if (!code) return json_({ ok: false, error: 'クーポンコードを入力してください。' }, 400);

    const spreadsheet = openSpreadsheet_();
    const sheet = spreadsheet.getSheetByName(COUPON_SHEET_NAME);
    if (!sheet) return json_({ ok: false, error: `シート「${COUPON_SHEET_NAME}」が見つかりません。` }, 500);

    const rows = readRows_(sheet);
    const index = rows.findIndex(row => normalizeCode_(row.code || row['コード']) === code);
    if (index === -1) return json_({ ok: false, error: 'クーポンコードが見つかりません。' }, 404);

    const row = rows[index];
    const coupon = buildCoupon_(row);
    const validationError = validateCoupon_(coupon, request.plan_name, request.action);
    if (validationError) return json_({ ok: false, error: validationError }, 400);

    writeHistory_(spreadsheet, {
      used_at: new Date(),
      code,
      email: request.email || '',
      user_id: request.user_id || '',
      plan_name: request.plan_name || '',
      billing_cycle: request.billing_cycle || '',
      action: request.action || 'checkout',
      result: 'validated',
    });

    return json_({ ok: true, coupon });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) }, 500);
  }
}

function parseRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  return JSON.parse(e.postData.contents);
}

function openSpreadsheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (spreadsheetId) return SpreadsheetApp.openById(spreadsheetId);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function readRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(value => String(value).trim());
  return values.slice(1).map(row => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    return item;
  });
}

function buildCoupon_(row) {
  const discountType = value_(row.discount_type, row['割引種別']) || 'percent';
  const activationType = value_(row.activation_type, row['有効化方法']) || 'checkout_only';
  return {
    code: normalizeCode_(value_(row.code, row['コード'])),
    label: value_(row.label, row['名称']) || value_(row.code, row['コード']),
    campaign_type: value_(row.campaign_type, row['用途']) || 'early_user',
    referrer_name: value_(row.referrer_name, row['紹介者名']) || null,
    referrer_email: value_(row.referrer_email, row['紹介者メール']) || null,
    plan_name: value_(row.plan_name, row['対象プラン']) || null,
    discount_type: discountType,
    discount_value: number_(value_(row.discount_value, row['割引値']), discountType === 'percent' ? 100 : 0),
    activation_type: activationType,
    free_until: dateText_(value_(row.free_until, row['無料提供期限'])),
    expires_at: dateText_(value_(row.expires_at, row['利用期限'])),
    max_redemptions: nullableNumber_(value_(row.max_redemptions, row['利用上限回数'])),
    stripe_coupon_id: value_(row.stripe_coupon_id, row['StripeクーポンID']) || null,
    status: value_(row.status, row['状態']) || 'active',
    note: value_(row.note, row['メモ']) || null,
  };
}

function validateCoupon_(coupon, planName, action) {
  if (coupon.status !== 'active') return 'このクーポンは現在使えません。';
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) return 'クーポンの有効期限が切れています。';
  if (coupon.free_until && coupon.discount_type === 'free_until' && new Date(coupon.free_until).getTime() < Date.now()) return '無料提供期限が切れています。';
  if (coupon.plan_name && planName && coupon.plan_name !== planName) return 'このクーポンは選択したプランでは使えません。';
  if (coupon.max_redemptions !== null && coupon.max_redemptions <= countUsed_(coupon.code)) return 'このクーポンは利用上限に達しています。';
  if (action === 'activate' && coupon.activation_type !== 'immediate') return 'このコードは課金登録時のみ有効です。';
  if (action === 'activate' && !coupon.plan_name) return '即時有効化コードには対象プランを設定してください。';
  return null;
}

function countUsed_(code) {
  const spreadsheet = openSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);
  if (!sheet) return 0;
  const rows = readRows_(sheet);
  return rows.filter(row => normalizeCode_(row.code || row['コード']) === code && String(row.result || row['結果']) === 'validated').length;
}

function writeHistory_(spreadsheet, record) {
  let sheet = spreadsheet.getSheetByName(HISTORY_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(HISTORY_SHEET_NAME);
    sheet.appendRow(['used_at', 'code', 'email', 'user_id', 'plan_name', 'billing_cycle', 'action', 'result']);
  }
  sheet.appendRow([
    record.used_at,
    record.code,
    record.email,
    record.user_id,
    record.plan_name,
    record.billing_cycle,
    record.action,
    record.result,
  ]);
}

function normalizeCode_(value) {
  return String(value || '').trim().toUpperCase();
}

function value_(primary, fallback) {
  const value = primary !== undefined && primary !== null && String(primary).trim() !== '' ? primary : fallback;
  return value === undefined || value === null ? '' : String(value).trim();
}

function number_(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nullableNumber_(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function dateText_(value) {
  if (!value) return null;
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, 'Asia/Tokyo', 'yyyy-MM-dd');
  }
  return String(value).trim() || null;
}

function setupCouponActivationTypeDropdown() {
  const spreadsheet = openSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(COUPON_SHEET_NAME);
  if (!sheet) throw new Error(`シート「${COUPON_SHEET_NAME}」が見つかりません。`);

  const values = sheet.getDataRange().getValues();
  let headerRow = -1;
  let activationColumn = -1;

  values.some((row, rowIndex) => {
    const columnIndex = row.findIndex(value => {
      const text = String(value || '').trim();
      return text === '有効化方法' || text === 'activation_type';
    });

    if (columnIndex >= 0) {
      headerRow = rowIndex + 1;
      activationColumn = columnIndex + 1;
      return true;
    }

    return false;
  });

  if (headerRow < 1 || activationColumn < 1) {
    throw new Error('有効化方法列が見つかりません。');
  }

  const targetRows = Math.max(sheet.getMaxRows() - headerRow, 1);
  const targetRange = sheet.getRange(headerRow + 1, activationColumn, targetRows, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['immediate', 'checkout_only'], true)
    .setAllowInvalid(false)
    .setHelpText('immediate=課金登録なしで有効化、checkout_only=決済時のみ有効')
    .build();

  targetRange.setDataValidation(rule);
  spreadsheet.toast('有効化方法のプルダウンを設定しました。', 'Legal Orbit');
}

function json_(body) {
  const output = ContentService.createTextOutput(JSON.stringify(body));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
