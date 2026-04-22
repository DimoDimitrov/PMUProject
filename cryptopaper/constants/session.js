import { useSyncExternalStore } from "react";

let sessionStore = {
  isLoggedIn: false,
  preferredAuthTab: "login", // "login" | "register"
  user: null,
};

const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getSessionState() {
  return sessionStore;
}

export function subscribeSession(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSessionState(partialState) {
  sessionStore = {
    ...sessionStore,
    ...partialState,
  };
  emitChange();
}

export function setPreferredAuthTab(tab) {
  sessionStore = {
    ...sessionStore,
    preferredAuthTab: tab,
  };
  emitChange();
}

export function logInUser(user) {
  sessionStore = {
    ...sessionStore,
    isLoggedIn: true,
    user,
  };
  emitChange();
}

export function logOutUser() {
  sessionStore = {
    ...sessionStore,
    isLoggedIn: false,
    user: null,
    preferredAuthTab: "login",
  };
  emitChange();
}

export function useSessionState() {
  return useSyncExternalStore(subscribeSession, getSessionState, getSessionState);
}
