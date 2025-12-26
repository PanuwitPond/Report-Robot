import './Login.css'
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

const base_api = window._env_.REACT_APP_API_BASE_URL || 'http://localhost:5000';
function LoginPage() {
  localStorage.removeItem("jwt_token");



  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const handleLogin = () => {

    // if (username === staticUsername && password === staticPassword) {
    //   setMessage('Login Successful');
    //   navigate("/incompleteIncident", { state: {username:staticUsername} });
    //   // navigate("/trueAlarm", { state: {username:staticUsername} });
    // } else {
    //   setMessage('Invalid Username or Password', staticUsername, staticPassword);
    // }


    fetch(`${base_api}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        username: username,
        password: password
      })
    })
      .then(response => {
        //console.log(base_api);
        // ตรวจสอบ status code ก่อน
        if (!response.ok) {
          throw new Error(`Login failed: ${response.status}`);
        }
        return response.text();
      })
      .then(token => {
        // ตรงนี้คือ login ผ่านเท่านั้น
        return new Promise((resolve) => {
        localStorage.setItem("jwt_token", token);
        // รอให้ browser จัดการกับ localStorage เสร็จ
        setTimeout(() => {
            resolve(token);
        }, 0);
    });
      })
      .then(() => {
        setMessage('Login Successful');
        navigate("/incompleteIncident");
      })
      .catch(error => {
        console.error('Login error:', error);
        setMessage('Login Failed: ' + error.message);
        // อาจจะ clear form หรือแสดง error message
        setUsername('');
        setPassword('');
      });
  };

  return (
    <div>
      <div className="App container-fluid d-flex justify-content-center align-items-center min-vh-100" >
        <div className="card" style={{ width: '18rem', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <div className="card-body">
            <img className="img" src="Metthier-Logo.jpg" />
            <input
              className="form-control"
              type="text"
              id="username_inp"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ marginBottom: '10px', marginTop: '10px' }}
            />
            <input
              className="form-control"
              type="password"
              id="password_inp"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <button className="btn  w-100" onClick={handleLogin} style={{ marginTop: '10px', backgroundColor: "#F28705", color: "#FFFFFF" }}>
              Login
            </button>
            {message && <p className="mt-3 text-center">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;