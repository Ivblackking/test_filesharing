import React from 'react'
import {useState, useEffect} from 'react'
import api from "./../../api";
import { useNavigate } from 'react-router-dom';
import RemoveFileBtn from './RemoveFileBtn';

function AllFiles() {
    const navigate = useNavigate();
    const [files, setFiles] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [fileToUpload, setFileToUpload] = useState(null);

    const fetchFiles = async () => {
        try{
            const token = localStorage.getItem("access_token");
            const response = await api.get("/files/", {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            // console.log(response.data);
            setFiles(response.data.files);
            setErrorMessage("");
        }catch(err) {
            // console.log(err);
            if (err.response.status === 401){
                navigate("/auth/login");
            }
            setErrorMessage(err.response.data.detail)
        }
    }

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        setFileToUpload(file);
    }

    const uploadFile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("access_token");
            await api.post('/files/upload/', 
                {"uploaded_file": fileToUpload}, {
                headers: {
                  "Content-Type": "multipart/form-data",
                  'Authorization': `Bearer ${token}`
                }
            });
            setErrorMessage("");
            await fetchFiles();
        }catch(err) {
            // console.log(err);
            setErrorMessage(err.response.data.detail)
        }
    }

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div className='container mt-3'>
            {errorMessage && <div className='alert alert-danger'>{errorMessage}</div>}
            {files && <>
                <h1 className='h2'>All Files</h1>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">filename</th>
                            <th scope="col">downloads</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, index) => {
                            return (
                                <tr key={file.id}>
                                    <th scope="row">{index+1}</th>
                                    <td>{file.filename}</td>
                                    <td>{file.downloads_counter}</td>
                                    <td>
                                        <RemoveFileBtn fileId={file.id}
                                            fetchFiles={fetchFiles}
                                            setErrorMessage={setErrorMessage}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </>}
            <form className='d-flex gap-2' onSubmit={uploadFile}>
                <input className="form-control" type='file' id='file' name='file'
                    onChange={handleFileInput} required
                />
                <button type='submit' className='btn btn-primary'>Upload</button>
            </form>
        </div>
    )
}

export default AllFiles