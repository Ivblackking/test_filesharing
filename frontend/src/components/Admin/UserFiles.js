import React from 'react'
import {useState, useEffect} from 'react'
import api from "./../../api";
import { useNavigate, useLocation } from 'react-router-dom';

function UserFiles() {
    const {state} = useLocation();
    const userId = state ? state.userId : 0;
    const navigate = useNavigate();
    const [files, setFiles] = useState(null);
    const [username, setUsername] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [allFiles, setAllFiles] = useState([]);
    const [fileId, setFileId] = useState(null);

    const fetchInfo = async () => {
        try{
            const token = localStorage.getItem("access_token");
            const response = await api.get(`/users/${userId}/files/`, {
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

    const fetchAllFiles = async () => {
        try{
            const token = localStorage.getItem("access_token");
            const response = await api.get("/files/", {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            // console.log(response.data);
            setAllFiles(response.data.files);
            setErrorMessage("");
        }catch(err) {
            // console.log(err);
            setErrorMessage(err.response.data.detail)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const token = localStorage.getItem("access_token");
            await api.get(`/files/${fileId}/user/${userId}/open-access/`, {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            await fetchInfo();
        }catch(err) {
            // console.log(err);
            setErrorMessage(err.response.data.detail)
        }
    }

    const handleSelectFile = (e) => {
        setFileId(e.target.value);
    }

    const handleCloseAccess = async (e) => {
        try{
            const token = localStorage.getItem("access_token");
            const fileId = e.target.getAttribute("data-file-id");
            await api.get(`/files/${fileId}/user/${userId}/close-access/`, {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            await fetchInfo();
        }catch(err) {
            // console.log(err);
            setErrorMessage(err.response.data.detail)
        }
    }

    useEffect(() => {
        fetchInfo();
        fetchAllFiles();
    }, []);

    return (
        <div className='container mt-3'>
            {errorMessage && <div className='alert alert-danger'>{errorMessage}</div>}
            {files && <>
                <h2 className='h2'>Files of the user <b>{username}</b></h2>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">filename</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, index) => {
                            return (
                                <tr key={file.id}>
                                    <th scope="row">{index+1}</th>
                                    <td>{file.filename}</td>
                                    <td>
                                        <button className='btn btn-outline-danger'
                                            onClick={handleCloseAccess}
                                            data-file-id={file.id}
                                        >
                                            Close access
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </>}
            <form onSubmit={handleSubmit}>
                <select className="form-select mb-1" 
                    onChange={handleSelectFile} required
                >
                    <option value="" selected>--Select file--</option>
                    {allFiles.map(file => {
                        return <option key={file.id} value={file.id}>{file.filename}</option>
                    })}
                </select>
                <button type='submit' className='btn btn-primary'>Open access</button>
            </form>
        </div>
    )
}

export default UserFiles