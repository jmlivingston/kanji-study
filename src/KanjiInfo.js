import React from 'react'

function KanjiInfo({ kanji, onClick }) {
  return (
    <div onClick={onClick}>
      <div className="h2">{kanji?.on?.join('・')}</div>
      <div className="h2">{kanji?.kun?.join('・')}</div>
      <div className="h3">{kanji?.meanings?.join(', ')}</div>
    </div>
  )
}

export default KanjiInfo
