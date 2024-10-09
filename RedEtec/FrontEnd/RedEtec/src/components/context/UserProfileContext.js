// UserProfileContext.js
import React, { createContext, useContext, useState } from 'react';

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState({
        username: '', // Inicialmente vazio, será preenchido após login
        profileImage: '', // Imagem de perfil
        seguidores: 0, // Exemplo de dados adicionais
        seguindo: 0
    });

    return (
        <UserProfileContext.Provider value={{ profile, setProfile }}>
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => {
    return useContext(UserProfileContext);
};
