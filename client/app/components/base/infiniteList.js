// @flow
import React from 'react';

import RefreshIndicator from 'material-ui/RefreshIndicator';
import VisibilitySensor from 'react-visibility-sensor';

type Props = {
    canLoadMore: bool,
    onLoadMore: () => void,
    children: React.Element<*>,
};

export default class InfiniteList extends React.Component {
    componentWillMount() {
        this.scrollBottom = 0;
    }

    componentDidMount() {
        this.restoreScroll();
    }

    componentWillUpdate() {
        const scroll = this.node.scrollTop + this.node.offsetHeight;
        this.scrollBottom = this.node.scrollHeight - scroll;
    }

    componentDidUpdate() {
        this.restoreScroll();
    }

    restoreScroll() {
        const scroll = this.scrollBottom + this.node.offsetHeight;
        this.node.scrollTop = this.node.scrollHeight - scroll;
    }

    node: HTMLDivElement;
    scrollBottom: number;
    props: Props;

    render() {
        const {
            canLoadMore,
            onLoadMore,
            ...other
        } = this.props;

        return (
            <div {...other} ref={node => { this.node = node; }}>
                {canLoadMore && (
                    <VisibilitySensor partialVisibility scrollCheck delayedCall
                        containment={this.node}
                        onChange={isVisible => {
                            if (isVisible) {
                                onLoadMore();
                            }
                        }}>
                        <RefreshIndicator size={50} top={8} left={8} status="loading" style={{
                            transform: 'unset',
                            top: 'unset',
                            right: 'unset',
                            position: 'static',
                            margin: '8px auto',
                        }} />
                    </VisibilitySensor>
                )}
                {this.props.children}
            </div>
        );
    }
}
