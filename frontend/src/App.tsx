import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
/* import AppLayaout from "./components/AppLayout" */


function App(){


  return (
    <BrowserRouter>
      <Routes>
        {/* Parte pública: */}
        <Route path="/" element={<Landing />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
