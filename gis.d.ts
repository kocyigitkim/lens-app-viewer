declare module "g-i-s"{
    export interface retrieveCallback{
        (err : any, results : {url:string,width:number,height:number}[]):void;
    }
    export default function retrieve(url:string, callback:retrieveCallback):void;
}
declare module "react-spinner-material"{
    export default class Spinner extends React.Component<any,any>{
    }
}