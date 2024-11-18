import {React, useState} from 'react'
import api from "./../../api";
import { useNavigate } from 'react-router-dom';

function SignUp() {
    const navigate = useNavigate();
    const [signUpData, setSignUpData] = useState({
        username: "",
        password: "",
        is_admin: false,
        admin_key: ""
    });

    const [errorMessage, setErrorMessage] = useState("");

    const handleInput = (e) => {
        setSignUpData({...signUpData, [e.target.name]: e.target.value});
    }

    const handleCheckBox = (e) => {
        setSignUpData({...signUpData, [e.target.name]: e.target.checked});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await api.post("/signup/", signUpData);
            // console.log(response);
            setErrorMessage("");
            navigate("/auth/login");
        }catch(err) {
            console.log(err);
            if (err.response){
                setErrorMessage(err.response.data.detail);
            }
        }
    }

    return (
        <div className='contaner mt-3'>
            <div style={{maxWidth: "512px"}} className='border rounded mx-auto mt-5 p-3'>
                <h1 className="h2 mb-3">Sign Up</h1>
                {errorMessage && <div className='alert alert-danger'>{errorMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input type="text" className="form-control" 
                            id="username" name='username' placeholder='username'
                            onChange={handleInput} required
                        />
                    </div>
                    <div className="mb-3">
                        <input type="password" className="form-control" 
                            id="password" name='password' placeholder='password'
                            onChange={handleInput} required
                        />
                    </div>
                    <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox"
                            id="is_admin" name="is_admin"
                            onChange={handleCheckBox}
                        />
                        <label className="form-check-label" htmlFor="is_admin">
                            Create admin account
                        </label>
                    </div>
                    <div className="mb-3">
                        <input type="text" className="form-control" 
                            id="admin_key" name='admin_key'
                            placeholder='Admin Key: required for admin account'
                            onChange={handleInput}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default SignUp;