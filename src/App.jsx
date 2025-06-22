import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />

          {/*/!* Dashboard 嵌套路由 *!/*/}
          {/*<Route path="/dashboard" element={<DashboardLayout />}>*/}
          {/*  <Route index element={<Dashboard />} />*/}
          {/*  <Route path="habits" element={<HabitManager />} />*/}
          {/*</Route>*/}
        </Routes>
      </Router>
  )
}

export default App
