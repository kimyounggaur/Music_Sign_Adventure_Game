const { test, expect } = require('@playwright/test');
const { SAVE_KEY, SETTINGS_KEY, boot, tapCanvas, saveRaw, settingsRaw } = require('./_helpers');

test('SV-01 title sound toggle does not overwrite progress save', async ({ page }) => {
  const progressSave = {
    version: 1,
    currentMap: 'forest',
    playerPosition: { x: 224, y: 288 },
    symbols: ['clef_g', 'note_c'],
    goldenNotes: ['village_note_1'],
    equip: 'clef_g',
    quests: {
      MQ01: { state: 'done', objective: '완료' },
      MQ02: { state: 'not_started', objective: '숲에서 사라진 악보를 찾자' }
    },
    flags: { tower_door_open: true },
    codex: ['clef_g'],
    scoreParts: { melody: true, accidental: false, rhythm: false, dynamics: false, harmony: false },
    soundOn: true,
    hapticsOn: true,
    playTime: 123
  };

  await page.addInitScript(({ saveKey, settingsKey, payload }) => {
    localStorage.setItem(saveKey, payload);
    localStorage.removeItem(settingsKey);
  }, { saveKey: SAVE_KEY, settingsKey: SETTINGS_KEY, payload: JSON.stringify(progressSave) });

  await boot(page, '', { clearSave: false });
  const before = await saveRaw(page);
  await tapCanvas(page, 180, 512);

  expect(await saveRaw(page)).toBe(before);
  expect(JSON.parse(await settingsRaw(page))).toMatchObject({
    version: 1,
    soundOn: false,
    hapticsOn: true
  });
});
