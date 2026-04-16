import React, { useContext } from 'react';
// 1. Use { } for the named import to match your Provider file
import { AuthenticationContext } from '../context/AuthenticationContextProvider';

const Register = ({ setIsLoginBox }) => {
    // 2. Uncomment the context values
    const { setUsername, setEmail, setPassword, register } = useContext(AuthenticationContext);

    // 3. Uncomment the handler function
    const handleRegister = async (e) => {
        e.preventDefault();
        await register();
    };

    return (
        <form className="authForm" onSubmit={handleRegister}>
            <h2>Register</h2>
            <div className="form-floating mb-3 authFormInputs">
                <input 
                    type="text" 
                    className="form-control" 
                    id="floatingInput" 
                    placeholder="username" 
                    onChange={(e) => setUsername(e.target.value)} 
                />
                <label htmlFor="floatingInput">Username</label>
            </div>
            <div className="form-floating mb-3 authFormInputs">
                <input 
                    type="email" 
                    className="form-control" 
                    id="floatingEmail" 
                    placeholder="name@example.com" 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <label htmlFor="floatingEmail">Email address</label>
            </div>
            <div className="form-floating mb-3 authFormInputs">
                <input 
                    type="password" 
                    className="form-control" 
                    id="floatingPassword" 
                    placeholder="Password" 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <label htmlFor="floatingPassword">Password</label>
            </div>
            {/* 4. Changed to type="submit" so the form handles the Enter key */}
            <button type="submit" className="btn btn-primary">Sign up</button>

            <p>Already registered? <span style={{cursor: 'pointer'}} onClick={() => setIsLoginBox(true)}>Login</span></p>
        </form>
    );
};

export default Register;
