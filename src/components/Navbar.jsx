import { useContext } from 'react';
import { Container, Nav, Navbar as NavbarBs } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { LoginContext } from '../App';
import { removeCookie } from "../utils/CookiesUtil";

export function Navbar() {

    const { isLogin } = useContext(LoginContext);

    function SignOut() {
        //remove login cookies
        removeCookie("nickname");
        removeCookie("accessToken");
        removeCookie("coins");
    }

    return (
        <NavbarBs sticky="top" className="bg-white shadow-sm mb-3">
            <Container>
                <Nav className="me-auto">
                    <Nav.Link to="/" as={NavLink}>Home</Nav.Link>
                    {/* {isLogin && <Nav.Link to="/profile" as={NavLink}>Profile</Nav.Link>} */}
                    {/* {!isLogin && <Nav.Link to="/signup" as={NavLink}>Sign Up</Nav.Link>} */}
                </Nav>
                {/* <Nav>
                    {
                        !isLogin ?
                            <Nav.Link to="/signin" as={NavLink}>Sign In</Nav.Link>
                            :
                            <Nav.Link onClick={SignOut}>Sign Out</Nav.Link>
                    }
                </Nav> */}
            </Container>
        </NavbarBs>
    );
}
