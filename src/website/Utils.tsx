import globals from "./Globals.module.css";

export const classes = (...names:string[]) => names.join(" ")

export const collapsable = (displayed:boolean, ...names:string[]) =>
    displayed
        ? classes(globals.transitionMode, ...names)
        : classes(globals.transitionMode, globals.collapseHide)
