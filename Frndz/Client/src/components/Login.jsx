import React, { useContext } from 'react';
// 1. IMPORT FIX: Import the Context object { AuthenticationContext }, 
// not the Provider component.
import { AuthenticationContext } from '../context/AuthenticationContextProvider';

const Login = ({ setIsLoginBox }) => {
    // 2. This will now work because AuthenticationContext is correctly imported above.
    const { setEmail, setPassword, login } = useContext(AuthenticationContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        await login();
    }

    return (
        <form className="authForm" onSubmit={handleLogin}>
            <h2>Login</h2>
            <div className="form-floating mb-3 authFormInputs">
                <input 
                    type="email" 
                    className="form-control" 
                    id="floatingInput" 
                    placeholder="name@example.com" 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                />
                <label htmlFor="floatingInput">Email address</label>
            </div>
            <div className="form-floating mb-3 authFormInputs">
                <input 
                    type="password" 
                    className="form-control" 
                    id="floatingPassword" 
                    placeholder="Password" 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                />
                <label htmlFor="floatingPassword">Password</label>
            </div>
            {/* 3. Using type="submit" inside a form with onSubmit is best practice */}
            <button type="submit" className="btn btn-primary">Sign in</button>

            <p>Not registered? <span style={{cursor: 'pointer'}} onClick={() => setIsLoginBox(false)}>Register</span></p>
        </form>
    )
}

export default Login;
