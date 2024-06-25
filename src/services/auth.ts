export const isAuthenticated = (): boolean => {
    return sessionStorage.getItem('token') !== null;
};

export const login = (token: string, user: any) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
};

export const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
};
