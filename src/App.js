import { createContext } from 'react';
import { Routes, Route } from "react-router-dom"
import { Container } from "react-bootstrap"
import { Home } from "./pages/Home/Home"
import { Profile } from "./pages/Profile/Profile"
import { SignUp } from "./pages/SignUp/SignUp"
import { SignIn } from "./pages/SignIn/SignIn"
import { SinglePlayer } from "./pages/SinglePlayer/SinglePlayer"
import { MultiPlayer } from "./pages/MultiPlayer/MultiPlayer"
import { Navbar } from "./components/Navbar";
import { getCookie } from "./utils/CookiesUtil";

export const LoginContext = createContext();

function App() {

    const isLogin = getCookie("accessToken") !== undefined;

    return (
        <>
            <LoginContext.Provider value={{ isLogin }}>
                {/* <Navbar /> */}
                <Container className="mb-5" style={{backgroundColor: '#FFD8B1', position: 'absolute', height: '100%'}}>
                    <Routes>
                        {/* <Route path="/" element={<Home />} /> */}
                        {/* <Route path="/profile" element={<Profile />} /> */}
                        {/* <Route path="/signup" element={<SignUp />} /> */}
                        {/* <Route path="/signin" element={<SignIn />} /> */}
                        {/* <Route path="/" exact element={<SinglePlayer />} /> */}
                        <Route path="/:tid" exact element={<SinglePlayer />} />
                        <Route path="/multiplayer" element={<MultiPlayer />} />

                    </Routes>
                </Container>
            </LoginContext.Provider>
        </>
    );
}

export default App;
