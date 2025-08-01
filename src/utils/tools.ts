

export const getToken = ()  => {
    const token = localStorage.getItem("sm-access-token");
    if (!token) {
        throw new Error("No token found");
    }
    return token;
}


