const { createReadStream, mkdirSync, rmSync, writeFileSync } = require('fs');
const { Parser } = require('kanjidic2stream');
const { sortBy } = require('lodash');
const path = require('path');

const stream = createReadStream(path.join(__dirname, '../src/data/kanjidic2.xml'), 'utf8').pipe(new Parser());

let kanjiJson = [];

function createGroupedKanji(kanjiJouyou, total = 50) {
  let groupedKanji = [];
  let counter = 0;
  let currentGroupedStack = [];
  kanjiJouyou.forEach((kanji, index) => {
    if (counter >= total || index === kanjiJouyou.length - 1) {
      counter = 0;
      groupedKanji.push(currentGroupedStack);
      currentGroupedStack = [];
    }
    currentGroupedStack.push(kanji);
    counter = counter + 1;
  });

  writeFileSync(
    path.join(__dirname, `../src/data/kanji-jouyou-grouped-${total}.json`),
    JSON.stringify(groupedKanji, null, 2)
  );
}

function createGroupedKanji2(kanjiJouyou, total = 50) {
  const groupedByName = `groupedBy${total}`;
  const detailsPath = path.join(__dirname, `../src/data/${groupedByName}`);
  rmSync(detailsPath, { recursive: true, force: true });
  mkdirSync(detailsPath);

  let groupedKanji = {};
  let counter = 0;
  let currentGroupedStack = {};
  kanjiJouyou.forEach((kanji, index) => {
    if (counter >= total || index === kanjiJouyou.length - 1) {
      counter = 0;
      groupedKanji[index] = { ...currentGroupedStack };
      currentGroupedStack = {};
    }
    currentGroupedStack[kanji.value] = kanji;
    counter = counter + 1;
  });

  const fileNames = [];

  Object.keys(groupedKanji).forEach((key, index) => {
    const groupKanji = groupedKanji[key];
    const groupKanjiKeys = Object.keys(groupKanji);
    const firstKey = groupKanjiKeys[0];
    const lastKey = groupKanjiKeys[groupKanjiKeys.length - 1];
    const fileName = `${(index + 1).toString().padStart(2, '0')}. ${firstKey}-${lastKey}.json`;
    fileNames.push({ fileName: fileName.replace('.json', ''), total: Object.keys(groupKanji).length });
    writeFileSync(path.join(__dirname, `../src/data/${groupedByName}/${fileName}`), JSON.stringify(groupKanji));
  });

  writeFileSync(
    path.join(__dirname, `../src/data/schema.json`),
    JSON.stringify({ [groupedByName]: { fileNames } }, null, 2)
  );
}

/*
  Convert from ucs endpoint
  String.fromCharCode(0x10611b);
  result - 愛

  Convert to ucs codepoint
  '愛'.codePointAt().toString(16)
  result - 611b
*/

function readKanjiDicXml({ isJlpt = true } = {}) {
  let codepoints = {};
  stream
    .on('data', (e) => {
      if (e.type === 'header') {
        // console.log('database version:', e.year + '-' + e.versionInYear);
      } else if (e.type === 'character' && isJlpt ? !!e.jlpt : true) {
        codepoints = { ...codepoints, ...e.variants };

        kanjiJson.push({
          grade: e.grade, // remove these later? used for sorting below
          frequency: e.freq, // remove this later?
          // jlptLevel: e.jlpt,
          // dictionaryReferences: {
          //   halpernNjecd: e.dicRefs.halpern_njecd,
          //   kanjiInContext: e.dicRefs.kanji_in_context
          // },
          kun: e.readings.ja_kun,
          meanings: e.meanings.en,
          on: e.readings.ja_on,
          strokeCount: e.strokeCounts[0], // There may be more, but we care about the most common
          value: e.literal,
        });
      }
    })
    .on('end', () => {
      console.log(JSON.stringify(codepoints, null, 2));

      // Writes all 13K+ kanji and subset of metadata shown above
      writeFileSync(path.join(__dirname, '../src/data/kanji-all.json'), JSON.stringify(kanjiJson, null, 2));

      // Writes only Joyou Kanji
      // let kanjiJouyou = kanjiJson.filter((kanji) => kanji.grade < 9);
      const kanjiJouyou = sortBy(kanjiJson, ['grade', 'frequency']);
      writeFileSync(path.join(__dirname, '../src/data/kanji-jouyou.json'), JSON.stringify(kanjiJouyou, null, 2));

      createGroupedKanji2(kanjiJouyou, 50);
      // createGroupedKanji(kanjiJouyou, 25);
      // createGroupedKanji(kanjiJouyou, 10);
    });
}

readKanjiDicXml();
