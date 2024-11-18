import React from 'react'
import api from '../../api';

function RemoveFileBtn({fileId, fetchFiles, setErrorMessage}) {

    const handleRemove = async (e) => {
        try{
            const token = localStorage.getItem("access_token");
            await api.delete(`/files/${fileId}/delete/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // console.log(response);
            fetchFiles();
            setErrorMessage("");
        }catch(err) {
            // console.log(err);
            setErrorMessage(err.response.data.detail)
        }
    }
    return (
        <button className='btn btn-outline-danger' onClick={handleRemove}>
            <i className="fa-solid fa-trash"></i>
        </button>
    )
}

export default RemoveFileBtn