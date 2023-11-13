import { useContext } from "react";
import { getCookie } from "../../utils/CookiesUtil";
import { LoginContext } from '../../App';

export function Profile() {

    const { isLogin } = useContext(LoginContext);

    if (!isLogin) {
        return (
            <>
                <div className="row ps-2 pt-3 d-flex justify-content-center">
                    <div className="col-md-8">
                        <div className="card mb-4">
                            <div className="card-body text-center">
                                <h3 className="my-3">You have no profile!</h3>
                                <p className="h5 text-black mb-4"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const userNickname = getCookie("nickname") || "";
    const userCoins = getCookie("coins") || "";

    return (
        <>
            <div className="row ps-2 pt-3 d-flex justify-content-center">
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-body text-center">
                            <h3 className="my-3">{userNickname}</h3>
                            <p className="h5 text-black mb-4">Coins: {userCoins}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
