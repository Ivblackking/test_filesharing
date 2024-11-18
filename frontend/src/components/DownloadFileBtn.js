import api from '../api'

function DownloadFileBtn({fileId, filename, setErrorMessage}) {
    
    const handleDownload = async (e) => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await api.get(`/files/${fileId}/download/`, {
                responseType: 'blob',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
            });
            // console.log(res);
            const blob = res.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a); // append the element to the dom
            a.click();
            a.remove(); // afterwards, remove the element
            setErrorMessage("");
        }catch(err) {
            // console.log(err);
            if (err.response){
                setErrorMessage(err.response.data.detail);
            }
        }
    }

    return (
        <button className='btn btn-outline-primary' onClick={handleDownload}>
            <i className="fa-solid fa-download"></i>
        </button>
    )
}

export default DownloadFileBtn