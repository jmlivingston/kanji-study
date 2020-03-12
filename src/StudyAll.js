import { ReactComponent as House } from 'bootstrap-icons/icons/house.svg'
import React from 'react'
import { Link } from 'react-router-dom'

function StudyAll({ kanjiList, reset }) {
  return (
    <>
      <Link to="/" className="display-1">
        <House width="48px" height="48px" className="text-light" />
      </Link>
      <h1 className="text-center">既に勉強しました</h1>
      <div className="text-center mb-3">
        <button className="btn btn-primary btn-lg text-center" onClick={reset}>
          リセット
        </button>
      </div>
      <div className="row">
        {kanjiList.map(kanji => (
          <div key={kanji.kanji} className="col-sm-3 mb-3">
            <div className="card border-secondary">
              <div className="card-body text-center cursor-pointer">
                <h1>{kanji.kanji}</h1>
                <div className="h6 text-truncate">{kanji.on.join('・')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default StudyAll
