import { useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import { LoginContext } from '../../App';
import "./SignIn.css";


export function SignIn() {

    const navigate = useNavigate();
    const { isLogin } = useContext(LoginContext);

    useEffect(() => {
        if (isLogin) navigate("/");
    }, []);

    async function Login() {
        let email = document.getElementById('email');
        let password = document.getElementById('password');

        let hasPassedRequisites = true;

        //check if one of the fields is empty
        if (email.value === "") {
            email.className = 'form-control mt-1 is-invalid';
            document.getElementById('email-message').innerHTML = "Not filled";
            hasPassedRequisites = false;
        }

        if (password.value === "") {
            password.className = 'form-control mt-1 is-invalid';
            document.getElementById('password-message').innerHTML = "Not filled";
            hasPassedRequisites = false;
        }

        //check if email has @ and . in it
        if (!email.className.includes("invalid") &&
            (!email.value.includes("@") || !email.value.includes("."))) {
            email.className = 'form-control mt-1 is-invalid';
            document.getElementById('email-message').innerHTML = "Email address is wrong";
            hasPassedRequisites = false;
        }

        //check if passowrd is at least 6 chars long
        if (!password.className.includes("invalid") && password.value.length < 6) {
            password.className = 'form-control mt-1 is-invalid';
            document.getElementById('password-message').innerHTML = "Password should be at least 6 characters long";
            hasPassedRequisites = false;
        }

        //check for cross-site-scripting: "XSS"
        if (!email.className.includes("invalid")
            && isJavaScript(email.value)) {
            email.className = 'form-control mt-1 is-invalid';
            document.getElementById('email-message').innerHTML = "Unallowed characters";
            hasPassedRequisites = false;
        }

        if (!password.className.includes("invalid")
            && isJavaScript(password.value)) {
            password.className = 'form-control mt-1 is-invalid';
            document.getElementById('password-message').innerHTML = "Unallowed characters";
            hasPassedRequisites = false;
        }

        if (!hasPassedRequisites) return;

        //check to see if user exist    
        let response = await checkCredentials(email.value, password.value);

        //if user not found
        if (response.message === "not found") {
            email.className = 'form-control mt-1 is-invalid';
            document.getElementById('email-message').innerHTML = "Email may be incorrect";

            password.className = 'form-control mt-1 is-invalid';
            document.getElementById('password-message').innerHTML = "Password may be incorrect";
            return;
        }

        document.location.reload();
    }

    async function checkCredentials(email, password) {

        //send request to server to login user
        let response = await fetch('/api/v1/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        return await response.json();
    }

    function isJavaScript(str) {
        for (let c of str) {
            if (c === '=' || c === '%' || c === '{' || c === '}' || c === '<' || c === '>')
                return true;
        }
        return false;
    }

    function onInputChange(elementID) {
        document.getElementById(elementID).className = "form-control mt-1";
        document.getElementById(elementID + "-message").innerHTML = "";
    }

    return (
        <form>
            <h3 className="text-center pt-3">Sign In</h3>
            <div className="form-group mt-3">
                <label>Email address</label>
                <input
                    id="email"
                    type="email"
                    className="form-control mt-1"
                    placeholder="Email address"
                    onChange={() => onInputChange("email")}
                />
                <div id="email-message" className="text-end text-danger h6"></div>
            </div>

            <div className="form-group mt-3">
                <label>Password</label>
                <div className="d-flex">
                    <input
                        id="password"
                        type="password"
                        className="form-control mt-1"
                        placeholder="Password"
                        onChange={() => onInputChange("password")}
                    />
                    <i className="bi bi-eye-slash"
                        id="togglePassword"
                        onClick={(e) => {
                            const password = document.querySelector('#password');
                            const type = password.getAttribute('type') === 'password' ?
                                'text' : 'password';

                            password.setAttribute('type', type);

                            if (type === 'text') {
                                e.target.classList.add("bi-eye");
                                e.target.classList.remove('bi-eye-slash');
                            }
                            else {
                                e.target.classList.remove("bi-eye");
                                e.target.classList.add('bi-eye-slash');
                            }

                        }}></i>
                </div>
                <div id="password-message" className="text-end text-danger h6"></div>
            </div>

            <div className="d-grid gap-2 mt-4">
                <button type="button" className="btn btn-primary"
                    onClick={Login}>
                    Sign In
                </button>
            </div>
            {/* <p className="text-center mt-2">
                Forgot <a href="/">password?</a>
            </p> */}
        </form>
    );
}
