const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
        setLoggedInUser({});
        localStorage.removeItem('loggedInUser');
    });
}; 