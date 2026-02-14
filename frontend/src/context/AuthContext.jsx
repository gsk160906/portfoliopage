import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const updateProfileData = (data) => {
        if (!currentUser) return;
        return updateDoc(doc(db, 'users', currentUser.uid), data);
    };

    const reauthenticate = (password) => {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, password);
        return reauthenticateWithCredential(user, credential);
    };

    const changePassword = (newPassword) => {
        return updatePassword(auth.currentUser, newPassword);
    };

    useEffect(() => {
        let unsubscribeFirestore = () => { };

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Set up real-time listener for user data
                unsubscribeFirestore = onSnapshot(doc(db, 'users', user.uid), (doc) => {
                    if (doc.exists()) {
                        setUserData(doc.data());
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Firestore error:", error);
                    setLoading(false);
                });
            } else {
                setUserData(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeFirestore();
        };
    }, []);

    const value = {
        currentUser,
        userData,
        signup,
        login,
        logout,
        googleSignIn,
        updateProfileData,
        changePassword,
        reauthenticate,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
