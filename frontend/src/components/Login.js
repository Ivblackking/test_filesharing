import {React, useState} from 'react'
import api from "../api";

function Login() {
    const [loginData, setLoginData] = useState({
        username: "",
        password: "",
    });

    const [errorMessage, setErrorMessage] = useState("");

    const handleInput = (e) => {
        setLoginData({...loginData, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await api.post("/login/", 
                loginData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            // console.log(response);
            setErrorMessage("");
            const token = response.data.access_token;
            localStorage.setItem("access_token", token);
        }catch(err) {
            // console.log(err);
            setErrorMessage(err.response.data.detail)
        }
    }

    return (
        <div className='contaner mt-3'>
            <div style={{maxWidth: "310px"}} className='border rounded mx-auto mt-5 p-3'>
                <h1 className="h2 mb-3">Log In</h1>
                {errorMessage && <div className='alert alert-danger'>{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input type="text" className="form-control" 
                            id="username" name='username' placeholder='username'
                            onChange={handleInput}
                        />
                    </div>
                    <div className="mb-3">
                        <input type="password" className="form-control" 
                            id="password" name='password' placeholder='password'
                            onChange={handleInput}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;