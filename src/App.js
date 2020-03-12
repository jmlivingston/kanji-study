import 'bootswatch/dist/darkly/bootstrap.min.css'
import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './Home'
import Study from './Study'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="kanji/:stackIndex" element={<Study />} />
      </Routes>
    </Router>
  )
}

export default App
