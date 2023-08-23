type Alert = 'new' | 'update' | 'remove';

export const playAlert = (alert: Alert) => new Audio(`/${alert}.mp3`).play();
