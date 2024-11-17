import React from 'react'
import {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import api from "./../../api";

function AllUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchUsers = async () => {
        try{
            const token = localStorage.getItem("access_token");
            const response = await api.get("/users/", {
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });
            // console.log(response.data);
            setUsers(response.data.users);
            setErrorMessage("");
        }catch(err) {
            // console.log(err);
            if (err.response.status === 401){
                navigate("/auth/login");
            }
            setErrorMessage(err.response.data.detail)
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className='container mt-3'>
            {errorMessage ? <div className='alert alert-danger'>{errorMessage}</div> :
            (users && <>
                <h1 className='h2'>All Users</h1>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">username</th>
                            <th scope="col">role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => {
                            return (
                                <tr key={user.id}>
                                    <th scope="row">{index+1}</th>
                                    <td>{user.username}</td>
                                    <td>{user.is_admin ? "admin": "user"}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </>)
            }
        </div>
    )
}

export default AllUsers