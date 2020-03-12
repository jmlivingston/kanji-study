import HanziWriter from 'hanzi-writer'
import React, { useEffect, useRef } from 'react'

function KanjiAnimation({ height, kanji, width }) {
  const hanziElement = useRef(null)
  let writer = useRef(null)
  useEffect(() => {
    if (!writer.current) {
      writer.current = HanziWriter.create(hanziElement.current, kanji, {
        width: width,
        height: height,
        padding: 5,
        showOutline: false,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 100,
        delayBetweenLoops: 1500,
        strokeColor: '#FFFFFF'
      })
      writer.current.loopCharacterAnimation()
    } else {
      writer.current.setCharacter(kanji)
      writer.current.loopCharacterAnimation()
    }
    return () => {
      clearInterval(writer.current)
    }
  })

  return <div ref={hanziElement} />
}

export default KanjiAnimation
