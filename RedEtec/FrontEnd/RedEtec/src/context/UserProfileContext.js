// UserProfileContext.js
import React, { createContext, useState, useContext } from 'react';

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState({
        username: 'Nome do Usuário',
        profileImage: 'https://via.placeholder.com/150',
        seguidores: 150,
        seguindo: 200
    });

    return (
        <UserProfileContext.Provider value={{ profile, setProfile }}>
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => useContext(UserProfileContext);