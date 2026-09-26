/** Source of the current time, injected so that date rules can be tested. */
export type Clock = () => Date;

export const systemClock: Clock = () => new Date();
