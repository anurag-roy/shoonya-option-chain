type Alert = 'add' | 'update' | 'remove';

export const playAlert = (alert: Alert) => new Audio(`/${alert}.mp3`).play();
