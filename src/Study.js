import { ReactComponent as Check } from 'bootstrap-icons/icons/check.svg'
import { ReactComponent as House } from 'bootstrap-icons/icons/house.svg'
import { ReactComponent as X } from 'bootstrap-icons/icons/x.svg'
import _debounce from 'lodash/debounce'
import React, { useEffect, useState } from 'react'
import CanvasDraw from 'react-canvas-draw'
import { Link, useParams } from 'react-router-dom'
import createPersistedState from 'use-persisted-state'
import kanjiJouyou from './data/kanji-jouyou-grouped-10.json'
import KanjiAnimation from './KanjiAnimation'
import KanjiInfo from './KanjiInfo'
import './Study.css'
import StudyAll from './StudyAll'

const useKanjiStudyState = createPersistedState('kanji-study')

function Study() {
  const { stackIndex } = useParams()
  const kanjiList = kanjiJouyou[stackIndex]

  const [windowSize, setWindowSize] = useState({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight
  })

  let [currentKanjiIndex, setCurrentKanjiIndex] = useState(0)
  let [currentKanji, setCurrentKanji] = useState()
  let [showAll, setShowAll] = useState(false)
  let [showKanji, setShowKanji] = useState(false)
  const [kanjiState, setKanjiState] = useKanjiStudyState({})

  const iconSize = {
    height: windowSize.innerHeight / 3 / 4,
    width: windowSize.innerHeight / 3 / 4
  }

  useEffect(() => {
    const handleResize = _debounce(
      () =>
        setWindowSize({
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight
        }),
      100
    )

    window.addEventListener('resize', handleResize)

    setShowAll(kanjiList.length === kanjiState?.cards?.[stackIndex]?.length)

    if (!kanjiState?.cards?.[stackIndex]) {
      setCurrentKanjiIndex(0)
      setCurrentKanji(kanjiList[0])
    } else if (kanjiState?.cards?.[stackIndex].length === kanjiList.length) {
      setShowAll(true)
    } else {
      for (let i = 0; i < kanjiList.length; i++) {
        if (!kanjiState.cards[stackIndex].includes(kanjiList[i].kanji)) {
          setCurrentKanjiIndex(i)
          setCurrentKanji(kanjiList[i])
          break
        }
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const next = isChecked => {
    setShowKanji(false)
    let newKanjiState = {}
    if (isChecked) {
      setCurrentKanjiIndex(currentKanjiIndex + 1)
      newKanjiState = {
        ...kanjiState,
        cards: {
          ...(kanjiState.cards ?? {}),
          [stackIndex.toString()]: [...(kanjiState?.cards?.[stackIndex] ?? []), currentKanji.kanji]
        }
      }
      setKanjiState(newKanjiState)
    }

    if (newKanjiState?.cards?.[stackIndex]?.length === kanjiList.length) {
      setCurrentKanjiIndex(0)
      setCurrentKanji(kanjiList[0])
      setShowAll(true)
    } else {
      for (let i = kanjiList.length === currentKanjiIndex + 1 ? 0 : currentKanjiIndex + 1; i < kanjiList.length; i++) {
        if (!newKanjiState?.cards?.[stackIndex]?.includes(kanjiList[i].kanji)) {
          setCurrentKanjiIndex(i)
          setCurrentKanji(kanjiList[i])
          break
        } else {
        }
      }
    }
  }

  const reset = () => {
    setKanjiState({
      ...kanjiState,
      cards: Object.keys(kanjiState.cards)
        .filter(x => x !== stackIndex)
        .reduce(
          (acc, value) => ({
            ...acc,
            [Number.parseInt(value)]: kanjiState.cards[value]
          }),
          {}
        )
    })
    setCurrentKanjiIndex(0)
    setCurrentKanji(kanjiList[0])
    setShowAll(false)
  }

  const loadDummyData = () => {
    // setKanjiState({
    //   cards: {
    //     '1': ['土']
    //   }
    // })
  }

  return (
    <div className="container-fluid">
      {showAll && <StudyAll kanjiList={kanjiList} reset={reset} />}
      {!showAll && (
        <>
          <div style={{ height: `${windowSize.innerHeight / 4}px` }}>
            <Link to="/">
              <House width="48px" height="48px" className="text-light" style={{ position: 'absolute', right: 20 }} />
              <button className="btn-danger btn-lg mt-2 ml-2 d-none" onClick={loadDummyData} style={{ position: 'absolute', right: 200 }}>
                Dummy Data
              </button>
            </Link>
            {showKanji ? (
              <div className="display-1 text-center" onClick={() => setShowKanji(!showKanji)}>
                <KanjiAnimation
                  height={(windowSize.innerHeight / 3 / 3) * 2}
                  kanji={currentKanji.kanji}
                  width={(windowSize.innerHeight / 3 / 3) * 2}
                />
              </div>
            ) : (
              <KanjiInfo kanji={currentKanji} onClick={() => setShowKanji(!showKanji)} />
            )}
          </div>
          <hr className="border-secondary" />
          <X {...iconSize} onClick={() => next(false)} style={{ position: 'absolute', bottom: 0, zIndex: 99 }} className="text-danger" />
          <Check
            onClick={() => next(true)}
            {...iconSize}
            style={{ position: 'absolute', bottom: 0, right: 20, zIndex: 99 }}
            className="text-success"
          />
          <CanvasDraw
            brushColor="#FFF"
            backgroundColor="transparent"
            hideGrid={true}
            canvasWidth={windowSize.innerWidth - 30}
            canvasHeight={`${(windowSize.innerHeight / 4) * 3}px`}
          />
        </>
      )}
    </div>
  )
}

export default Study
