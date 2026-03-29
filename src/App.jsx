import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Mapa from './pages/Mapa'
import Estadistiques from './pages/Estadistiques'
import Blog from './pages/Blog'
import Article from './pages/Article'
import Metodologia from './pages/Metodologia'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="mapa" element={<Mapa />} />
          <Route path="estadistiques" element={<Estadistiques />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<Article />} />
          <Route path="metodologia" element={<Metodologia />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
