import './App.css';
import EditForm from './EditForm';
import IncompleteIncident from './IncompleteIncident';
import LoginPage from './LoginPage';
import TrueAlarm from './PageTrueAlarm';
import PageReport from './PageReport'; 
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

function App() {
  const location = useLocation(); // ดึงข้อมูลเส้นทางปัจจุบัน

  // ตรวจสอบว่าเส้นทางคือ '/' หรือไม่ ถ้าใช่ให้ซ่อน AppBar

  return (
    // <BrowserRouter>
    <div style={{ overflowX: 'hidden', overflowY: 'auto' }}>
      {location.pathname !== '/' && (
        <AppBar position="static" style={{ backgroundColor: "#F28705" }} >
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              <img src="/mt_logo.png" alt="Metthier Logo" style={{ height: '50px' }} />
            </Typography>
            <Button color="inherit" component={Link} to="/">Logout</Button>
            <Button color="inherit" component={Link} to="/trueAlarm" state={{ username: 'dsfajdfgakjdlg' }} style={{
              backgroundColor: location.pathname === '/trueAlarm' ? '#6532a4' : 'transparent',
              color: '#fff',
            }}>True Alarm
            </Button>
            <Button color="inherit" component={Link} to="/incompleteIncident" state={{ username: 'oijsedfadmi' }}
              style={{
                backgroundColor: location.pathname === '/incompleteIncident' ? '#6532a4' : 'transparent',
                color: '#fff',
              }}>Incomplete Incident
            </Button>
            <Button color="inherit" component={Link} to="/pageReport" state={{ username: 'oijsedfadmi' }}
              style={{
                backgroundColor: location.pathname === '/pageReport' ? '#6532a4' : 'transparent',
                color: '#fff',
              }}>Report
            </Button>
          </Toolbar>
        </AppBar>
      )}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/trueAlarm" element={<TrueAlarm />} />
        <Route path="/incompleteIncident" element={<IncompleteIncident />} />
        <Route path="/editForm" element={<EditForm />} />
        <Route path="/pageReport" element={<PageReport />} />
      </Routes>
    </div>
    // </BrowserRouter>
  );
}

export default App;
