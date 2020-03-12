import React from 'react'
import { useNavigate } from 'react-router-dom'
import createPersistedState from 'use-persisted-state'
import './App.css'
import kanjiJouyou from './data/kanji-jouyou-grouped-10.json'

const useKanjiStudyState = createPersistedState('kanji-study')

function Home() {
  let navigate = useNavigate()
  const total = 10 // based on file above
  const [kanjiState, setKanjiState] = useKanjiStudyState({})

  const loadDummyData = () => {
    // setKanjiState({
    //   cards: {
    //     '0': kanjiJouyou[0].map(x => x.kanji),
    //     '1': [kanjiJouyou[1][0].kanji]
    //   }
    // })
  }

  return (
    <div className="container-fluid">
      <h1 className="float-left">漢字勉強</h1>
      <div className="float-right">
        <button
          className="btn-primary btn-lg mt-2"
          onClick={() => setKanjiState({})}>
          リセット
        </button>
        {/* <button className="btn-danger btn-lg mt-2 ml-2" onClick={loadDummyData}>
          Dummy Data
        </button> */}
      </div>
      <div className="clearfix"></div>
      <div className="row">
        {kanjiJouyou.map((kanji, index) => (
          <div
            key={index}
            className="col-sm-2 mb-3"
            onClick={() => navigate(`/kanji/${index}`)}>
            <div
              className={`card ${
                kanjiState?.cards?.[index]?.length
                  ? kanji.length === kanjiState.cards[index].length
                    ? 'border-success'
                    : 'border-warning'
                  : 'border-secondary'
              }`}>
              <div className="card-body text-center cursor-pointer">
                <div className="h4">
                  {kanji[0].kanji} - {kanji[kanji.length - 1].kanji}
                </div>
                ({index * total + 1} -{' '}
                {index * total +
                  kanji.length +
                  (kanjiJouyou.length === index + 1 ? 1 : 0)}
                )
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
