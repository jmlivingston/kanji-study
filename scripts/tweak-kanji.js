const { createReadStream, writeFileSync } = require('fs')
const { Parser } = require('kanjidic2stream')
const { sortBy } = require('lodash')
const path = require('path')

const stream = createReadStream(
  path.join(__dirname, '../src/data/kanjidic2.xml'),
  'utf8'
).pipe(new Parser())

let kanjiJson = []

function createGroupedKanji(kanjiJouyou, total = 50) {
  let groupedKanji = []
  let counter = 0
  let currentGroupedStack = []
  kanjiJouyou.forEach((kanji, index) => {
    if (counter >= total || index === kanjiJouyou.length - 1) {
      counter = 0
      groupedKanji.push(currentGroupedStack)
      currentGroupedStack = []
    }
    currentGroupedStack.push(kanji)
    counter = counter + 1
  })

  writeFileSync(
    path.join(__dirname, `../src/data/kanji-jouyou-grouped-${total}.json`),
    JSON.stringify(groupedKanji, null, 2)
  )
}

function readKanjiDicXml() {
  stream
    .on('data', e => {
      if (e.type === 'header') {
        console.log('database version:', e.year + '-' + e.versionInYear)
      } else if (e.type === 'character') {
        kanjiJson.push({
          kanji: e.literal,
          grade: e.grade,
          strokeCounts: e.strokeCounts,
          frequency: e.freq,
          jlptLevel: e.jlpt,
          dictionaryReferences: {
            halpernNjecd: e.dicRefs.halpern_njecd,
            kanjiInContext: e.dicRefs.kanji_in_context
          },
          on: e.readings.ja_on,
          kun: e.readings.ja_kun,
          meanings: e.meanings.en
        })
      }
    })
    .on('end', () => {
      // Writes all 13K+ kanji and subset of metadata shown above
      writeFileSync(
        path.join(__dirname, '../src/data/kanji-all.json'),
        JSON.stringify(kanjiJson, null, 2)
      )

      // Writes only Joyou Kanji
      let kanjiJouyou = kanjiJson.filter(kanji => kanji.grade < 9)
      kanjiJouyou = sortBy(kanjiJouyou, ['grade', 'frequency'])
      writeFileSync(
        path.join(__dirname, '../src/data/kanji-jouyou.json'),
        JSON.stringify(kanjiJouyou, null, 2)
      )

      createGroupedKanji(kanjiJouyou, 50)
      createGroupedKanji(kanjiJouyou, 25)
      createGroupedKanji(kanjiJouyou, 10)
    })
}

readKanjiDicXml()
