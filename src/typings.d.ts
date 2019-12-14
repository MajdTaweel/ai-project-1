/* SystemJS module definition */
declare var nodeModule: NodeModule;

interface NodeModule {
    id: string;
}

// @ts-ignore
declare var window: Window;

interface Window {
    process: any;
    require: any;
}

declare var eel: any;
declare var $:any;
