import React from 'react'
import {useState, useEffect} from 'react'
import api from "./../../api";
import { useNavigate } from 'react-router-dom';

function MyFiles() {
    const navigate = useNavigate();
    const [files, setFiles] = useState(null);
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const fetchInfo = async () => {
        try{
            const token = localStorage.getItem("access_token");
            const response = await api.get("/user/my-files/", {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            // console.log(response.data);
            setUsername(response.data.username);
            setFiles(response.data.files);
            setErrorMessage("");
        }catch(err) {
            // console.log(err);
            if (err.response.status === 401){
                navigate("/auth/login");
            }
            setErrorMessage(err.response.data.detail);
        }
    }

    useEffect(() => {
        fetchInfo();
    }, []);

    return (
        <div className='container mt-3'>
            {errorMessage && <div className='alert alert-danger'>{errorMessage}</div>}
            {files && <>
                <h1 className='h4 fw-bold'>{username}</h1>
                <h2 className='h2'>My Files</h2>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">filename</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, index) => {
                            return (
                                <tr key={file.id}>
                                    <th scope="row">{index+1}</th>
                                    <td>{file.filename}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </>}
        </div>
    )
}

export default MyFiles