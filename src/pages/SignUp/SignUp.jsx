import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getCookie } from "../../utils/CookiesUtil"
// import "./SignUp.css";

export function SignUp() {

    const navigate = useNavigate();

    useEffect(() => {
        if (getCookie("accessToken") !== undefined) {
            navigate("/");
        }
    }, []);

    async function createUser() {
        let nickname = document.getElementById('nickname');
        let email = document.getElementById('email');
        let password = document.getElementById('password');
        let confirmPassword = document.getElementById('confirm-password');

        let hasPassedRequisites = true;

        //check if one of the fields is empty
        if (nickname.value === "") {
            nickname.className = 'form-control mt-1 is-invalid';
            document.getElementById('nickname-message').innerHTML = "Not filled";
            hasPassedRequisites = false;
        }

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

        if (confirmPassword.value === "") {
            confirmPassword.className = 'form-control mt-1 is-invalid';
            document.getElementById('confirm-password-message').innerHTML = "Not filled";
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

        //check if confirmPassword is equal to password
        if (!confirmPassword.className.includes("invalid")
            && !password.className.includes("invalid")
            && confirmPassword.value !== password.value) {
            confirmPassword.className = 'form-control mt-1 is-invalid';
            document.getElementById('confirm-password-message').innerHTML = "Confirm password is not the same as password";
            hasPassedRequisites = false;
        }

        //check for cross-site-scripting: "XSS"
        if (!nickname.className.includes("invalid")
            && isJavaScript(nickname.value)) {
            nickname.className = 'form-control mt-1 is-invalid';
            document.getElementById('nickname-message').innerHTML = "Unallowed characters";
            hasPassedRequisites = false;
        }

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

        if (!confirmPassword.className.includes("invalid")
            && isJavaScript(confirmPassword.value)) {
            confirmPassword.className = 'form-control mt-1 is-invalid';
            document.getElementById('confirm-password-message').innerHTML = "Unallowed characters";
            hasPassedRequisites = false;
        }

        if (!hasPassedRequisites) return;

        //send request to server to create new user
        let response = await createNewUser(nickname.value,
            email.value,
            password.value);

        //If there is already an existing user with the same params
        if (response.message === "duplicate users") {
            email.className = 'form-control mt-1 is-invalid';
            document.getElementById('email-message').innerHTML = "Unallowed email address";
            return;
        }

        document.location.reload();
    }

    async function createNewUser(nickname, email, password) {
        let response = await fetch('/api/v1/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, email, password })
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
            <h3 className="text-center pt-3">Sign Up</h3>
            <div className="form-group mt-3">
                <label>Nickname</label>
                <input
                    id="nickname"
                    type="email"
                    className="form-control mt-1"
                    placeholder="Nickname"
                    onChange={() => onInputChange("nickname")}
                />
                <div id="nickname-message" className="text-end text-danger h6"></div>
            </div>
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
                <input
                    id="password"
                    type="password"
                    className="form-control mt-1"
                    placeholder="Password"
                    onChange={() => onInputChange("password")}
                />
                <div id="password-message" className="text-end text-danger h6"></div>
            </div>
            <div className="form-group mt-3">
                <label>Confirm password</label>
                <input
                    id="confirm-password"
                    type="password"
                    className="form-control mt-1"
                    placeholder="Confirm password"
                    onChange={() => onInputChange("confirm-password")}
                />
                <div id="confirm-password-message" className="text-end text-danger h6"></div>
            </div>
            <div className="d-grid mt-4">
                <button type="button"
                    className="btn btn-primary"
                    onClick={createUser}>
                    Sign Up
                </button>
            </div>
        </form>
    )
}
