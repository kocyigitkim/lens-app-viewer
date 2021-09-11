import React, { Component } from 'react'

import Spinner from 'react-spinner-material';
import color from 'color';
import { Helper } from '../Helper';

Helper.registerStylesheetFromCurrentDir("loading", "src/styles/Loading.css");
export default class Loading extends Component {
    props: {
        show: boolean,
        bg?: string,
        color?: string,
        children?: any
    };
    componentDidMount() {
        var internalFiber = (this as any)._reactInternalFiber || (this as any)._reactInternals;
        if (!internalFiber) return;

        (this as any).parentNode = internalFiber.return.stateNode;
        (this as any).currentNode = internalFiber.child.stateNode;
        (this as any).parentNode.style.position = 'relative';


        var computedParent = window.getComputedStyle((this as any).parentNode);
        (this as any).currentNode.style.borderRadius = computedParent.borderRadius;
    }
    render() {
        const backColor = color((this as any).props.bg || 'white').alpha(0.5);

        return <div style={{ opacity: ((this as any).props.show ? 1 : 0), pointerEvents: ((this as any).props.show ? 'all' : 'none'), color: ((this as any).props.color || 'black'), backgroundColor: backColor.toString() }} className="__react__loadingcontent">
            <div style={{ zIndex: 2, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'center', margin: 20 }}>
                    <Spinner radius={25} stroke={3} {...this.props} children={null}></Spinner>
                </div>
                <div style={{ display: 'block', fontWeight: 'bold' }}>
                    {this.props.children}
                </div>
            </div>
        </div>;
    }
}