import React from 'react'
import {useState, useEffect} from 'react'
import api from "../api";

function AllFiles() {
    const [files, setFiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

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
            setErrorMessage(err.response.data.detail)
        }
    }

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div>
            <h1 className='h2'>All Files</h1>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">filename</th>
                        <th scope="col">downloads</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, index) => {
                        return (
                            <tr key={file.id}>
                                <th scope="row">{index+1}</th>
                                <td>{file.filename}</td>
                                <td>{file.downloads_counter}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default AllFiles